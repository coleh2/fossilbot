var markdown;

function parseMd(text) {
  if(!text) return "";

  var pHtml = markdown.toHTML(text);
  var p = document.createElement("p");
  p.innerHTML = pHtml;
  if(p.childElementCount == 1) return p.firstElementChild.innerHTML;
  else return pHtml;
  return p.firstElementChild.innerHTML;
}

var writingPost = {
    "title": "",
    "description": "",
    "fields": {
    },
    timestamp: (new Date()).toISOString()
    
};
var postCache = {};
var editingPost, editingPostId;

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
    
    document.getElementsByTagName("aside")[0].classList.remove("disabled");

    if(pageID == "queue") updateQueueDisplay();
}
function createDiscordEmbedPreview(embedObject) {
    var wrapper = document.createElement("div");
    wrapper.setAttribute("class", "embed-IeVjo6 embedWrapper-3AbfJJ");
    
    var embedPill = document.createElement("div");
    embedPill.setAttribute("class", "embedPill-1Zntps");
    embedPill.style.backgroundColor = "#ffeecc";
    wrapper.appendChild(embedPill);
    
    var embedInner = document.createElement("div");
    embedInner.setAttribute("class", "embedInner-1-fpTo");
    wrapper.appendChild(embedInner);

    var embedContent = document.createElement("div");
    embedContent.setAttribute("class", "embedContent-3fnYWm");
    embedInner.appendChild(embedContent);

    var embedContentInner = document.createElement("div");
    embedContentInner.setAttribute("class", "embedContentInner-FBnk7v markup-2BOw-j");
    embedContent.appendChild(embedContentInner);
    
    //AUTHOR
    if(embedObject.author) {
        var embedAuthor = document.createElement("div");
        if(embedObject.author.icon_url) {
            var embedAuthorIcon = document.createElement("img");
            embedAuthorIcon.setAttribute("class", "embedAuthorIcon--1zR3L");
            embedAuthorIcon.setAttribute("class", embedObject.author.icon_url);
        
            embedAuthor.appendChild(embedAuthorIcon);
        }
        if(!embedObject.author.name) return alert("Your author must have a name!");
      
        var embedAuthorName = document.createElement("a");
        if(embedObject.author.url) {
            embedAuthorName.setAttribute("href", embedObject.author.url);
            embedAuthorName.setAttribute("class", "anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB embedAuthorNameLink-1gVryT embedLink-1G1K1D embedAuthorName-3mnTWj");
        } else {
            embedAuthorName.setAttribute("class", "anchor-3Z-8Bb embedAuthorName-3mnTWj");
        }
        embedAuthorName.innerText = embedObject.author.name;
        embedAuthor.appendChild(embedAuthorName);
      
        embedContentInner.appendChild(embedAuthor);
    }
    
    //TITLE
    if(embedObject.title) {
        var embedTitleWrapper = document.createElement("div");
        embedTitleWrapper.setAttribute("class", "embedMargin-UO5XwE");
    
        var embedTitle = document.createElement("a");
    
        if(embedObject.url) {
            embedTitle.setAttribute("href", embedObject.url);
            embedTitle.setAttribute("class", "anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB embedTitleLink-1Zla9e embedLink-1G1K1D embedTitle-3OXDkz");
        } else {
            embedTitle.setAttribute("class", "anchor-3Z-8Bb embedTitle-3OXDkz");
        }
        let mdText = parseMd(embedObject.title);
        embedTitle.innerHTML = mdText;
    
        embedTitleWrapper.appendChild(embedTitle);
        embedContentInner.appendChild(embedTitleWrapper);
    }
    
    //DESCRIPTION
    if(embedObject.description) {
        var embedDescription = document.createElement("div");
        embedDescription.setAttribute("class", "embedDescription-1Cuq9a embedMargin-UO5XwE");
        let mdText = parseMd(embedObject.description);
        embedDescription.innerHTML = mdText;
      
        Array.from(embedDescription.getElementsByTagName("a")).forEach(elem => {
            elem.setAttribute("class", "anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB");
        });

        embedContentInner.appendChild(embedDescription);
    }
    
    //FIELDS
    if(embedObject.fields) {
      
        var embedFields = document.createElement("div");
        embedFields.setAttribute("class", "embedFields-2IPs5Z embedMargin-UO5XwE");
      
        for(var i = 0; i < embedObject.fields.length; i++) {
            var fieldData = embedObject.fields[i];
        
            var field = document.createElement("div");
            field.setAttribute("class", "embedField-1v-Pnh");
            if(fieldData.inline) field.classList.add("embedFieldInline-3-e-XX");
        
            var fieldName = document.createElement("div");
            fieldName.setAttribute("class", "embedFieldName-NFrena");
            let mdName = parseMd(fieldData.name);
            fieldName.innerHTML = mdName;
            field.appendChild(fieldName);
        
            var fieldValue = document.createElement("div");
            fieldValue.setAttribute("class", "embedFieldValue-nELq2s");
            let mdVal = parseMd(fieldData.value);
            fieldValue.innerHTML = mdVal;
            field.appendChild(fieldValue);
        
            embedFields.appendChild(field);
        }
        embedContentInner.appendChild(embedFields);
    }
    
    //THUMBNAIL
    if(embedObject.thumbnail) {
        var thumbnail = document.createElement("a");
        thumbnail.setAttribute("class", "anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB imageWrapper-2p5ogY imageZoom-1n-ADA clickable-3Ya1ho embedThumbnail-2Y84-K");
        thumbnail.style.width = "80px";
        thumbnail.style.height = "80px";

        var thumbnailImg = document.createElement("img");
        thumbnailImg.setAttribute("src", embedObject.thumbnail.url);
        thumbnailImg.style.width = "80px";
        thumbnailImg.style.height = "80px";
      
        thumbnail.appendChild(thumbnailImg);
        embedContent.appendChild(thumbnail);
    }
    
    //IMAGE
    if(embedObject.image) {
        var imageWrapper = document.createElement("a");
        imageWrapper.setAttribute("class", "anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB imageWrapper-2p5ogY imageZoom-1n-ADA clickable-3Ya1ho embedImage-2W1cML embedMarginLarge-YZDCEs embedWrapper-3AbfJJ");

        var image = document.createElement("img");
        image.setAttribute("src", embedObject.image.url);
        image.style.width = "256px";
        image.style.height = "256px";

        imageWrapper.appendChild(image);

        embedInner.appendChild(imageWrapper);
    }

    //FOOTER
    if(embedObject.footer) {
        var footerWrapper = document.createElement("div");
        footerWrapper.setAttribute("class", "embedFooter-3yVop- embedMarginLarge-YZDCEs");

        if(embedObject.footer.icon_url) {
            var footerImage = document.createElement("img");
            footerImage.setAttribute("class", "embedFooterIcon-239O1f");
            footerImage.setAttribute("src", embedObject.footer.icon_url);
            footerWrapper.appendChild(footerImage);
        }
        if(embedObject.footer.text) {
            var footerText = document.createElement("span");
            footerText.setAttribute("class","embedFooterText-28V_Wb");
            let mdText = parseMd(embedObject.footer.text);
            footerText.innerHTML = mdText;
            if(embedObject.timestamp) {
                footerText.innerHTML += "<span class=\"embedFooterSeparator-3klTIQ\">•</span>" + (new Date(embedObject.timestamp)).toLocaleString();
            }
            footerWrapper.appendChild(footerText);
        }
        embedInner.appendChild(footerWrapper);
    }

    return wrapper;
}
function createPostCard(post) {
    var parent = document.createElement("div");

    var body = document.createElement("p");
    body.innerHTML = parseMd(post.description);
    parent.appendChild(body);

    if(post.fields) {
        for(var i = 0; i < post.fields.length; i++) {
            let fieldHeading = document.createElement("h4");
            fieldHeading.innerText = post.fields[i].name;
            parent.appendChild(fieldHeading);
            
            let fieldBody = document.createElement("p");
            fieldBody.innerHTML = parseMd(post.fields[i].value);
            parent.appendChild(fieldBody);
        }
    }

    return parent;

}
function deletePost(postId, cb) {
    function announceError(text) {
        snackbar({
            stopTimeout: true,
            exitButton: true,
            text: text || "Could not send post.",
            color: "err",
            actions: [{
                text: "Retry",
                action: sendPost
            }]
        });
    };

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) cb();
            else announceError();
        }
    };
    xhr.onerror = announceError;

    xhr.open("POST", "/twanhs/delete?id=" + postId, true);
    xhr.setRequestHeader("Authorization",localStorage.getItem("connectCode"));
    xhr.setRequestHeader("Content-Type","application/json");
    xhr.send();
}

