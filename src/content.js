const deserialiseCookies = () => {
    const textCookies = decodeURIComponent(document.cookie).split('; ');
    const cookies = {};
    textCookies.forEach(cookie => {
        cookies[cookie.substr(0, cookie.indexOf("="))] = cookie;
    })
    return cookies;
}

const getCookieByName = (feature) => {
    const cookies = deserialiseCookies()
    if (Object.keys(cookies).indexOf(cookieName(feature)) !== -1) {
        return cookies[Object.keys(cookies).indexOf(cookieName(feature))];
    }
}

const cookieName = (feature) => {
    return "fc_hmac_" + feature.toLowerCase();
}

const offCookie = (feature) => {
    return cookieName(feature) + "=" + feature.toUpperCase() + ":off";
}

const cookieIsPresent = (feature) => {
    return Object.keys(deserialiseCookies()).indexOf(feature) !== -1
}

const cookieIsOn = (feature) => {
    return cookieIsPresent(feature) && getCookieByName(feature) !== offCookie(feature);
}

fetch(chrome.extension.getURL("modal.html"))
    .then((response) => response.text())
    .then((text) => {
        $(document.body).append($(text));

        const rawData = $("#ncvo-logger").data("logger");
        if (rawData === undefined) {
            return;
        }
        const data = atob(rawData);
        const lines = JSON.parse(data);
        const content = $("<table class='ncvo-table'>");
        const components = [];
        lines.forEach(line => {
            // level
            const level = line.split("-")[3].trim();
            // component
            const tail = line.substr(line.indexOf("front")); // Strip off date/level
            const start = tail.indexOf(".") + 1;
            let component = tail.substr(
                start, // string the first module (front_controller), we don't need it
                tail.indexOf(":") - start, //; the component name ends with :
            );
            if (component.trim() === "") {
                component = "front_controller";
            }
            if (components.indexOf(component) === -1) {
                components.push(component.trim());
            }
            const message = tail.substr(tail.indexOf(":") + 1)
            const tr = $('<tr>');
            tr.append('<td class="ncvo-level ncvo-level-' + level.toLowerCase() + '">' + level + '</td>');
            tr.append('<td class="ncvo-component ncvo-component-' + component.replace(".", "-").replace("_", "-").toLowerCase() + '">' + component + '</td>');
            tr.append('<td class="ncvo-message">' + message + '</td>');
            content.append(tr);
        });
        components.forEach(component => {
            $("#ncvo-controls-component-select").append("<option value='" + component + "'>" + component + "</option>")
        })
        $("#ncvo-logger-content").append(content);

        $("#ncvo-controls-component-select").on("change", event => {
            const target = ".ncvo-component-" + event.currentTarget.value.replace(".", "-").replace("_", "-").toLowerCase();
            $(".ncvo-component").parent().hide();
            $(target).parent().show();
        });

        $(".ncvo-controls-level:checkbox").on("change", event => {
            $(".ncvo-controls-level:checkbox").each((index, checkbox) => {
                const attr = $(checkbox).attr("name");
                if (checkbox.checked) {
                    $(".ncvo-level-" + attr).parent().show();
                } else {
                    $(".ncvo-level-" + attr).parent().hide();
                }

            });
        });
    });

const footerSrcUrl = chrome.extension.getURL("footer.html");

fetch(footerSrcUrl)
    .then((response) => response.text()) //assuming file contains json
    .then((text) => {
        $(document.body).append($(text));

        $("#ncvo-logger-btn").on("click", (event) => {
            $("#ncvo-logger-dialog").dialog({
                resizable: false,
                modal: true,
                width: 1200,
            })
        });

        // Now check for cookies and add buttons for them
        chrome.storage.local.get({
            features: {
                logger: false,
                auth: false,
            }
        }, function (items) {
            const cookies = deserialiseCookies();
            const cookieNames = Object.keys(cookies);
            for (const feature in items.features) {
                // Make the icons and label for the feature
                const id = 'ncvo-footer-' + feature;
                $("#footer-left").append(
                    "<span class='ncvo-feature' id='" + id + "'>" +
                    "<i class=\"fa fa-check\" id=\"" + id + "-check\" aria-hidden=\"true\"></i>" +
                    "<i class=\"fa fa-times\" id=\"" + id + "-times\" aria-hidden=\"true\"></i>" +
                    feature +
                    "</span>"
                );
                // Check if the feature is enabled
                if (cookieIsOn(feature)) {
                    $("#" + id + "-check").css({display: "inline"});
                    $("#" + id + "-times").css({display: "none"});
                } else {
                    $("#" + id + "-check").css({display: "none"});
                    $("#" + id + "-times").css({display: "inline"});
                }
                // Add a listener to toggle the feature
                $("#" + id).on("click", e => {
                    const cookies = Object.keys(deserialiseCookies());
                    const feature = e.target.id.substr(e.target.id.lastIndexOf("-") + 1);
                    const cookieName = "fc_hmac_" + feature;
                    // Always remove the cookie.
                    document.cookie = offCookie(feature);
                    if (!cookieIsOn(feature)) {
                        chrome.storage.local.get({
                            secrets: {
                                develop: "",
                                integration: "",
                                staging: "",
                                production: "",
                            }
                        }, function (items) {
                            const env = $("#foot-env").val();
                            const secret = items.secrets[env];
                            if (secret === "" || secret === undefined) {
                                $("#footer-text").text(env + " secret is not set.");
                                setTimeout($("#footer-text").text(""), 750);
                            }
                            // what is feature
                            const shortName = cookieName.substr(cookieName.lastIndexOf("_") + 1).toUpperCase();
                            const plainText = shortName + secret;
                            // sha256hash = sha256(plaintext.encode("utf-8")).hexdigest()
                            const shaJs = require('sha.js')
                            const sha256hash = shaJs('sha256').update(plainText).digest('hex');
                            document.cookie = cookieName + "=" + shortName + ":" + sha256hash + "; expires=${new Date(Date.now() + 30*24*60*60*1000).toUTCString()}; path=/;";

                            window.location = location.href;
                        });
                    } else {
                        // Always reload to update flags in the FC
                        window.location = location.href;
                    }
                })
            }
        });
    });
