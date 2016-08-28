using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Google.Protobuf;
using PoGoMITM.Base.ProtoHelpers;
using POGOProtos.Networking.Envelopes;
using POGOProtos.Networking.Platform;
using POGOProtos.Networking.Requests;

namespace PoGoMITM.Base.Models
{
    public class POGOProtosRequestParser:IRequestParser
    {
        public async Task ParseRequest(RequestContext result)
        {
            result.RawDecodedRequestBody = await Protoc.DecodeRaw(result.RequestBody);
            result.RawDecodedResponseBody = await Protoc.DecodeRaw(result.ResponseBody);

            var codedRequest = new CodedInputStream(result.RequestBody);
            result.RequestEnvelope = RequestEnvelope.Parser.ParseFrom(codedRequest);

            if (result.RequestEnvelope?.PlatformRequests != null &&
                result.RequestEnvelope?.PlatformRequests.Count > 0)
            {
                foreach (var platformRequest in result.RequestEnvelope.PlatformRequests)
                {
                    if (Enum.IsDefined(typeof(PlatformRequestType), platformRequest.Type))
                    {
                        var type =
                            Type.GetType("POGOProtos.Networking.Platform.Requests." + platformRequest.Type + "Request");
                        if (type != null)
                        {
                            var instance = (IMessage) Activator.CreateInstance(type);
                            instance.MergeFrom(platformRequest.RequestMessage);
                            result.PlatformRequests.Add(platformRequest.Type, instance);
                        }
                        else
                        {
                            result.PlatformRequests.Add(platformRequest.Type, platformRequest);
                        }
                    }

                    else
                    {
                        result.PlatformRequests.Add(platformRequest.Type, platformRequest);
                    }
                }
            }

            if (result.RequestEnvelope?.Requests != null && result.RequestEnvelope.Requests.Count > 0)
            {
                foreach (var request in result.RequestEnvelope.Requests)
                {
                    if (Enum.IsDefined(typeof(RequestType), request.RequestType))
                    {
                        var type =
                            Type.GetType("POGOProtos.Networking.Requests.Messages." + request.RequestType + "Message");
                        if (type != null)
                        {
                            var instance = (IMessage) Activator.CreateInstance(type);
                            instance.MergeFrom(request.RequestMessage);
                            result.Requests.Add(request.RequestType, instance);
                        }
                        else
                        {
                            result.Requests.Add(request.RequestType, request);
                        }
                    }
                    else
                    {
                        result.Requests.Add(request.RequestType, request);
                    }
                }
            }

            var codedResponse = new CodedInputStream(result.ResponseBody);
            result.ResponseEnvelope = ResponseEnvelope.Parser.ParseFrom(codedResponse);

            if (result.ResponseEnvelope?.PlatformReturns != null && result.ResponseEnvelope?.PlatformReturns.Count > 0)
            {
                foreach (var platformReturn in result.ResponseEnvelope.PlatformReturns)
                {
                    if (Enum.IsDefined(typeof(PlatformRequestType), platformReturn.Type))
                    {
                        var type =
                            Type.GetType("POGOProtos.Networking.Platform.Responses." + platformReturn.Type + "Response");
                        if (type != null)
                        {
                            var instance = (IMessage) Activator.CreateInstance(type);
                            instance.MergeFrom(platformReturn.Response);
                            result.PlatformResponses.Add(platformReturn.Type, instance);
                        }
                        else
                        {
                            result.PlatformResponses.Add(platformReturn.Type, platformReturn);
                        }
                    }

                    else
                    {
                        result.PlatformResponses.Add(platformReturn.Type, platformReturn);
                    }
                }
            }


            if (result.ResponseEnvelope?.Returns != null && result.ResponseEnvelope.Returns.Count > 0)
            {
                var index = 0;
                foreach (var request in result.Requests)
                {
                    if (Enum.IsDefined(typeof(RequestType), request.Key))
                    {
                        var requestType = (RequestType) request.Key;
                        var typeName = "POGOProtos.Networking.Responses." + requestType + "Response";
                        var type = Type.GetType(typeName);
                        if (type != null)
                        {
                            var instance = (IMessage) Activator.CreateInstance(type);
                            instance.MergeFrom(result.ResponseEnvelope.Returns[index]);
                            result.Responses.Add(requestType, instance);
                        }
                        else
                        {
                            result.Responses.Add(requestType, null);
                        }
                    }
                    else
                    {
                        result.Responses.Add(request.Key, null);
                    }
                    index++;
                }
            }
        }
    }
}
