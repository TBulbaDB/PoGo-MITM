namespace PoGoMITM.Base.Models
{
    public interface IRequestPacker
    {
        byte[] GenerateRequestBody(RequestData requestData);
    }
}