var cfgLocal = {};
var changesMade = 0;

var CHANGES_THRESHOLD_KEYVALUE = 0;
var CHANGES_THRESHOLD_NORMAL = 0;

var inputProcessors = {
    hexToDiscordColor: function(direction, hex) {
        if(direction) return parseInt(hex.substring(1), 16);
        else return "#" + hex.toString(16);
    },
    millisecondsToMinutes: function (direction, ms) {
        if(direction) return ms * 60000;
        else return ms / 60000;
    },
    lowercase: function (direction, text) {
        return text.toLowerCase();
    }
};

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
function editKeyInObject(object, key, newKey) {
    object[newKey] = object[key];
    delete object[key];
}
function emptyKeyValueEditorRow(editorElem, editorObject,processorFunc, isArr) {
    let row = document.createElement("tr");
    row.classList.add("emptyRow");
    
    let addButton = document.createElement("a");
    addButton.innerHTML = "&plus;";
    addButton.href = "javascript:void(0)";
    addButton.addEventListener("click", function() {
        editorElem.insertBefore(normalKeyValueEditorRow(editorElem,editorObject,"","",processorFunc,isArr),row);
    });
    let buttonTableCell = document.createElement("td"); 
    buttonTableCell.colSpan = 3;
    buttonTableCell.appendChild(addButton);
    row.appendChild(buttonTableCell);

    return row;
}
function normalKeyValueEditorRow(editorElem, editorObject, key, value, processorFunc,isArr) {
    let rowElem = document.createElement("tr");

    let keyTableCell = document.createElement("td");
    let keyEditElem = document.createElement("input");
    keyEditElem.value = key;
    keyEditElem.addEventListener("input", function() {
        let val = keyEditElem.value;
        if(processorFunc) val = processorFunc(val);
        editKeyInObject(editorObject, key, val);
        key = keyEditElem.val;
        changesMade++;
        if(changesMade > CHANGES_THRESHOLD_KEYVALUE) sendEdits();
    });
    keyTableCell.appendChild(keyEditElem);
    rowElem.appendChild(keyTableCell);

    let valueTableCell = document.createElement("td");
    if(isArr) valueTableCell.appendChild(arrayKeyValueEditElem(value || []));
    else {
        let valueEditElem = document.createElement("input");
        if(typeof value == "number") valueEditElem.type = "number";
        if(typeof value == "boolean") valueEditElem.type = "checkbox";
        valueEditElem.value = value;
        valueEditElem.addEventListener("input", function() {
            let val = valueEditElem.type === "checkbox" ? valueEditElem.checked : valueEditElem.value;
            if(processorFunc) val = processorFunc(val);
            editorObject[key] = val;
            changesMade++;
            if(changesMade > CHANGES_THRESHOLD_KEYVALUE) sendEdits();
        });
        valueTableCell.appendChild(valueEditElem);
    }
    rowElem.appendChild(valueTableCell);

    let deleteTableCell = document.createElement("td");
    let deleteKeyElem = document.createElement("a");
    deleteKeyElem.href = "javascript:void(0)";
    deleteKeyElem.innerHTML = "&times;";
    deleteKeyElem.addEventListener("click", function() {
        delete editorObject[key];
        editorElem.removeChild(rowElem);

        changesMade++;
        if(changesMade > CHANGES_THRESHOLD_NORMAL) sendEdits();
    });
    deleteTableCell.appendChild(deleteKeyElem);
    rowElem.appendChild(deleteTableCell);

    return rowElem;
}
function arrayKeyValueEditElem(array) {
    let elem = document.createElement("details");
    elem.classList.add("array-editor");
    
    let elemSum = document.createElement("summary");
    elemSum.innerText = "Edit List...";
    elem.appendChild(elemSum);

    function arrayRow(value,index) {
        let row = document.createElement("div");
        let input = document.createElement("input");
        input.value = value === undefined ? "" : value;
        input.addEventListener("input", function() {
            array[index] = input.value;
        });
        row.appendChild(input);
        let deleteLink = document.createElement("a");
        deleteLink.href = "javascript:void(0)";
        deleteLink.innerHTML = "&times;";
        deleteLink.addEventListener("click", function() {
            delete array[index];
            row.parentElement.removeChild(row);
        });
        row.appendChild(deleteLink);
        return row;
    } 
    for(let i = 0; i < array.length; i++) {
        elem.appendChild(arrayRow(array[i], i));
    }

    let lastRow = document.createElement("a");
    lastRow.innerHTML = "+";
    lastRow.href = "javascript:void(0)";
    lastRow.addEventListener("click",function() {
        elem.insertBefore(arrayRow("", array.length++), lastRow);
    });
    elem.appendChild(lastRow);

    return elem;
}
function headerKeyValueEditorRow(keyHeader, valueHeader) {
    let row = document.createElement("tr");

    let keyTH = document.createElement("th");
    keyTH.innerText = keyHeader;
    row.appendChild(keyTH);
    
    let valueTH = document.createElement("th");
    valueTH.innerText = valueHeader;
    row.appendChild(valueTH);

    let placeHolderHeader = document.createElement("th");
    placeHolderHeader.innerHTML = "&nbsp;";
    row.appendChild(placeHolderHeader);

    return row;
}
function keyValueEditor(editedObject,keyHeader,valueHeader,processorFunc,isArr) {
    var editorElem = document.createElement("table");
    editorElem.classList.add("key-value-editor-container");

    editorElem.appendChild(headerKeyValueEditorRow(keyHeader||"Key", valueHeader || "Value"));
    var keys = Object.keys(editedObject);
    var values = Object.values(editedObject);

    for(let i = 0; i < keys.length; i++) {
        if(typeof values[i] === "number" || typeof values[i] === "string" || (values[i].constructor == Array && isArr)) editorElem.appendChild(normalKeyValueEditorRow(editorElem, editedObject, keys[i], values[i], processorFunc,isArr));
    }

    editorElem.appendChild(emptyKeyValueEditorRow(editorElem,editedObject,processorFunc,isArr));

    return editorElem;
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

    if(changesMade > CHANGES_THRESHOLD_NORMAL) sendEdits();
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
    var value = elem.value;
    var processorKey = elem.getAttribute("data-config-processor");

    if(elem.type == "checkbox") value = elem.checked;
    if(processorKey) value = inputProcessors[processorKey](true, value);

    setRelativeDotNotationValue(cfgLocal, configKey, value);
}
function updateInputCurrentValues(configObject) {
    var inputs = document.getElementsByClassName("config-input");

    for(var i = 0; i < inputs.length; i++) {
        var configKey = inputs[i].getAttribute("data-config-key");
        var configValue = getRelativeDotNotationValue(configObject, configKey);
        var processorKey = inputs[i].getAttribute("data-config-processor");
        var inputType = inputs[i].type;

        if(processorKey) configValue = inputProcessors[processorKey](false, configValue);    

        if(inputType == "checkbox") inputs[i].checked = configValue;
        else inputs[i].value = configValue;
    }

    var keyValueContainers = document.getElementsByClassName("config-keyvalue-editor");

    for(let i = 0; i < keyValueContainers.length; i++) {
        let containerElem = keyValueContainers[i];
        let subObjectOfConfig = getRelativeDotNotationValue(configObject,containerElem.getAttribute("data-config-key"));
        let headers = containerElem.getAttribute("data-config-header").split(",");
        let processorKey = containerElem.getAttribute("data-config-processor");
        let tableIsOfArrays = containerElem.getAttribute("data-config-valuetype") == "array";
        removeAllChildrenOfElement(containerElem);

        console.log(subObjectOfConfig);
        let editorElement = keyValueEditor(subObjectOfConfig,headers[0],headers[1],inputProcessors[processorKey],tableIsOfArrays);
        containerElem.appendChild(editorElement);
    }
}

