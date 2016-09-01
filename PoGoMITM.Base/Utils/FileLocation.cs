using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace PoGoMITM.Base.Utils
{
    public static class FileLocation
    {
        public static string GetFileLocation(string filename)
        {
            var currentDir = Environment.CurrentDirectory;
            var currentFileLocation = Path.Combine(currentDir, filename);
            if (File.Exists(currentFileLocation)) return currentFileLocation;
            currentDir = AppDomain.CurrentDomain.BaseDirectory;
            currentFileLocation = Path.Combine(currentDir, filename);
            if (File.Exists(currentFileLocation)) return currentFileLocation;
            currentDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            if (currentDir != null)
                currentFileLocation = Path.Combine(currentDir, filename);
            if (File.Exists(currentFileLocation)) return currentFileLocation;
            //exhausted all options
            return null;
        }

        public static string GetFolderLocation(string foldername)
        {
            var currentDir = Environment.CurrentDirectory;
            var currentFileLocation = Path.Combine(currentDir, foldername);
            if (Directory.Exists(currentFileLocation)) return currentFileLocation;
            currentDir = AppDomain.CurrentDomain.BaseDirectory;
            currentFileLocation = Path.Combine(currentDir, foldername);
            if (Directory.Exists(currentFileLocation)) return currentFileLocation;
            currentDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            if (currentDir != null)
                currentFileLocation = Path.Combine(currentDir, foldername);
            if (Directory.Exists(currentFileLocation)) return currentFileLocation;
            //exhausted all options
            return null;
        }

    }
}
