var cfgLocal = {};
var changesMade = 0;
function snackbar(opts) {
    if(opts === undefined) opts = {};
    var colors = {
        "suc": "#92D190",
        "err": "#DD8B8B",
        "war": "#FAB28E"
    };
    var elem = document.createElement("div");

    document.querySelectorAll(".snackbar").forEach(x => {
        x.parentElement.removeChild(x);
    });

    elem.classList.add("snackbar");
    elem.style.borderColor = colors[opts.color] || colors.suc;
    elem.style.cursor = "default";

    elem.innerText = (opts.text || "");

    var snackbarActions = document.createElement("div");
    snackbarActions.classList.add("snackbar-actions");
    if(opts.actions) {
        for(let i = 0; i < opts.actions.length; i++) {
            let buttonElem = document.createElement("button");
            buttonElem.innerText = opts.actions[i].text;
            buttonElem.onclick = opts.actions[i].action;
            snackbarActions.appendChild(buttonElem);
        }
    }

    if(opts.exitButton) {
        let exitElem = document.createElement("button");
        exitElem.innerHTML = "Close" || opts.exitText;
        exitElem.onclick = function() {
            elem.parentElement.removeChild(elem);
        };
        snackbarActions.appendChild(exitElem);
    } else {
        elem.onclick = function() {
            elem.parentElement.removeChild(elem);
        };
    }

    elem.appendChild(snackbarActions);

    document.body.appendChild(elem);

    if(!opts.stopTimeout) {
        setTimeout(function () {
            try { document.body.removeChild(elem); } catch (e) { console.error(e);  }
        }, opts.duration || 3000 );
    }
}

function openSubpage(pageID) {


    let pages = Array.from(document.getElementsByClassName("tab"));
    for(let i = 0; i < pages.length; i++) {
        pages[i].hidden = true;
    }
    document.getElementById(pageID).hidden = false;

    var links = Array.from(document.querySelectorAll("aside a"));
    for(let i = 0; i < links.length; i++) {
        links[i].parentElement.classList.remove("selected");
    }
    var pageSelectors = document.querySelectorAll("aside a");
    for(let i = 0; i < pageSelectors.length; i++) {
        if(pageSelectors[i].getAttribute("href") == "#" + pageID) {
            pageSelectors[i].parentElement.classList.add("selected");
            break;
        }
    }
}
function setRelativeDotNotationValue(object, dotNotation, value) {
    var keys = dotNotation.split(".");
    var target = object;
    for(var i = 0; i < keys.length; i++) {
        if(i+1<keys.length && target[keys[i]] === undefined) target[keys[i]] = {};

        if(i+1 == keys.length) target[keys[i]] = value;
        else target = target[keys[i]];
    }
    changesMade++;

    if(changesMade > 0) sendEdits();
}
function getRelativeDotNotationValue(object, dotNotation) {
    var keys = dotNotation.split(".");
    var target = object;
    for(var i = 0; i < keys.length; i++) {
        if(i+1<keys.length && target[keys[i]] === undefined) target[keys[i]] = {};

        if(i+1 == keys.length) return target[keys[i]];
        else target = target[keys[i]];
    }
}
function handleEventConfigInputChange(event) {
    var elem = event.target;
    var configKey = elem.getAttribute("data-config-key");
    if(elem.checked !== undefined) {
        setRelativeDotNotationValue(cfgLocal, configKey, elem.checked);
    } else {
        setRelativeDotNotationValue(cfgLocal, configKey, elem.value);
    }
}
function updateInputCurrentValues(configObject) {
    var inputs = document.getElementsByClassName("config-input");

    for(var i = 0; i < inputs.length; i++) {
        var configKey = inputs[i].getAttribute("data-config-key");
        var configValue = getRelativeDotNotationValue(configObject, configKey);
        var inputType = inputs[i].type;
        if(inputType == "checkbox") inputs[i].checked = configValue;
        else inputs[i].value = configValue;
    }
}
function updateEnabledModuleButtons(configObject) {
    var links = document.querySelectorAll("aside a");

    for(let i = 0; i < links.length; i++) {
        var enabledKey = links[i].getAttribute("href").substring(1);
        if(configObject.enabledFeatures[enabledKey] === false) links[i].classList.add("disabled");
    }
}
function pullConfig(serverId) {
    function announceError() {
        snackbar({
            stopTimeout: true,
            exitButton: true,
            text: "Error getting configuration.",
            color: "err",
            actions: [{
                text: "Retry",
                action: pullConfig
            }]
        });
    }
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(req.readyState == 4) {
            if(req.status == 200) updateLocalConfigObjects(req.responseText);
            else announceError();
        }
    };
    req.onerror = announceError;
    req.open("GET",`/data?src=discord&mode=${serverId}&type=cfg`,true);
    req.setRequestHeader("Authorization",localStorage.getItem("connectCode"));
    req.send();
}
function updateLocalConfigObjects(configText) {
    var parsedConfig = JSON.parse(configText);

    cfgLocal = parsedConfig;
    updateInputCurrentValues(cfgLocal);
    updateEnabledModuleButtons(cfgLocal);
}

