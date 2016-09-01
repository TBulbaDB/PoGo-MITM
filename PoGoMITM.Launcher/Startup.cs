using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using log4net.Core;
using Nancy;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Owin;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Logging;
using PoGoMITM.Base.Models;
using PoGoMITM.Base.Utils;
using PoGoMITM.Launcher.Plugins;

namespace PoGoMITM.Launcher
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            //#if DEBUG
            app.UseErrorPage();
            //#endif
            //app.MapSignalR(new HubConfiguration { Resolver = GlobalHost.DependencyResolver });
            app.MapSignalR();
            app.UseNancy();
            //app.UseStageMarker(PipelineStage.MapHandler);
        }

        public static void RegisterGlobals()
        {
            Log4NetHelper.AddAppender(Log4NetHelper.ConsoleAppender(Level.All));
            Log4NetHelper.AddAppender(Log4NetHelper.FileAppender(Level.All));


            RequestContext.Parser = new POGOProtosProtoParser();
            AppConfig.Logger.Info("Attempting to load the plugins");
            RequestContext.RequestModifiers = new List<IRequestModifier> { new LocationModifier(), new TestModifier() };
            RequestContext.ResponseModifiers = new List<IResponseModifier> { new LocationModifier(), new TestModifier() };
            //RequestContext.RequestModifiers = PluginLoader.LoadPlugins<IRequestModifier>();
            //RequestContext.ResponseModifiers = PluginLoader.LoadPlugins<IResponseModifier>();
            if (RequestContext.RequestModifiers != null && RequestContext.RequestModifiers.Count > 0)
            {
                AppConfig.Logger.Info(
                    $"Loaded Request Modifier Plugins: {string.Join(", ", RequestContext.RequestModifiers.Select(m => m.GetType().Name))}");
            }


            RequestContext.RequestPacker = new POGOProtosRequestPacker();
            RequestContext.ResponsePacker=new POGOProtosResponsePacker();

            var decryptorPath = FileLocation.GetFileLocation("pcrypt.dll");
            if (decryptorPath != null)
            {
                var assembly = Assembly.LoadFile(decryptorPath);
                var encryptionType = assembly.GetExportedTypes().FirstOrDefault(t => t.Name == "SignatureDecryptor");
                if (encryptionType != null)
                {
                    RequestContext.Parser.SignatureEncryption = Activator.CreateInstance(encryptionType);
                }
            }
            else
            {

            }

            StaticConfiguration.DisableErrorTraces = false;
            JsonConvert.DefaultSettings = () =>
            {
                var settings = new JsonSerializerSettings();
                settings.Converters.Add(new StringEnumConverter { CamelCaseText = true });
                settings.Converters.Add(new LongConverter());
                settings.Converters.Add(new ULongConverter());
                return settings;
            };


        }
    }
}