function updateQueueDisplay() {
    function announceError(text) {
        snackbar({
            stopTimeout: true,
            exitButton: true,
            text: text || "Could not send post.",
            color: "err",
            actions: [{
                text: "Retry",
                action: sendPost
            }]
        });
    };
    
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                var txt = xhr.responseText;
                var json = JSON.parse(txt);

                var cardContainer = document.getElementById("queue").querySelector(".card-parent");
                cardContainer.innerHTML = "";

                console.log(json);
                if(document.querySelector(".empty-state-sorry")) {
                    document.querySelector(".empty-state-sorry").parentElement.removeChild(document.querySelector(".empty-state-sorry"));
                }
                var postIds = Object.keys(json);
                var posts = Object.values(json);
                for(var i = 0; i < posts.length; i++) {

                    postCache[postIds[i]] = posts[i];

                    let card = document.createElement("div");
                    card.classList.add("card");
                    card.setAttribute("data-post-id", postIds[i]);

                    let cardTitle = document.createElement("h3");
                    cardTitle.innerText = posts[i].embed.title;
                    card.appendChild(cardTitle);

                    let postPreview = document.createElement("div");
                    postPreview.classList.add("content-preview");
                    postPreview.appendChild(createPostCard(posts[i].embed));
                    card.appendChild(postPreview);

                    let cardActions = document.createElement("div");
                    cardActions.classList.add("card-actions");

                     var cardTime = document.createElement("span");
                     cardTime.innerText = (new Date(posts[i].timeAt)).toLocaleString();
                     cardTime.classList.add("card-time");
                     cardActions.appendChild(cardTime);

                    let cardActionEdit = document.createElement("a");
                    cardActionEdit.innerText = "edit";
                    cardActionEdit.style.marginRight = "0.25em";
                    cardActionEdit.href = "javascript:void(0)";
                    cardActionEdit.addEventListener("click",function() {
                        openPostForEdit(card.getAttribute("data-post-id"));
                    });
                    cardActions.appendChild(cardActionEdit);

                    let cardActionDelete = document.createElement("a");
                    cardActionDelete.innerText = "delete";
                    cardActionDelete.href = "javascript:void(0)";
                    cardActionDelete.addEventListener("click",function() {
                        deletePost(card.getAttribute("data-post-id"), function() {
                            card.classList.add("shrinking-to-nothing");
                            setTimeout(function() {
                                cardContainer.removeChild(card);
                            },200);
                        }); 
                    });
                    cardActions.appendChild(cardActionDelete);

                    card.appendChild(cardActions);

                    cardContainer.appendChild(card);
                }
                if(posts.length == 0) {
                    var sorry = document.createElement("div");
                    sorry.classList.add("empty-state-sorry");

                    var sorryTitle = document.createElement("h2");
                    sorryTitle.innerText = "Sorry!";
                    sorry.appendChild(sorryTitle);

                    var sorrySummary = document.createElement("p");
                    sorrySummary.innerText = "I couldn't find any posts queued-- maybe everything's already been sent out!";
                    sorry.appendChild(sorrySummary);

                    document.getElementById("queue").appendChild(sorry);
                }
            } else announceError();
        }
    };
    xhr.onerror = announceError;

    xhr.open("POST", "/twanhs/list", true);
    xhr.setRequestHeader("Authorization",localStorage.getItem("connectCode"));
    xhr.setRequestHeader("Content-Type","application/json");
    xhr.send();
}
function toDiscordFormat(object) {
    object.fields = Object.values(object.fields);
    return object;
}
function toEditFormat(object) {
    var fieldsAsObj = {};
    for(var i = 0; i < object.fields.length; i++) {
        fieldsAsObj["s" + i] = object.fields[i];
    }
    object.fields = fieldsAsObj;
    return object;
}
function createFieldEditorElement(targetObject, initialName, initialValue, existingId) {
    var newFieldTempId = Date.now().toString(16);
    if(existingId) newFieldTempId = existingId;
    else {
        while(targetObject.fields[newFieldTempId]) newFieldTempId += "1";
        targetObject.fields[newFieldTempId] = {};
    }
    
    var parentDiv = document.createElement("div");
    parentDiv.classList.add("input-fields-field-parent");
    parentDiv.setAttribute("data-field-id", newFieldTempId);
    
    var nameParent = document.createElement("div");
    nameParent.classList.add("input-fields-name-parent");
    
    var nameSpan = document.createElement("span");
    nameSpan.innerText = "Name: ";
    
    var nameInput = document.createElement("input");
    nameInput.classList.add("input-fields-field-name");
    if(initialName) nameInput.value = initialName;
    nameInput.addEventListener("input", function() {
        targetObject.fields[newFieldTempId].name = nameInput.value;
    });
    nameParent.appendChild(nameSpan);
    nameParent.appendChild(nameInput);
    
    var valueParent = document.createElement("div");
    valueParent.classList.add("input-fields-value-parent");
    
    var valueSpan = document.createElement("span");
    valueSpan.innerText = "Content: ";
    
    var valueInput = document.createElement("textarea");
    valueInput.classList.add("input-fields-field-value");
    if(initialValue) valueInput.value = initialValue;
    valueInput.addEventListener("input", function() {
        targetObject.fields[newFieldTempId].value = valueInput.value;
    });
    
    valueParent.appendChild(valueSpan);
    valueParent.appendChild(valueInput);
    
    var actionsParent = document.createElement("div");
    actionsParent.classList.add("input-fields-field-actions");
    
    var actionsDelete = document.createElement("a");
    actionsDelete.innerText = "delete";
    actionsDelete.addEventListener("click", function() {
        delete targetObject.fields[newFieldTempId];
        parentDiv.parentElement.removeChild(parentDiv);
    });
    
    actionsParent.appendChild(actionsDelete);
    
    parentDiv.appendChild(nameParent);
    parentDiv.appendChild(valueParent);
    parentDiv.appendChild(actionsParent);
    
    return parentDiv;
    
}
function removeAllChildrenOfElement(element) {
    while(element.firstChild) {
        element.removeChild(element.firstChild);
    } 
}
function cloneObject (object) {
    return JSON.parse(JSON.stringify(object));
}
function requireLogin() {
    document.getElementById("login-link").addEventListener("click",openLogin);
    if(localStorage.getItem("connectCode")) {
        document.getElementById("login-splash").style.display = "none";
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
                document.getElementById("login-splash").style.display = "none";
            }
        };
        req.open("GET", "/connectCode", true);
        req.setRequestHeader("Authorization",event.data);
        req.send();
    }, false);
}
function sendEdit() {
    var req = new XMLHttpRequest();

    function announceError(text) {
        snackbar({
            stopTimeout: true,
            exitButton: true,
            text: text || "Could not update edit.",
            color: "err",
            actions: [{
                text: "Retry",
                action: sendEdit
            }]
        });
    };
    req.onreadystatechange = function() {
        if (this.readyState == 4) {
            if(this.status.toString().substring(0,1) == "2") {
                snackbar({
                    exitButton: true,
                    text: "Post updated!",
                    color: "suc"
                });
                openSubpage("queue");
            } else if(req.responseText == "past") {
                announceError("Make sure your time isn't in the past!");
            } else if(req.status == "409") {
                snackbar({
                    stopTimeout: true,
                    exitButton: true,
                    text: "Posts cannot be queued for the same time!",
                    color: "err",
                    actions: [{
                        text: "Why?",
                        action: function() { window.alert("Discord puts limits on the rate of messages that a bot sends. To stay under this limit, you're not allowed to queue multiple posts at the same time.") }
                    }]
                });
            } else announceError();
        }
    };
    req.onerror = announceError;

    req.open("POST", "/twanhs/edit?id="+editingPostId, true);
    req.setRequestHeader("Authorization",localStorage.getItem("connectCode"));
    req.setRequestHeader("Content-Type","application/json");
    req.send(JSON.stringify({timeAt: (new Date(editingPost.timestamp)).valueOf(), embed: toDiscordFormat(editingPost)}));
}  
function sendPost() {
    var req = new XMLHttpRequest();

    function announceError(text) {
        snackbar({
            stopTimeout: true,
            exitButton: true,
            text: text || "Could not send post.",
            color: "err",
            actions: [{
                text: "Retry",
                action: sendPost
            }]
        });
    };
    req.onreadystatechange = function() {
        if (this.readyState == 4) {
            if(this.status.toString().substring(0,1) == "2") {
                snackbar({
                    exitButton: true,
                    text: "Post scheduled!",
                    color: "suc"
                });
            } else if(req.responseText == "past") {
                announceError("Make sure your time isn't in the past!");
            } else if(req.status == "409") {
                snackbar({
                    stopTimeout: true,
                    exitButton: true,
                    text: "Posts cannot be queued for the same time!",
                    color: "err",
                    actions: [{
                        text: "Why?",
                        action: function() { window.alert("Discord puts limits on the rate of messages that a bot sends. To stay under this limit, you're not allowed to queue multiple posts at the same time.") }
                    }]
                });
            } else announceError();
        }
    };
    req.onerror = announceError;

    req.open("POST", "/twanhs/post", true);
    req.setRequestHeader("Authorization",localStorage.getItem("connectCode"));
    req.setRequestHeader("Content-Type","application/json");
    req.send(JSON.stringify({timeAt: (new Date(writingPost.timestamp)).valueOf(), embed: toDiscordFormat(writingPost)}));
}
  
