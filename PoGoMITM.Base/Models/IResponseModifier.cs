using System.Threading.Tasks;

namespace PoGoMITM.Base.Models
{
    public interface IResponseModifier
    {
        bool Enabled { get; }
        bool ModifyResponse(RequestContext requestContext);
    }
}