function removeAllChildrenOfElement(element) {
    while(element.firstChild) {
        element.removeChild(element.firstChild);
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
    var windowUrl = "https://discordapp.com/oauth2/authorize?client_id=387963766798811136&redirect_uri=http%3A%2F%2Ffossilbot.cf%2Fdiscordoauthresponse&response_type=token&scope=identify%20guilds%20connections&state=" + encodeURIComponent(window.location.pathname);
    if(location.protocol == "https:") windowUrl = "https://discordapp.com/oauth2/authorize?client_id=387963766798811136&redirect_uri=https%3A%2F%2Ffossilbot.cf%2Fdiscordoauthresponse&response_type=token&scope=identify%20guilds%20connections&state=" + encodeURIComponent(window.location.pathname);
    window.open(windowUrl, "DiscordAuthWindow","toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=400,height=600"); 
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

function logOut() {
    localStorage.clear();
    window.location.reload();
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
            if(pageID == "logout") logOut();
            else openSubpage(pageID);
        });
    }

    document.getElementById("open-menu-button").addEventListener("click", function() {
        document.getElementById("side-menu").classList.toggle("disabled");
    });
    document.getElementById("side-menu-shadowbox").addEventListener("click", function() {
        document.getElementById("side-menu").classList.toggle("disabled");
    })

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
