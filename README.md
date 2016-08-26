# PoGoMITM [![Build status](https://ci.appveyor.com/api/projects/status/iipbt2ftxv7w49dh/branch/master?svg=true)](https://ci.appveyor.com/project/TBulbaDB/pogomitm/branch/master)

This project is a .net MITM proxy designed to read all the API messages sent between the Pokemon Go device and the Pokemon Go servers. 
# Usage

## Running for the first time

If you are using the precompiled release package, just run PoGoMITM.exe. If you are using the source, you should already know what to do. :)

It will create a root certificate and ask you if you want to install it. Click to Yes. After that, goto http://localhost:61222 and you should see the Web UI.

## Setting up your Android Phone to use the proxy

After making sure that the Proxy and Web UI running (see the console output for detailed info), go to your Phone Settings / WiFi, find your WiFi connection. Tap on it and wait a bit till you see the menu with Modify Network option. In Modify Network, you should see Advanced options, and a Proxy option under it. Select Manual as Proxy, then enter the ip address of your Proxy Server (the local ip of the computer you are running the Proxy server) and 61221 as port.

Then open a web browser on your phone and enter http://proxyip:61222. You should see the Web UI. There click to Download Root Certificate link at the top right corner and follow the instructions to install the certificate.

You also need the PoGo APK with Certificate Pinning disabled in order to run PoGo through the proxy. You can download it here.

## Settings

All the settings are located in PoGoMITM.exe.config file (App.Config if you are using the source code)

```
  <connectionStrings>
    <add name="mongodb" connectionString="mongodb://127.0.0.1/PoGoMITM?maxPoolSize=1000&amp;minPoolSize=100" />
  </connectionStrings>
  <appSettings>
    <add key="ProxyIp" value="0.0.0.0" />
    <add key="ProxyPort" value="61221" />
    <add key="WebServerPort" value="61222" />
    <add key="RootCertificateName" value="PoGoMITM CA" />
    <add key="RootCertificateIssuer" value="PoGoMITM" />
    <add key="DumpsFolder" value="Dumps" />
    <add key="LogsFolder" value="Logs" />
    <add key="TempFolder" value="Temp" />
    <!-- Comma separated list of dumpers. Valid values are FileDumper,MongoDumper -->
    <add key="DataDumpers" value="MongoDumper" />
    <add key="DumpRaw" value="false" />
    <add key="DumpProcessesed" value="false" />
    <add key="HostsToDump" value="sso.pokemon.com,pgorelease.nianticlabs.com,bootstrap.upsight-api.com,batch.upsight-api.com" />
    <!-- Do not change the values below -->
    <add key="owin:HandleAllRequests" value="true" />
    <add key="webPages:Enabled" value="false" />
  </appSettings>
```



