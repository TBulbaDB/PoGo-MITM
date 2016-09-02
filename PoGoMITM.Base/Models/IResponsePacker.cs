namespace PoGoMITM.Base.Models
{
    public interface IResponsePacker
    {
        byte[] GenerateResponseBody(ResponseData responseData);
    }
}