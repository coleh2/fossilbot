window.addEventListener("load", function () {
    var myAccountLink = document.getElementById("account-nav");
    myAccountLink.addEventListener("click", openAccountMenu);
    document.getElementById("account-dropdown").addEventListener("click",stopEventPropagation);

    if(localStorage.getItem("connectCode")) displayUserInLoginText();
});

var openAccountMenu = function() {
    var isLoggedIn = localStorage.getItem("connectCode");
    if(!isLoggedIn) {
        openLogin();
    } else {
        var dropdown = document.getElementById("account-dropdown");
        if(dropdown.hidden) dropdown.hidden = false;

        document.body.addEventListener("click",closeAccountMenu);
    }
}

var stopEventPropagation = function(event) {
    event.stopPropagation();
}

var closeAccountMenu = function() {
    var dropdown = document.getElementById("account-dropdown");
    if(!dropdown.hidden) dropdown.hidden = true;

    document.body.removeEventListener("click", closeAccountMenu);
}

var openLogin = function () {
    window.open("https://discordapp.com/oauth2/authorize?client_id=387963766798811136&redirect_uri=http%3A%2F%2Ffossilbot.cf%2Fdiscordoauthresponse&response_type=token&scope=identify%20guilds%20connections&state=" + encodeURIComponent(window.location.pathname), 'DiscordAuthWindow', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=400,height=600');
    window.addEventListener("message", function (event) {
        localStorage.setItem('discordToken', event.data);
        event.source.close();
        sendCodeSync(event.data);
    });
}
var displayUserInLoginText = function() {
    var userData = JSON.parse(localStorage.getItem("discordMyAccount");
    var accountLinkText = document.getElementById('account-text');
    accountLinkText.style.display = "flex"
    accountLinkText.classList.add("loggedin");
    accountLinkText.style.justifyContent = "center"
    accountLinkText.innerHTML = '<span style="margin-right:0.25em">' + userData.username + ' </span> <img src="' + function (x) { if (x.avatar) { return 'https://cdn.discordapp.com/avatars/' + x.id + '/' + x.avatar } else { return 'https://cdn.discordapp.com/embed/avatars/' + (x.discriminator % 5) + '.png' } }(userData) + '" style="height:24px;border-radius:100%;overflow:hidden;" alt="yourpfp">'
}
var sendCodeSync = function (code) {
    var xhr = ((window.XMLHttpRequest) ? (new XMLHttpRequest()) : (new ActiveXObject("Microsoft.XMLHTTP")));

    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var parsedResponse = JSON.parse(this.responseText);
            if (!parsedResponse.code) { return }
            localStorage.setItem('connectCode', parsedResponse.code);
            localStorage.setItem('discordMyAccount', JSON.stringify(parsedResponse.user));
            
            displayUserInLoginText();
            openAccountMenu();
        }
    };
    xhr.open("GET", "/connectCode", true);
    xhr.setRequestHeader('Authorization', code);
    xhr.send();
}