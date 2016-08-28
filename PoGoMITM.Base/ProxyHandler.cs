using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Google.Protobuf;
using log4net;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Logging;
using PoGoMITM.Base.Models;
using POGOProtos.Networking.Envelopes;
using POGOProtos.Networking.Requests;
using POGOProtos.Networking.Requests.Messages;
using Titanium.Web.Proxy;
using Titanium.Web.Proxy.Exceptions;
using Titanium.Web.Proxy.Models;

namespace PoGoMITM.Base
{
    public class ProxyHandler : IDisposable
    {
        public delegate void RequestSentEventHandler(RawContext rawContext);
        public delegate void RequestCompletedEventHandler(RawContext rawContext);

        private readonly ProxyServer _proxyServer;
        private readonly Dictionary<string, RawContext> _contexts = new Dictionary<string, RawContext>();

        private readonly string _ip;
        private readonly int _port;
        private readonly ILog _logger;

        public event RequestSentEventHandler RequestSent;
        public event RequestCompletedEventHandler RequestCompleted;

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
            _proxyServer.BeforeRequest += ProxyServer_BeforeRequest; ;
            _proxyServer.BeforeResponse += ProxyServer_BeforeResponse; ;
            _proxyServer.ServerCertificateValidationCallback += ProxyServer_ServerCertificateValidationCallback; ;
            _proxyServer.ClientCertificateSelectionCallback += ProxyServer_ClientCertificateSelectionCallback; ;

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


        private async Task ProxyServer_BeforeRequest(object sender, Titanium.Web.Proxy.EventArguments.SessionEventArgs e)
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
                    RequestTime = DateTime.UtcNow
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
                //var codedRequest = new CodedInputStream(context.RequestBody);
                //var requestEnvelope = RequestEnvelope.Parser.ParseFrom(codedRequest);
                //for (int i = 0; i < requestEnvelope.Requests.Count; i++)
                //{
                //    var request = requestEnvelope.Requests[i];
                //    if (request.RequestType == RequestType.CheckChallenge)
                //    {
                //        var message = CheckChallengeMessage.Parser.ParseFrom(request.RequestMessage);
                //        message.DebugRequest = true;
                //        request.RequestMessage = message.ToByteString();
                //        var newEnvelope = PrepareRequestEnvelope(requestEnvelope);
                //        context.RequestBody = await newEnvelope.ReadAsByteArrayAsync();
                //        await e.SetRequestBody(context.RequestBody);
                //    }
                //}
                OnRequestSent(context);
            }
            catch (Exception ex)
            {
                _logger.LogException(ex);
            }

        }

        private ByteArrayContent PrepareRequestEnvelope(RequestEnvelope requestEnvelope)
        {
            var messageBytes = requestEnvelope.ToByteArray();

            // TODO: Compression?

            return new ByteArrayContent(messageBytes);
        }

        private async Task ProxyServer_BeforeResponse(object sender, Titanium.Web.Proxy.EventArguments.SessionEventArgs e)
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

                OnRequestCompleted(context);
            }
            catch (Exception ex)
            {
                _logger.LogException(ex);
            }

        }

        private void OnRequestCompleted(RawContext context)
        {
            if (context == null) return;
            RequestCompleted?.Invoke(context);
        }

        private void OnRequestSent(RawContext context)
        {
            if (context == null) return;
            RequestSent?.Invoke(context);
        }




        private static Task ProxyServer_ClientCertificateSelectionCallback(object arg1, Titanium.Web.Proxy.EventArguments.CertificateSelectionEventArgs e)
        {
            return Task.FromResult(0);
        }

        private static Task ProxyServer_ServerCertificateValidationCallback(object arg1, Titanium.Web.Proxy.EventArguments.CertificateValidationEventArgs e)
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
