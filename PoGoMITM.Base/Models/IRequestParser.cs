using System.Threading.Tasks;

namespace PoGoMITM.Base.Models
{
    public interface IProtoParser
    {
        void ParseRequest(RequestContext requestContext, RequestData requestData);
        void ParseResponse(RequestContext requestContext, ResponseData responseData);
        object SignatureEncryption { get; set; }
    }
}
