using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PoGoMITM.Base.Models;
using POGOProtos.Networking.Requests;
using POGOProtos.Networking.Requests.Messages;
using POGOProtos.Networking.Responses;

namespace PoGoMITM.Launcher.Plugins
{
    public class PluginTemplate : IModifierPlugin
    {
        public bool Enabled => false;

        public bool ModifyRequest(RequestContext requestContext)
        {
            var changed = false;

            var requestData = requestContext.ModifiedRequestData ?? requestContext.RequestData;
            foreach (var request in requestData.Requests)
            {

                switch (request.Key)
                {
                    case RequestType.AddFortModifier:
                        var addFortModifierMessage = (AddFortModifierMessage)request.Value;
                        break;
                    case RequestType.AttackGym:
                        var attackGymMessage = (AttackGymMessage)request.Value;
                        break;
                    case RequestType.BuyGemPack:
                        //var buyGemPackMessage = (BuyGemPackMessage)request.Value;
                        break;
                    case RequestType.BuyItemPack:
                        //var buyItemPackMessage = (BuyItemPackMessage)request.Value;
                        break;
                    case RequestType.CatchPokemon:
                        var catchPokemonMessage = (CatchPokemonMessage)request.Value;
                        break;
                    case RequestType.CheckAwardedBadges:
                        var checkAwardedBadgesMessage = (CheckAwardedBadgesMessage)request.Value;
                        break;
                    case RequestType.CheckChallenge:
                        var checkChallengeMessage = (CheckChallengeMessage)request.Value;
                        break;
                    case RequestType.CheckCodenameAvailable:
                        var checkCodenameAvailableMessage = (CheckCodenameAvailableMessage)request.Value;
                        break;
                    case RequestType.ClaimCodename:
                        var claimCodenameMessage = (ClaimCodenameMessage)request.Value;
                        break;
                    case RequestType.CollectDailyBonus:
                        var collectDailyBonusMessage = (CollectDailyBonusMessage)request.Value;
                        break;
                    case RequestType.CollectDailyDefenderBonus:
                        var collectDailyDefenderBonusMessage = (CollectDailyDefenderBonusMessage)request.Value;
                        break;
                    case RequestType.DebugDeletePlayer:
                        //var debugDeletePlayerMessage = (DebugDeletePlayerMessage)request.Value;
                        break;
                    case RequestType.DebugUpdateInventory:
                        //var debugUpdateInventoryMessage = (DebugUpdateInventoryMessage)request.Value;
                        break;
                    case RequestType.DiskEncounter:
                        var diskEncounterMessage = (DiskEncounterMessage)request.Value;
                        break;
                    case RequestType.DownloadItemTemplates:
                        var downloadItemTemplatesMessage = (DownloadItemTemplatesMessage)request.Value;
                        break;
                    case RequestType.DownloadRemoteConfigVersion:
                        var downloadRemoteConfigVersionMessage = (DownloadRemoteConfigVersionMessage)request.Value;
                        break;
                    case RequestType.DownloadSettings:
                        var downloadSettingsMessage = (DownloadSettingsMessage)request.Value;
                        break;
                    case RequestType.Echo:
                        var echoMessage = (EchoMessage)request.Value;
                        break;
                    case RequestType.Encounter:
                        var encounterMessage = (EncounterMessage)request.Value;
                        break;
                    case RequestType.EncounterTutorialComplete:
                        var encounterTutorialCompleteMessage = (EncounterTutorialCompleteMessage)request.Value;
                        break;
                    case RequestType.EquipBadge:
                        var equipBadgeMessage = (EquipBadgeMessage)request.Value;
                        break;
                    case RequestType.EvolvePokemon:
                        var evolvePokemonMessage = (EvolvePokemonMessage)request.Value;
                        break;
                    case RequestType.FortDeployPokemon:
                        var fortDeployPokemonMessage = (FortDeployPokemonMessage)request.Value;
                        break;
                    case RequestType.FortDetails:
                        var fortDetailsMessage = (FortDetailsMessage)request.Value;
                        break;
                    case RequestType.FortRecallPokemon:
                        var fortRecallPokemonMessage = (FortRecallPokemonMessage)request.Value;
                        break;
                    case RequestType.FortSearch:
                        var fortSearchMessage = (FortSearchMessage)request.Value;
                        break;
                    case RequestType.GetAssetDigest:
                        var getAssetDigestMessage = (GetAssetDigestMessage)request.Value;
                        break;
                    case RequestType.GetBuddyWalked:
                        var getBuddyWalkedMessage = (GetBuddyWalkedMessage)request.Value;
                        break;
                    case RequestType.GetDownloadUrls:
                        var getDownloadUrlsMessage = (GetDownloadUrlsMessage)request.Value;
                        break;
                    case RequestType.GetGymDetails:
                        var getGymDetailsMessage = (GetGymDetailsMessage)request.Value;
                        break;
                    case RequestType.GetHatchedEggs:
                        var getHatchedEggsMessage = (GetHatchedEggsMessage)request.Value;
                        break;
                    case RequestType.GetIncensePokemon:
                        var getIncensePokemonMessage = (GetIncensePokemonMessage)request.Value;
                        break;
                    case RequestType.GetInventory:
                        var getInventoryMessage = (GetInventoryMessage)request.Value;
                        break;
                    case RequestType.GetItemPack:
                        //var getItemPackMessage = (GetItemPackMessage)request.Value;
                        break;
                    case RequestType.GetMapObjects:
                        var getMapObjectsMessage = (GetMapObjectsMessage)request.Value;
                        break;
                    case RequestType.GetPlayer:
                        var getPlayerMessage = (GetPlayerMessage)request.Value;
                        break;
                    case RequestType.GetPlayerProfile:
                        var getPlayerProfileMessage = (GetPlayerProfileMessage)request.Value;
                        break;
                    case RequestType.GetSuggestedCodenames:
                        var getSuggestedCodenamesMessage = (GetSuggestedCodenamesMessage)request.Value;
                        break;
                    case RequestType.IncenseEncounter:
                        var incenseEncounterMessage = (IncenseEncounterMessage)request.Value;
                        break;
                    case RequestType.ItemUse:
                        //var itemUseMessage = (ItemUseMessage)request.Value;
                        break;
                    case RequestType.LevelUpRewards:
                        var levelUpRewardsMessage = (LevelUpRewardsMessage)request.Value;
                        break;
                    case RequestType.LoadSpawnPoints:
                        //var loadSpawnPointsMessage = (LoadSpawnPointsMessage)request.Value;
                        break;
                    case RequestType.MarkTutorialComplete:
                        var markTutorialCompleteMessage = (MarkTutorialCompleteMessage)request.Value;
                        break;
                    case RequestType.MethodUnset:
                        //var methodUnsetMessage = (MethodUnsetMessage)request.Value;
                        break;
                    case RequestType.NicknamePokemon:
                        var nicknamePokemonMessage = (NicknamePokemonMessage)request.Value;
                        break;
                    case RequestType.PlayerUpdate:
                        var playerUpdateMessage = (PlayerUpdateMessage)request.Value;
                        break;
                    case RequestType.RecycleInventoryItem:
                        var recycleInventoryItemMessage = (RecycleInventoryItemMessage)request.Value;
                        break;
                    case RequestType.ReleasePokemon:
                        var releasePokemonMessage = (ReleasePokemonMessage)request.Value;
                        break;
                    case RequestType.SetAvatar:
                        var setAvatarMessage = (SetAvatarMessage)request.Value;
                        break;
                    case RequestType.SetBuddyPokemon:
                        var setBuddyPokemonMessage = (SetBuddyPokemonMessage)request.Value;
                        break;
                    case RequestType.SetContactSettings:
                        var setContactSettingsMessage = (SetContactSettingsMessage)request.Value;
                        break;
                    case RequestType.SetFavoritePokemon:
                        var setFavoritePokemonMessage = (SetFavoritePokemonMessage)request.Value;
                        break;
                    case RequestType.SetPlayerTeam:
                        var setPlayerTeamMessage = (SetPlayerTeamMessage)request.Value;
                        break;
                    case RequestType.SfidaAction:
                        //var sfidaActionMessage = (SfidaActionMessage)request.Value;
                        break;
                    case RequestType.SfidaActionLog:
                        var sfidaActionLogMessage = (SfidaActionLogMessage)request.Value;
                        break;
                    case RequestType.SfidaCapture:
                        //var sfidaCaptureMessage = (SfidaCaptureMessage)request.Value;
                        break;
                    case RequestType.SfidaCertification:
                        //var sfidaCertificationMessage = (SfidaCertificationMessage)request.Value;
                        break;
                    case RequestType.SfidaDowser:
                        //var sfidaDowserMessage = (SfidaDowserMessage)request.Value;
                        break;
                    case RequestType.SfidaRegistration:
                        //var sfidaRegistrationMessage = (SfidaRegistrationMessage)request.Value;
                        break;
                    case RequestType.SfidaUpdate:
                        //var sfidaUpdateMessage = (SfidaUpdateMessage)request.Value;
                        break;
                    case RequestType.StartGymBattle:
                        var startGymBattleMessage = (StartGymBattleMessage)request.Value;
                        break;
                    case RequestType.TradeOffer:
                        //var tradeOfferMessage = (TradeOfferMessage)request.Value;
                        break;
                    case RequestType.TradeResponse:
                        //var tradeResponseMessage = (TradeResponseMessage)request.Value;
                        break;
                    case RequestType.TradeResult:
                        //var tradeResultMessage = (TradeResultMessage)request.Value;
                        break;
                    case RequestType.TradeSearch:
                        //var tradeSearchMessage = (TradeSearchMessage)request.Value;
                        break;
                    case RequestType.UpgradePokemon:
                        var upgradePokemonMessage = (UpgradePokemonMessage)request.Value;
                        break;
                    case RequestType.UseIncense:
                        var useIncenseMessage = (UseIncenseMessage)request.Value;
                        break;
                    case RequestType.UseItemCapture:
                        var useItemCaptureMessage = (UseItemCaptureMessage)request.Value;
                        break;
                    case RequestType.UseItemEggIncubator:
                        var useItemEggIncubatorMessage = (UseItemEggIncubatorMessage)request.Value;
                        break;
                    case RequestType.UseItemFlee:
                        //var useItemFleeMessage = (UseItemFleeMessage)request.Value;
                        break;
                    case RequestType.UseItemGym:
                        var useItemGymMessage = (UseItemGymMessage)request.Value;
                        break;
                    case RequestType.UseItemPotion:
                        var useItemPotionMessage = (UseItemPotionMessage)request.Value;
                        break;
                    case RequestType.UseItemRevive:
                        var useItemReviveMessage = (UseItemReviveMessage)request.Value;
                        break;
                    case RequestType.UseItemXpBoost:
                        var useItemXpBoostMessage = (UseItemXpBoostMessage)request.Value;
                        break;
                    case RequestType.VerifyChallenge:
                        var verifyChallengeMessage = (VerifyChallengeMessage)request.Value;
                        break;
                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }
            return changed;
        }

        public bool ModifyResponse(RequestContext requestContext)
        {
            var changed = false;

            var responseData = requestContext.ModifiedResponseData ?? requestContext.ResponseData;

            foreach (var response in responseData.Responses)
            {
                switch (response.Key)
                {
                    case RequestType.AddFortModifier:
                        var addFortModifierResponse = (AddFortModifierResponse)response.Value;
                        break;
                    case RequestType.AttackGym:
                        var attackGymResponse = (AttackGymResponse)response.Value;
                        break;
                    case RequestType.BuyGemPack:
                        //var buyGemPackResponse = (BuyGemPackResponse)response.Value;
                        break;
                    case RequestType.BuyItemPack:
                        //var buyItemPackResponse = (BuyItemPackResponse)response.Value;
                        break;
                    case RequestType.CatchPokemon:
                        var catchPokemonResponse = (CatchPokemonResponse)response.Value;
                        break;
                    case RequestType.CheckAwardedBadges:
                        var checkAwardedBadgesResponse = (CheckAwardedBadgesResponse)response.Value;
                        break;
                    case RequestType.CheckChallenge:
                        var checkChallengeResponse = (CheckChallengeResponse)response.Value;
                        break;
                    case RequestType.CheckCodenameAvailable:
                        var checkCodenameAvailableResponse = (CheckCodenameAvailableResponse)response.Value;
                        break;
                    case RequestType.ClaimCodename:
                        var claimCodenameResponse = (ClaimCodenameResponse)response.Value;
                        break;
                    case RequestType.CollectDailyBonus:
                        var collectDailyBonusResponse = (CollectDailyBonusResponse)response.Value;
                        break;
                    case RequestType.CollectDailyDefenderBonus:
                        var collectDailyDefenderBonusResponse = (CollectDailyDefenderBonusResponse)response.Value;
                        break;
                    case RequestType.DebugDeletePlayer:
                        //var debugDeletePlayerResponse = (DebugDeletePlayerResponse)response.Value;
                        break;
                    case RequestType.DebugUpdateInventory:
                        //var debugUpdateInventoryResponse = (DebugUpdateInventoryResponse)response.Value;
                        break;
                    case RequestType.DiskEncounter:
                        var diskEncounterResponse = (DiskEncounterResponse)response.Value;
                        break;
                    case RequestType.DownloadItemTemplates:
                        var downloadItemTemplatesResponse = (DownloadItemTemplatesResponse)response.Value;
                        break;
                    case RequestType.DownloadRemoteConfigVersion:
                        var downloadRemoteConfigVersionResponse = (DownloadRemoteConfigVersionResponse)response.Value;
                        break;
                    case RequestType.DownloadSettings:
                        var downloadSettingsResponse = (DownloadSettingsResponse)response.Value;
                        break;
                    case RequestType.Echo:
                        var echoResponse = (EchoResponse)response.Value;
                        break;
                    case RequestType.Encounter:
                        var encounterResponse = (EncounterResponse)response.Value;
                        break;
                    case RequestType.EncounterTutorialComplete:
                        var encounterTutorialCompleteResponse = (EncounterTutorialCompleteResponse)response.Value;
                        break;
                    case RequestType.EquipBadge:
                        var equipBadgeResponse = (EquipBadgeResponse)response.Value;
                        break;
                    case RequestType.EvolvePokemon:
                        var evolvePokemonResponse = (EvolvePokemonResponse)response.Value;
                        break;
                    case RequestType.FortDeployPokemon:
                        var fortDeployPokemonResponse = (FortDeployPokemonResponse)response.Value;
                        break;
                    case RequestType.FortDetails:
                        var fortDetailsResponse = (FortDetailsResponse)response.Value;
                        break;
                    case RequestType.FortRecallPokemon:
                        var fortRecallPokemonResponse = (FortRecallPokemonResponse)response.Value;
                        break;
                    case RequestType.FortSearch:
                        var fortSearchResponse = (FortSearchResponse)response.Value;
                        break;
                    case RequestType.GetAssetDigest:
                        var getAssetDigestResponse = (GetAssetDigestResponse)response.Value;
                        break;
                    case RequestType.GetBuddyWalked:
                        var getBuddyWalkedResponse = (GetBuddyWalkedResponse)response.Value;
                        break;
                    case RequestType.GetDownloadUrls:
                        var getDownloadUrlsResponse = (GetDownloadUrlsResponse)response.Value;
                        break;
                    case RequestType.GetGymDetails:
                        var getGymDetailsResponse = (GetGymDetailsResponse)response.Value;
                        break;
                    case RequestType.GetHatchedEggs:
                        var getHatchedEggsResponse = (GetHatchedEggsResponse)response.Value;
                        break;
                    case RequestType.GetIncensePokemon:
                        var getIncensePokemonResponse = (GetIncensePokemonResponse)response.Value;
                        break;
                    case RequestType.GetInventory:
                        var getInventoryResponse = (GetInventoryResponse)response.Value;
                        break;
                    case RequestType.GetItemPack:
                        //var getItemPackResponse = (GetItemPackResponse)response.Value;
                        break;
                    case RequestType.GetMapObjects:
                        var getMapObjectsResponse = (GetMapObjectsResponse)response.Value;
                        break;
                    case RequestType.GetPlayer:
                        var getPlayerResponse = (GetPlayerResponse)response.Value;
                        break;
                    case RequestType.GetPlayerProfile:
                        var getPlayerProfileResponse = (GetPlayerProfileResponse)response.Value;
                        break;
                    case RequestType.GetSuggestedCodenames:
                        var getSuggestedCodenamesResponse = (GetSuggestedCodenamesResponse)response.Value;
                        break;
                    case RequestType.IncenseEncounter:
                        var incenseEncounterResponse = (IncenseEncounterResponse)response.Value;
                        break;
                    case RequestType.ItemUse:
                        //var itemUseResponse = (ItemUseResponse)response.Value;
                        break;
                    case RequestType.LevelUpRewards:
                        var levelUpRewardsResponse = (LevelUpRewardsResponse)response.Value;
                        break;
                    case RequestType.LoadSpawnPoints:
                        //var loadSpawnPointsResponse = (LoadSpawnPointsResponse)response.Value;
                        break;
                    case RequestType.MarkTutorialComplete:
                        var markTutorialCompleteResponse = (MarkTutorialCompleteResponse)response.Value;
                        break;
                    case RequestType.MethodUnset:
                        //var methodUnsetResponse = (MethodUnsetResponse)response.Value;
                        break;
                    case RequestType.NicknamePokemon:
                        var nicknamePokemonResponse = (NicknamePokemonResponse)response.Value;
                        break;
                    case RequestType.PlayerUpdate:
                        var playerUpdateResponse = (PlayerUpdateResponse)response.Value;
                        break;
                    case RequestType.RecycleInventoryItem:
                        var recycleInventoryItemResponse = (RecycleInventoryItemResponse)response.Value;
                        break;
                    case RequestType.ReleasePokemon:
                        var releasePokemonResponse = (ReleasePokemonResponse)response.Value;
                        break;
                    case RequestType.SetAvatar:
                        var setAvatarResponse = (SetAvatarResponse)response.Value;
                        break;
                    case RequestType.SetBuddyPokemon:
                        var setBuddyPokemonResponse = (SetBuddyPokemonResponse)response.Value;
                        break;
                    case RequestType.SetContactSettings:
                        var setContactSettingsResponse = (SetContactSettingsResponse)response.Value;
                        break;
                    case RequestType.SetFavoritePokemon:
                        var setFavoritePokemonResponse = (SetFavoritePokemonResponse)response.Value;
                        break;
                    case RequestType.SetPlayerTeam:
                        var setPlayerTeamResponse = (SetPlayerTeamResponse)response.Value;
                        break;
                    case RequestType.SfidaAction:
                        //var sfidaActionResponse = (SfidaActionResponse)response.Value;
                        break;
                    case RequestType.SfidaActionLog:
                        var sfidaActionLogResponse = (SfidaActionLogResponse)response.Value;
                        break;
                    case RequestType.SfidaCapture:
                        //var sfidaCaptureResponse = (SfidaCaptureResponse)response.Value;
                        break;
                    case RequestType.SfidaCertification:
                        //var sfidaCertificationResponse = (SfidaCertificationResponse)response.Value;
                        break;
                    case RequestType.SfidaDowser:
                        //var sfidaDowserResponse = (SfidaDowserResponse)response.Value;
                        break;
                    case RequestType.SfidaRegistration:
                        //var sfidaRegistrationResponse = (SfidaRegistrationResponse)response.Value;
                        break;
                    case RequestType.SfidaUpdate:
                        //var sfidaUpdateResponse = (SfidaUpdateResponse)response.Value;
                        break;
                    case RequestType.StartGymBattle:
                        var startGymBattleResponse = (StartGymBattleResponse)response.Value;
                        break;
                    case RequestType.TradeOffer:
                        //var tradeOfferResponse = (TradeOfferResponse)response.Value;
                        break;
                    case RequestType.TradeResponse:
                        //var tradeResponseResponse = (TradeResponseResponse)response.Value;
                        break;
                    case RequestType.TradeResult:
                        //var tradeResultResponse = (TradeResultResponse)response.Value;
                        break;
                    case RequestType.TradeSearch:
                        //var tradeSearchResponse = (TradeSearchResponse)response.Value;
                        break;
                    case RequestType.UpgradePokemon:
                        var upgradePokemonResponse = (UpgradePokemonResponse)response.Value;
                        break;
                    case RequestType.UseIncense:
                        var useIncenseResponse = (UseIncenseResponse)response.Value;
                        break;
                    case RequestType.UseItemCapture:
                        var useItemCaptureResponse = (UseItemCaptureResponse)response.Value;
                        break;
                    case RequestType.UseItemEggIncubator:
                        var useItemEggIncubatorResponse = (UseItemEggIncubatorResponse)response.Value;
                        break;
                    case RequestType.UseItemFlee:
                        //var useItemFleeResponse = (UseItemFleeResponse)response.Value;
                        break;
                    case RequestType.UseItemGym:
                        var useItemGymResponse = (UseItemGymResponse)response.Value;
                        break;
                    case RequestType.UseItemPotion:
                        var useItemPotionResponse = (UseItemPotionResponse)response.Value;
                        break;
                    case RequestType.UseItemRevive:
                        var useItemReviveResponse = (UseItemReviveResponse)response.Value;
                        break;
                    case RequestType.UseItemXpBoost:
                        var useItemXpBoostResponse = (UseItemXpBoostResponse)response.Value;
                        break;
                    case RequestType.VerifyChallenge:
                        var verifyChallengeResponse = (VerifyChallengeResponse)response.Value;
                        break;
                    default:
                        throw new ArgumentOutOfRangeException();

                }

            }
            return changed;
        }

        public void ResetState()
        {
        }
    }
}
