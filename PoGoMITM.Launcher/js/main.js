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

        self.toolbarS2Map = ko.observable("#");
        self.toolbarS2MapEnabled = ko.observable(false);

        self.rawContextListItems = ko.observableArray([]);

        self.addItem = function (guid, requestTime, host, methods) {
            self.rawContextListItems.push({
                Guid: guid,
                RequestTime: requestTime,
                Host: host,
                Methods: methods,
                IsActive: ko.observable(false)
            });
        };

        self.loadSessions = function() {
            
        },

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
                self.addItem(item.Guid, item.RequestTime, item.Host, item.Methods);
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
                        if (data.DecryptedSignature) {
                            self.toolbarDownloadDecryptedRawSignatureEnabled(true);
                        } else {
                            self.toolbarDownloadDecryptedRawSignatureEnabled(false);
                        }


                        self.toolbarDownloadJson("/download/json/" + item.Guid);
                        self.toolbarDownloadJsonEnabled(true);

                        if (data.RequestData.Requests &&
                            data.RequestData.Requests.GetMapObjects &&
                            data.RequestData.Requests.GetMapObjects.CellId &&
                            data.RequestData.Requests.GetMapObjects.CellId.length > 0) {
                            var s2Uri = "http://s2map.com/#order=latlng&mode=polygon&s2=false&points=";
                            var found = false;
                            for (var i = 0; i < data.RequestData.Requests.GetMapObjects.CellId.length; i++) {
                                var mapCell = data.RequestData.Requests.GetMapObjects.CellId[i];
                                if (mapCell) {
                                    s2Uri += mapCell.replace("ulong: ","") + ",";
                                    found = true;
                                }
                            }
                            if (found) {
                                self.toolbarS2Map(s2Uri);
                                self.toolbarS2MapEnabled(true);
                            }
                        } else {
                            self.toolbarS2MapEnabled(false);
                        }

                    } else {
                        $(".jsonViewer").html("An error occured");
                        self.toolbarDownloadRawRequestEnabled(false);
                        self.toolbarDownloadDecodedRequestEnabled(false);
                        self.toolbarDownloadRawResponseEnabled(false);
                        self.toolbarDownloadDecodedResponseEnabled(false);
                        self.toolbarDownloadDecryptedRawSignatureEnabled(false);
                        self.toolbarDownloadJsonEnabled(false);
                        self.toolbarS2MapEnabled(false);

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
                    self.toolbarS2MapEnabled(false);
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
                pogoMITM.models.rawContextsList.addItem(vm.Guid, vm.RequestTime, vm.Host, vm.Methods);
            }
        };
        $.connection.hub.start()
            .done(function () {
                // notifications.server.sendMessage("test");
            });
    }
};

pogoMITM.toClipboard = function(text) {
    var textArea = document.createElement("textarea");

    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a flash,
    // so some of these are just precautions. However in IE the element
    // is visible whilst the popup box asking the user for permission for
    // the web page to copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = "2em";
    textArea.style.height = "2em";

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = "transparent";


    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    try {
        var successful = document.execCommand("copy");
        var msg = successful ? "successful" : "unsuccessful";
        console.log("Copying text command was " + msg);
    } catch (err) {
        console.log("Oops, unable to copy");
    }

    document.body.removeChild(textArea);
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