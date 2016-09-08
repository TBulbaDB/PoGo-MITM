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
			Logger.Info("Current IP: " + GetLocalIPAddress());
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

		private static string GetLocalIPAddress()
		{
			var host = Dns.GetHostEntry(Dns.GetHostName());
			foreach (var ip in host.AddressList)
			{
				if (ip.AddressFamily == AddressFamily.InterNetwork)
				{
					return ip.ToString();
				}
			}
			throw new Exception("Local IP Address Not Found!");
		}
    }
}
