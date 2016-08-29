using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using log4net;
using log4net.Core;
using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.Owin.Hosting;
using Nancy;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using PoGoMITM.Base;
using PoGoMITM.Base.Cache;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Logging;
using PoGoMITM.Base.Models;
using PoGoMITM.Base.Utils;
using PoGoMITM.Launcher.Models;
using POGOProtos.Networking.Envelopes;

namespace PoGoMITM.Launcher
{
    internal class Program
    {
        private static readonly ILog Logger = LogManager.GetLogger("Proxy");

        private static void Main()
        {
            RequestContext.Parser = new POGOProtosRequestParser();

            StaticConfiguration.DisableErrorTraces = false;
            JsonConvert.DefaultSettings = () =>
            {
                var settings = new JsonSerializerSettings();
                settings.Converters.Add(new StringEnumConverter { CamelCaseText = true });
                return settings;
            };

            Log4NetHelper.AddAppender(Log4NetHelper.ConsoleAppender(Level.All));
            Log4NetHelper.AddAppender(Log4NetHelper.FileAppender(Level.All));


            var proxy = new ProxyHandler(AppConfig.ProxyIp, AppConfig.ProxyPort, Logger);

            proxy.RequestSent += Proxy_RequestSent;
            proxy.RequestCompleted += Proxy_RequestCompleted;

            proxy.Start();

            Logger.Info($"Proxy is started on {AppConfig.ProxyIp}:{AppConfig.ProxyPort}");

            var webApp = WebApp.Start<Startup>($"http://*:{AppConfig.WebServerPort}");
            Logger.Info($"Web Server is started on http://localhost:{AppConfig.WebServerPort}");

            Console.WriteLine();
            Logger.Info("Hit escape to stop the proxy and exit..");
            Console.WriteLine();


            while (true)
            {
                var key = Console.ReadKey();
                switch (key.Key)
                {
                    case ConsoleKey.Escape:
                        proxy.Dispose();
                        Logger.Info("Proxy is stopped.");
                        webApp.Dispose();
                        Logger.Info("Web server is stopped.");
                        return;
                }
            }
        }

        private static void Proxy_RequestSent(RawContext rawContext)
        {
            try
            {
                if (!AppConfig.HostsToDump.Contains(rawContext.RequestUri.Host)) return;
                Logger.Info(rawContext.RequestUri.AbsoluteUri + " Request Sent.");
            }
            catch (Exception ex)
            {
                Logger.LogException(ex);
            }
        }

        private static async void Proxy_RequestCompleted(RawContext rawContext)
        {
            try
            {

                if (!AppConfig.HostsToDump.Contains(rawContext.RequestUri.Host)) return;
                rawContext.IsLive = true;
                ContextCache.RawContexts.TryAdd(rawContext.Guid, rawContext);
                NotificationHub.SendRawContext(RequestContextListModel.FromRawContext(rawContext));


                Logger.Info(rawContext.RequestUri.AbsoluteUri + " Request Completed.");

                if (AppConfig.DumpRaw)
                {
                    foreach (var dumper in AppConfig.DataDumpers)
                    {
                        await dumper.Dump(rawContext);

                    }
                }
                if (AppConfig.DumpProcessed)
                {
                    var processedContext = await RequestContext.GetInstance(rawContext);
                    foreach (var dumper in AppConfig.DataDumpers)
                    {
                        await dumper.Dump(processedContext);

                    }
                }
            }
            catch (Exception ex)
            {
                Logger.LogException(ex);
            }
        }
    }
}