using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using POGOProtos.Networking.Requests;

namespace PoGoMITM.Base.Plugins
{
    public class RequestTypeSwitchGenerator
    {
        public static string GenerateForRequest()
        {
            var sb=new StringBuilder();
            var values = Enum.GetNames(typeof(RequestType)).OrderBy(t=>t).ToList();
            foreach (var value in values)
            {
                var lowerCamel = value.Substring(0, 1).ToLowerInvariant() + value.Substring(1);
                sb.AppendLine($"case RequestType.{value}:");
                sb.AppendLine($"var {lowerCamel}Message=({value}Message)request.Value;");
                sb.AppendLine($"break;");
            }
            return sb.ToString();
        }

        public static string GenerateForResponse()
        {
            var sb = new StringBuilder();
            var values = Enum.GetNames(typeof(RequestType)).OrderBy(t => t).ToList();
            foreach (var value in values)
            {
                var lowerCamel = value.Substring(0, 1).ToLowerInvariant() + value.Substring(1);
                sb.AppendLine($"case RequestType.{value}:");
                sb.AppendLine($"var {lowerCamel}Response=({value}Response)response.Value;");
                sb.AppendLine($"break;");
            }
            return sb.ToString();
        }


    }
}
