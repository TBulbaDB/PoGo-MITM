using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PoGoMITM.Base.Models;

namespace PoGoMITM.Launcher.ViewModels
{
    public class RequestContextListItemViewModel
    {
        public string Guid { get; set; }
        public DateTime RequestTime { get; set; }
        public string Host { get; set; }

        public string Methods { get; set; }

        public List<string> RequestTypes { get; set; }
    }
}
