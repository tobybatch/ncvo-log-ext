const deserialiseCookies = () => {
    const textCookies = decodeURIComponent(document.cookie).split('; ');
    const cookies = {};
    textCookies.forEach(cookie => {
        cookies[cookie.substr(0, cookie.indexOf("="))] = cookie;
    })
    return cookies;
}

const getCookieByFeature = (feature) => {
    const cookies = deserialiseCookies();
    const cName = cookieName(feature);
    return cookies[cName];
}

const cookieName = (feature) => {
    return "fc_hmac_" + feature.toLowerCase();
}

const cookieIsOn = (feature) => {
    const cookie = getCookieByFeature(feature);
    return cookie !== undefined && cookie.indexOf(":off") === -1;
}

const setMessage = (message) => {
    $("#footer-text").text(message);
    setTimeout(() => {$("#footer-text").text("")}, 2000);
}

const getEnv = (location) => {
    if (location.href.indexOf("localhost") || location.href.indexOf("127.0.0")) {
        return "local";
    } else if (location.href.indexOf("develop")) {
        return "develop";
    } else if (location.href.indexOf("integration")) {
        return "integration";
    } else if (location.href.indexOf("staging")) {
        return "staging";
    } else {
        return "production";
    }
}

const featureClick = (e) => {
    const id = e.currentTarget.id;
    const feature = id.substr(id.lastIndexOf("-") + 1);
    const checked = e.currentTarget.checked;
    if (checked) {
        chrome.storage.local.get({
                secrets: {
                    local: "",
                    develop: "",
                    integration: "",
                    staging: "",
                    production: "",
                }
            }, function (items) {
                const env = getEnv(window.location);
                if (items[env] === undefined) {
                    setMessage("Can't find secret for " + env);
                }
                const expireTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
                const plainText = feature + items[env];
                const shaJs = require('sha.js')
                const sha256hash = shaJs('sha256').update(plainText).digest('hex');
                document.cookie = `fc_hmac_${feature}=${feature.toUpperCase()}:${sha256hash}; expires=${expireTime}; path=/;`;
                setMessage("Cookie for " + feature + " set for env " + env);
                $("#footer-reload").show();
            }
        );
    } else {
        document.cookie = `fc_hmac_${feature}=LOGGER:off; expires=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toUTCString()}; path=/;`;
        setMessage("Cookie for " + feature + " cleared.");
        $("#footer-reload").show();
    }
}

const addFeatureButton = (feature) => {
    const featureId = "ncvo-feature-" + feature;
    const checked = cookieIsOn(feature);
    $("#footer-left").append(
        "<span><input type='checkbox' id='" + featureId + "' " + (checked ? "checked" : "") + ">" +
        feature +
        "</inputcheckbox></span>"
    );

    $("#" + featureId).on("click", featureClick);
}

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
        });
}

/*
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
*/
setUpFooter();
