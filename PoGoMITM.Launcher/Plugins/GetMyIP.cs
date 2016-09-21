using System;
using System.Net;
using System.Net.Sockets;
using log4net;
using PoGoMITM.Base.Models;
using POGOProtos.Networking.Requests;
using POGOProtos.Networking.Responses;

namespace PoGoMITM.Launcher.Plugins
{
    public class GetMyIP : IModifierPlugin
    {
        public bool Enabled => true;
		public static readonly ILog Logger = LogManager.GetLogger("GetMyIP");
		
		public GetMyIP() 
		{
            var host = Dns.GetHostEntry(Dns.GetHostName());
            Logger.Info("Local IP Address(es):");
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    Logger.Info(ip.ToString());
                }
            }
        }

        public bool ModifyRequest(RequestContext requestContext)
        {
            return false;
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
