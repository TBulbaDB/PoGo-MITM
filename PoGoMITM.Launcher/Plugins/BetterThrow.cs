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
        private static readonly Random Randomizer = new Random();
        public bool Enabled => true;

        public bool ModifyRequest(RequestContext requestContext)
        {
            var changed = false;
            foreach (var request in requestContext.RequestData.Requests)
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
                        if (catchPokemonMessage.NormalizedHitPosition == 0)
                        {
                            catchPokemonMessage.NormalizedHitPosition = Randomizer.Next(0, 10) > 2 ? 1 : 0;
                            changed = true;
                        }
                        if (catchPokemonMessage.SpinModifier == 0)
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
