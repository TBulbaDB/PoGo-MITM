using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PoGoMITM.Base.Models;
using POGOProtos.Networking.Requests;
using POGOProtos.Networking.Responses;

namespace PoGoMITM.Launcher.Plugins
{
    public class TestModifier: IModifierPlugin
    {
        public bool Enabled => true;

        public bool ModifyRequest(RequestContext requestContext)
        {
            return false;
        }


        public bool ModifyResponse(RequestContext requestContext)
        {
            var changed = false;
            if (requestContext.ResponseData.Responses.ContainsKey(RequestType.GetPlayer))
            {
                var playerDataResponse = (GetPlayerResponse)requestContext.ResponseData.Responses[RequestType.GetPlayer];
                if (playerDataResponse.Success)
                {
                    playerDataResponse.PlayerData.Username = "Tortuga";
                    changed = true;
                }
            }
            return changed;
        }

        public void ResetState()
        {
        }
    }
}
