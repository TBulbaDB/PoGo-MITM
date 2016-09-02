using System;
using Newtonsoft.Json;

namespace PoGoMITM.Base.Utils
{
    public class ULongConverter : JsonConverter
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
            var longValue = (ulong) value;
            if (longValue > 9007199254740991 *2)
            {
                writer.WriteValue("ulong: " + Convert.ToString(longValue));
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
            if (reader.Value.ToString().StartsWith("ulong: "))
            {
                var numberString = reader.Value.ToString().Remove(0, 7);
                ulong retval;
                if (ulong.TryParse(numberString, out retval))
                {
                    return retval;
                }
                return 0;
            }
            else
            {
                ulong retval;
                if (ulong.TryParse(reader.Value.ToString(), out retval))
                {
                    return retval;
                }
                return 0;
            }
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType==typeof(ulong); 
        }
    }
}
