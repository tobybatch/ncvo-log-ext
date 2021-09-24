import shaJs from "sha.js";

export const deserialiseCookies = () => {
    const textCookies = decodeURIComponent(document.cookie).split('; ');
    const cookies = {};
    textCookies.forEach(cookie => {
        cookies[cookie.substr(0, cookie.indexOf("="))] = cookie;
    })
    return cookies;
}

export const getCookieByFeature = (feature) => {
    const cookies = deserialiseCookies();
    const cName = cookieName(feature);
    return cookies[cName];
}

export const cookieName = (feature) => {
    return "fc_hmac_" + feature.toLowerCase();
}

export const cookieIsOn = (feature) => {
    const cookie = getCookieByFeature(feature);
    return cookie !== undefined && cookie.indexOf(":off") === -1;
}

export const setMessage = (message) => {
    $("#ncvoext-footer-text").text(message);
    setTimeout(() => {
        $("#ncvoext-footer-text").text("")
    }, 2000);
}

export const getEnv = (location) => {
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

export const featureClick = (e) => {
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
                console.log(items);
                const env = getEnv(window.location);
                if (items.secrets[env] === undefined) {
                    setMessage("Can't find secret for " + env);
                    return false;
                }
                const expireTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
                const plainText = feature.toUpperCase() + items.secrets[env];
                const shaJs = require('sha.js')
                const sha256hash = shaJs('sha256').update(plainText).digest('hex');
                document.cookie = `fc_hmac_${feature}=${feature.toUpperCase()}:${sha256hash}; expires=${expireTime}; path=/;`;
                setMessage("Cookie for " + feature + " set for env " + env);
                $("#ncvoext-footer-reload").show();
            }
        );
    } else {
        document.cookie = `fc_hmac_${feature}=LOGGER:off; expires=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toUTCString()}; path=/;`;
        setMessage("Cookie for " + feature + " cleared.");
        $("#ncvoext-footer-reload").show();
    }
}

export const addFeatureButton = (feature) => {
    const featureId = "ncvoext-feature-" + feature;
    const checked = cookieIsOn(feature);
    $("#ncvoext-footer-left").append(
        "<span><input type='checkbox' id='" + featureId + "' " + (checked ? "checked" : "") + ">" +
        feature +
        "</inputcheckbox></span>"
    );

    $("#" + featureId).on("click", featureClick);
}
