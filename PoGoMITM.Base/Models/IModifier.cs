namespace PoGoMITM.Base.Models
{
    public interface IModifierPlugin
    {
        bool Enabled { get; }
        bool ModifyRequest(RequestContext requestContext);
        bool ModifyResponse(RequestContext requestContext);
        void ResetState();
    }
}