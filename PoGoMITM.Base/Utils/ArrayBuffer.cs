using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace System
{
    // http://www.khronos.org/registry/typedarray/specs/latest/#5

    public class ArrayBuffer
    {
        public static bool IsSupported => false;

        public static bool Is(object obj)
        {
            return false;
        }

        public ArrayBuffer(int size) { }

        public int ByteLength => 0;

        public ArrayBuffer Slice(int begin) { return null; }

        public ArrayBuffer Slice(int begin, int end) { return null; }
    }

    // http://www.khronos.org/registry/typedarray/specs/latest/#6

    public class ArrayBufferView<T>
    {
        protected ArrayBufferView() { }

        public ArrayBuffer Buffer { get { return null; } }

        public int ByteOffset { get { return 0; } }

        public int ByteLength { get { return 0; } }

        public T this[int i] { get { return default(T); } set { } }
    }

    public class UInt8Array : ArrayBufferView<byte>
    {
        public UInt8Array(ArrayBuffer buffer) { }

        public static bool Is(object obj) { return false; }
    }

    public class Int8Array : ArrayBufferView<sbyte>
    {
        public Int8Array(ArrayBuffer buffer) { }

    }

    public class UInt8ClampedArray : ArrayBufferView<uint>
    {
        public UInt8ClampedArray(ArrayBuffer buffer) { }
    }

    public class Int16Array : ArrayBufferView<short>
    {
        public Int16Array(ArrayBuffer buffer) { }
    }

    public class UInt16Array : ArrayBufferView<ushort>
    {
        public UInt16Array(ArrayBuffer buffer) { }
    }

    public class Int32Array : ArrayBufferView<int>
    {
        public Int32Array(ArrayBuffer buffer) { }
    }

    public class UInt32Array : ArrayBufferView<uint>
    {
        public UInt32Array(ArrayBuffer buffer) { }
    }

    public class Float32Array : ArrayBufferView<float>
    {
        public Float32Array(ArrayBuffer buffer) { }
    }

    public class Float64Array : ArrayBufferView<double>
    {
        public Float64Array(ArrayBuffer buffer) { }
    }
    public static class ArrayExtensions
    {
        public static T[] Slice<T>(this T[] arr, uint indexFrom, uint indexTo = 0)
        {
            if (indexTo == 0 && arr.Length > 0)
                indexTo = (uint)arr.Length - 1;

            if (indexFrom > indexTo)
            {
                throw new ArgumentOutOfRangeException("indexFrom is bigger than indexTo!");
            }

            uint length = indexTo - indexFrom;
            T[] result = new T[length];
            Array.Copy(arr, indexFrom, result, 0, length);

            return result;
        }
    }

}

