using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Utils;

namespace PoGoMITM.Base.Dumpers
{
    public class FileDataDumper : IDataDumper
    {
        private static string filenameTemplate;

        static FileDataDumper()
        {
            filenameTemplate = $"{{0}}{DateTime.Now.ToString("yyyyMMddHHmmss")}.log";
        }
        public async Task Dump<T>(T context)
        {
            try
            {
                var logFilePath = GenerateLogFileName(typeof(T).Name);
                var sb = new StringBuilder();
                sb.AppendLine();

                sb.AppendLine(JsonConvert.SerializeObject(context, Formatting.Indented));
                sb.AppendLine("/*** === ***/");
                await FileAsync.WriteTextAsync(logFilePath, sb.ToString(), Encoding.ASCII);

            }
            catch (Exception)
            {
            }

        }

        private string GenerateLogFileName(string name)
        {
            var fileName = string.Format(filenameTemplate, name);
            Directory.CreateDirectory(AppConfig.DumpsFolder);
            return Path.Combine(AppConfig.DumpsFolder, fileName);
        }
    }
}