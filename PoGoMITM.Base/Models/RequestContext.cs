using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Google.Protobuf;
using Newtonsoft.Json;
using PoGoMITM.Base.Cache;
using POGOProtos.Networking.Envelopes;
using POGOProtos.Networking.Platform;
using POGOProtos.Networking.Requests;
using Titanium.Web.Proxy.Models;

namespace PoGoMITM.Base.Models
{
    public class RequestData
    {
        [JsonIgnore]
        public byte[] RequestBody { get; set; }
        [JsonIgnore]
        public string RawDecodedRequestBody { get; set; }
        public RequestEnvelope RequestEnvelope { get; set; }
        public Dictionary<RequestType, IMessage> Requests { get; set; } = new Dictionary<RequestType, IMessage>();
        public Dictionary<PlatformRequestType, IMessage> PlatformRequests { get; set; } = new Dictionary<PlatformRequestType, IMessage>();
        public Signature DecryptedSignature { get; set; }
        [JsonIgnore]
        public byte[] RawDecryptedSignature { get; set; }
        [JsonIgnore]
        public byte[] RawEncryptedSignature { get; set; }
    }

    public class ResponseData
    {
        [JsonIgnore]
        public byte[] ResponseBody { get; set; }
        [JsonIgnore]
        public string RawDecodedResponseBody { get; set; }
        public ResponseEnvelope ResponseEnvelope { get; set; }
        public Dictionary<RequestType, IMessage> Responses { get; set; } = new Dictionary<RequestType, IMessage>();
        public Dictionary<PlatformRequestType, IMessage> PlatformResponses { get; set; } = new Dictionary<PlatformRequestType, IMessage>();
    }

    public class RequestContext
    {

        private static readonly ConcurrentDictionary<Guid, RequestContext> Cache = new ConcurrentDictionary<Guid, RequestContext>();

        private RawContext _rawContext;
        public static IProtoParser Parser { get; set; }
        public static List<IModifierPlugin> Modifiers { get; set; }
        public static IRequestPacker RequestPacker { get; set; }
        public static IResponsePacker ResponsePacker { get; set; }

        public Guid Guid { get; set; }
        public DateTime RequestTime { get; set; }
        public Uri RequestUri { get; set; }
        public string ClientIp { get; set; }

        // Request
        public List<HttpHeader> RequestHeaders { get; set; }
        public bool RequestModified { get; set; }

        public RequestData RequestData { get; set; } = new RequestData();
        public RequestData ModifiedRequestData { get; set; }

        // Response
        public List<HttpHeader> ResponseHeaders { get; set; }
        public bool ResponseModified { get; set; }

        public ResponseData ResponseData { get; set; } = new ResponseData();
        public ResponseData ModifiedResponseData { get; set; }

        private RequestContext()
        {

        }

        public static RequestContext GetInstance(RawContext rawContext)
        {
            RequestContext result;
            if (Cache.TryGetValue(rawContext.Guid, out result))
            {
                return result;
            }
            result = new RequestContext();
            result._rawContext = rawContext;
            result.Guid = rawContext.Guid;
            result.RequestTime = rawContext.RequestTime;
            result.RequestUri = rawContext.RequestUri;
            result.ClientIp = rawContext.ClientIp;
            result.CopyRequestData(rawContext);
            result.CopyResponseData(rawContext);

            Cache.TryAdd(rawContext.Guid, result);
            return result;
        }

        public void CopyRequestData(RawContext rawContext)
        {
            RequestHeaders = rawContext.RequestHeaders;
            RequestData.RequestBody = rawContext.RequestBody;
            ParseRequest(RequestData);
            if (rawContext.ModifiedRequestBody != null)
            {
                ModifiedRequestData = new RequestData { RequestBody = rawContext.ModifiedRequestBody };
                ParseRequest(ModifiedRequestData);
                RequestModified = true;
            }
        }

        public void CopyResponseData(RawContext rawContext)
        {
            ResponseData.ResponseBody = rawContext.ResponseBody;
            ResponseHeaders = rawContext.ResponseHeaders;
            ParseResponse(ResponseData);
            if (rawContext.ModifiedResponseBody != null)
            {
                ModifiedResponseData = new ResponseData() { ResponseBody = rawContext.ModifiedResponseBody };
                ParseResponse(ModifiedResponseData);
                ResponseModified = true;
            }
        }


        private void ParseRequest(RequestData requestData)
        {
            if (RequestUri.Host == "pgorelease.nianticlabs.com")
            {
                Parser?.ParseRequest(this, requestData);
            }
            else
            {
                if (requestData.RequestBody != null)
                    requestData.RawDecodedRequestBody = Encoding.UTF8.GetString(requestData.RequestBody);
            }
        }


        private void ParseResponse(ResponseData responseData)
        {
            if (RequestUri.Host == "pgorelease.nianticlabs.com")
            {
                Parser?.ParseResponse(this, responseData);
            }
            else
            {
                if (responseData.ResponseBody != null)
                    responseData.RawDecodedResponseBody = Encoding.UTF8.GetString(responseData.ResponseBody);
            }
        }

        public void ModifyRequest()
        {

            if (Modifiers == null || RequestPacker == null || Modifiers.Count == 0 || RequestData.RequestBody == null || RequestData.RequestBody.Length == 0) return;
            foreach (var requestModifier in Modifiers.Where(r => r.Enabled))
            {

                if (requestModifier.ModifyRequest(this))
                {
                    RequestModified = true;
                }
            }
            if (!RequestModified) return;
            if (ModifiedRequestData == null)
            {
                ModifiedRequestData = new RequestData();
                ModifiedRequestData.RequestBody = RequestPacker.GenerateRequestBody(RequestData);
            }
            else
            {
                ModifiedRequestData.RequestBody = RequestPacker.GenerateRequestBody(ModifiedRequestData);
                _rawContext.ModifiedRequestBody = ModifiedRequestData.RequestBody;
            }
            _rawContext.ModifiedRequestBody = ModifiedRequestData.RequestBody;
            ParseRequest(RequestData);
            ParseRequest(ModifiedRequestData);
        }

        public void ModifyResponse()
        {

            if (Modifiers == null || ResponsePacker == null || Modifiers.Count == 0 || ResponseData.ResponseBody == null || ResponseData.ResponseBody.Length == 0) return;
            foreach (var requestModifier in Modifiers.Where(r => r.Enabled))
            {
                if (requestModifier.ModifyResponse(this))
                {
                    ResponseModified = true;
                }
            }
            if (!ResponseModified) return;
            if (ModifiedResponseData == null)
            {
                ModifiedResponseData = new ResponseData();
                ModifiedResponseData.ResponseBody = ResponsePacker.GenerateResponseBody(ResponseData);
            }
            else
            {
                ModifiedResponseData.ResponseBody = ResponsePacker.GenerateResponseBody(ModifiedResponseData);
            }
            _rawContext.ModifiedResponseBody = ModifiedResponseData.ResponseBody;
            ParseResponse(ResponseData);
            ParseResponse(ModifiedResponseData);
        }

    }
}