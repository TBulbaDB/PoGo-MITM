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
    public class BetterThrow : IModifierPlugin
    {
        private const float TOLERANCE = 0.001f;
        private static readonly Random Randomizer = new Random();
        public bool Enabled => true;

        public bool ModifyRequest(RequestContext requestContext)
        {
            var changed = false;
            var requestData = requestContext.ModifiedRequestData ?? requestContext.RequestData;
            foreach (var request in requestData.Requests)
            {

                switch (request.Key)
                {
                    case RequestType.CatchPokemon:
                        var catchPokemonMessage = (CatchPokemonMessage)request.Value;
                        if (catchPokemonMessage.HitPokemon && catchPokemonMessage.NormalizedReticleSize < 1.2)
                        {
                            catchPokemonMessage.NormalizedReticleSize = Randomizer.NextDouble() * 0.74 + 1.2;
                            changed = true;
                        }
                        if (Math.Abs(catchPokemonMessage.NormalizedHitPosition) < TOLERANCE)
                        {
                            catchPokemonMessage.NormalizedHitPosition = Randomizer.Next(0, 10) > 2 ? 1 : 0;
                            changed = true;
                        }
                        if (Math.Abs(catchPokemonMessage.SpinModifier) < TOLERANCE)
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
            return false;
        }

        public void ResetState()
        {
        }
    }
}
