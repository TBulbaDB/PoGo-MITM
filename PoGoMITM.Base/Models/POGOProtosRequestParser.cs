using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Google.Protobuf;
using PoGoMITM.Base.ProtoHelpers;
using PoGoMITM.Base.Utils;
using PoGoMITM.Base.Utils.Crypt;
using POGOProtos.Networking.Envelopes;
using POGOProtos.Networking.Platform;
using POGOProtos.Networking.Requests;

namespace PoGoMITM.Base.Models
{
    public class POGOProtosProtoParser : IProtoParser
    {
        public void ParseRequest(RequestContext result, RequestData requestData)
        {
            //result.RawDecodedRequestBody = await Protoc.DecodeRaw(result.RequestBody);
            //result.RawDecodedResponseBody = await Protoc.DecodeRaw(result.ResponseBody);

            if (result.RequestBody != null && result.RequestBody.Length > 0)
            {
                var codedRequest = new CodedInputStream(result.RequestBody);
                requestData.RequestEnvelope = RequestEnvelope.Parser.ParseFrom(codedRequest);

                if (requestData.RequestEnvelope?.PlatformRequests != null &&
                    requestData.RequestEnvelope?.PlatformRequests.Count > 0)
                {
                    foreach (var platformRequest in requestData.RequestEnvelope.PlatformRequests)
                    {
                        if (Enum.IsDefined(typeof(PlatformRequestType), platformRequest.Type))
                        {
                            var type =
                                Type.GetType("POGOProtos.Networking.Platform.Requests." + platformRequest.Type +
                                             "Request");
                            if (type != null)
                            {
                                var instance = (IMessage)Activator.CreateInstance(type);
                                instance.MergeFrom(platformRequest.RequestMessage);
                                requestData.PlatformRequests.Add(platformRequest.Type, instance);
                            }
                            else
                            {
                                requestData.PlatformRequests.Add(platformRequest.Type, platformRequest);
                            }
                        }

                        else
                        {
                            requestData.PlatformRequests.Add(platformRequest.Type, platformRequest);
                        }
                    }
                }

                if (requestData.RequestEnvelope?.Requests != null && requestData.RequestEnvelope.Requests.Count > 0)
                {
                    foreach (var request in requestData.RequestEnvelope.Requests)
                    {
                        if (Enum.IsDefined(typeof(RequestType), request.RequestType))
                        {
                            var type =
                                Type.GetType("POGOProtos.Networking.Requests.Messages." + request.RequestType +
                                             "Message");
                            if (type != null)
                            {
                                var instance = (IMessage)Activator.CreateInstance(type);
                                instance.MergeFrom(request.RequestMessage);
                                requestData.Requests.Add(request.RequestType, instance);
                            }
                            else
                            {
                                requestData.Requests.Add(request.RequestType, request);
                            }
                        }
                        else
                        {
                            requestData.Requests.Add(request.RequestType, request);
                        }
                    }
                }

                var sig =
                    requestData.RequestEnvelope?.PlatformRequests?.FirstOrDefault(
                        pr => pr.Type == PlatformRequestType.SendEncryptedSignature);
                if (sig != null)
                {
                    var req = new POGOProtos.Networking.Platform.Requests.SendEncryptedSignatureRequest();
                    req.MergeFrom(sig.RequestMessage);
                    var bytes = req.EncryptedSignature.ToByteArray();
                    result.RawEncryptedSignature = bytes;
                    try
                    {
                        if (bytes.Length > 0)
                        {
                            result.RawDecryptedSignature = Encryption.Decrypt(bytes);
                            //result.RawDecryptedSignature =
                            //    SignatureEncryption.GetType()
                            //        .InvokeMember("Decrypt", BindingFlags.Default | BindingFlags.InvokeMethod, null,
                            //            SignatureEncryption, new[] {bytes}) as byte[];
                            if (result.RawDecryptedSignature != null)
                            {
                                requestData.DecryptedSignature = Signature.Parser.ParseFrom(result.RawDecryptedSignature);
                            }
                        }
                    }
                    catch
                    {

                    }
                }
            }


        }

        public void ParseResponse(RequestContext result, ResponseData responseData)
        {
            if (result.ResponseBody != null && result.RequestBody.Length > 0)
            {
                var codedResponse = new CodedInputStream(result.ResponseBody);
                responseData.ResponseEnvelope = ResponseEnvelope.Parser.ParseFrom(codedResponse);
                if (responseData.ResponseEnvelope.StatusCode == ResponseEnvelope.Types.StatusCode.BadRequest)
                {
                    Console.WriteLine("ERROR: StatusCode.BadRequest, possibly banned account.");
                }

                if (responseData.ResponseEnvelope?.PlatformReturns != null &&
                    responseData.ResponseEnvelope?.PlatformReturns.Count > 0)
                {
                    foreach (var platformReturn in responseData.ResponseEnvelope.PlatformReturns)
                    {
                        if (Enum.IsDefined(typeof(PlatformRequestType), platformReturn.Type))
                        {
                            var type =
                                Type.GetType("POGOProtos.Networking.Platform.Responses." + platformReturn.Type +
                                             "Response");
                            if (type != null)
                            {
                                var instance = (IMessage)Activator.CreateInstance(type);
                                instance.MergeFrom(platformReturn.Response);
                                responseData.PlatformResponses.Add(platformReturn.Type, instance);
                            }
                            else
                            {
                                responseData.PlatformResponses.Add(platformReturn.Type, platformReturn);
                            }
                        }

                        else
                        {
                            responseData.PlatformResponses.Add(platformReturn.Type, platformReturn);
                        }
                    }
                }
            }



            if (responseData.ResponseEnvelope?.Returns != null && responseData.ResponseEnvelope.Returns.Count > 0 &&
                responseData.ResponseEnvelope.Returns.Any(r => !r.IsEmpty))
            {
                responseData.Responses.Clear();

                var index = 0;
                foreach (var request in result.RequestData.Requests)
                {
                    if (Enum.IsDefined(typeof(RequestType), request.Key))
                    {
                        var requestType = (RequestType)request.Key;
                        var typeName = "POGOProtos.Networking.Responses." + requestType + "Response";
                        var type = Type.GetType(typeName);
                        if (type != null)
                        {
                            var instance = (IMessage)Activator.CreateInstance(type);
                            instance.MergeFrom(responseData.ResponseEnvelope.Returns[index]);
                            responseData.Responses.Add(requestType, instance);
                        }
                        else
                        {
                            responseData.Responses.Add(requestType, null);
                        }
                    }
                    else
                    {
                        responseData.Responses.Add(request.Key, null);
                    }
                    index++;

                }
            }
        }

        public object SignatureEncryption { get; set; }
    }
}
