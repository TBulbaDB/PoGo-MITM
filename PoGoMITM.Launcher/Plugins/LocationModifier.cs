using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Google.Common.Geometry;
using Google.Protobuf.Collections;
using log4net;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Models;
using POGOProtos.Networking.Requests;
using POGOProtos.Networking.Requests.Messages;
using POGOProtos.Networking.Responses;

namespace PoGoMITM.Launcher.Plugins
{
    public class LocationModifier : IRequestModifier, IResponseModifier
    {
        public bool Enabled => false;

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
                        break;
                    case RequestType.GetPlayer:
                        break;
                    case RequestType.GetInventory:
                        break;
                    case RequestType.DownloadSettings:
                        break;
                    case RequestType.DownloadItemTemplates:
                        break;
                    case RequestType.DownloadRemoteConfigVersion:
                        break;
                    case RequestType.FortSearch:
                        break;
                    case RequestType.Encounter:
                        break;
                    case RequestType.CatchPokemon:
                        break;
                    case RequestType.FortDetails:
                        break;
                    case RequestType.ItemUse:
                        break;
                    case RequestType.GetMapObjects:
                        var mapObjectsRequest = (GetMapObjectsMessage)request.Value;
                        mapObjectsRequest.Latitude = GetModifiedLatitude(mapObjectsRequest.Latitude);
                        mapObjectsRequest.Longitude = GetModifiedLongitude(mapObjectsRequest.Longitude);
                        var calculatedCells = GetCellIdsForLatLong(mapObjectsRequest.Latitude,
                            mapObjectsRequest.Longitude);
                        var originalCellIds = mapObjectsRequest.CellId.ToList();
                        _cellIdConversions.Add(requestContext.Guid, new CellIdConversion { OriginalCellIds = originalCellIds, CalculatedCellIds = calculatedCells });
                        mapObjectsRequest.CellId.Clear();
                        mapObjectsRequest.CellId.AddRange(calculatedCells);
                        changed = true;
                        break;
                    case RequestType.FortDeployPokemon:
                        break;
                    case RequestType.FortRecallPokemon:
                        break;
                    case RequestType.ReleasePokemon:
                        break;
                    case RequestType.UseItemPotion:
                        break;
                    case RequestType.UseItemCapture:
                        break;
                    case RequestType.UseItemFlee:
                        break;
                    case RequestType.UseItemRevive:
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
                        break;
                    case RequestType.GetItemPack:
                        break;
                    case RequestType.BuyItemPack:
                        break;
                    case RequestType.BuyGemPack:
                        break;
                    case RequestType.EvolvePokemon:
                        break;
                    case RequestType.GetHatchedEggs:
                        break;
                    case RequestType.EncounterTutorialComplete:
                        break;
                    case RequestType.LevelUpRewards:
                        break;
                    case RequestType.CheckAwardedBadges:
                        break;
                    case RequestType.UseItemGym:
                        break;
                    case RequestType.GetGymDetails:
                        break;
                    case RequestType.StartGymBattle:
                        break;
                    case RequestType.AttackGym:
                        break;
                    case RequestType.RecycleInventoryItem:
                        break;
                    case RequestType.CollectDailyBonus:
                        break;
                    case RequestType.UseItemXpBoost:
                        break;
                    case RequestType.UseItemEggIncubator:
                        break;
                    case RequestType.UseIncense:
                        break;
                    case RequestType.GetIncensePokemon:
                        break;
                    case RequestType.IncenseEncounter:
                        break;
                    case RequestType.AddFortModifier:
                        break;
                    case RequestType.DiskEncounter:
                        break;
                    case RequestType.CollectDailyDefenderBonus:
                        break;
                    case RequestType.UpgradePokemon:
                        break;
                    case RequestType.SetFavoritePokemon:
                        break;
                    case RequestType.NicknamePokemon:
                        break;
                    case RequestType.EquipBadge:
                        break;
                    case RequestType.SetContactSettings:
                        break;
                    case RequestType.SetBuddyPokemon:
                        break;
                    case RequestType.GetBuddyWalked:
                        break;
                    case RequestType.GetAssetDigest:
                        break;
                    case RequestType.GetDownloadUrls:
                        break;
                    case RequestType.GetSuggestedCodenames:
                        break;
                    case RequestType.CheckCodenameAvailable:
                        break;
                    case RequestType.ClaimCodename:
                        break;
                    case RequestType.SetAvatar:
                        break;
                    case RequestType.SetPlayerTeam:
                        break;
                    case RequestType.MarkTutorialComplete:
                        break;
                    case RequestType.LoadSpawnPoints:
                        break;
                    case RequestType.CheckChallenge:
                        break;
                    case RequestType.VerifyChallenge:
                        break;
                    case RequestType.Echo:
                        break;
                    case RequestType.DebugUpdateInventory:
                        break;
                    case RequestType.DebugDeletePlayer:
                        break;
                    case RequestType.SfidaRegistration:
                        break;
                    case RequestType.SfidaActionLog:
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
                        break;
                    case RequestType.GetPlayer:
                        break;
                    case RequestType.GetInventory:
                        break;
                    case RequestType.DownloadSettings:
                        break;
                    case RequestType.DownloadItemTemplates:
                        break;
                    case RequestType.DownloadRemoteConfigVersion:
                        break;
                    case RequestType.FortSearch:
                        break;
                    case RequestType.Encounter:
                        break;
                    case RequestType.CatchPokemon:
                        break;
                    case RequestType.FortDetails:
                        break;
                    case RequestType.ItemUse:
                        break;
                    case RequestType.GetMapObjects:
                        var mapObjectsResponse = (GetMapObjectsResponse)response.Value;

