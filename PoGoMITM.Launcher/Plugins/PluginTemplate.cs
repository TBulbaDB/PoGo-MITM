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
            foreach (var request in requestContext.RequestData.Requests)
            {

                switch (request.Key)
                {
                    case RequestType.MethodUnset:
                        break;
                    case RequestType.PlayerUpdate:
                        var playerUpdate = (PlayerUpdateMessage)request.Value;
                        break;
                    case RequestType.GetPlayer:
                        var getPlayer = (GetPlayerMessage)request.Value;
                        break;
                    case RequestType.GetInventory:
                        var getInventory = (GetInventoryMessage)request.Value;
                        break;
                    case RequestType.DownloadSettings:
                        var downloadSettings = (DownloadSettingsMessage)request.Value;
                        break;
                    case RequestType.DownloadItemTemplates:
                        var downloadItemTemplates = (DownloadItemTemplatesMessage)request.Value;
                        break;
                    case RequestType.DownloadRemoteConfigVersion:
                        var downloadRemoteConfigVersion = (DownloadRemoteConfigVersionMessage)request.Value;
                        break;
                    case RequestType.FortSearch:
                        var fortSearch = (FortSearchMessage)request.Value;
                        break;
                    case RequestType.Encounter:
                        var encounter = (EncounterMessage)request.Value;
                        break;
                    case RequestType.CatchPokemon:
                        var catchPokemon = (CatchPokemonMessage)request.Value;
                        break;
                    case RequestType.FortDetails:
                        var fortDetails = (FortDetailsMessage)request.Value;
                        break;
                    case RequestType.ItemUse:
                        break;
                    case RequestType.GetMapObjects:
                        var mapObjectsRequest = (GetMapObjectsMessage)request.Value;
                        break;
                    case RequestType.FortDeployPokemon:
                        var fortDeployPokemon = (FortDeployPokemonMessage)request.Value;
                        break;
                    case RequestType.FortRecallPokemon:
                        var fortRecallPokemon = (FortRecallPokemonMessage)request.Value;
                        break;
                    case RequestType.ReleasePokemon:
                        var releasePokemon = (ReleasePokemonMessage)request.Value;
                        break;
                    case RequestType.UseItemPotion:
                        var useItemPotion = (UseItemPotionMessage)request.Value;
                        break;
                    case RequestType.UseItemCapture:
                        var useItemCapture = (UseItemCaptureMessage)request.Value;
                        break;
                    case RequestType.UseItemFlee:
                        break;
                    case RequestType.UseItemRevive:
                        var useItemRevive = (UseItemReviveMessage)request.Value;
                        break;
                    case RequestType.TradeSearch:
                        break;
                    case RequestType.TradeOffer:
                        break;
                    case RequestType.TradeResponse:
                        break;
                    case RequestType.TradeResult:
                        break;
                    case RequestType.GetPlayerProfile:
                        var getPlayerProfile = (GetPlayerProfileMessage)request.Value;
                        break;
                    case RequestType.GetItemPack:
                        break;
                    case RequestType.BuyItemPack:
                        break;
                    case RequestType.BuyGemPack:
                        break;
                    case RequestType.EvolvePokemon:
                        var evolvePokemon = (EvolvePokemonMessage)request.Value;
                        break;
                    case RequestType.GetHatchedEggs:
                        var getHatchedEggs = (GetHatchedEggsMessage)request.Value;
                        break;
                    case RequestType.EncounterTutorialComplete:
                        var encounterTutorialComplete = (EncounterTutorialCompleteMessage)request.Value;
                        break;
                    case RequestType.LevelUpRewards:
                        var levelUpRewards = (LevelUpRewardsMessage)request.Value;
                        break;
                    case RequestType.CheckAwardedBadges:
                        var checkAwardedBadges = (CheckAwardedBadgesMessage)request.Value;
                        break;
                    case RequestType.UseItemGym:
                        var useItemGym = (UseItemGymMessage)request.Value;
                        break;
                    case RequestType.GetGymDetails:
                        var getGymDetails = (GetGymDetailsMessage)request.Value;
                        break;
                    case RequestType.StartGymBattle:
                        var startGymBattle = (StartGymBattleMessage)request.Value;
                        break;
                    case RequestType.AttackGym:
                        var attackGym = (AttackGymMessage)request.Value;
                        break;
                    case RequestType.RecycleInventoryItem:
                        var recycleInventoryItem = (RecycleInventoryItemMessage)request.Value;
                        break;
                    case RequestType.CollectDailyBonus:
                        var collectDailyBonus = (CollectDailyBonusMessage)request.Value;
                        break;
                    case RequestType.UseItemXpBoost:
                        var useItemXpBoost = (UseItemXpBoostMessage)request.Value;
                        break;
                    case RequestType.UseItemEggIncubator:
                        var useItemEggIncubator = (UseItemEggIncubatorMessage)request.Value;
                        break;
                    case RequestType.UseIncense:
                        var useIncense = (UseIncenseMessage)request.Value;
                        break;
                    case RequestType.GetIncensePokemon:
                        var getIncensePokemon = (GetIncensePokemonMessage)request.Value;
                        break;
                    case RequestType.IncenseEncounter:
                        var incenseEncounter = (IncenseEncounterMessage)request.Value;
                        break;
                    case RequestType.AddFortModifier:
                        var addFortModifier = (AddFortModifierMessage)request.Value;
                        break;
                    case RequestType.DiskEncounter:
                        var diskEncounter = (DiskEncounterMessage)request.Value;
                        break;
                    case RequestType.CollectDailyDefenderBonus:
                        var collectDailyDefenderBonus = (CollectDailyDefenderBonusMessage)request.Value;
                        break;
                    case RequestType.UpgradePokemon:
                        var upgradePokemon = (UpgradePokemonMessage)request.Value;
                        break;
                    case RequestType.SetFavoritePokemon:
                        var setFavoritePokemon = (SetFavoritePokemonMessage)request.Value;
                        break;
                    case RequestType.NicknamePokemon:
                        var nicknamePokemon = (NicknamePokemonMessage)request.Value;
                        break;
                    case RequestType.EquipBadge:
                        var equipBadge = (EquipBadgeMessage)request.Value;
                        break;
                    case RequestType.SetContactSettings:
                        var setContactSettings = (SetContactSettingsMessage)request.Value;
                        break;
                    case RequestType.SetBuddyPokemon:
                        var setBuddyPokemon = (SetBuddyPokemonMessage)request.Value;
                        break;
                    case RequestType.GetBuddyWalked:
                        var getBuddyWalked = (GetBuddyWalkedMessage)request.Value;
                        break;
                    case RequestType.GetAssetDigest:
                        var getAssetDigest = (GetAssetDigestMessage)request.Value;
                        break;
                    case RequestType.GetDownloadUrls:
                        var getDownloadUrls = (GetDownloadUrlsMessage)request.Value;
                        break;
                    case RequestType.GetSuggestedCodenames:
                        var getSuggestedCodenames = (GetSuggestedCodenamesMessage)request.Value;
                        break;
                    case RequestType.CheckCodenameAvailable:
                        var checkCodenameAvailable = (CheckCodenameAvailableMessage)request.Value;
                        break;
                    case RequestType.ClaimCodename:
                        var claimCodename = (ClaimCodenameMessage)request.Value;
                        break;
                    case RequestType.SetAvatar:
                        var setAvatar = (SetAvatarMessage)request.Value;
                        break;
                    case RequestType.SetPlayerTeam:
                        var setPlayerTeam = (SetPlayerTeamMessage)request.Value;
                        break;
                    case RequestType.MarkTutorialComplete:
                        var markTutorialComplete = (MarkTutorialCompleteMessage)request.Value;
                        break;
                    case RequestType.LoadSpawnPoints:
                        break;
                    case RequestType.CheckChallenge:
                        var checkChallenge = (CheckChallengeMessage)request.Value;
                        break;
                    case RequestType.VerifyChallenge:
                        var verifyChallenge = (VerifyChallengeMessage)request.Value;
                        break;
                    case RequestType.Echo:
                        var echo = (EchoMessage)request.Value;
                        break;
                    case RequestType.DebugUpdateInventory:
                        break;
                    case RequestType.DebugDeletePlayer:
                        break;
                    case RequestType.SfidaRegistration:
                        break;
                    case RequestType.SfidaActionLog:
                        var sfidaActionLog = (SfidaActionLogMessage)request.Value;
                        break;
                    case RequestType.SfidaCertification:
                        break;
                    case RequestType.SfidaUpdate:
                        break;
                    case RequestType.SfidaAction:
                        break;
                    case RequestType.SfidaDowser:
                        break;
                    case RequestType.SfidaCapture:
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
            foreach (var response in requestContext.ResponseData.Responses)
            {
                switch (response.Key)
                {
                    case RequestType.MethodUnset:
                        break;
                    case RequestType.PlayerUpdate:
                        var playerUpdate = (PlayerUpdateResponse)response.Value;
                        break;
                    case RequestType.GetPlayer:
                        var getPlayer = (GetPlayerResponse)response.Value;
                        break;
                    case RequestType.GetInventory:
                        var getInventory = (GetInventoryResponse)response.Value;
                        break;
                    case RequestType.DownloadSettings:
                        var downloadSettings = (DownloadSettingsResponse)response.Value;
                        break;
                    case RequestType.DownloadItemTemplates:
                        var downloadItemTemplates = (DownloadItemTemplatesResponse)response.Value;
                        break;
                    case RequestType.DownloadRemoteConfigVersion:
                        var downloadRemoteConfigVersion = (DownloadRemoteConfigVersionResponse)response.Value;
                        break;
                    case RequestType.FortSearch:
                        var fortSearch = (FortSearchResponse)response.Value;
                        break;
                    case RequestType.Encounter:
                        var encounter = (EncounterResponse)response.Value;
                        break;
                    case RequestType.CatchPokemon:
                        var catchPokemon = (CatchPokemonResponse)response.Value;
                        break;
                    case RequestType.FortDetails:
                        var fortDetails = (FortDetailsResponse)response.Value;
                        break;
                    case RequestType.ItemUse:
                        break;
                    case RequestType.GetMapObjects:
                        var getMapObjects = (GetMapObjectsResponse)response.Value;
                        break;
                    case RequestType.FortDeployPokemon:
                        var fortDeployPokemon = (FortDeployPokemonResponse)response.Value;
                        break;
                    case RequestType.FortRecallPokemon:
                        var fortRecallPokemon = (FortRecallPokemonResponse)response.Value;
                        break;
                    case RequestType.ReleasePokemon:
                        var releasePokemon = (ReleasePokemonResponse)response.Value;
                        break;
                    case RequestType.UseItemPotion:
                        var useItemPotion = (UseItemPotionResponse)response.Value;
                        break;
                    case RequestType.UseItemCapture:
                        var useItemCapture = (UseItemCaptureResponse)response.Value;
                        break;
                    case RequestType.UseItemFlee:
                        break;
                    case RequestType.UseItemRevive:
                        var useItemRevive = (UseItemReviveResponse)response.Value;
                        break;
                    case RequestType.TradeSearch:
                        break;
                    case RequestType.TradeOffer:
                        break;
                    case RequestType.TradeResponse:
                        break;
                    case RequestType.TradeResult:
                        break;
                    case RequestType.GetPlayerProfile:
                        var getPlayerProfile = (GetPlayerProfileResponse)response.Value;
                        break;
                    case RequestType.GetItemPack:
                        break;
                    case RequestType.BuyItemPack:
                        break;
                    case RequestType.BuyGemPack:
                        break;
                    case RequestType.EvolvePokemon:
                        var evolvePokemon = (EvolvePokemonResponse)response.Value;
                        break;
                    case RequestType.GetHatchedEggs:
                        var getHatchedEggs = (GetHatchedEggsResponse)response.Value;
                        break;
                    case RequestType.EncounterTutorialComplete:
                        var encounterTutorialComplete = (EncounterTutorialCompleteResponse)response.Value;
                        break;
                    case RequestType.LevelUpRewards:
                        var levelUpRewards = (LevelUpRewardsResponse)response.Value;
                        break;
                    case RequestType.CheckAwardedBadges:
                        var checkAwardedBadges = (CheckAwardedBadgesResponse)response.Value;
                        break;
                    case RequestType.UseItemGym:
                        var useItemGym = (UseItemGymResponse)response.Value;
                        break;
                    case RequestType.GetGymDetails:
                        var getGymDetails = (GetGymDetailsResponse)response.Value;
                        break;
                    case RequestType.StartGymBattle:
                        var startGymBattle = (StartGymBattleResponse)response.Value;
                        break;
                    case RequestType.AttackGym:
                        var attackGym = (AttackGymResponse)response.Value;
                        break;
                    case RequestType.RecycleInventoryItem:
                        var recycleInventoryItem = (RecycleInventoryItemResponse)response.Value;
                        break;
                    case RequestType.CollectDailyBonus:
                        var collectDailyBonus = (CollectDailyBonusResponse)response.Value;
                        break;
                    case RequestType.UseItemXpBoost:
                        var useItemXpBoost = (UseItemXpBoostResponse)response.Value;
                        break;
                    case RequestType.UseItemEggIncubator:
                        var useItemEggIncubator = (UseItemEggIncubatorResponse)response.Value;
                        break;
                    case RequestType.UseIncense:
                        var useIncense = (UseIncenseResponse)response.Value;
                        break;
                    case RequestType.GetIncensePokemon:
                        var getIncensePokemon = (GetIncensePokemonResponse)response.Value;
                        break;
                    case RequestType.IncenseEncounter:
                        var incenseEncounter = (IncenseEncounterResponse)response.Value;
                        break;
                    case RequestType.AddFortModifier:
                        var addFortModifier = (AddFortModifierResponse)response.Value;
                        break;
                    case RequestType.DiskEncounter:
                        var diskEncounter = (DiskEncounterResponse)response.Value;
                        break;
                    case RequestType.CollectDailyDefenderBonus:
                        var collectDailyDefenderBonus = (CollectDailyDefenderBonusResponse)response.Value;
                        break;
                    case RequestType.UpgradePokemon:
                        var upgradePokemon = (UpgradePokemonResponse)response.Value;
                        break;
                    case RequestType.SetFavoritePokemon:
                        var setFavoritePokemon = (SetFavoritePokemonResponse)response.Value;
                        break;
                    case RequestType.NicknamePokemon:
                        var nicknamePokemon = (NicknamePokemonResponse)response.Value;
                        break;
                    case RequestType.EquipBadge:
                        var equipBadge = (EquipBadgeResponse)response.Value;
                        break;
                    case RequestType.SetContactSettings:
                        var setContactSettings = (SetContactSettingsResponse)response.Value;
                        break;
                    case RequestType.SetBuddyPokemon:
                        var setBuddyPokemon = (SetBuddyPokemonResponse)response.Value;
                        break;
                    case RequestType.GetBuddyWalked:
                        var getBuddyWalked = (GetBuddyWalkedResponse)response.Value;
                        break;
                    case RequestType.GetAssetDigest:
                        var getAssetDigest = (GetAssetDigestResponse)response.Value;
                        break;
                    case RequestType.GetDownloadUrls:
                        var getDownloadUrls = (GetDownloadUrlsResponse)response.Value;
                        break;
                    case RequestType.GetSuggestedCodenames:
                        var getSuggestedCodenames = (GetSuggestedCodenamesResponse)response.Value;
                        break;
                    case RequestType.CheckCodenameAvailable:
                        var checkCodenameAvailable = (CheckCodenameAvailableResponse)response.Value;
                        break;
                    case RequestType.ClaimCodename:
                        var claimCodename = (ClaimCodenameResponse)response.Value;
                        break;
                    case RequestType.SetAvatar:
                        var setAvatar = (SetAvatarResponse)response.Value;
                        break;
                    case RequestType.SetPlayerTeam:
                        var setPlayerTeam = (SetPlayerTeamResponse)response.Value;
                        break;
                    case RequestType.MarkTutorialComplete:
                        var markTutorialComplete = (MarkTutorialCompleteResponse)response.Value;
                        break;
                    case RequestType.LoadSpawnPoints:
                        break;
                    case RequestType.CheckChallenge:
                        var checkChallenge = (CheckChallengeResponse)response.Value;
                        break;
                    case RequestType.VerifyChallenge:
                        var verifyChallenge = (VerifyChallengeResponse)response.Value;
                        break;
                    case RequestType.Echo:
                        var echo = (EchoResponse)response.Value;
                        break;
                    case RequestType.DebugUpdateInventory:
                        break;
                    case RequestType.DebugDeletePlayer:
                        break;
                    case RequestType.SfidaRegistration:
                        break;
                    case RequestType.SfidaActionLog:
                        var sfidaActionLog = (SfidaActionLogResponse)response.Value;
                        break;
                    case RequestType.SfidaCertification:
                        break;
                    case RequestType.SfidaUpdate:
                        break;
                    case RequestType.SfidaAction:
                        break;
                    case RequestType.SfidaDowser:
                        break;
                    case RequestType.SfidaCapture:
                        break;
                }

            }
            return changed;
        }

        public void ResetState()
        {
        }
    }
}
