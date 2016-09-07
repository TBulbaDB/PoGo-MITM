using System;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using PoGoMITM.Base.Config;

namespace PoGoMITM.Base.Utils
{
    public static class CertificateHelper
    {
        public static string ConvertToPem(X509Certificate2 cert)
        {
            if (cert == null)
                throw new ArgumentNullException(nameof(cert));

            var base64 = Convert.ToBase64String(cert.RawData).Trim();

            var pem = "-----BEGIN CERTIFICATE-----" + Environment.NewLine;

            do
            {
                pem += base64.Substring(0, 64) + Environment.NewLine;
                base64 = base64.Remove(0, 64);
            }
            while (base64.Length > 64);

            pem += base64 + Environment.NewLine + "-----END CERTIFICATE-----";

            return pem;
        }

        public static X509Certificate2 GetCertificateFromStore()
        {

            // Get the certificate store for the current user.
            var store = new X509Store(StoreName.Root, StoreLocation.CurrentUser);
            try
            {
                store.Open(OpenFlags.ReadOnly);
                return store.Certificates.Cast<X509Certificate2>().FirstOrDefault(cert => cert.SubjectName.Name != null && cert.SubjectName.Name.Contains(AppConfig.RootCertificateName));
            }
            finally
            {
                store.Close();
            }

        }
    }
}
