using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using log4net;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Logging;
using PoGoMITM.Base.Models;
using Titanium.Web.Proxy;
using Titanium.Web.Proxy.EventArguments;
using Titanium.Web.Proxy.Exceptions;
using Titanium.Web.Proxy.Models;

namespace PoGoMITM.Base
{
    public class ProxyHandler : IDisposable
    {
        public delegate void BeforeRequestEventHandler(RawContext rawContext, SessionEventArgs e);
        public delegate void BeforeResponseEventHandler(RawContext rawContext, SessionEventArgs e);

        private readonly ProxyServer _proxyServer;
        private readonly Dictionary<string, RawContext> _contexts = new Dictionary<string, RawContext>();

        private readonly string _ip;
        private readonly int _port;
        private readonly ILog _logger;

        public event BeforeRequestEventHandler BeforeRequest;
        public event BeforeResponseEventHandler BeforeResponse;

        public ProxyHandler(string ipAddress, int port, ILog logger)
        {
            _proxyServer = new ProxyServer(AppConfig.RootCertificateName, AppConfig.RootCertificateIssuer);
            _ip = ipAddress;
            _port = port;
            _logger = logger;
        }

        public void Start()
        {
            // Link up handlers
            _proxyServer.Enable100ContinueBehaviour = true;
            _proxyServer.BeforeRequest += ProxyServer_BeforeRequest;
            _proxyServer.BeforeResponse += ProxyServer_BeforeResponse;
            _proxyServer.ServerCertificateValidationCallback += ProxyServer_ServerCertificateValidationCallback;
            _proxyServer.ClientCertificateSelectionCallback += ProxyServer_ClientCertificateSelectionCallback;

            // Set ip and port to monitor
            var explicitEndPoint = new ExplicitProxyEndPoint(IPAddress.Parse(_ip), _port, true);
            _proxyServer.AddEndPoint(explicitEndPoint);

            // Start proxy server
            _proxyServer.Start();
        }

        public void Stop()
        {
            // Unlink handlers
            _proxyServer.BeforeRequest -= ProxyServer_BeforeResponse;
            _proxyServer.BeforeResponse -= ProxyServer_BeforeRequest;
            _proxyServer.ServerCertificateValidationCallback -= ProxyServer_ServerCertificateValidationCallback;
            _proxyServer.ClientCertificateSelectionCallback -= ProxyServer_ClientCertificateSelectionCallback;

            // Stop server
            _proxyServer.Stop();
            _proxyServer.Dispose();
        }


        private async Task ProxyServer_BeforeRequest(object sender, SessionEventArgs e)
        {
            try
            {

                _logger.Debug($"{e.WebSession.Request.RequestUri.AbsoluteUri} Request Initialized");


                var uid = Guid.NewGuid();
                var context = new RawContext()
                {
                    RequestHeaders = e.WebSession.Request.RequestHeaders.Values.ToList(),
                    Guid = uid,
                    RequestUri = e.WebSession.Request.RequestUri,
                    RequestTime = DateTime.UtcNow,
                    ClientIp = e.ClientEndPoint.Address.ToString()
                };
                _contexts.Add(uid.ToString(), context);
                e.WebSession.Response.ResponseHeaders.Add("POGO_UID", new HttpHeader("POGO_UID", uid.ToString()));


                try
                {
                    context.RequestBody = await e.GetRequestBody();
                }
                catch (BodyNotFoundException)
                {
                }
                //if (e.WebSession.Request.RequestUri.Host == "pgorelease.nianticlabs.com")
                //{
                //    var codedRequest = new CodedInputStream(context.RequestBody);
                //    var requestEnvelope = RequestEnvelope.Parser.ParseFrom(codedRequest);
                //    for (int i = 0; i < requestEnvelope.Requests.Count; i++)
                //    {
                //        var request = requestEnvelope.Requests[i];
                //        if (request.RequestType == RequestType.CheckChallenge)
                //        {
                //            var message = CheckChallengeMessage.Parser.ParseFrom(request.RequestMessage);
                //            message.DebugRequest = true;
                //            request.RequestMessage = message.ToByteString();
                //            var newEnvelope = PrepareRequestEnvelope(requestEnvelope);
                //            context.RequestBody = await newEnvelope.ReadAsByteArrayAsync();
                //            await e.SetRequestBody(context.RequestBody);
                //        }
                //    }
                //}
                OnBeforeRequest(context, e);
            }
            catch (Exception ex)
            {
                _logger.LogException(ex);
            }

        }

        private async Task ProxyServer_BeforeResponse(object sender, SessionEventArgs e)
        {
            try
            {


                RawContext context;
                if (e.WebSession.Response.ResponseHeaders.ContainsKey("POGO_UID") &&
                    _contexts.ContainsKey(e.WebSession.Response.ResponseHeaders["POGO_UID"].Value))
                {
                    context = _contexts[e.WebSession.Response.ResponseHeaders["POGO_UID"].Value];
                }
                else
                {
                    _logger.Warn("Couldn't find the RawContext for the response");
                    return;
                }
                e.WebSession.Response.ResponseHeaders.Remove("POGO_UID");

                context.ResponseHeaders = e.WebSession.Response.ResponseHeaders.Values.ToList();


                try
                {
                    context.ResponseBody = await e.GetResponseBody();
                    await e.SetResponseBody(context.ResponseBody);
                }
                catch (BodyNotFoundException)
                {
                }


                _contexts.Remove(context.Guid.ToString());

                OnBeforeResponse(context, e);
            }
            catch (Exception ex)
            {
                _logger.LogException(ex);
            }

        }

        private void OnBeforeResponse(RawContext context, SessionEventArgs e)
        {
            if (context == null) return;
            BeforeResponse?.Invoke(context, e);
        }

        private void OnBeforeRequest(RawContext context, SessionEventArgs e)
        {
            if (context == null) return;
            BeforeRequest?.Invoke(context, e);
        }




        private static Task ProxyServer_ClientCertificateSelectionCallback(object arg1, CertificateSelectionEventArgs e)
        {
            return Task.FromResult(0);
        }

        private static Task ProxyServer_ServerCertificateValidationCallback(object arg1, CertificateValidationEventArgs e)
        {
            //set IsValid to true/false based on Certificate Errors
            if (e.SslPolicyErrors == System.Net.Security.SslPolicyErrors.None)
            {
                e.IsValid = true;
            }

            return Task.FromResult(0);
        }

        public void Dispose()
        {
            try
            {
                _proxyServer.Dispose();
            }
            catch { }
        }


    }
}
