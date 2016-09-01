using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Google.Protobuf;
using Newtonsoft.Json;
using PoGoMITM.Base.Cache;
using PoGoMITM.Base.Config;
using POGOProtos.Map;
using POGOProtos.Networking.Envelopes;
using POGOProtos.Networking.Platform;
using POGOProtos.Networking.Requests;
using POGOProtos.Networking.Requests.Messages;
using POGOProtos.Networking.Responses;
using Titanium.Web.Proxy.Models;

namespace PoGoMITM.Base.Models
{
    public class RequestData
    {
        public RequestEnvelope RequestEnvelope { get; set; }
        public Dictionary<RequestType, IMessage> Requests { get; set; } = new Dictionary<RequestType, IMessage>();
        public Dictionary<PlatformRequestType, IMessage> PlatformRequests { get; set; } = new Dictionary<PlatformRequestType, IMessage>();
        public Signature DecryptedSignature { get; set; }

    }

    public class ResponseData
    {
        public ResponseEnvelope ResponseEnvelope { get; set; }
        public Dictionary<RequestType, IMessage> Responses { get; set; } = new Dictionary<RequestType, IMessage>();
        public Dictionary<PlatformRequestType, IMessage> PlatformResponses { get; set; } = new Dictionary<PlatformRequestType, IMessage>();
    }

    public class RequestContext
    {
        //[JsonIgnore]
        public bool RequestParsed { get; set; }
        //[JsonIgnore]
        public bool ResponseParsed { get; set; }

        public static IProtoParser Parser { get; set; }
        public static List<IRequestModifier> RequestModifiers { get; set; }
        public static List<IResponseModifier> ResponseModifiers { get; set; }
        public static IRequestPacker RequestPacker { get; set; }
        public static IResponsePacker ResponsePacker { get; set; }


        public Guid Guid { get; set; }
        public DateTime RequestTime { get; set; }
        public Uri RequestUri { get; set; }

        // Request
        public List<HttpHeader> RequestHeaders { get; set; }
        [JsonIgnore]
        public byte[] RequestBody { get; set; }
        [JsonIgnore]
        public string RawDecodedRequestBody { get; set; }
        public int RequestBodyLength { get; set; }

        public bool RequestModified { get; set; }
        public RequestData RequestData { get; set; }

        // Response
        public List<HttpHeader> ResponseHeaders { get; set; }
        [JsonIgnore]
        public byte[] ResponseBody { get; set; }
        [JsonIgnore]
        public string RawDecodedResponseBody { get; set; }
        public int ResponseBodyLength { get; set; }

        public bool ResponseModified { get; set; }
        public ResponseData ResponseData { get; set; }

        [JsonIgnore]
        public byte[] RawDecryptedSignature { get; set; }

        [JsonIgnore]
        public byte[] RawEncryptedSignature { get; set; }

        public static RequestContext GetInstance(Guid guid)
        {
            RequestContext result;
            if (ContextCache.RequestContext.TryGetValue(guid, out result))
            {
                return result;
            }
            return null;
        }

        public static RequestContext Create(RawContext context)
        {
            RequestContext result;
            if (!ContextCache.RequestContext.TryGetValue(context.Guid, out result))
            {
                result = new RequestContext();
            }
            result.Guid = context.Guid;
            result.RequestTime = context.RequestTime;
            result.RequestUri = context.RequestUri;

            ContextCache.RequestContext.AddOrUpdate(context.Guid, result, (g, r) => result);
            return result;
        }

        public void CopyRequestData(RawContext rawContext)
        {
            RequestBody = rawContext.RequestBody;
            RequestBodyLength = rawContext.RequestBody?.Length ?? 0;
            RequestHeaders = rawContext.RequestHeaders;
        }

        public void CopyResponseData(RawContext rawContext)
        {
            ResponseBody = rawContext.ResponseBody;
            ResponseBodyLength = rawContext.ResponseBody?.Length ?? 0;
            ResponseHeaders = rawContext.ResponseHeaders;
        }

        public void ParseRequest()
        {
            if (RequestUri.Host == "pgorelease.nianticlabs.com")
            {
                RequestData = new RequestData();
                Parser?.ParseRequest(this, RequestData);
            }
            else
            {
                if (RequestBody != null)
                    RawDecodedRequestBody = Encoding.UTF8.GetString(RequestBody);
            }
            RequestParsed = true;

        }

        public void ParseResponse()
        {
            if (RequestUri.Host == "pgorelease.nianticlabs.com")
            {
                ResponseData = new ResponseData();
                Parser?.ParseResponse(this, ResponseData);
            }
            else
            {
                if (ResponseBody != null)
                    RawDecodedResponseBody = Encoding.UTF8.GetString(ResponseBody);
            }

            ResponseParsed = true;


        }

        public void ModifyRequest()
        {
            if (RequestModifiers != null && RequestBody != null && RequestBody.Length != 0)
            {
                foreach (var requestModifier in RequestModifiers.Where(r=>r.Enabled))
                {
                    if (RequestData.Requests.ContainsKey(RequestType.GetMapObjects))
                    {
                        Debug.WriteLine("Client Request");
                        Debug.WriteLine(string.Join(",", ((GetMapObjectsMessage)RequestData.Requests[RequestType.GetMapObjects]).CellId.OrderBy(c => c)));
                    }

                    if (requestModifier.ModifyRequest(RequestData))
                    {
                        if (RequestData.Requests.ContainsKey(RequestType.GetMapObjects))
                        {
                            Debug.WriteLine("Modified Request");
                            Debug.WriteLine(string.Join(",",
                                ((GetMapObjectsMessage)RequestData.Requests[RequestType.GetMapObjects]).CellId.OrderBy(c => c)));
                        }
                        RequestModified = true;
                    }

                }
            }

            if (RequestPacker != null && RequestModified)
            {
                RequestBody = RequestPacker.GenerateRequestBody(this.RequestData);
                ParseRequest();
            }
        }

        public void ModifyResponse()
        {
            if (ResponseModifiers != null && ResponseBody != null && ResponseBody.Length != 0)
            {
                foreach (var responseModifier in ResponseModifiers.Where(r => r.Enabled))
                {
                    if (ResponseData.Responses.ContainsKey(RequestType.GetMapObjects))
                    {
                        Debug.WriteLine("Server Response");
                        Debug.WriteLine(string.Join(",", ((GetMapObjectsResponse)ResponseData.Responses[RequestType.GetMapObjects]).MapCells.Select(m => m.S2CellId).OrderBy(c => c).ToList()));
                    }
                    if (responseModifier.ModifyResponse(ResponseData))
                    {
                        if (ResponseData.Responses.ContainsKey(RequestType.GetMapObjects))
                        {
                            Debug.WriteLine("Modified Response");
                            Debug.WriteLine(string.Join(",",
                                ((GetMapObjectsResponse)ResponseData.Responses[RequestType.GetMapObjects]).MapCells
                                    .Select(m => m.S2CellId).OrderBy(c=>c).ToList()));
                        }
                        ResponseModified = true;
                    }

                }
            }

            if (ResponsePacker != null && ResponseModified)
            {
                ResponseBody = ResponsePacker.GenerateResponseBody(this.ResponseData);
                ParseResponse();
            }
        }

    }
}