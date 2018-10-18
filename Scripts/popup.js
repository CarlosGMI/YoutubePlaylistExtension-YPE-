$(document).ready(function(){
    $('select').formSelect();
});

let urlOauth2 = "https://accounts.google.com/o/oauth2/auth?";
let idCliente = "1068019676011-ioguch2k68ppfhhjk4c34m0gm3falu6m.apps.googleusercontent.com";//"1068019676011-i8foh6s791hgvalphsesukblafn6src8.apps.googleusercontent.com";
let redirect_uri = chrome.identity.getRedirectURL("oauth2");//chrome.identity.getRedirectURL();//chrome.identity.getRedirectURL("oauth2");//"http%3A%2F%2Flocalhost%2Foauth2callback";"http://localhost/oauth2callback";
let scope = "https://www.googleapis.com/auth/youtube";
let response_type = "token";
let authUrl = urlOauth2+'&client_id='+idCliente+'&redirect_uri='+redirect_uri+'&response_type='+response_type+'&scope='+scope;

OperaAuthentication();

/**
 * Autenticación en Opera.
 * 
 * Función que gestiona la autenticación de Opera. Si no hay cookie, inicia la autenticación en Youtube por OAauth2 
 * dado el authUrl. Si existe dicha cookie debe llenar el popup con la información de los playlists.
 */
async function OperaAuthentication()
{
    if(getCookie("YPE") == false)
    {
        chrome.identity.launchWebAuthFlow(
        {
            'url': authUrl,
            'interactive': true
        }, OperaRedirectURL);
    }
    else
    {
        console.log("Ya estoy logeado en YPE :D");
        let tokenInCookie = getCookie("YPE");
        let idCanal = await obtenerInfo(tokenInCookie);
    }
}

/**
 * Autenticación por OAuth2.
 * 
 * Función que maneja la respuesta del usuario al presentársele la ventana de autenticación de Youtube. Si el usuario
 * garantizó el permiso se obtiene el token de acceso, lo valida y se guarda en una cookie. De lo contrario se arroja 
 * un error de autenticación.
 * 
 * @param {redirectUrl} var La URL de redireccionamiento que provee OAuth2 cuando el usuario otorga permisos de acceso a
 * la aplicación
 */
function OperaRedirectURL(redirectUrl)
{
    if (redirectUrl) 
    {
        console.log("Redirect URL from Chrome.identity: " + redirectUrl);
        var token = getTokenFromURL(redirectUrl);
        //console.log("El maravilloso token es: " + token);
        ValidateTokenRequest(token)
            .then((json) => /* getRefreshToken(token) */setCookie("YPE", token, "600"))
            .catch((e) => alert(e));
    }
    else
        alert("Ha ocurrido un error en la autenticación de Opera");
}

/**
 * Validación del token de acceso a través del API Chrome.identity.
 * 
 * Función que realiza la validación del token de acceso otorgado por OAuth2. Si existiera alguna incoherencia en el
 * token se arroja un error de credenciales de acceso erróneas.
 * 
 * @param {token} var El token de acceso que es extraído del URL de redireccionamiento dado por OAuth2
 */
async function ValidateTokenRequest(token) 
{
    let checkToken = await fetch("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="+token);
    let json = await checkToken.json();
    if(json.error === undefined)
        return json;
    else
        throw Error("Ha ocurrido un error validando tus credenciales de acceso");
}

async function getRefreshToken(token)
{
    let checkToken = await fetch("https://accounts.google.com/o/oauth2/token?&client_id="+idCliente+"&client_secret=AIzaSyAL5AUBoY46yjT66rnIX3E8e8JlHMr0ies&refresh_token="+token+"&grant_type=refresh_token");
    console.log(checkToken);
}

function setCookie(name, value, duration)
{
    //chrome.cookies.set({"url": "https://*/*", "name": name, "value": value, "expirationDate": duration});
    document.cookie = name+"="+value+"; max-age="+duration;
}

function getCookie(name)
{
    //chrome.cookies.get({"url": "https://*/*", "name": name}, function(cookie){
      //  if(cookie)
        //    return cookie;
        //else
        //    return false;
    //})
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) 
        return parts.pop().split(";").shift();
    else
        return false;
}

/**
 * Obtención del token de acceso.
 * 
 * Función que realiza la extracción del token de acceso de la URL de redireccionamiento otorgada por OAuth2.
 * 
 * @param {url} var El URL de redireccionamiento del cual se extraerá el token de acceso.
 */
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

//SOLICITUD API PARA OBTENER LOS CANALES CORRESPONDIENTES AL ACCESS TOKEN ESPECIFICADO
function obtenerInfo(token) 
{
    $.ajax({
            url: "https://www.googleapis.com/youtube/v3/channels?part=id&mine=true",
            beforeSend: function(xhr)
            {
                xhr.setRequestHeader("Authorization", "Bearer "+token);
            },
            success: function(data)
            {
                console.log("La respuesta de los canales es: "+JSON.stringify(data));
                obtenerPlaylists(token, data.items[0].id);
            }
        });
}

function obtenerPlaylists(token, idCanal)
{
    $.ajax({
        //url: "https://www.googleapis.com/youtube/v3/playlists?part=snippet&maxResults=20&id=PL-JD1GaONZFQ8ZSH1yNZVuv27p8EX5mGV",
        url: "https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=20",
        beforeSend: function(xhr)
        {
            xhr.setRequestHeader("Authorization", "OAuth "+token);
        },
        success: function(data)
        {
            //actualizarPlaylistList(data.items[0].id, data.items[0].snippet.title);
            console.log(JSON.stringify(data.items));
        }
    });
}

function actualizarPlaylistList(idPlaylist, nombrePlaylist)
{
    console.log("Entro por acá con ID: "+idPlaylist+" --- y nombre: "+nombrePlaylist);
}

//Autenticación para Chrome
// let idCliente = "1068019676011-kt5qv58g0q5krvdeek58q94r9ojrcv7o.apps.googleusercontent.com";
/* chrome.identity.getAuthToken({interactive: true}, function(token)
{
    //alert(chrome.runtime.lastError.message);
    alert("Sali por aqui: "+token);
    console.log(token);
}); */