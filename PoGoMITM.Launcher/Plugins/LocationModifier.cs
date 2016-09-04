using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Google.Common.Geometry;
using log4net;
using PoGoMITM.Base.Models;
using PoGoMITM.Base.Plugins;
using POGOProtos.Networking.Requests;
using POGOProtos.Networking.Requests.Messages;
using POGOProtos.Networking.Responses;

namespace PoGoMITM.Launcher.Plugins
{
    public class LocationModifier : LocationModifierBase, IModifierPlugin
    {
        public override bool Enabled => true;

        public override double DestinationLatitude => 40.754054;
        public override double DestinationLongitude => -73.984336;

        public LocationModifier()
        {
            LocationModifierBase.Logger.Info("Creating instance");
        }
    }
}
