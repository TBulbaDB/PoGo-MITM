namespace PoGoMITM.Base.Models
{
    /// <summary>
    /// Allows third party developers to create plugins which can modify the requests and responses of pogo servers. Each plugin's instance is created once during the startup sequence and same instance is used till the end of the application.
    /// </summary>
    public interface IModifierPlugin
    {
        /// <summary>
        /// Controls whether the plugin is enabled or not
        /// </summary>
        bool Enabled { get; }
        /// <summary>
        /// Allows modifications on the request data which is sent to pogo servers
        /// </summary>
        /// <param name="requestContext">Includes all parsed and raw data about the request</param>
        /// <returns></returns>
        bool ModifyRequest(RequestContext requestContext);
        /// <summary>
        /// Allows modifications on the response data which is sent from pogo servers
        /// </summary>
        /// <param name="requestContext">Includes all parsed and raw data about the response</param>
        /// <returns></returns>
        bool ModifyResponse(RequestContext requestContext);
        /// <summary>
        /// Gets called after the response is sent to reset the state of the plugin instance
        /// </summary>
        void ResetState();
    }
}