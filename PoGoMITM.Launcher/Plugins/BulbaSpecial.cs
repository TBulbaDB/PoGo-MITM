using System;
using System.Collections.Concurrent;
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
    public class BulbaSpecial : IModifierPlugin
    {
        private static readonly Random Randomizer = new Random();
        public virtual bool Enabled => false;

        public const string PluginName = "BulbaSpecial";
        public virtual double DestinationLatitude => 40.754054;
        public virtual double DestinationLongitude => -73.984336;

        public static readonly ILog Logger = LogManager.GetLogger(PluginName);

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
                //requestData.DecryptedSignature.GpsInfo = null;
                //changed = true;

            }


            if (requestData.Requests == null) return false;
            foreach (var request in requestData.Requests)
            {

                switch (request.Key)
                {
                    case RequestType.AddFortModifier:
                        var addFortModifierMessage = (AddFortModifierMessage)request.Value;
                        addFortModifierMessage.PlayerLatitude =
                            GetModifiedLatitude(addFortModifierMessage.PlayerLatitude);
                        addFortModifierMessage.PlayerLongitude =
                            GetModifiedLongitude(addFortModifierMessage.PlayerLongitude);
                        changed = true;
                        break;
                    case RequestType.AttackGym:
                        var attackGymMessage = (AttackGymMessage)request.Value;
                        attackGymMessage.PlayerLatitude = GetModifiedLatitude(attackGymMessage.PlayerLatitude);
                        attackGymMessage.PlayerLongitude = GetModifiedLongitude(attackGymMessage.PlayerLongitude);
                        changed = true;
                        break;

                    case RequestType.DiskEncounter:
                        var diskEncounterMessage = (DiskEncounterMessage)request.Value;
                        diskEncounterMessage.PlayerLatitude = GetModifiedLatitude(diskEncounterMessage.PlayerLatitude);
                        diskEncounterMessage.PlayerLongitude = GetModifiedLongitude(diskEncounterMessage.PlayerLongitude);
                        changed = true;
                        break;

                    case RequestType.Encounter:
                        var encounterMessage = (EncounterMessage)request.Value;
                        encounterMessage.PlayerLatitude = GetModifiedLatitude(encounterMessage.PlayerLatitude);
                        encounterMessage.PlayerLongitude = GetModifiedLongitude(encounterMessage.PlayerLongitude);
                        changed = true;
                        break;

                    case RequestType.FortDeployPokemon:
                        var fortDeployPokemonMessage = (FortDeployPokemonMessage)request.Value;
                        fortDeployPokemonMessage.PlayerLatitude =
                            GetModifiedLatitude(fortDeployPokemonMessage.PlayerLatitude);
                        fortDeployPokemonMessage.PlayerLongitude =
                            GetModifiedLongitude(fortDeployPokemonMessage.PlayerLongitude);
                        changed = true;
                        break;
                    case RequestType.FortDetails:
                        var fortDetailsMessage = (FortDetailsMessage)request.Value;
                        fortDetailsMessage.Latitude = GetModifiedLatitude(fortDetailsMessage.Latitude);
                        fortDetailsMessage.Longitude = GetModifiedLongitude(fortDetailsMessage.Longitude);
                        changed = true;
                        break;
                    case RequestType.FortRecallPokemon:
                        var fortRecallPokemonMessage = (FortRecallPokemonMessage)request.Value;
                        fortRecallPokemonMessage.PlayerLatitude =
                            GetModifiedLatitude(fortRecallPokemonMessage.PlayerLatitude);
                        fortRecallPokemonMessage.PlayerLongitude =
                            GetModifiedLongitude(fortRecallPokemonMessage.PlayerLongitude);
                        changed = true;
                        break;
                    case RequestType.FortSearch:
                        var fortSearch = (FortSearchMessage)request.Value;
                        fortSearch.FortLatitude = GetModifiedLatitude(fortSearch.FortLatitude);
                        fortSearch.FortLongitude = GetModifiedLongitude(fortSearch.FortLongitude);
                        fortSearch.PlayerLatitude = GetModifiedLatitude(fortSearch.PlayerLatitude);
                        fortSearch.PlayerLongitude = GetModifiedLongitude(fortSearch.PlayerLongitude);
                        changed = true;
                        break;

                    case RequestType.GetGymDetails:
                        var getGymDetailsMessage = (GetGymDetailsMessage)request.Value;
                        getGymDetailsMessage.GymLatitude = GetModifiedLatitude(getGymDetailsMessage.GymLatitude);
                        getGymDetailsMessage.GymLongitude = GetModifiedLongitude(getGymDetailsMessage.GymLongitude);
                        getGymDetailsMessage.PlayerLatitude = GetModifiedLatitude(getGymDetailsMessage.PlayerLatitude);
                        getGymDetailsMessage.PlayerLongitude = GetModifiedLongitude(getGymDetailsMessage.PlayerLongitude);
                        changed = true;
                        break;
                    case RequestType.GetHatchedEggs:
                        var getHatchedEggsMessage = (GetHatchedEggsMessage)request.Value;
                        break;
                    case RequestType.GetIncensePokemon:
                        var getIncensePokemonMessage = (GetIncensePokemonMessage)request.Value;
                        getIncensePokemonMessage.PlayerLatitude =
                            GetModifiedLatitude(getIncensePokemonMessage.PlayerLatitude);
                        getIncensePokemonMessage.PlayerLongitude =
                            GetModifiedLongitude(getIncensePokemonMessage.PlayerLongitude);
                        changed = true;
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

                    case RequestType.PlayerUpdate:
                        var playerUpdate = (PlayerUpdateMessage)request.Value;
                        playerUpdate.Latitude = GetModifiedLatitude(playerUpdate.Latitude);
                        playerUpdate.Longitude = GetModifiedLongitude(playerUpdate.Longitude);
                        changed = true;
                        break;

                    case RequestType.StartGymBattle:
                        var startGymBattleMessage = (StartGymBattleMessage)request.Value;
                        startGymBattleMessage.PlayerLatitude = GetModifiedLatitude(startGymBattleMessage.PlayerLatitude);
                        startGymBattleMessage.PlayerLongitude =
                            GetModifiedLongitude(startGymBattleMessage.PlayerLongitude);
                        changed = true;
                        break;

                    case RequestType.UseItemGym:
                        var useItemGymMessage = (UseItemGymMessage)request.Value;
                        useItemGymMessage.PlayerLatitude = GetModifiedLatitude(useItemGymMessage.PlayerLatitude);
                        useItemGymMessage.PlayerLongitude = GetModifiedLongitude(useItemGymMessage.PlayerLongitude);
                        changed = true;
                        break;

                    case RequestType.CatchPokemon:
                        var catchPokemonMessage = (CatchPokemonMessage)request.Value;
                        if (catchPokemonMessage.HitPokemon && catchPokemonMessage.NormalizedReticleSize < 1.2)
                        {
                            catchPokemonMessage.NormalizedReticleSize = Randomizer.NextDouble() * 0.74 + 1.2;
                            changed = true;
                        }
                        if (Math.Abs(catchPokemonMessage.NormalizedHitPosition) < 0.01)
                        {
                            catchPokemonMessage.NormalizedHitPosition = Randomizer.Next(0, 10) > 2 ? 1 : 0;
                            changed = true;
                        }
                        if (Math.Abs(catchPokemonMessage.SpinModifier) < 0.01)
                        {
                            catchPokemonMessage.SpinModifier = Randomizer.Next(0, 10) > 4 ? 1 : 0;
                            changed = true;
                        }
                        break;
                }
            }
            return changed;
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
                    case RequestType.AddFortModifier:
                        var addFortModifierResponse = (AddFortModifierResponse)response.Value;
                        if (addFortModifierResponse.FortDetails != null)
                        {
                            addFortModifierResponse.FortDetails.Latitude =
                                GetOriginalLatitude(addFortModifierResponse.FortDetails.Latitude);
                            addFortModifierResponse.FortDetails.Longitude =
                                GetOriginalLongitude(addFortModifierResponse.FortDetails.Longitude);
                            changed = true;
                        }
                        break;

                    case RequestType.Encounter:
                        var encounterResponse = (EncounterResponse)response.Value;
                        if (encounterResponse.WildPokemon != null)
                        {
                            encounterResponse.WildPokemon.Latitude =
                                GetOriginalLatitude(encounterResponse.WildPokemon.Latitude);
                            encounterResponse.WildPokemon.Longitude =
                                GetOriginalLongitude(encounterResponse.WildPokemon.Longitude);
                            changed = true;
                        }
                        break;

                    case RequestType.FortDeployPokemon:
                        var fortDeployPokemonResponse = (FortDeployPokemonResponse)response.Value;
                        if (fortDeployPokemonResponse.FortDetails != null)
                        {
                            fortDeployPokemonResponse.FortDetails.Latitude =
                                GetOriginalLatitude(fortDeployPokemonResponse.FortDetails.Latitude);
                            fortDeployPokemonResponse.FortDetails.Longitude =
                                GetOriginalLongitude(fortDeployPokemonResponse.FortDetails.Longitude);
                            changed = true;
                        }
                        if (fortDeployPokemonResponse.GymState?.FortData != null)
                        {
                            fortDeployPokemonResponse.GymState.FortData.Latitude =
                                GetOriginalLatitude(fortDeployPokemonResponse.GymState.FortData.Latitude);
                            fortDeployPokemonResponse.GymState.FortData.Longitude =
                                GetOriginalLongitude(fortDeployPokemonResponse.GymState.FortData.Longitude);
                            changed = true;
                        }
                        break;
                    case RequestType.FortDetails:
                        var fortDetailsResponse = (FortDetailsResponse)response.Value;
                        fortDetailsResponse.Latitude = GetOriginalLatitude(fortDetailsResponse.Latitude);
                        fortDetailsResponse.Longitude = GetOriginalLongitude(fortDetailsResponse.Longitude);
                        changed = true;
                        break;
                    case RequestType.FortRecallPokemon:
                        var fortRecallPokemonResponse = (FortRecallPokemonResponse)response.Value;
                        if (fortRecallPokemonResponse.FortDetails != null)
                        {
                            fortRecallPokemonResponse.FortDetails.Latitude =
                                GetOriginalLatitude(fortRecallPokemonResponse.FortDetails.Latitude);
                            fortRecallPokemonResponse.FortDetails.Longitude =
                                GetOriginalLongitude(fortRecallPokemonResponse.FortDetails.Longitude);
                            changed = true;
                        }
                        break;

                    case RequestType.GetGymDetails:
                        var getGymDetailsResponse = (GetGymDetailsResponse)response.Value;
                        if (getGymDetailsResponse.GymState?.FortData != null)
                        {
                            getGymDetailsResponse.GymState.FortData.Latitude =
                                GetOriginalLatitude(getGymDetailsResponse.GymState.FortData.Latitude);
                            getGymDetailsResponse.GymState.FortData.Longitude =
                                GetOriginalLongitude(getGymDetailsResponse.GymState.FortData.Longitude);
                            changed = true;
                        }
                        break;

                    case RequestType.GetIncensePokemon:
                        var getIncensePokemonResponse = (GetIncensePokemonResponse)response.Value;
                        getIncensePokemonResponse.Latitude = GetOriginalLatitude(getIncensePokemonResponse.Latitude);
                        getIncensePokemonResponse.Longitude = GetOriginalLongitude(getIncensePokemonResponse.Longitude);
                        changed = true;
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

                    case RequestType.PlayerUpdate:
                        var playerUpdateResponse = (PlayerUpdateResponse)response.Value;
                        if (playerUpdateResponse.Forts != null)
                        {
                            foreach (var fortData in playerUpdateResponse.Forts)
                            {
                                fortData.Latitude = GetOriginalLatitude(fortData.Latitude);
                                fortData.Longitude = GetOriginalLongitude(fortData.Longitude);
                                changed = true;
                            }
                        }
                        if (playerUpdateResponse.WildPokemons != null)
                        {
                            foreach (var wildPokemon in playerUpdateResponse.WildPokemons)
                            {
                                wildPokemon.Latitude = GetOriginalLatitude(wildPokemon.Latitude);
                                wildPokemon.Longitude = GetOriginalLongitude(wildPokemon.Longitude);
                                changed = true;
                            }
                        }
                        break;
                    case RequestType.GetInventory:
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
                        break;

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

        private bool HandleRequestLatitude(double latitude, bool useAsStarter = true)
        {
            if (useAsStarter && Math.Abs(StartingLatitude) < 0.001 && Math.Abs(latitude - 360) > 0.01 && Math.Abs(latitude - (-360)) > 0.01 && Math.Abs(latitude) > 0.01)
            {
                StartingLatitude = latitude;
                Logger.Debug($"Setting the starting latitude to {latitude}");
            }

            if (Math.Abs(StartingLatitude) > 0.001 && Math.Abs(latitude) > 0.01 && Math.Abs(latitude - 360) > 0.01 && Math.Abs(latitude - (-360)) > 0.01)
            {
                //Logger.Debug($"Latitude: {latitude}");
                //Logger.Debug($"Modified latitude is {GetModifiedLatitude(latitude)}");
                return true;
            }
            return false;
        }

        private bool HandleRequestLongitude(double longitude, bool useAsStarter = true)
        {
            if (useAsStarter && Math.Abs(StartingLongitude) < 0.001 && Math.Abs(longitude - 360) > 0.01 && Math.Abs(longitude - (-360)) > 0.01 && Math.Abs(longitude) > 0.01)
            {
                StartingLongitude = longitude;
                Logger.Debug($"Setting the starting longitude to {longitude}");
            }

            if (Math.Abs(StartingLongitude) > 0.001 && Math.Abs(longitude) > 0.01 && Math.Abs(longitude - 360) > 0.01 && Math.Abs(longitude - (-360)) > 0.01)
            {
                //Logger.Debug($"Longitude: {longitude}");
                //Logger.Debug($"Modified longitude is {GetModifiedLongitude(longitude)}");
                return true;
            }
            return false;
        }

        private double StartingLatitude
        {
            get { return _startingLatitude; }
            set
            {
                _offsetLatitude = DestinationLatitude - value;
                //_offsetLatitude = 0;
                _startingLatitude = value;
            }
        }

        private double StartingLongitude
        {
            get { return _startingLongitude; }
            set
            {
                _offsetLongitude = DestinationLongitude - value;
                //_offsetLongitude = 0;
                _startingLongitude = value;
            }
        }

        private double GetModifiedLatitude(double latitude)
        {
            return latitude + _offsetLatitude;
        }

        private double GetModifiedLongitude(double longitude)
        {
            return longitude + _offsetLongitude;
        }

        private double GetOriginalLatitude(double latitude)
        {
            return latitude - _offsetLatitude;
        }

        private double GetOriginalLongitude(double longitude)
        {
            return longitude - _offsetLongitude;
        }

        private readonly ConcurrentDictionary<ulong, ulong> CellConversion = new ConcurrentDictionary<ulong, ulong>();

        private ulong GetModifiedS2Cell(ulong cellId)
        {
            var s2Cell = new S2CellId(cellId);
            var latlng = s2Cell.ToLatLng();

            var latLong = S2LatLng.FromDegrees(GetModifiedLatitude(latlng.LatDegrees), GetModifiedLongitude(latlng.LngDegrees)).Normalized.ToPoint();

            var cell = S2CellId.FromPoint(latLong);
            var newCellId = cell.ParentForLevel(s2Cell.Level);

            CellConversion.TryAdd(newCellId.Id, cellId);

            return newCellId.Id;
        }

        private ulong GetOriginalS2Cell(ulong cellId)
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
