using System;
using System.Linq;

namespace PoGoMITM.Base.Utils.Crypt
{
    public partial class Encryption 
    {

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
            if (input == null)
            {
                throw new ArgumentNullException(nameof(input));
            }
            if (input.Length < 288 || (input.Length - 32) % 256 != 0)
            {
                throw new ArgumentException("Invalid input length", nameof(input));
            }

            var output8 = input.Skip(32).ToArray();

            var output32 = new uint[output8.Length / 4];
            Buffer.BlockCopy(output8, 0, output32, 0, output8.Length);

            var cipherSource = input.Take(32).ToArray();


            var cipher8 = Cipher8FromIv(cipherSource);
            var cipher32 = new uint[cipher8.Length / 4];
            Buffer.BlockCopy(cipher8, 0, cipher32, 0, cipher8.Length);

            for (var offset = 0; offset < output32.Length; offset += 64)
            {
                var tmp = output32.Skip(offset).Take(64).ToArray();
                var shuffle32 = output32.Skip(offset).Take(64).ToArray();

                var shuffled32 = Unshuffle(shuffle32);


                for (var i = offset; i < offset + 64; i++)
                {
                    output32[i] = shuffled32[i - offset];
                }

                for (var ii = 0; ii < 64; ++ii)
                {
                    output32[offset + ii] ^= cipher32[ii];
                }
                cipher32 = tmp;

            }

            var tempResult = new byte[output32.Length * 4];
            Buffer.BlockCopy(output32, 0, tempResult, 0, output32.Length * 4);
            return tempResult.Take(tempResult.Length - tempResult.Last()).ToArray();
        }
    }
}
