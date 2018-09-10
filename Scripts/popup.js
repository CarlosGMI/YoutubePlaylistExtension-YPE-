$(document).ready(function(){
    $('select').formSelect();
});

let urlOauth2 = "https://accounts.google.com/o/oauth2/auth?";
let idCliente = "1068019676011-ioguch2k68ppfhhjk4c34m0gm3falu6m.apps.googleusercontent.com";//"1068019676011-i8foh6s791hgvalphsesukblafn6src8.apps.googleusercontent.com";
let redirect_uri = chrome.identity.getRedirectURL("oauth2");//chrome.identity.getRedirectURL();//chrome.identity.getRedirectURL("oauth2");//"http%3A%2F%2Flocalhost%2Foauth2callback";"http://localhost/oauth2callback";
let scope = "https://www.googleapis.com/auth/youtube";
let response_type = "token";
let authUrl = urlOauth2+'&client_id='+idCliente+'&redirect_uri='+redirect_uri+'&response_type='+response_type+'&scope='+scope;

//ESTO FUNCIONA PERFECTO EN OPERA
chrome.identity.launchWebAuthFlow({'url': authUrl, 'interactive': true}, function(redirectUrl)
{
    if (redirectUrl) {
        console.log(redirectUrl);
        var token = getTokenFromURL(redirectUrl);
        console.log("El maravilloso token es: "+token);
        validateToken(token);
        $.ajax({
            url: "https://www.googleapis.com/youtube/v3/channels?part=id&mine=true",
            beforeSend: function(xhr)
            {
                xhr.setRequestHeader("Authorization", "Bearer "+token);
            },
            success: function(data)
            {
                console.log(JSON.stringify(data));
            }
        });
    }
    else
    {
        if (chrome.runtime.lastError)
        {
            alert("Ocurrió el siguiente error al autenticar: "+chrome.runtime.lastError.message);
        }
        else
        {
            alert("Ocurrió un error al autenticar");
        } 
    }
});

function getTokenFromURL(url) 
{
    var q = url.substr(url.indexOf('#') + 1);
    var parts = q.split('&');
    for (var i = 0; i < parts.length; i++) 
    {
        var kv = parts[i].split('=');
        if (kv[0] == 'access_token') 
        {
            token = kv[1];
            return token;
        }
    }
}

function validateToken(token) {
    $.post("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="+token, function(data, status)
    {
        if(status === "success")
        {
            console.log(JSON.stringify(data));
        }
        else
        {
            alert("Token inválido!");
        }
    });
}

//ESTO FUNCIONA PERFECTO EN CHROME
// let idCliente = "1068019676011-kt5qv58g0q5krvdeek58q94r9ojrcv7o.apps.googleusercontent.com";
/* chrome.identity.getAuthToken({interactive: true}, function(token)
{
    //alert(chrome.runtime.lastError.message);
    alert("Sali por aqui: "+token);
    console.log(token);
}); */