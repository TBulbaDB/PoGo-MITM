using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Google.Common.Geometry;
using Google.Protobuf;
using log4net;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Emit;
using Microsoft.CSharp;
using Newtonsoft.Json;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Utils;

namespace PoGoMITM.Base.Plugins
{
    public class PluginLoader
    {
        private static readonly ILog Logger = LogManager.GetLogger("PluginLoader");
        private static readonly string PluginsFolder;
        static PluginLoader()
        {
            PluginsFolder = FileLocation.GetFolderLocation("Plugins");
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
            //var providerOptions = new Dictionary<string, string>
            //    {
            //        {"CompilerVersion", "v4.5"}
            //    };
            //var provider = new CSharpCodeProvider(providerOptions);

            //var compilerParams = new CompilerParameters
            //{
            //    GenerateInMemory = true,
            //    GenerateExecutable = false
            //};

            //CompilerResults results = provider.CompileAssemblyFromSource(compilerParams, source);

            //if (results.Errors.Count != 0)
            //    throw new Exception("Mission failed!");

            //var pluginType =
            //    results.CompiledAssembly.DefinedTypes.FirstOrDefault(t => t.ImplementedInterfaces.Any(i => i == typeof(T)));
            //if (pluginType != null)
            //{
            //    return results.CompiledAssembly.CreateInstance(pluginType.Name) as T;
            //}

            var syntaxTree = CSharpSyntaxTree.ParseText(source);

            //var root=syntaxTree.GetRoot() as CompilationUnitSyntax;
            //if (root == null)
            //{
            //    Logger.Error($"Could not get the syntax tree for {filename}");
            //    return default(T);
            //}
            var assemblyName = Path.GetRandomFileName();

            //MetadataReferenceResolver
            var references = new MetadataReference[]
            {
                
                MetadataReference.CreateFromFile(typeof(object).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(Enumerable).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(PluginLoader).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(IMessage).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(ILog).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(JsonConvert).Assembly.Location), 
                MetadataReference.CreateFromFile(typeof(S2Cell).Assembly.Location), 

            };


            var compilation = CSharpCompilation.Create(
                assemblyName,
                new[] { syntaxTree },
                references,
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
                        return (T)instance ;
                    }
                }
            }

            return default(T);
        }
    }
}
