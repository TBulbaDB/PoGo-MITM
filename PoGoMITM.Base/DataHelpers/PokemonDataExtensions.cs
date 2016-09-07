using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using POGOProtos.Data;

namespace PoGoMITM.Base.DataHelpers
{
    public static class PokemonDataExtensions
    {
        public static double CalculateIV(this PokemonData pokemonData)
        {
            return IVCalculator.Calculate(pokemonData);
        }
    }
}
