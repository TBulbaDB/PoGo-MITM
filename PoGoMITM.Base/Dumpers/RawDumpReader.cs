using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Models;

namespace PoGoMITM.Base.Dumpers
{
    public static class RawDumpReader
    {
        public static List<string> GetRawDumpSessions()
        {
            return Directory.Exists(AppConfig.DumpsFolder) ?
                Directory.GetFiles(AppConfig.DumpsFolder).Where(f => f.Contains("\\RawContext")).Select(f => f.Split('\\').Last()).ToList() :
                new List<string>();
        }

        public static List<RawContext> GetSession(string fileName)
        {
            if (!Path.IsPathRooted(fileName) && !fileName.Contains("\\"))
                fileName = Path.Combine(AppConfig.DumpsFolder, fileName); 
            if (!File.Exists(fileName)) return new List<RawContext>();
            var content = File.ReadAllText(fileName);
            var dumpJsons = content.Split(new[] {"/*** === ***/"}, StringSplitOptions.RemoveEmptyEntries);
            return dumpJsons.Select(JsonConvert.DeserializeObject<RawContext>).ToList();
        }
    }
}
