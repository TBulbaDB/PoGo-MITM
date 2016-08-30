using System.Threading.Tasks;

namespace PoGoMITM.Base.Models
{
    public interface IRequestParser
    {
        Task ParseRequest(RequestContext requestContext);
        object SignatureEncryption { get; set; }
    }
}
