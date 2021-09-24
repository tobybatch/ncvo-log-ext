const {addFeatureButton, cookieIsOn} = require("./footerFunctions");
const {decodeLogs, attachFilters} = require("./loggerModalFunctions");

const setUpFooter = () => {
    const footerSrcUrl = chrome.extension.getURL("footer.html");
    fetch(footerSrcUrl)
        .then((response) => response.text())
        .then((text) => {
            $(document.body).append($(text));
            chrome.storage.local.get({
                features: {
                    logger: false,
                    auth: false,
                }
            }, function (items) {
                if (items.features) {
                    for (const key in items.features) {
                        if (items.features[key]) {
                            addFeatureButton(key);
                        }
                    }
                }
            });


            if (cookieIsOn("logger")) {
                fetch(chrome.extension.getURL("modal.html"))
                    .then((response) => response.text())
                    .then((text) => {
                        $(document.body).append($(text));
                        decodeLogs();
                        attachFilters();
                        $("#ncvoext-logger-btn").on("click", (e) => {
                            $("#ncvoext-logger-dialog").dialog({
                                resizable: false,
                                modal: true,
                                width: "90%",
                            })
                        });
                    });
            } // else hide the cog button


        });
}

// Maybe a better way of doing this but only load on html pages
if ($("html") !== undefined) {
    setUpFooter();
}
