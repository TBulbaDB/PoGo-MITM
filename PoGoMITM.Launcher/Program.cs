using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using log4net;
using log4net.Core;
using Microsoft.Owin.Hosting;
using Nancy;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using PoGoMITM.Base;
using PoGoMITM.Base.Cache;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Logging;
using PoGoMITM.Base.Models;
using PoGoMITM.Launcher.Models;
using Titanium.Web.Proxy.EventArguments;

namespace PoGoMITM.Launcher
{
    internal class Program
    {
        private static ILog Logger;

        private static void Main()
        {
            Logger = LogManager.GetLogger("Proxy");
            AppConfig.Logger = Logger;

            Startup.RegisterGlobals();

            var proxy = new ProxyHandler(AppConfig.ProxyIp, AppConfig.ProxyPort, Logger);

            proxy.BeforeRequest += ProxyBeforeRequest;
            proxy.BeforeResponse += ProxyBeforeResponse;

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

        private static async void ProxyBeforeRequest(RawContext rawContext, SessionEventArgs e)
        {
            try
            {
                if (!AppConfig.HostsToDump.Contains(rawContext.RequestUri.Host)) return;

                var requestContext = RequestContext.Create(rawContext);
                requestContext.CopyRequestData(rawContext);
                requestContext.ParseRequest();
                requestContext.ModifyRequest();
                if (requestContext.RequestModified)
                {
                    requestContext.ParseRequest();
                    await e.SetRequestBody(requestContext.RequestBody);
                }

                Logger.Info(rawContext.RequestUri.AbsoluteUri + " Request Sent.");
            }
            catch (Exception ex)
            {
                Logger.LogException(ex);
            }
        }

        private static async void ProxyBeforeResponse(RawContext rawContext, SessionEventArgs e)
        {

            try
            {

                if (!AppConfig.HostsToDump.Contains(rawContext.RequestUri.Host)) return;
                rawContext.IsLive = true;
                ContextCache.RawContexts.TryAdd(rawContext.Guid, rawContext);

                var requestContext = RequestContext.GetInstance(rawContext.Guid);

                if (requestContext == null)
                {
                    Logger.Error("Could not find the request context in cache, it shouldn't happen.");
                    return;
                }
                requestContext.CopyResponseData(rawContext);
                requestContext.ParseResponse();
                requestContext.ModifyResponse();
                if (requestContext.ResponseModified)
                {
                    requestContext.ParseResponse();
                    await e.SetResponseBody(requestContext.ResponseBody);
                }

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
                    foreach (var dumper in AppConfig.DataDumpers)
                    {
                        await dumper.Dump(requestContext);

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