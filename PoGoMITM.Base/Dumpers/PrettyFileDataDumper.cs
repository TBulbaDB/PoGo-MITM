using Google.Protobuf;
using Google.Protobuf.Collections;
using Newtonsoft.Json;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Models;
using PoGoMITM.Base.Utils;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Titanium.Web.Proxy.Models;

namespace PoGoMITM.Base.Dumpers
{
    public class PrettyFileDataDumper : IDataDumper
    {
        private static string filenameTemplate;

        static PrettyFileDataDumper()
        {
            filenameTemplate = "{0}{1}{2}.log";
        }
        public async Task Dump<T>(T context)
        {
            try
            {
                var requestList = "";
                if (context is RequestContext)
                {
                    foreach (var request in (context as RequestContext).RequestEnvelope.Requests)
                    {
                        requestList += (requestList == "" ? "" : ", ") + request.RequestType.ToString();
                    }
                    if (requestList != "") requestList = " " + requestList;
                }

                var logFilePath = GenerateLogFileName(typeof(T).Name, requestList);
                var sb = new StringBuilder();
                sb.AppendLine();

                var settings = new JsonSerializerSettings
                {
                    Formatting = Formatting.Indented,
                };
                settings.Converters.Add(new MyConverter());

                sb.AppendLine(JsonConvert.SerializeObject(context, Formatting.Indented, settings));
                //sb.AppendLine("/*** === ***/");
                await FileAsync.WriteTextAsync(logFilePath, sb.ToString(), Encoding.ASCII);

            }
            catch (Exception)
            {
            }

        }

        private string GenerateLogFileName(string name, string postfix)
        {
            var fileName = string.Format(filenameTemplate, name, DateTime.Now.ToString("yyyyMMddHHmmssfff"), postfix);
            Directory.CreateDirectory(AppConfig.DumpsFolder);
            return Path.Combine(AppConfig.DumpsFolder, fileName);
        }

        class MyConverter : JsonConverter
        {
            public override bool CanConvert(Type objectType)
            {
                if (objectType == typeof(ByteString)) return true;
                if (objectType == typeof(RepeatedField<ulong>)) return true;
                if (objectType == typeof(RepeatedField<byte>)) return true;
                if (objectType == typeof(RepeatedField<long>)) return true;
                if (objectType == typeof(RepeatedField<int>)) return true;
                if (objectType == typeof(RepeatedField<uint>)) return true;
                if (objectType == typeof(RepeatedField<POGOProtos.Networking.Requests.Request>)) return true;
                if (objectType == typeof(POGOProtos.Map.SpawnPoint)) return true;
                if (objectType == typeof(HttpHeader)) return true;
                return false;
            }

            public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
            {
                throw new NotImplementedException();
            }

            public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
            {
                writer.WriteRawValue(JsonConvert.SerializeObject(value, Formatting.None));
            }
        }

    }
}