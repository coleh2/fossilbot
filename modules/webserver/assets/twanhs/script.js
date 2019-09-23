var writingPost = {
    "title": "",
    "description": "",
    "fields": {
      
    },
    timestamp: (new Date()).toISOString()
    
  };
  var changesMade = 0;
  
  var CHANGES_THRESHOLD_KEYVALUE = 0;
  var CHANGES_THRESHOLD_NORMAL = 0;
  
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
    var mdText = markdown.toHTML(embedObject.title);
    embedTitle.innerHTML = mdText.substring(3, mdText.length - 4);
    
    embedTitleWrapper.appendChild(embedTitle);
    embedContentInner.appendChild(embedTitleWrapper);
    }
    
    //DESCRIPTION
    if(embedObject.description) {
      var embedDescription = document.createElement("div");
      embedDescription.setAttribute("class", "embedDescription-1Cuq9a embedMargin-UO5XwE");
      var mdText = markdown.toHTML(embedObject.description);
      embedDescription.innerHTML = mdText.substring(3, mdText.length - 4);
      
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
        var mdText = markdown.toHTML(fieldData.name);
        fieldName.innerHTML = mdText.substring(3, mdText.length - 4);
        field.appendChild(fieldName);
        
        var fieldValue = document.createElement("div");
        fieldValue.setAttribute("class", "embedFieldValue-nELq2s");
        var mdText = markdown.toHTML(fieldData.value);
        fieldValue.innerHTML = mdText.substring(3, mdText.length - 4);
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
            img.setAttribute("class", "embedFooterIcon-239O1f");
            img.setAttribute("src", embedObject.footer.icon_url);
        }
        if(embedObject.footer.text) {
            var footerText = document.createElement("span");
            footerText.setAttribute("class","embedFooterText-28V_Wb");
            var mdText = markdown.toHTML(embedObject.footer.text)
            footerText.innerHTML = mdText.substring(3, mdText.length - 4);
            if(embedObject.timestamp) {
                footerText.innerHTML += "<span class=\"embedFooterSeparator-3klTIQ\">•</span>" + (new Date(embedObject.timestamp)).toLocaleString();
            }
            footerWrapper.appendChild(footerText);
        }
        embedInner.appendChild(footerWrapper);
    }

    return wrapper;
  }
  function toDiscordFormat(object) {
      object.fields = Object.values(object.fields);
      return object;
  }
  function createFieldEditorElement() {
    var newFieldTempId = Date.now().toString(16);
    while(writingPost.fields[newFieldTempId]) newFieldTempId += "1";
    writingPost.fields[newFieldTempId] = {};
    
    var parentDiv = document.createElement("div");
    parentDiv.classList.add("input-fields-field-parent");
    parentDiv.setAttribute("data-field-id", newFieldTempId)
    
    var nameParent = document.createElement("div");
    nameParent.classList.add("input-fields-name-parent");
    
    var nameSpan = document.createElement("span");
    nameSpan.innerText = "Name: ";
    
    var nameInput = document.createElement("input");
    nameInput.classList.add("input-fields-field-name");
    nameInput.addEventListener("input", function() {
      writingPost.fields[newFieldTempId].name = nameInput.value;
    });
    nameParent.appendChild(nameSpan);
    nameParent.appendChild(nameInput);
    
    var valueParent = document.createElement("div");
    valueParent.classList.add("input-fields-value-parent");
    
    var valueSpan = document.createElement("span");
    valueSpan.innerText = "Content: ";
    
    var valueInput = document.createElement("textarea");
    valueInput.classList.add("input-fields-field-value");
    valueInput.addEventListener("input", function() {
      writingPost.fields[newFieldTempId].value = valueInput.value;
    });
    
    valueParent.appendChild(valueSpan);
    valueParent.appendChild(valueInput);
    
    var actionsParent = document.createElement("div");
    actionsParent.classList.add("input-fields-field-actions");
    
    var actionsDelete = document.createElement("a");
    actionsDelete.innerText = "delete";
    actionsDelete.addEventListener("click", function() {
      delete writingPost.fields[newFieldTempId];
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

      function announceError(text) {
        snackbar({
            stopTimeout: true,
            exitButton: true,
            text: text || "Could not send post.",
            color: "err",
            actions: [{
                text: "Retry",
                action: sendEdits
            }]
        });
    }
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
      });

      
  
      var openLink = document.getElementById((window.location.hash || "#modules").substring(1));
      if(openLink) {
          openSubpage(openLink.id);
      }
    
      document.getElementById("input-fields-add").addEventListener("click", function() {
        document.getElementById("input-fields").insertBefore(createFieldEditorElement(), document.getElementById("input-fields-add"));
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
        if(isNaN(date)) writingPost.timestamp = (new Date()).toISOString();
        else writingPost.timestamp = date.toISOString();
      });
      document.getElementById("post-write-time").addEventListener("input", function() {
        var date = new Date(document.getElementById("post-write-date").value + " " + document.getElementById("post-write-time").value);
        if(isNaN(date)) writingPost.timestamp = (new Date()).toISOString();
        else writingPost.timestamp = date.toISOString();
      });
      document.getElementById("post-action-preview").addEventListener("click", function() {
        var frame = document.getElementById("post-preview-embed");
        removeAllChildrenOfElement(frame.contentDocument.body);
        frame.contentDocument.body.appendChild(createDiscordEmbedPreview(toDiscordFormat(cloneObject(writingPost))));
      });
      document.getElementById("post-action-send").addEventListener("click", function() {
        sendEdits();
      });

      requireLogin();
  });
  