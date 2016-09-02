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

namespace PoGoMITM.Base.Plugins
{
    public class PluginLoader
    {
        private static readonly PortableExecutableReference[] Refererences;

        private static readonly ILog Logger = LogManager.GetLogger("PluginLoader");
        private static readonly string PluginsFolder;
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
        public static List<T> LoadPlugins<T>() where T : class
        {
            var plugins = new List<T>();
            if (PluginsFolder == null) return plugins;
            foreach (var file in Directory.GetFiles(PluginsFolder).Where(f => f.EndsWith(".cs")))
            {
                var plugin = LoadPlugin<T>(file);
                if (plugin != null)
                {
                    plugins.Add(LoadPlugin<T>(file));
                }
            }
            return plugins;
        }

        private static T LoadPlugin<T>(string filename) where T : class
        {
            var source = File.ReadAllText(filename);
            if (string.IsNullOrWhiteSpace(source))
            {
                Logger.Error($"Could not load the source for {filename}");

                return default(T);
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
                        assembly.DefinedTypes.FirstOrDefault(t => t.ImplementedInterfaces.Any(i => i == typeof(T)));
                    if (pluginType != null)
                    {
                        var instance = assembly.CreateInstance(pluginType.FullName);
                        return (T)instance;
                    }
                }
            }

            return default(T);
        }
    }
}
