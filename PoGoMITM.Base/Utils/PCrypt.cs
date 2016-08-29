using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Google.Protobuf;
using MongoDB.Bson.IO;
using PoGoMITM.Base.Dumpers;
using PoGoMITM.Base.Models;
using POGOProtos.Networking.Platform;

namespace PoGoMITM.Base.Utils
{
    public static partial class PCrypt
    {
        public static byte[] Test()
        {
            var dumps = RawDumpReader.GetSession("RawContext20160829112905.log");
            var dump = dumps[dumps.Count - 4];
            if (dump != null)
            {
                RequestContext context = null;
                Task.Run(async () =>
                {
                    context = await RequestContext.GetInstance(dump);

                }).Wait();
                var sig = context?.RequestEnvelope?.PlatformRequests?.FirstOrDefault(
                    pr => pr.Type == PlatformRequestType.SendEncryptedSignature);
                if (sig != null)
                {
                    //var bytes=sig.RequestMessageva
                    var req = new POGOProtos.Networking.Platform.Requests.SendEncryptedSignatureRequest();
                    req.MergeFrom(sig.RequestMessage);
                    var bytes = req.EncryptedSignature.ToByteArray();
                    return Decrypt(bytes);
                }
            }

            throw new Exception("Couldn't find a signature");
        }

        private static byte Rotl8(uint x, int n)
        {
            return (byte)(((x << n) | (x >> (8 - n))) & byte.MaxValue);
        }

        private static byte[] Cipher8FromIv(byte[] iv)
        {
            var cipher8 = new byte[256];
            for (var ii = 0; ii < 8; ++ii)
            {
                for (var jj = 0; jj < 32; ++jj)
                {
                    cipher8[32 * ii + jj] = Rotl8(iv[jj], ii);
                }
            }
            return cipher8;
        }


        public static byte[] Decrypt(byte[] input)
        {

            //// Sanity checks
            //if (!(input instanceof Buffer)) {
            //    throw new Error('Input must be Buffer');
            //} else
            if (input.Length < 288 || (input.Length - 32) % 256 != 0)
            {
                throw new Exception("Invalid input length");
            }

            //// Allocate space for decrypted payload
            var output8 = input.Skip(32).ToArray();

            var output32 = new uint[output8.Length / 4];
            Buffer.BlockCopy(output8, 0, output32, 0, output8.Length / 4);

            var cipherSource = input.Take(32).ToArray();
            var cipherBuffer = new uint[32];
            Buffer.BlockCopy(cipherSource, 0, cipherBuffer, 0, 32);

            var cipher8 = Cipher8FromIv(cipherSource);
            var cipher32 = new uint[cipher8.Length / 4];
            Buffer.BlockCopy(cipher8, 0, cipher32, 0, cipher8.Length );
            //let outputBuffer = output8.buffer;
            //let output32 = new Int32Array(outputBuffer);

            //// Initialize cipher
            //let cipher32 = new Int32Array(cipher8FromIV(input.slice(0, 32)).buffer);

            //// Decrypt in chunks of 256 bytes
            for (var offset = 0; offset < output8.Length; offset += 256)
            {
                var tmp = output8.Skip(offset).Take(256).ToArray();
                var shuffle32 = new uint[64];
                Buffer.BlockCopy(output8, offset, shuffle32, 0, 256);

                var shuffled32 = Unshuffle(shuffle32);
                for (var ii = 0; ii < 64; ++ii)
                {
                    output32[offset / 4 + ii] ^= cipher32[ii];
                }
                cipher32 = new uint[64];
                Buffer.BlockCopy(tmp, 0, cipher32, 0, 256);
                //cipher32 = new Int32Array(tmp.buffer);
            }
            //return new Buffer(outputBuffer).slice(0, output8.length - output8[output8.length - 1]);
            return new byte[1];
        }
    }
}
