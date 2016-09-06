using System;
using System.Collections.Concurrent;
using PoGoMITM.Base.Models;

namespace PoGoMITM.Base.Cache
{
    public static class ContextCache
    {
        public static ConcurrentDictionary<Guid, RawContext> RawContexts = new ConcurrentDictionary<Guid, RawContext>();

    }
}
