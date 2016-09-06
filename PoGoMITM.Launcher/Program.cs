using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using log4net;
using Microsoft.Owin.Hosting;
using PoGoMITM.Base;
using PoGoMITM.Base.Cache;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Logging;
using PoGoMITM.Base.Models;
using PoGoMITM.Base.Plugins;
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
                if (await HandleGoogleLogin(rawContext, e))
                {
                    Logger.Info("Fixed app signature for Google");
                    return;
                }
                if (!AppConfig.HostsToDump.Contains(rawContext.RequestUri.Host)) return;

                var requestContext = RequestContext.GetInstance(rawContext);
                requestContext.ModifyRequest();
                if (requestContext.RequestModified)
                {
                    await e.SetRequestBody(requestContext.ModifiedRequestData.RequestBody);
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

                var requestContext = RequestContext.GetInstance(rawContext);

                if (requestContext?.ResponseData == null)
                {
                    Logger.Error("Could not find the request context in cache or there is no response data, it shouldn't happen.");
                    return;
                }
                requestContext.CopyResponseData(rawContext);
                requestContext.ModifyResponse();
                if (requestContext.ResponseModified)
                {
                    await e.SetResponseBody(requestContext.ModifiedResponseData.ResponseBody);
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

        private static async Task<bool> HandleGoogleLogin(RawContext rawContext, SessionEventArgs e)
        {
            if (e.WebSession.Request.RequestUri.AbsoluteUri != "https://android.clients.google.com/auth") return false;
            if (rawContext.RequestBody == null || rawContext.RequestBody.Length == 0) return false;
            var data = Encoding.UTF8.GetString(rawContext.RequestBody);
            if (!data.Contains("com.nianticlabs.pokemongo")) return false;
            var dataArr = data.Split('&');
            var newDataList = new List<string>();
            var changed = false;
            foreach (var currentData in dataArr)
            {
                if (currentData.StartsWith("callerSig="))
                {
                    newDataList.Add("callerSig=321187995bc7cdc2b5fc91b11a96e2baa8602c62");
                    changed = true;
                }
                else if (currentData.StartsWith("client_sig="))
                {
                    newDataList.Add("client_sig=321187995bc7cdc2b5fc91b11a96e2baa8602c62");
                    changed = true;
                }
                else
                {
                    newDataList.Add(currentData);
                }
            }
            if (!changed) return false;
            var newData = string.Join("&", newDataList);
            await e.SetRequestBody(Encoding.UTF8.GetBytes(newData));
            return true;
        }
    }
}