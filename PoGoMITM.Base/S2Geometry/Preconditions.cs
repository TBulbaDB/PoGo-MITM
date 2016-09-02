using System;

namespace Google.Common.Geometry
{
    internal static class Preconditions
    {
        public static void CheckArgument(bool expression, string message = null)
        {
            if (!expression)
                throw new ArgumentException(message ?? string.Empty);
        }

        public static void CheckState(bool expression, string message = null)
        {
            if (!expression)
                throw new InvalidOperationException(message ?? "bad state");
        }
    }
}