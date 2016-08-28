using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Google.Protobuf;
using Newtonsoft.Json;
using PoGoMITM.Base.Cache;
using PoGoMITM.Base.ProtoHelpers;
using POGOProtos.Networking.Envelopes;
using POGOProtos.Networking.Platform;
using POGOProtos.Networking.Requests;
using Titanium.Web.Proxy.Models;

namespace PoGoMITM.Base.Models
{
    public class RequestContext
    {
        public static IRequestParser Parser { get; set; }

        public Guid Guid { get; set; }
        public DateTime RequestTime { get; set; }
        public Uri RequestUri { get; set; }

        // Request
        public List<HttpHeader> RequestHeaders { get; set; }
        [JsonIgnore]
        public byte[] RequestBody { get; set; }
        [JsonIgnore]
        public string RawDecodedRequestBody { get; set; }
        public RequestEnvelope RequestEnvelope { get; set; }
        public Dictionary<RequestType, IMessage> Requests { get; set; } = new Dictionary<RequestType, IMessage>();
        public int RequestBodyLength { get; set; }

        public Dictionary<PlatformRequestType, IMessage> PlatformRequests { get; set; } = new Dictionary<PlatformRequestType, IMessage>();

        // Response
        public List<HttpHeader> ResponseHeaders { get; set; }
        [JsonIgnore]
        public byte[] ResponseBody { get; set; }
        [JsonIgnore]
        public string RawDecodedResponseBody { get; set; }
        public ResponseEnvelope ResponseEnvelope { get; set; }
        public Dictionary<RequestType, IMessage> Responses { get; set; } = new Dictionary<RequestType, IMessage>();
        public int ResponseBodyLength { get; set; }

        public Dictionary<PlatformRequestType, IMessage> PlatformResponses { get; set; } = new Dictionary<PlatformRequestType, IMessage>();



        public Signature DecryptedSignature { get; set; }

        [JsonIgnore]
        public byte[] RawDecryptedSignature { get; set; }

        public static async Task<RequestContext> GetInstance(RawContext context)
        {
            RequestContext requestContext;
            if (ContextCache.RequestContext.TryGetValue(context.Guid, out requestContext))
            {
                return requestContext;
            }
            var result = new RequestContext();

            result.Guid = context.Guid;
            result.RequestTime = context.RequestTime;
            result.RequestUri = context.RequestUri;

            result.RequestBody = context.RequestBody;
            result.RequestBodyLength = context.RequestBody?.Length ?? 0;
            result.ResponseBody = context.ResponseBody;
            result.ResponseBodyLength = context.ResponseBody?.Length ?? 0;

            result.RequestHeaders = context.RequestHeaders;
            result.ResponseHeaders = context.ResponseHeaders;

            if (result.RequestUri.Host == "pgorelease.nianticlabs.com")
            {
                if (Parser != null)
                {
                    await Parser.ParseRequest(result);
                }
                
            }
            else
            {
                if (result.RequestBody != null)
                    result.RawDecodedRequestBody = Encoding.UTF8.GetString(result.RequestBody);
                if (result.ResponseBody != null)
                    result.RawDecodedResponseBody = Encoding.UTF8.GetString(result.ResponseBody);
            }


            ContextCache.RequestContext.TryAdd(context.Guid, result);
            return result;
        }

    }
}