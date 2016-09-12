using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Google.Common.Geometry;
using Google.Protobuf;
using log4net;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Newtonsoft.Json;
using PoGoMITM.Base.Utils;
using PoGoMITM.Base.Models;

namespace PoGoMITM.Base.Plugins
{
    public class PluginLoader
    {
        private static readonly PortableExecutableReference[] Refererences;

        private static readonly ILog Logger = LogManager.GetLogger("PluginLoader");
        private static readonly string PluginsFolder;
        private static FileSystemWatcher Watcher = null;
        private static Dictionary<string, IPlugin> AllPlugins = null;

        public delegate void PluginChangeDelegate(string name, IPlugin plugin);
        public static PluginChangeDelegate PluginChanged;

        static PluginLoader()
        {
            PluginsFolder = FileLocation.GetFolderLocation("Plugins");

            var referencedAssemblies = Assembly.GetExecutingAssembly().GetReferencedAssemblies().ToList();
            referencedAssemblies.AddRange(typeof(PluginLoader).Assembly.GetReferencedAssemblies());
            var referencesList =
                Assembly.GetExecutingAssembly()
                    .GetReferencedAssemblies()
                    .Select(Assembly.Load)
                    .Select(a => a.Location)
                    .ToList();

            referencesList.AddRange(new List<string>
            {
                typeof(object).Assembly.Location,
                typeof(System.Linq.Enumerable).Assembly.Location,
                typeof(PluginLoader).Assembly.Location,
                typeof(IMessage).Assembly.Location,
                typeof(ILog).Assembly.Location,
                typeof(JsonConvert).Assembly.Location,
                typeof(S2Cell).Assembly.Location
            });

            var an = new AssemblyName("System.Runtime, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a");
            var asa = Assembly.Load(an);
            referencesList.Add(asa.Location);

            referencesList = referencesList.Distinct().ToList();

            Refererences = referencesList.Select(l => MetadataReference.CreateFromFile(l)).ToArray();
        }

        public static void LoadAllPlugins()
        {
            AllPlugins = new Dictionary<string, IPlugin>();
            if (PluginsFolder == null) return;

            foreach (var file in new DirectoryInfo(PluginsFolder).GetFiles("*.cs"))
            {
                var plugin = LoadPlugin(file.FullName);
                if (plugin != null)
                {
                    AllPlugins[file.Name] = plugin;
                }
            }

            Watcher = new FileSystemWatcher();
            Watcher.Path = PluginsFolder;
            Watcher.NotifyFilter = NotifyFilters.LastWrite;
            Watcher.Filter = "*.cs";
            Watcher.IncludeSubdirectories = false;
            Watcher.Changed += (source, e) =>
            {
                Logger.Info("Plugin changed: " + e.Name);

                var plugin = LoadPlugin(e.FullPath);
                AllPlugins[e.Name] = plugin;
                PluginChanged?.Invoke(e.Name, plugin);
            };
            Watcher.EnableRaisingEvents = true;
        }

        public static List<T> LoadPlugins<T>()
        {
            if (AllPlugins == null) LoadAllPlugins();
            return AllPlugins.Values.Where(p => p is T).Select(p => (T)p).ToList<T>();
        }
        
        private static IPlugin LoadPlugin(string filename)
        {
            var source = File.ReadAllText(filename);
            if (string.IsNullOrWhiteSpace(source))
            {
                Logger.Error($"Could not load the source for {filename}");
                return null;
            }

            var syntaxTree = CSharpSyntaxTree.ParseText(source);

            var assemblyName = Path.GetRandomFileName();

            var compilation = CSharpCompilation.Create(
                assemblyName,
                new[] { syntaxTree },
                Refererences,
                new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

            using (var ms = new MemoryStream())
            {
                var result = compilation.Emit(ms);

                if (!result.Success)
                {
                    var failures = result.Diagnostics.Where(diagnostic =>
                        diagnostic.IsWarningAsError ||
                        diagnostic.Severity == DiagnosticSeverity.Error);

                    Logger.Error($"Could not compile the plugin {filename}");

                    foreach (var diagnostic in failures)
                    {
                        Logger.Error($"{diagnostic.Id}: {diagnostic.GetMessage()}");
                    }
                }
                else
                {
                    ms.Seek(0, SeekOrigin.Begin);
                    var assembly = Assembly.Load(ms.ToArray());

                    var pluginType =
                        assembly.DefinedTypes.FirstOrDefault(t => t.ImplementedInterfaces.Any(i => i == typeof(IPlugin)));
                    if (pluginType != null)
                    {
                        var instance = assembly.CreateInstance(pluginType.FullName);
                        return (IPlugin)instance;
                    }
                }
            }

            return null;
        }
    }
}
