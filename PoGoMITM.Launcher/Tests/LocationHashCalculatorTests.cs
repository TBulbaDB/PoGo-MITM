using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Google.Protobuf;
using Newtonsoft.Json;
using PoGoMITM.Base.Models;
using PoGoMITM.Base.Utils.Crypt;

namespace PoGoMITM.Launcher.Tests
{
    public static class LocationHashCalculatorTests
    {
        public static void Init()
        {
            var data =
                "{\r\n  \"Guid\": \"cb277621-9481-4382-afc5-57e6ff884253\",\r\n  \"RequestTime\": \"2016-09-02T09:47:55.7776192Z\",\r\n  \"RequestUri\": \"https://pgorelease.nianticlabs.com/plfe/536/rpc\",\r\n  \"ClientIp\": \"192.168.1.41\",\r\n  \"RequestHeaders\": [\r\n    {\r\n      \"Name\": \"Connection\",\r\n      \"Value\": \"Keep-Alive\"\r\n    },\r\n    {\r\n      \"Name\": \"Content-Type\",\r\n      \"Value\": \"application/x-www-form-urlencoded\"\r\n    },\r\n    {\r\n      \"Name\": \"User-Agent\",\r\n      \"Value\": \"Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus 5 Build/MOB30Y)\"\r\n    },\r\n    {\r\n      \"Name\": \"Host\",\r\n      \"Value\": \"pgorelease.nianticlabs.com\"\r\n    },\r\n    {\r\n      \"Name\": \"Accept-Encoding\",\r\n      \"Value\": \"gzip,deflate,zlib\"\r\n    },\r\n    {\r\n      \"Name\": \"Content-Length\",\r\n      \"Value\": \"966\"\r\n    }\r\n  ],\r\n  \"RequestBody\": \"CAIYgoCAgIDJ39tTIg4IAhIKCggKAlVTEgJlbiIDCNgEMqgGCAYSowYKoAalYs7OACzlRGIF+6mrRVUrm4JssmFThXPCL+6i4nPWRMUyRMUkf+3oJvKhkNlPzYABwCZ8bHSd14190UHVELIxPjCZ1jhp1oX5m9Gm542KMMBdtH9+bVY6RSHDWXGzjqbnxY9S1aHlOg81zVpqsVVAhHv4ORxpOyrokVjpI0hw4ppNNa/F9P+sxNluhIMgVvtOvprH9qT4bf51h0GgeQc0YOPAwIv2RAJ4Rg3yOjkQexhK/apWJYweyiYquzo0Sh8hCLzHoxWdMqnGIf0bxhMhKnTlcAa2NYelF/5k6/Wth6wuvQpg5qHYLhj9tWB9x+kIGQBjntdQb3EdIG4vMx2horwEiHKdWGueTg/JRzesUgojgMswEOQoVsSO2CFgNZVTTg9sP1f5QFan33XFyrKNb+Tsk139XDvMS6+974hxunxRMVlH8RmQrPul4Maie1Y471qbVdp+xetcxi/G7Eplius+IYLVfG59M4tHZAhbhb+Sxx7X22VyxtoZlJ2D3bid5Wjt/9BLwYfSd+HPaEbvLzgTX39m0VQ6t3HOXXX/CMPqc+IaXQEqDV90PDnVDcrGXY0gmwwZYQ2+QmmJUykNfGNbLGDAHekdtSdP2P9EI4+vOGZ9dQUozLb6XFSimYJqgtmu/Sg9mlIgS1IUrTJ39FrTDtVwEptK8/9+4l9O9RCxskJSwEBEECXwn+oVtaS0s+JnR+vnEv2OOs2YXlB1R5OWsBAxkHytQglZYKnHvTJRPnpONKS16ZIrjnxBi3eJXOTOw0XgEz1TP0OklbWzMuQhtrMs/hydPeikBgewiOn52AdhmQqENyOOFaNcLrWTon0jhD0ZHcy9a/iUlH6vZct+UJx107g0fPr6fgKr+2bLQ1KJMMXa+V6e/M/1k0b+p5fEgYDGa5aOMRWTbc/r/uMjIE8aIlyEeurejMLrBHrpvmZuPxVrdON0/IGTI3iQq4ch4xk3uZEetOCHA6FP3z/8nyUFebL0gZEQ8WJK75Pb9h5FZ0svxevOBrhUUWKCK4k7xkWy8LWS0tCFboL7dmORQojsFOUMxYyXIk1clDkAAADgRzpDQEEAAACAKis7QEkAAADgIls5QFJaCgNwdGMSUwpPVEdULTI0MzgyMjExLTVxV2RKc2M0NDdDNzVXZ1NpemdScVNVbHZwQjFtRnBSNHhPU2o5dEh5dHZmWE92VjZkLXNzby5wb2tlbW9uLmNvbRANYONd\",\r\n  \"ResponseHeaders\": [\r\n    {\r\n      \"Name\": \"Server\",\r\n      \"Value\": \"nginx/1.11.1\"\r\n    },\r\n    {\r\n      \"Name\": \"Date\",\r\n      \"Value\": \"Fri, 02 Sep 2016 09:47:55 GMT\"\r\n    },\r\n    {\r\n      \"Name\": \"Cache-Control\",\r\n      \"Value\": \"no-cache\"\r\n    },\r\n    {\r\n      \"Name\": \"Content-Encoding\",\r\n      \"Value\": \"gzip\"\r\n    },\r\n    {\r\n      \"Name\": \"Via\",\r\n      \"Value\": \"1.1 google\"\r\n    },\r\n    {\r\n      \"Name\": \"Content-Type\",\r\n      \"Value\": \"text/html; charset=UTF-8\"\r\n    },\r\n    {\r\n      \"Name\": \"Alt-Svc\",\r\n      \"Value\": \"clear\"\r\n    },\r\n    {\r\n      \"Name\": \"Transfer-Encoding\",\r\n      \"Value\": \"chunked\"\r\n    }\r\n  ],\r\n  \"ResponseBody\": \"CAEQgoCAgIDJ39tTMgYIBhICCAE6awpQD0R2hK832MF5MrmeOeeCI1C2Vtr33QZYHmfMUueEXEFyQNVW8cVw/hAbxB6dEh2NAkFbfNNKkgUu4zldQaCarka/I8ib+VfkrNOw3k7TPz4Ql8ie0+4qGhC+XJ1sGCZm+qWTs1Usq1mIogZQCAESTAjZ38bD6SoSDkRlbGluZGFXaW5zdG9uOgUAAQMEB0IASPoBUN4CWgBiAGoAcgoKCFBPS0VDT0lOcg0KCFNUQVJEVVNUEOASeAGCAQCiBgMSASA=\"\r\n}";

            var rawContext = JsonConvert.DeserializeObject<RawContext>(data);
            var requestContext = RequestContext.Create(rawContext);
            requestContext.CopyRequestData(rawContext);
            requestContext.CopyResponseData(rawContext);
            requestContext.ParseRequest();
            requestContext.ParseResponse();

            var requestData = requestContext.RequestData;
            Test1(requestData);
            Test2(requestData);


        }