                        var mapCells = mapObjectsResponse.MapCells.ToList();
                        mapObjectsResponse.MapCells.Clear();
                        foreach (var mapCell in mapCells)
                        {
                            //mapCell.S2CellId = GetOriginalS2Cell(requestContext.Guid, mapCell.S2CellId);
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
                        break;
                    case RequestType.FortRecallPokemon:
                        break;
                    case RequestType.ReleasePokemon:
                        break;
                    case RequestType.UseItemPotion:
                        break;
                    case RequestType.UseItemCapture:
                        break;
                    case RequestType.UseItemFlee:
                        break;
                    case RequestType.UseItemRevive:
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
                        break;
                    case RequestType.GetItemPack:
                        break;
                    case RequestType.BuyItemPack:
                        break;
                    case RequestType.BuyGemPack:
                        break;
                    case RequestType.EvolvePokemon:
                        break;
                    case RequestType.GetHatchedEggs:
                        break;
                    case RequestType.EncounterTutorialComplete:
                        break;
                    case RequestType.LevelUpRewards:
                        break;
                    case RequestType.CheckAwardedBadges:
                        break;
                    case RequestType.UseItemGym:
                        break;
                    case RequestType.GetGymDetails:
                        break;
                    case RequestType.StartGymBattle:
                        break;
                    case RequestType.AttackGym:
                        break;
                    case RequestType.RecycleInventoryItem:
                        break;
                    case RequestType.CollectDailyBonus:
                        break;
                    case RequestType.UseItemXpBoost:
                        break;
                    case RequestType.UseItemEggIncubator:
                        break;
                    case RequestType.UseIncense:
                        break;
                    case RequestType.GetIncensePokemon:
                        break;
                    case RequestType.IncenseEncounter:
                        break;
                    case RequestType.AddFortModifier:
                        break;
                    case RequestType.DiskEncounter:
                        break;
                    case RequestType.CollectDailyDefenderBonus:
                        break;
                    case RequestType.UpgradePokemon:
                        break;
                    case RequestType.SetFavoritePokemon:
                        break;
                    case RequestType.NicknamePokemon:
                        break;
                    case RequestType.EquipBadge:
                        break;
                    case RequestType.SetContactSettings:
                        break;
                    case RequestType.SetBuddyPokemon:
                        break;
                    case RequestType.GetBuddyWalked:
                        break;
                    case RequestType.GetAssetDigest:
                        break;
                    case RequestType.GetDownloadUrls:
                        break;
                    case RequestType.GetSuggestedCodenames:
                        break;
                    case RequestType.CheckCodenameAvailable:
                        break;
                    case RequestType.ClaimCodename:
                        break;
                    case RequestType.SetAvatar:
                        break;
                    case RequestType.SetPlayerTeam:
                        break;
                    case RequestType.MarkTutorialComplete:
                        break;
                    case RequestType.LoadSpawnPoints:
                        break;
                    case RequestType.CheckChallenge:
                        break;
                    case RequestType.VerifyChallenge:
                        break;
                    case RequestType.Echo:
                        break;
                    case RequestType.DebugUpdateInventory:
                        break;
                    case RequestType.DebugDeletePlayer:
                        break;
                    case RequestType.SfidaRegistration:
                        break;
                    case RequestType.SfidaActionLog:
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
                _startingLatitude = value;
            }
        }

