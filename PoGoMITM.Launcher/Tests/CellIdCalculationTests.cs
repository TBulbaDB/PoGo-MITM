using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Google.Common.Geometry;

namespace PoGoMITM.Launcher.Tests
{
    public class CellIdCalculationTests
    {
        public static void Test()
        {
            const double DestinationLatitude = 40.754056;
            const double DestinationLongitude = -73.984310;
            var cells = GetCellIds(DestinationLatitude, DestinationLongitude);
        }

        public static List<ulong> GetCellIds(double latitude, double longitude)
        {
            var kEarthCircumferenceMeters = 1000 * 40075.017d;
            var radius = 500;
            var radiusInRadians = (2 * Math.PI) * (radius / kEarthCircumferenceMeters);

            var centerPoint = S2LatLng.FromDegrees(latitude, longitude).Normalized.ToPoint();

            var cap = S2Cap.FromAxisHeight(centerPoint, (radiusInRadians * radiusInRadians) / 2);
            var coverer = new S2RegionCoverer()
            {
                MaxLevel = 15,
                MinLevel = 15,
                LevelMod = 1,
                MaxCells = 1000,
            };

            var list = new List<S2CellId>();
            coverer.GetCovering(cap, list);

            return list.Select(x => x.Id).OrderBy(c => c).ToList();
        }
    }
}
