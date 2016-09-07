using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Titanium.Web.Proxy.Models;

namespace PoGoMITM.Base.Models
{
    public class RawContext
    {
        public Guid Guid { get; set; }
        public DateTime RequestTime { get; set; }
        public Uri RequestUri { get; set; }
        public string ClientIp { get; set; }

        public List<HttpHeader> RequestHeaders { get; set; }
        public byte[] RequestBody { get; set; }
        public byte[] ModifiedRequestBody { get; set; }

        public List<HttpHeader> ResponseHeaders { get; set; }
        public byte[] ResponseBody { get; set; }
        public byte[] ModifiedResponseBody { get; set; }

        [JsonIgnore]
        public bool IsLive { get; set; }
    }
}
