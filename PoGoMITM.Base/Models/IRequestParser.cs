using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PoGoMITM.Base.Models
{
    public interface IRequestParser
    {
        Task ParseRequest(RequestContext requestContext);
    }
}
