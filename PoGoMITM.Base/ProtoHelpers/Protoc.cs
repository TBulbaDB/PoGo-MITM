using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using log4net.Repository.Hierarchy;
using PoGoMITM.Base.Config;
using PoGoMITM.Base.Utils;

namespace PoGoMITM.Base.ProtoHelpers
{
    public static class Protoc
    {

        private static readonly string ProtocPath;
        static Protoc()
        {
            var tempFolder = Path.Combine(Environment.CurrentDirectory, "Temp");
            Directory.CreateDirectory(tempFolder);
            var files = Directory.GetFiles(tempFolder);
            foreach (var file in files)
            {
                File.Delete(file);
            }
            ProtocPath = FileLocation.GetFileLocation("protoc.exe");
            if (ProtocPath == null)
            {
                AppConfig.Logger.Error("Could not find protoc.exe in the application directory, won't be able to raw decode protos.");
            }
        }

        public static async Task<string> DecodeRaw(byte[] data)
        {
            if (ProtocPath == null) return null;
            if (data == null || data.Length == 0) return null;
            var guid = Guid.NewGuid().ToString();
            var inPath = Path.Combine("Temp", guid + "-in");
            await FileAsync.WriteAsync(inPath, data);
            var outPath = Path.Combine("Temp", guid + "-out");
            var arguments = $"--decode_raw < \"{inPath}\" > \"{outPath}\"";
            var commandOutput = await RunProtoc(arguments);
            if (File.Exists(outPath))
            {
                return await FileAsync.ReadTextAsync(outPath, Encoding.ASCII);
            }
            return null;

        }

        private static Task<string> RunProtoc(string arguments)
        {
            var tcs = new TaskCompletionSource<string>();
            var sb = new StringBuilder();
            var startInfo = new ProcessStartInfo
            {
                FileName = "cmd",
                Arguments = $"/c protoc {arguments}",
                RedirectStandardError = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                WorkingDirectory = Environment.CurrentDirectory
            };
            //startInfo.RedirectStandardInput = true;

            var process = new Process
            {
                StartInfo = startInfo,
                EnableRaisingEvents = true
            };
            process.ErrorDataReceived += (sender, args) =>
            {
                if (args.Data != null) sb.AppendLine(args.Data);
                tcs.TrySetResult(sb.ToString());
            };
            process.OutputDataReceived += (sender, args) =>
            {
                if (args.Data != null) sb.AppendLine(args.Data);
            };
            if (process.Start())
            {
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
                process.WaitForExit(5000);
                tcs.TrySetResult(sb.ToString());
            }
            //process.StandardInput.BaseStream.Write(data,0,data.Length);
            //new BinaryWriter(process.StandardInput.BaseStream).Write(data);
            return tcs.Task;
        }
    }
}
