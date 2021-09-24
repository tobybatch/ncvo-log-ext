function save_options() {

    chrome.storage.local.set(
        {
            features: {
                logger: document.getElementById("logger").checked,
                auth: document.getElementById("auth").checked,
            },
            secrets: {
                local: document.getElementById("local").value,
                develop: document.getElementById("develop").value,
                integration: document.getElementById("integration").value,
                staging: document.getElementById("staging").value,
                production: document.getElementById("production").value,
            }
        },

        function () {
            // Update status to let user know options were saved.
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(function () {
                status.textContent = '';
            }, 750);
        }
    );
}

function restore_options() {
    chrome.storage.local.get({
        features: {
            logger: false,
            auth: false,
        },
        secrets: {
            develop: "",
            integration: "",
            staging: "",
            production: "",
        }
    }, function (items) {
        document.getElementById("logger").checked = items.features.logger;
        document.getElementById("auth").checked = items.features.auth;
        document.getElementById("local").value = items.secrets.local;
        document.getElementById("develop").value = items.secrets.develop;
        document.getElementById("integration").value = items.secrets.integration;
        document.getElementById("staging").value = items.secrets.staging;
        document.getElementById("production").value = items.secrets.production;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
