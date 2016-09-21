using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PoGoMITM.Base.Models
{
    public interface IPlugin
    {
        /// <summary>
        /// Controls whether the plugin is enabled or not
        /// </summary>
        bool Enabled { get; }
    }
}
