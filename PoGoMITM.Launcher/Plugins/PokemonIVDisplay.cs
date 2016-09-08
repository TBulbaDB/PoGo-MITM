using PoGoMITM.Base.DataHelpers;
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
            var responseData = requestContext.ModifiedResponseData ?? requestContext.ResponseData;
            if (!responseData.Responses.ContainsKey(RequestType.GetInventory)) return false;
            var getInventoryResponse = (GetInventoryResponse)responseData.Responses[RequestType.GetInventory];
            if (!getInventoryResponse.Success) return false;
            if (getInventoryResponse.InventoryDelta?.InventoryItems == null) return false;
            foreach (var inventoryItem in getInventoryResponse.InventoryDelta.InventoryItems)
            {
                if (inventoryItem.InventoryItemData?.PokemonData == null) continue;
                var data = inventoryItem.InventoryItemData.PokemonData;
                var iv = data.CalculateIV();
                var level = data.CalculateLevel();
                var nickName = string.IsNullOrWhiteSpace(data.Nickname) ? data.PokemonId.ToString().Replace("Male", "♂").Replace("Female", "♀") : data.Nickname;
                data.Nickname = $"{nickName} IV:{iv:F}% LVL:{level}";
                changed = true;
            }
            return changed;
        }

        public void ResetState()
        {

        }
    }
}