        private static void Test1(RequestData requestData)
        {
            var auth = requestData.RequestEnvelope.AuthInfo;
            var serializedTicket = auth.ToByteArray();
            var locationSeed = CalculateHash32(serializedTicket, 0x61656632);
            var locationBytes = BitConverter.GetBytes(requestData.RequestEnvelope.Latitude).Reverse()
                .Concat(BitConverter.GetBytes(requestData.RequestEnvelope.Longitude).Reverse())
                .Concat(BitConverter.GetBytes(requestData.RequestEnvelope.Accuracy).Reverse()).ToArray();
            var locationHash1 = CalculateHash32(locationBytes, locationSeed);
            var locationHash2 = CalculateHash32(locationBytes, 0x61656632);

            Console.WriteLine($"Hash1 Original: {requestData.DecryptedSignature.LocationHash1} Calculated: {locationHash1}");
            Console.WriteLine($"Hash2 Original: {requestData.DecryptedSignature.LocationHash2} Calculated: {locationHash2}");
        }

        private static void Test2(RequestData requestData)
        {
            var auth = requestData.RequestEnvelope.AuthInfo;
            var serializedTicket = auth.Token.ToByteArray();
            var locationSeed = CalculateHash32(serializedTicket, 0x61656632);
            var locationBytes = BitConverter.GetBytes(requestData.RequestEnvelope.Latitude).Reverse()
                .Concat(BitConverter.GetBytes(requestData.RequestEnvelope.Longitude).Reverse())
                .Concat(BitConverter.GetBytes(requestData.RequestEnvelope.Accuracy).Reverse()).ToArray();
            var locationHash1 = CalculateHash32(locationBytes, locationSeed);
            var locationHash2 = CalculateHash32(locationBytes, 0x61656632);

            Console.WriteLine($"Hash1 Original: {requestData.DecryptedSignature.LocationHash1} Calculated: {locationHash1}");
            Console.WriteLine($"Hash2 Original: {requestData.DecryptedSignature.LocationHash2} Calculated: {locationHash2}");
        }

        private static uint CalculateHash32(byte[] bytes, uint seed)
        {
            var xxHash = new xxHash32();
            xxHash.Init(seed);
            xxHash.Update(bytes, bytes.Length);
            return xxHash.Digest();
        }
    }
}