        private static double StartingLongitude
        {
            get { return _startingLongitude; }
            set
            {
                _offsetLongitude = DestinationLongitude - value;
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

        //private static Dictionary<ulong, ulong> _cellConversion = new Dictionary<ulong, ulong>();

        //private static ulong GetModifiedS2Cell(ulong cellId)
        //{
        //    var s2Cell = new S2CellId(cellId);
        //    var latlng = s2Cell.ToLatLng();

        //    var lat = GetModifiedLatitude(latlng.LatDegrees);
        //    var lng = GetModifiedLongitude(latlng.LngDegrees);


        //    var latLong = S2LatLng.FromDegrees(lat, lng);
        //    var cell = S2CellId.FromLatLng(latLong);
        //    var newCellId = cell.ParentForLevel(s2Cell.Level);
        //    if (!_cellConversion.ContainsKey(newCellId.Id))
        //    {
        //        _cellConversion.Add(newCellId.Id, cellId);
        //    }
        //    return newCellId.Id;
        //}

        private static S2CellId GetOriginalS2Cell(ulong cellId)
        {
            var s2Cell = new S2CellId(cellId);
            var latlng = s2Cell.ToLatLng();

            var lat = GetOriginalLatitude(latlng.LatDegrees);
            var lng = GetOriginalLongitude(latlng.LngDegrees);


            var latLong = S2LatLng.FromDegrees(lat, lng);
            var cell = S2CellId.FromLatLng(latLong);
            var newCellId = cell.ParentForLevel(s2Cell.Level);
            return newCellId;
        }

        private static List<ulong> GetCellIdsForLatLong(double latitude, double longitude)
        {
            var latLong = S2LatLng.FromDegrees(latitude, longitude);
            var cell = S2CellId.FromLatLng(latLong);
            var cellId = cell.ParentForLevel(15);
            var cells = cellId.GetEdgeNeighbors();
            var cellIds = new List<ulong>
            {
                cellId.Id
            };

            foreach (var cellEdge1 in cells)
            {
                if (!cellIds.Contains(cellEdge1.Id)) cellIds.Add(cellEdge1.Id);

                foreach (var cellEdge2 in cellEdge1.GetEdgeNeighbors())
                {
                    if (!cellIds.Contains(cellEdge2.Id)) cellIds.Add(cellEdge2.Id);
                }
            }

            return cellIds;
        }

        private static Dictionary<Guid, CellIdConversion> _cellIdConversions = new Dictionary<Guid, CellIdConversion>();
        private class CellIdConversion
        {
            private List<S2CellId> _s2OriginalIds;
            private List<S2CellId> _s2CalculatedIds;
            public List<ulong> OriginalCellIds { get; set; }
            public List<ulong> CalculatedCellIds { get; set; }

            public ulong GetOriginalCellId(ulong calculatedCellId)
            {
                var calculatedCell=new S2CellId(calculatedCellId);
                var calculatedCellLocation = calculatedCell.ToLatLng();
                var originalLat = GetOriginalLatitude(calculatedCellLocation.LatDegrees);
                var originalLon = GetOriginalLongitude(calculatedCellLocation.LngDegrees);

                //var coords=new GeoCoordinate

                if (_s2OriginalIds == null || _s2CalculatedIds == null)
                {
                    GenerateCellIds();
                }

                //var nearestOriginalCellId=_s2OriginalIds.Where(c=>c.)
                return 0;
            }

            private void GenerateCellIds()
            {
                _s2OriginalIds = OriginalCellIds.Select(c => new S2CellId(c)).ToList();
                _s2CalculatedIds = CalculatedCellIds.Select(c => new S2CellId(c)).ToList();
            }
        }
    }
}