function reloadCurrentConfig() {
    if(window.location.pathname.length > 5) {
        var serverId = window.location.pathname.substring(4);
        pullConfig(serverId);
    }
}
function requireLogin() {
    document.getElementById("login-link").addEventListener("click",openLogin);
    if(localStorage.getItem("connectCode")) {
        document.getElementById("login-splash").style.display = "none";
        reloadCurrentConfig();
    }
}
function openLogin() {
    window.open("https://discordapp.com/oauth2/authorize?client_id=387963766798811136&redirect_uri=http%3A%2F%2Ffossilbot.cf%2Fdiscordoauthresponse&response_type=token&scope=identify%20guilds%20connections&state=" + encodeURIComponent(window.location.pathname), "DiscordAuthWindow","toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=400,height=600"); 
    window.addEventListener("message", function(event) {
        localStorage.setItem("discordToken",event.data);
        event.source.close();
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                localStorage.setItem("connectCode",JSON.parse(this.responseText).code);
                localStorage.setItem("connectCode",JSON.parse(this.responseText).code);
                localStorage.setItem("discordMyAccount",JSON.stringify(JSON.parse(this.responseText).user));
                reloadCurrentConfig();
            }
        };
        req.open("GET", "/connectCode", true);
        req.setRequestHeader("Authorization",event.data);
        req.send();
    }, false);
}

function sendEdits() {
    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            changesMade = 0;
        }
    };
    req.open("POST", "/adminAction", true);
    req.setRequestHeader("Authorization",localStorage.getItem("connectCode"));
    req.setRequestHeader("Content-Type","application/json");
    req.send(JSON.stringify(cfgLocal));
}

window.addEventListener("load", function() {
    var pageSelectors = document.querySelectorAll("aside a");
    for(let i = 0; i < pageSelectors.length; i++) {
        pageSelectors[i].addEventListener("click", function(event) {
            let link = event.target;
            while(!link.getAttribute("href")) {
                link = link.parentElement;
            }

            let pageID = link.getAttribute("href").substring(1);
            openSubpage(pageID);
        });
    }

    var openLink = document.getElementById((window.location.hash || "#modules").substring(1));
    if(openLink) {
        openSubpage(openLink.id);
    }

    var configInputs = document.getElementsByClassName("config-input");
    for(let i = 0; i < configInputs.length; i++) {
        let configInput = configInputs[i];
        configInput.addEventListener("change", handleEventConfigInputChange);
        configInput.addEventListener("input", handleEventConfigInputChange);
    }
    var enableModuleCheckboxes = document.getElementsByClassName("enable-module-checkbox");
    for(let i = 0; i < enableModuleCheckboxes.length; i++) {
        enableModuleCheckboxes[i].addEventListener("change", function(event) {
            var name = event.target.getAttribute("name");
            var link = document.querySelector("aside a[href='#"+name+"']");

            if(event.target.checked) link.parentElement.classList.remove("disabled");
            else link.parentElement.classList.add("disabled");
        });
    }

    requireLogin();
});
