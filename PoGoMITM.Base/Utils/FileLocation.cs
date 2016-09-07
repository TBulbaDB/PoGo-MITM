using System;
using System.IO;
using System.Reflection;

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
