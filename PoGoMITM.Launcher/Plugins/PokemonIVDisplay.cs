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
    public class PokemonIVDisplay : IModifierPlugin
    {
        public bool Enabled => true;
        public bool ModifyRequest(RequestContext requestContext)
        {
            return false;
        }

        public bool ModifyResponse(RequestContext requestContext)
        {
            var changed = false;
            if (requestContext.ResponseData.Responses.ContainsKey(RequestType.GetInventory))
            {
                var getInventoryResponse = (GetInventoryResponse)requestContext.ResponseData.Responses[RequestType.GetInventory];
                if (getInventoryResponse.Success)
                {
                    if (getInventoryResponse.InventoryDelta?.InventoryItems != null)
                    {
                        foreach (var inventoryItem in getInventoryResponse.InventoryDelta.InventoryItems)
                        {
                            if (inventoryItem.InventoryItemData?.PokemonData != null)
                            {
                                var data = inventoryItem.InventoryItemData.PokemonData;
                                var iv =
                                    (double)(data.IndividualAttack + data.IndividualDefense + data.IndividualStamina) /
                                    45 * 100;
                                var nickName = string.IsNullOrWhiteSpace(data.Nickname) ? data.PokemonId.ToString().Replace(" Male", "♂").Replace(" Female", "♀") : data.Nickname;
                                data.Nickname = $"{nickName} {iv:F}%";
                                changed = true;
                            }
                        }
                    }
                }

            }
            return changed;
        }

        public void ResetState()
        {

        }
    }
}
