using System.Threading.Tasks;

namespace PoGoMITM.Base.Models
{
    public interface IRequestModifier
    {
        bool Enabled { get; }
        bool ModifyRequest(RequestContext requestContext);
    }
}