using System;
using Newtonsoft.Json;

namespace PoGoMITM.Base.Utils
{
    public class LongConverter : JsonConverter
    {
        public override void WriteJson(
            JsonWriter writer,
            object value,
            JsonSerializer serializer)
        {
            if (value == null)
            {
                writer.WriteNull();
                return;
            }
            var longValue = (long) value;
            if (longValue > 9007199254740991)
            {
                writer.WriteValue("long: " + Convert.ToString(longValue));
            }
            else
            {
                writer.WriteValue(value);
            }

        }

        public override object ReadJson(
            JsonReader reader,
            Type objectType,
            object existingValue,
            JsonSerializer serializer)
        {
            if (reader.Value.ToString().StartsWith("long: "))
            {
                var numberString = reader.Value.ToString().Remove(0, 6);
                long retval;
                if (long.TryParse(numberString, out retval))
                {
                    return retval;
                }
                return 0;
            }
            else
            {
                long retval;
                if (long.TryParse(reader.Value.ToString(), out retval))
                {
                    return retval;
                }
                return 0;
            }
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType==typeof(long); 
        }
    }
}
