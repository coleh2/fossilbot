var rawData;

Array.prototype.findSName = function(y) {
    return this.find(x => { return x.name == y; });
};

window.addEventListener("error", function(e) {
    //if we don't have an available profile pic, take the default one
    if(e.target.tagName != "IMG") { return; }
    if(!e.target.parentElement.getAttribute("data-discord-id")) { return; }
    var id = e.target.parentElement.getAttribute("data-discord-id");
    
    if(!rawData) { return; } 
    
    var item = rawData.find(x => {x.discord.id = id;});
    if(!item) { return; }
    e.target.src = "https://cdn.discordapp.com/embed/avatars/" + (item.discord.discriminator % 5) + ".png";
}, true);

function formatLb(d,sFunc,dOR) {
    var nE = true;
    var ol = document.getElementById("list");

    if(!dOR) { ol.innerHTML = ""; }

    d = d.sort(sFunc);

    if(d[0].r.sId) {

        document.getElementById("serverIconImg").src = "https://cdn.discordapp.com/icons/"+d[0].r.sId+"/"+d[0].r.sIcon;
        document.getElementById("serverNameSpan").innerHTML = d[0].r.sName;


    }

    var GSBNhex = ["#FFD700","#C0C0C0","#CD7F32","#3E4246"];
    for(var i = 0; i < d.length; i++) {
        try {

            var bE = document.createElement("li");

            var sms = d[i].r.sms;
            var lvl = d[i].r.level;
            var mxp = d[i].r.score;
            var avatarUrl = function(x) {if (x.discord.avatar) {return "https://cdn.discordapp.com/avatars/" + x.discord.id + "/" + x.discord.avatar;} else { return "https://cdn.discordapp.com/embed/avatars/" + (x.discord.discriminator % 5) + ".png"; }}(d[i]);
            bE.innerHTML = "<img src=\""+ avatarUrl + "\" alt=\""+ d[i].discord.username +" \" style=\"border: 2px solid " + GSBNhex[Math.min(3,i)] +"\"> <span>" + d[i].discord.username +"<b>#"+d[i].discord.discriminator +"</b></span> <div class=\"listatdiv\"> <span>Level " + lvl +"</span> | <span class=\"data1\">" + sms +" Messages</span> | <span class=\"data2\">" + mxp + " XP</span></div><div class=\"advancedData\" onclick=\"event.stopPropagation();\" style=\"display:none\"><hr><div class=dataHolder></div><div class=\"advLoadImgH\"><img src=\"/load.svg\" alt=\"Loading...\" class=\"advLoadImg\"></div></div>";

            bE.setAttribute("data-discord-id",d[i].discord.id);
            bE.addEventListener("click", function() { 
                //advInfoOpen(e);
            });
            ol.appendChild(bE);
        } catch(e) {if(e) { nE = false; console.log(e);} }
    }
    return nE;
}

document.addEventListener("DOMContentLoaded", init, false);

var serverIdMode;

function init() {
 
    serverIdMode = "";
    if(window.location.pathname.length > 5) serverIdMode = window.location.pathname.substring(4);
    else return;

    console.log(serverIdMode);

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            //console.log(this.responseText);
            if( formatLb(JSON.parse(this.responseText),  function (a,b) {return b.r.score - a.r.score;} ) ) {
                rawData = JSON.parse(this.responseText);
                endLoad();
            }
        }
    };
    req.open("GET", "/data?src=discord&mode="+ serverIdMode +"&type=lb&start=0", true);
    req.send();
  
  
  
    if(localStorage.getItem("discordMyAccount")) {
        let osl = document.getElementById("openSettingsLink");
        var dma = JSON.parse(localStorage.getItem("discordMyAccount"));
        osl.style.display = "flex";
        osl.onclick = openSettings;
        osl.style.justifyContent = "center";
        osl.innerHTML = "<span style=\"margin-right:0.25em\">" + dma.username + " </span> <img src=\"" + function(x) {if (x.avatar) {return "https://cdn.discordapp.com/avatars/" + x.id + "/" + x.avatar;} else { return "https://cdn.discordapp.com/embed/avatars/" + (x.discriminator % 5) + ".png"; }}(dma) +"\" style=\"height:24px;border-radius:100%;overflow:hidden;\" alt=\"pfp\">"; 
    } else {
        let osl = document.getElementById("openSettingsLink");
        osl.style.display = "inital";
        osl.style.justifyContent = "initial";
        osl.innerHTML = "<svg width=\"24\" height=\"24\" xmlns=\"http://www.w3.org/2000/svg\" fill-rule=\"evenodd\" fill=\"white\" clip-rule=\"evenodd\"><path d=\"M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z\"></path></svg>"; 

    }

    document.getElementById("fwakueyuwackdzgrgdhgvjs").href = ("/cp/" + serverIdMode);
}



function endLoad(i) {
    if(!i) {
        document.getElementById("loading").style.display = "none";
        document.getElementById("listHolder").style.display = "block";
    }
}

function openSettings() {
    if(!localStorage.getItem("connectCode")) {
        openLogin();
    } else {
        var q = document.getElementById("q");
        q.style.display = (q.style.display=="block"?"none":"block");
    }
}
function openLogin() {
    window.open("https://discordapp.com/oauth2/authorize?client_id=387963766798811136&redirect_uri=http%3A%2F%2Ffossilbot.net%2Fdiscordoauthresponse&response_type=token&scope=identify%20guilds%20connections&state=" + encodeURIComponent(window.location.pathname), "DiscordAuthWindow","toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=400,height=600"); 
    window.addEventListener("message", function(e) {
        console.log(e);
        localStorage.setItem("discordToken",e.data);
        e.source.close();
        (function(w,d,x) {
            x = new XMLHttpRequest();

            x.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    localStorage.setItem("connectCode",JSON.parse(this.responseText).code);
                    localStorage.setItem("discordMyAccount",JSON.stringify(JSON.parse(this.responseText).user));
                    if(!localStorage.getItem("connectCode")) { return; }
                    var osl = document.getElementById("openSettingsLink");
                    osl.style.display = "flex";
                    osl.style.justifyContent = "center";
                    osl.innerHTML = "<span style=\"margin-right:0.25em\">" + JSON.parse(this.responseText).user.username + " </span> <img src=\"" + function(x) {if (x.avatar) {return "https://cdn.discordapp.com/avatars/" + x.id + "/" + x.avatar;} else { return "https://cdn.discordapp.com/embed/avatars/" + (x.discriminator % 5) + ".png"; }}(JSON.parse(this.responseText).user) +"\" style=\"height:24px;border-radius:100%;overflow:hidden;\" alt=\"yourpfp\">"; 
                }
            };
            x.open("GET", "/connectCode", true);
            x.setRequestHeader("Authorization",e.data);
            x.send();
        })(window,document);
        
    }, false);
    
}
