using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Google.Common.Geometry;
using log4net;
using PoGoMITM.Base.Models;
using POGOProtos.Networking.Requests;
using POGOProtos.Networking.Requests.Messages;
using POGOProtos.Networking.Responses;

namespace PoGoMITM.Launcher.Plugins
{

    // INCOMPLETE - DO NOT USE
    public class LocationModifier : IModifierPlugin
    {
        public bool Enabled => true;

        public const string PluginName = "LocationModifier";
        private const double DestinationLatitude = 38.450242;
        private const double DestinationLongitude = 27.210476;

        private static readonly ILog Logger = LogManager.GetLogger(PluginName);

        public bool ModifyRequest(RequestContext requestContext)
        {
            Logger.Debug("Modifying the request");
            var requestData = requestContext.RequestData;

            var changed = false;

            if (requestData.RequestEnvelope == null) return false;
            if (HandleRequestLatitude(requestData.RequestEnvelope.Latitude))
            {
                requestData.RequestEnvelope.Latitude = GetModifiedLatitude(requestData.RequestEnvelope.Latitude);
                changed = true;
            }
            if (HandleRequestLongitude(requestData.RequestEnvelope.Longitude))
            {
                requestData.RequestEnvelope.Longitude = GetModifiedLongitude(requestData.RequestEnvelope.Longitude);
                changed = true;
            }

            if (requestData.DecryptedSignature == null) return false;
            if (requestData.DecryptedSignature.LocationFix != null)
            {
                foreach (var locationFix in requestData.DecryptedSignature.LocationFix)
                {
                    if (HandleRequestLatitude(locationFix.Latitude, false))
                    {
                        locationFix.Latitude = (float)GetModifiedLatitude(locationFix.Latitude);
                        //Logger.Debug($"Changed requestContext.DecryptedSignature.LocationFix.Latitude");
                        changed = true;
                    }
                    if (HandleRequestLongitude(locationFix.Longitude, false))
                    {
                        locationFix.Longitude = (float)GetModifiedLongitude(locationFix.Longitude);
                        //Logger.Debug($"Changed requestContext.DecryptedSignature.LocationFix.Longitude");
                        changed = true;
                    }
                }
            }
            

            if (requestData.Requests == null) return false;
            foreach (var request in requestData.Requests)
            {

                switch (request.Key)
                {
                    case RequestType.MethodUnset:
                        break;
                    case RequestType.PlayerUpdate:
                        var playerUpdate = (PlayerUpdateMessage)request.Value;
                        playerUpdate.Latitude = GetModifiedLatitude(playerUpdate.Latitude);
                        playerUpdate.Longitude = GetModifiedLongitude(playerUpdate.Longitude);
                        changed = true;

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
                        fortSearch.FortLatitude = GetModifiedLatitude(fortSearch.FortLatitude);
                        fortSearch.FortLongitude = GetModifiedLongitude(fortSearch.FortLongitude);
                        fortSearch.PlayerLatitude = GetModifiedLatitude(fortSearch.PlayerLatitude);
                        fortSearch.PlayerLongitude = GetModifiedLongitude(fortSearch.PlayerLongitude);
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
                        mapObjectsRequest.Latitude = GetModifiedLatitude(mapObjectsRequest.Latitude);
                        mapObjectsRequest.Longitude = GetModifiedLongitude(mapObjectsRequest.Longitude);
                        var originalCellIds = mapObjectsRequest.CellId.ToList();
                        var calculatedCells = originalCellIds.Select(GetModifiedS2Cell).ToList();
                        mapObjectsRequest.CellId.Clear();
                        mapObjectsRequest.CellId.AddRange(calculatedCells);
                        changed = true;
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

        private bool HandleRequestLatitude(double latitude, bool useAsStarter = true)
        {
            if (useAsStarter && Math.Abs(StartingLatitude) < 0.001 && latitude > 0 && latitude < 360)
            {
                StartingLatitude = latitude;
                Logger.Debug($"Setting the starting latitude to {latitude}");
            }

            if (Math.Abs(StartingLatitude) > 0.001 && latitude > 0 && latitude < 360)
            {
                //Logger.Debug($"Latitude: {latitude}");
                //Logger.Debug($"Modified latitude is {GetModifiedLatitude(latitude)}");
                return true;
            }
            return false;
        }

        private bool HandleRequestLongitude(double longitude, bool useAsStarter = true)
        {
            if (useAsStarter && Math.Abs(StartingLongitude) < 0.001 && longitude > 0 && longitude < 360)
            {
                StartingLongitude = longitude;
                Logger.Debug($"Setting the starting longitude to {longitude}");
            }

            if (Math.Abs(StartingLongitude) > 0.001 && longitude > 0 && longitude < 360)
            {
                //Logger.Debug($"Longitude: {longitude}");
                //Logger.Debug($"Modified longitude is {GetModifiedLongitude(longitude)}");
                return true;
            }
            return false;
        }

        public bool ModifyResponse(RequestContext requestContext)
        {
            Logger.Debug("Modifying the response");
            var responseData = requestContext.ResponseData;
            var changed = false;

            if (responseData.Responses == null) return false;
            foreach (var response in responseData.Responses)
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
                        var mapObjectsResponse = (GetMapObjectsResponse)response.Value;

                        var mapCells = mapObjectsResponse.MapCells.ToList();
                        mapObjectsResponse.MapCells.Clear();
                        foreach (var mapCell in mapCells)
                        {
                            mapCell.S2CellId = GetOriginalS2Cell(mapCell.S2CellId);
                            foreach (var spawnPoint in mapCell.SpawnPoints)
                            {
                                spawnPoint.Latitude = GetOriginalLatitude(spawnPoint.Latitude);
                                spawnPoint.Longitude = GetOriginalLongitude(spawnPoint.Longitude);
                            }
                            foreach (var fortData in mapCell.Forts)
                            {
                                fortData.Latitude = GetOriginalLatitude(fortData.Latitude);
                                fortData.Longitude = GetOriginalLongitude(fortData.Longitude);
                            }
                            foreach (var catchablePokemon in mapCell.CatchablePokemons)
                            {
                                catchablePokemon.Latitude = GetOriginalLatitude(catchablePokemon.Latitude);
                                catchablePokemon.Longitude = GetOriginalLongitude(catchablePokemon.Longitude);
                            }
                            foreach (var fortSummary in mapCell.FortSummaries)
                            {
                                fortSummary.Latitude = GetOriginalLatitude(fortSummary.Latitude);
                                fortSummary.Longitude = GetOriginalLongitude(fortSummary.Longitude);
                            }
                            foreach (var spawnPoint in mapCell.DecimatedSpawnPoints)
                            {
                                spawnPoint.Latitude = GetOriginalLatitude(spawnPoint.Latitude);
                                spawnPoint.Longitude = GetOriginalLongitude(spawnPoint.Longitude);
                            }
                            foreach (var pokemon in mapCell.WildPokemons)
                            {
                                pokemon.Latitude = GetOriginalLatitude(pokemon.Latitude);
                                pokemon.Longitude = GetOriginalLongitude(pokemon.Longitude);
                            }
                            mapObjectsResponse.MapCells.Add(mapCell);
                            changed = true;
                        }

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
                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }
            return changed;
        }

        public void ResetState()
        {
        }

        private static double _startingLatitude;
        private static double _startingLongitude;
        private static double _offsetLatitude;
        private static double _offsetLongitude;

        private static double StartingLatitude
        {
            get { return _startingLatitude; }
            set
            {
                _offsetLatitude = DestinationLatitude - value;
                //_offsetLatitude = 0;
                _startingLatitude = value;
            }
        }

        private static double StartingLongitude
        {
            get { return _startingLongitude; }
            set
            {
                _offsetLongitude = DestinationLongitude - value;
                //_offsetLongitude = 0;
                _startingLongitude = value;
            }
        }

        private static double GetModifiedLatitude(double latitude)
        {
            return latitude + _offsetLatitude;
        }

        private static double GetModifiedLongitude(double longitude)
        {
            return longitude + _offsetLongitude;
        }

        private static double GetOriginalLatitude(double latitude)
        {
            return latitude - _offsetLatitude;
        }

        private static double GetOriginalLongitude(double longitude)
        {
            return longitude - _offsetLongitude;
        }

        private static readonly ConcurrentDictionary<ulong, ulong> CellConversion = new ConcurrentDictionary<ulong, ulong>();

        private static ulong GetModifiedS2Cell(ulong cellId)
        {
            var s2Cell = new S2CellId(cellId);
            var latlng = s2Cell.ToLatLng();

            var latLong = S2LatLng.FromDegrees(GetModifiedLatitude(latlng.LatDegrees), GetModifiedLongitude(latlng.LngDegrees)).Normalized.ToPoint();

            var cell = S2CellId.FromPoint(latLong);
            var newCellId = cell.ParentForLevel(s2Cell.Level);

            CellConversion.TryAdd(newCellId.Id, cellId);

            return newCellId.Id;
        }

        private static ulong GetOriginalS2Cell(ulong cellId)
        {
            ulong result;

            if (CellConversion.TryGetValue(cellId, out result))
            {
                return result;
            }
            throw new Exception("Cell conversion is not cached, shouldn't have happened.");

        }


    }
}