function logOut() {
    localStorage.clear();
    window.location.reload();
}
function openPostForEdit(postId) {
    if(!postCache[postId]) return;

    editingPost = toEditFormat(cloneObject(postCache[postId].embed));
    loadPostToEdit(editingPost);
    
    openSubpage("edit");
    editingPostId = postId;
}
function loadPostToEdit(postEmbed) {
    var fieldIds = Object.keys(postEmbed.fields);
    var fieldDatas = Object.values(postEmbed.fields);
    var currentExistingFields = document.querySelectorAll("#edit-fields .input-fields-field-parent");
    for(var i = 0; i < currentExistingFields.length; i++) {
        currentExistingFields[i].parentElement.removeChild(currentExistingFields[i]);
    }
    for(var i = 0; i < fieldDatas.length; i++) {
        console.log(fieldDatas[i]);
        let editElem = createFieldEditorElement(editingPost, fieldDatas[i].name, fieldDatas[i].value, fieldIds[i]);
        document.getElementById("edit-fields").insertBefore(editElem, document.getElementById("edit-fields-add"));
    }

    document.getElementById("edit-write-title").value = postEmbed.title;

    document.getElementById("edit-write-body").value = postEmbed.description;

    if(postEmbed.thumbnail) document.getElementById("edit-media-thumb").value = postEmbed.thumbnail.url || "";

    if(postEmbed.footer) document.getElementById("edit-media-footer").value = postEmbed.footer.icon_url || "";
    
    if(postEmbed.footer) document.getElementById("edit-write-footer").value = postEmbed.footer.text || "";
 
    var postDate = new Date(postEmbed.timestamp);
    document.getElementById("edit-write-date").value = postDate.getFullYear() + "-" + (postDate.getMonth() + 1) + postDate.getDate();
    document.getElementById("edit-write-time").value = (postDate.getHours()<10?"0"+postDate.getHours():postDate.getHours()) + ":" + (postDate.getMinutes()<10?"0"+postDate.getMinutes():postDate.getMinutes());
}
window.addEventListener("load", function() {
    document.body.style.height = window.innerHeight + "px";
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
    });

      
  
    var openLink = document.getElementById((window.location.hash || "#modules").substring(1));
    if(openLink) {
        openSubpage(openLink.id);
    }
    
    document.getElementById("input-fields-add").addEventListener("click", function() {
        document.getElementById("input-fields").insertBefore(createFieldEditorElement(writingPost), document.getElementById("input-fields-add"));
    });

    document.getElementById("post-write-title").addEventListener("input", function() {
        writingPost.title = document.getElementById("post-write-title").value;
    });
    document.getElementById("post-write-body").addEventListener("input", function() {
        writingPost.description = document.getElementById("post-write-body").value;
    });
    document.getElementById("post-media-thumb").addEventListener("input", function() {
        if(!writingPost.thumbnail) writingPost.thumbnail = {};
        writingPost.thumbnail.url = document.getElementById("post-media-thumb").value;
        if(!document.getElementById("post-media-thumb").value) delete writingPost.thumbnail;
    });
    document.getElementById("post-media-footer").addEventListener("input", function() {
        if(!writingPost.footer) writingPost.footer = {};
        writingPost.footer.icon_url = document.getElementById("post-media-footer").value;
        if(!document.getElementById("post-media-footer").value && !writingPost.footer.text) delete writingPost.footer;
    });
    document.getElementById("post-write-footer").addEventListener("input", function() {
        if(!writingPost.footer) writingPost.footer = {};
        writingPost.footer.text = document.getElementById("post-write-footer").value;
        if(!document.getElementById("post-write-footer").value && !writingPost.footer.icon_url) delete writingPost.footer;
    });
    document.getElementById("post-write-date").addEventListener("input", function() {
        var date = new Date(document.getElementById("post-write-date").value + " " + document.getElementById("post-write-time").value);
        if(!isNaN(date)) writingPost.timestamp = date.toISOString();
    });
    document.getElementById("post-write-time").addEventListener("input", function() {
        var date = new Date(document.getElementById("post-write-date").value + " " + document.getElementById("post-write-time").value);
        if(!isNaN(date)) writingPost.timestamp = date.toISOString();
    });
    document.getElementById("post-action-preview").addEventListener("click", function() {
        var frame = document.getElementById("post-preview-embed");
        removeAllChildrenOfElement(frame.contentDocument.body);
        frame.contentDocument.body.appendChild(createDiscordEmbedPreview(toDiscordFormat(cloneObject(writingPost))));
    });
    document.getElementById("post-action-send").addEventListener("click", function() {
        sendPost();
    });

    //for editing
    document.getElementById("edit-fields-add").addEventListener("click", function() {
        document.getElementById("edit-fields").insertBefore(createFieldEditorElement(editingPost), document.getElementById("edit-fields-add"));
    });

    document.getElementById("edit-write-title").addEventListener("input", function() {
        editingPost.title = document.getElementById("edit-write-title").value;
    });
    document.getElementById("edit-write-body").addEventListener("input", function() {
        editingPost.description = document.getElementById("edit-write-body").value;
    });
    document.getElementById("edit-media-thumb").addEventListener("input", function() {
        if(!editingPost.thumbnail) editingPost.thumbnail = {};
        editingPost.thumbnail.url = document.getElementById("edit-media-thumb").value;
        if(!document.getElementById("edit-media-thumb").value) delete editingPost.thumbnail;
    });
    document.getElementById("edit-media-footer").addEventListener("input", function() {
        if(!editingPost.footer) editingPost.footer = {};
        editingPost.footer.icon_url = document.getElementById("edit-media-footer").value;
        if(!document.getElementById("edit-media-footer").value && !editingPost.footer.text) delete editingPost.footer;
    });
    document.getElementById("edit-write-footer").addEventListener("input", function() {
        if(!editingPost.footer) editingPost.footer = {};
        editingPost.footer.text = document.getElementById("edit-write-footer").value;
        if(!document.getElementById("edit-write-footer").value && !editingPost.footer.icon_url) delete editingPost.footer;
    });
    document.getElementById("edit-write-date").addEventListener("input", function() {
        var date = new Date(document.getElementById("edit-write-date").value + " " + document.getElementById("edit-write-time").value);
        if(!isNaN(date)) editingPost.timestamp = date.toISOString();
    });
    document.getElementById("edit-write-time").addEventListener("input", function() {
        var date = new Date(document.getElementById("edit-write-date").value + " " + document.getElementById("edit-write-time").value);
        if(!isNaN(date)) editingPost.timestamp = date.toISOString();
    });
    document.getElementById("edit-action-preview").addEventListener("click", function() {
        var frame = document.getElementById("edit-preview-embed");
        removeAllChildrenOfElement(frame.contentDocument.body);
        frame.contentDocument.body.appendChild(createDiscordEmbedPreview(toDiscordFormat(cloneObject(editingPost))));
    });
    document.getElementById("edit-action-send").addEventListener("click", function() {
        sendEdit();
    });

    requireLogin();
});
  
