using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using PoGoMITM.Base.Cache;
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
         RequestContext requestContext = null;
         Task.Run(async () => { requestContext = await RequestContext.GetInstance(context); }).Wait();
         var model = new RequestContextListItemViewModel();
         model.Guid = context.Guid.ToString();
         model.RequestTime = context.RequestTime;
         model.Host = context.RequestUri.Host;

         try
         {
            List<string> lsMethods = new List<string>();

            foreach (var request in requestContext.Requests)
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
