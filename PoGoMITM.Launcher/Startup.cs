using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using log4net.Core;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Microsoft.Owin.Extensions;
using Nancy;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Owin;
using PoGoMITM.Base.Logging;
using PoGoMITM.Base.Models;

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
            RequestContext.Parser = new POGOProtosRequestParser();

            //var decryptorPath = Path.Combine(Environment.CurrentDirectory, "PCrypt.dll");
            //if (File.Exists(decryptorPath))
            //{
            //    var assembly = Assembly.LoadFile(decryptorPath);
            //    var encryptionType = assembly.GetExportedTypes().FirstOrDefault(t => t.Name == "SignatureDecryptor");
            //    if (encryptionType != null)
            //    {
            //        RequestContext.Parser.SignatureEncryption = Activator.CreateInstance(encryptionType);
            //    }
            //}

            StaticConfiguration.DisableErrorTraces = false;
            JsonConvert.DefaultSettings = () =>
            {
                var settings = new JsonSerializerSettings();
                settings.Converters.Add(new StringEnumConverter { CamelCaseText = true });
                return settings;
            };

            Log4NetHelper.AddAppender(Log4NetHelper.ConsoleAppender(Level.All));
            Log4NetHelper.AddAppender(Log4NetHelper.FileAppender(Level.All));
        }
    }
}
