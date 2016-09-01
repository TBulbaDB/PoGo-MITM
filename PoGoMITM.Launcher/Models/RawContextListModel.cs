using System;
using System.Collections.Generic;
using System.Linq;
using PoGoMITM.Base.Dumpers;
using PoGoMITM.Base.Models;
using PoGoMITM.Launcher.ViewModels;

namespace PoGoMITM.Launcher.Models
{
    public class RequestContextListModel
    {
        private static RequestContextListModel _instance;

        public static RequestContextListItemViewModel FromRawContext(RawContext context)
        {
            var model = new RequestContextListItemViewModel();
            model.Guid = context.Guid.ToString();
            model.RequestTime = context.RequestTime;
            model.Host = context.RequestUri.Host;


            var requestContext = RequestContext.GetInstance(context.Guid) ?? RequestContext.Create(context);
            requestContext.CopyRequestData(context);
            requestContext.CopyResponseData(context);
            if (!requestContext.RequestParsed)
            {
                requestContext.ParseRequest();
            }
            if (!requestContext.ResponseParsed)
            {
                requestContext.ParseResponse();
            }

            try
            {
                var lsMethods = new List<string>();

                foreach (var request in requestContext.RequestData.Requests)
                {
                    lsMethods.Add(request.Key.ToString());
                }

                model.Methods = string.Join(", ", lsMethods);

            }
            catch (Exception)
            {
                model.Methods = "n/a";
            }

            return model;
        }

        public static RequestContextListModel Instance => _instance ?? (_instance = new RequestContextListModel());

        public Dictionary<string, string> RawDumpSessions
            => RawDumpReader.GetRawDumpSessions().ToDictionary(f => f.Replace("RawContext", string.Empty).Replace(".log", string.Empty));
    }
}
