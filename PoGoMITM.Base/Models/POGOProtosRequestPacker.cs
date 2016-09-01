using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Google.Protobuf;
using Google.Protobuf.Collections;
using PoGoMITM.Base.Utils.Crypt;
using POGOProtos.Networking.Envelopes;
using POGOProtos.Networking.Platform;
using POGOProtos.Networking.Platform.Requests;
using POGOProtos.Networking.Requests;

namespace PoGoMITM.Base.Models
{
    public class POGOProtosRequestPacker : IRequestPacker
    {
        public byte[] GenerateRequestBody(RequestData requestData)
        {
            var requestEnvelope = new RequestEnvelope(requestData.RequestEnvelope);
            requestEnvelope.Requests.Clear();
            foreach (var request in requestData.Requests)
            {
                var requestItem = new Request();
                requestItem.RequestType = request.Key;
                requestItem.RequestMessage = request.Value.ToByteString();
                requestEnvelope.Requests.Add(requestItem);
            }

            var signatureRequest = GetSignatureRequest(requestData);
            requestEnvelope.PlatformRequests.Clear();
            foreach (var platformRequest in requestData.RequestEnvelope.PlatformRequests)
            {
                if (platformRequest.Type == PlatformRequestType.SendEncryptedSignature)
                {
                    requestEnvelope.PlatformRequests.Add(signatureRequest);
                }
                else
                {
                    requestEnvelope.PlatformRequests.Add(platformRequest);
                }
            }

            return requestEnvelope.ToByteArray();
        }


        private RequestEnvelope.Types.PlatformRequest GetSignatureRequest(RequestData requestData)
        {
            var serializedTicket = requestData.RequestEnvelope.AuthTicket != null ? requestData.RequestEnvelope.AuthTicket.ToByteArray() : requestData.RequestEnvelope.AuthInfo.ToByteArray();
            var firstHash = CalculateHash32(serializedTicket, 0x61656632);
            var locationBytes = BitConverter.GetBytes(requestData.RequestEnvelope.Latitude).Reverse()
                .Concat(BitConverter.GetBytes(requestData.RequestEnvelope.Latitude).Reverse())
                .Concat(BitConverter.GetBytes(requestData.RequestEnvelope.Accuracy).Reverse()).ToArray();

            requestData.DecryptedSignature.LocationHash1 = CalculateHash32(locationBytes, firstHash);
            requestData.DecryptedSignature.LocationHash2 = CalculateHash32(locationBytes, 0x61656632);
            var seed = xxHash64.CalculateHash(serializedTicket, serializedTicket.Length, 0x61656632);
            foreach (var req in requestData.RequestEnvelope.Requests)
            {
                var reqBytes = req.ToByteArray();
                requestData.DecryptedSignature.RequestHash.Add(xxHash64.CalculateHash(reqBytes, reqBytes.Length, seed));
                //requestContext.DecryptedSignature.Unknown25 = 7363665268261373700;
            }

            var platformRequest = new RequestEnvelope.Types.PlatformRequest()
            {
                Type = PlatformRequestType.SendEncryptedSignature,
                RequestMessage = new SendEncryptedSignatureRequest()
                {
                    EncryptedSignature = ByteString.CopyFrom(Encryption.Encrypt(requestData.DecryptedSignature.ToByteArray())),
                }.ToByteString(),
            };
            return platformRequest;
        }

        private uint CalculateHash32(byte[] bytes, uint seed)
        {
            var xxHash = new xxHash32();
            xxHash.Init(seed);
            xxHash.Update(bytes, bytes.Length);
            return xxHash.Digest();
        }

        //_requestSeedHasher = new xxHash(64, 0x61656632);
        //_locationSeedHasher = new xxHash32(32, 0x61656632);

        ////_unknown25Hasher = new xxHash(64, 0x88533787);
        //_unknown25hash = 7363665268261374000; //BitConverter.ToInt64(_unknown25Hasher.ComputeHash(System.Text.Encoding.ASCII.GetBytes("\"b8fa9757195897aae92c53dbcf8a60fb3d86d745\"")), 0);


        //private RequestEnvelope.Types.PlatformRequest GenerateEncrypterSignaturePlatformRequest(double accuracy, IEnumerable<IMessage> requests, byte[] ticketSerialized, List<Signature.Types.LocationFix> locationFixes)
        //{
        //    var _locationSeedHasher = new xxHash32();
        //    var sig = new Signature();
        //    //sig.Timestamp = (ulong)DateTime.UtcNow.ToUnixMilliseconds();
        //    //sig.TimestampSinceStart = sig.Timestamp - LastLoginTime;
        //    // according to google, normalizing the angles means normalizing *0 to 360* degree values to -180..180


        //    var locationSeed = BitConverter.ToUInt32(xxHash32.CalculateHash(ticketSerialized, 32, 0x61656632).GetHashCode());

        //    var locationHasher = new xxHash(32, locationSeed);
        //    var locationBytes =
        //        BitConverter.GetBytes(CurrentLatitude).Reverse()
        //        .Concat(BitConverter.GetBytes(CurrentLongitude).Reverse())
        //        .Concat(BitConverter.GetBytes(accuracy).Reverse()).ToArray();

        //    sig.LocationHash1 = BitConverter.ToUInt32(locationHasher.ComputeHash(locationBytes), 0);

        //    sig.LocationHash2 = BitConverter.ToUInt32(_locationSeedHasher.ComputeHash(locationBytes), 0);

        //    var requestSeed = BitConverter.ToUInt64(_requestSeedHasher.ComputeHash(ticketSerialized), 0);
        //    var requestHasher = new xxHash(64, requestSeed);
        //    foreach (var req in requests)
        //    {
        //        sig.RequestHash.Add(BitConverter.ToUInt64(requestHasher.ComputeHash(req.ToByteArray()), 0));
        //    }

        //    sig.SessionHash = ByteString.CopyFrom(_sessionHash);
        //    sig.Unknown25 = _unknown25hash;

        //    var platformRequest = new RequestEnvelope.Types.PlatformRequest()
        //    {
        //        Type = POGOProtos.Networking.Platform.PlatformRequestType.SendEncryptedSignature,
        //        RequestMessage = new SendEncryptedSignatureRequest()
        //        {
        //            EncryptedSignature = ByteString.CopyFrom(Encrypt(sig.ToByteArray())),
        //        }.ToByteString(),
        //    };
        //    return platformRequest;
        //}
    }
}