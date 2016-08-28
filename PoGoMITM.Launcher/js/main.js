var pogoMITM = pogoMITM || {};

pogoMITM.models = new function () {

    this.rawContextsList = new RawContextsList();
    ko.applyBindings(this.rawContextsList, document.body);

    function RawContextsList() {
        var self = this;
        var previousActiveItem;

        self.isLiveSession = true;
        self.activeMenuItem = ko.observable("live");

        self.toolbarDownloadRawRequest = ko.observable("#");
        self.toolbarDownloadRawRequestEnabled = ko.observable(false);
        self.toolbarDownloadDecodedRequest = ko.observable("#");
        self.toolbarDownloadDecodedRequestEnabled = ko.observable(false);

        self.toolbarDownloadRawResponse = ko.observable("#");
        self.toolbarDownloadRawResponseEnabled = ko.observable(false);
        self.toolbarDownloadDecodedResponse = ko.observable("#");
        self.toolbarDownloadDecodedResponseEnabled = ko.observable(false);

        self.toolbarDownloadDecryptedRawSignature = ko.observable("#");
        self.toolbarDownloadDecryptedRawSignatureEnabled = ko.observable(false);

        self.toolbarDownloadJson = ko.observable("#");
        self.toolbarDownloadJsonEnabled = ko.observable(false);

        self.rawContextListItems = ko.observableArray([]);

        self.addItem = function (guid, requestTime, host) {
            self.rawContextListItems.push({
                Guid: guid,
                RequestTime: requestTime,
                Host: host,
                IsActive: ko.observable(false)
            });
        };

        self.loadItems = function (session) {
            $(".jsonViewer").html("");
            if (session == "live") {
                self.activeMenuItem("live");
            } else {
                self.activeMenuItem("previous");
            }
            $.ajax({
                url: "/session/" + (session ? session : "live"),
                method: "GET"
            })
                .done(function (data) {
                    if (data && data.length > -1) {
                        self.rawContextListItems.removeAll();
                        self.addRange(data);
                        if (session != "live") {
                            self.isLiveSession = false;
                        } else {
                            self.isLiveSession = true;
                        }
                        //console.log(data);
                        //ko.applyBindings(self.rawContextsList, document.body);
                    }
                });
        };

        self.addRange = function (listOfItems) {
            for (var i = 0; i < listOfItems.length; i++) {
                var item = listOfItems[i];
                self.addItem(item.Guid, item.RequestTime, item.Host);
            }
        };

        self.loadRequestDetails = function (item) {
            $(".jsonViewer").html("Loading...");
            $.ajax({
                url: "/details/" + item.Guid,
                method: "GET"
            })
                .done(function (data) {
                    if (data) {
                        try {

                            if (data.PlatformRequests &&
                                data.PlatformRequests.SendEncryptedSignature) {
                                var test = p.d(data.PlatformRequests.SendEncryptedSignature.EncryptedSignature);
                                var test1 = new Uint8Array(test);
                                var test2 = Array.from(test1);

                                $.ajax({
                                    url: "/details/signature/" + item.Guid,
                                    data: { Bytes: JSON.stringify(test2) },
                                    method: "POST"
                                })
                                    .done(function (result) {
                                        if (result && result.success) {
                                            data.DecryptedSignature = result.signature;
                                            self.toolbarDownloadDecryptedRawSignatureEnabled(true);
                                            $(".jsonViewer").JSONView(data, { collapsed: true });
                                        }
                                    });
                            }

                        } catch (e) {

                        }
                        if (previousActiveItem) previousActiveItem.IsActive(false);
                        item.IsActive(true);
                        previousActiveItem = item;
                        $(".jsonViewer").JSONView(data, { collapsed: true });
                        if (data.RequestBodyLength > 0) {
                            self.toolbarDownloadRawRequest("/download/request/raw/" + item.Guid);
                            self.toolbarDownloadRawRequestEnabled(true);
                            self.toolbarDownloadDecodedRequest("/download/request/decoded/" + item.Guid);
                            self.toolbarDownloadDecodedRequestEnabled(true);
                        } else {
                            self.toolbarDownloadRawRequestEnabled(false);
                            self.toolbarDownloadDecodedRequestEnabled(false);
                        }
                        if (data.ResponseBodyLength > 0) {
                            self.toolbarDownloadRawResponse("/download/response/raw/" + item.Guid);
                            self.toolbarDownloadRawResponseEnabled(true);
                            self.toolbarDownloadDecodedResponse("/download/response/decoded/" + item.Guid);
                            self.toolbarDownloadDecodedResponseEnabled(true);
                        } else {
                            self.toolbarDownloadRawResponseEnabled(false);
                            self.toolbarDownloadDecodedResponseEnabled(false);
                        }
                        self.toolbarDownloadDecryptedRawSignature("/download/decryptedrawsignature/" + item.Guid);
                        self.toolbarDownloadDecryptedRawSignatureEnabled(false);
                        self.toolbarDownloadJson("/download/json/" + item.Guid);
                        self.toolbarDownloadJsonEnabled(true);
                    } else {
                        $(".jsonViewer").html("An error occured");
                        self.toolbarDownloadRawRequestEnabled(false);
                        self.toolbarDownloadDecodedRequestEnabled(false);
                        self.toolbarDownloadRawResponseEnabled(false);
                        self.toolbarDownloadDecodedResponseEnabled(false);
                        self.toolbarDownloadDecryptedRawSignatureEnabled(false);
                        self.toolbarDownloadJsonEnabled(false);

                    }
                })
                .fail(function () {
                    $(".jsonViewer").html("An error occured");
                    self.toolbarDownloadRawRequestEnabled(false);
                    self.toolbarDownloadDecodedRequestEnabled(false);
                    self.toolbarDownloadRawResponseEnabled(false);
                    self.toolbarDownloadDecodedResponseEnabled(false);
                    self.toolbarDownloadDecryptedRawSignatureEnabled(false);
                    self.toolbarDownloadJsonEnabled(false);
                });
        }
    }
}

pogoMITM.signalR = {
    init: function () {
        var notifications = $.connection.notificationHub;

        notifications.client.sendMessage = function (message) {
            //console.log(message);
        };
        notifications.client.rc = function (vm) {
            //console.log(vm);
            if (pogoMITM.models.rawContextsList.isLiveSession) {
                pogoMITM.models.rawContextsList.addItem(vm.Guid, vm.RequestTime, vm.Host);
            }
        };
        $.connection.hub.start()
            .done(function () {
                // notifications.server.sendMessage("test");
            });
    }
};



$(function () {

    pogoMITM.signalR.init();

    function resizeRawContextsContainer() {
        var windowHeight = $(window).height();
        var contentHeight = windowHeight - $(".navbar").height() - 30;
        $(".rawContextsContainer").height(contentHeight);
        $(".jsonViewer").height(contentHeight - 40);
    }

    $(window).on("resize", resizeRawContextsContainer);
    resizeRawContextsContainer();

});