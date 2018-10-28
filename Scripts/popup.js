/* $(document).ready(function(){
    $('select').formSelect();
}); */

let urlOauth2 = "https://accounts.google.com/o/oauth2/auth?";
let idCliente = "1068019676011-ioguch2k68ppfhhjk4c34m0gm3falu6m.apps.googleusercontent.com";//"1068019676011-i8foh6s791hgvalphsesukblafn6src8.apps.googleusercontent.com";
let redirect_uri = chrome.identity.getRedirectURL("oauth2");//chrome.identity.getRedirectURL();//chrome.identity.getRedirectURL("oauth2");//"http%3A%2F%2Flocalhost%2Foauth2callback";"http://localhost/oauth2callback";
let scope = "https://www.googleapis.com/auth/youtube";
let response_type = "token";
let authUrl = urlOauth2+'&client_id='+idCliente+'&redirect_uri='+redirect_uri+'&response_type='+response_type+'&scope='+scope;
let songsInPlaylist = [];

OperaAuthentication();
$(function () 
{
    $('select').formSelect();
    $('.playlistList').on('contentChanged', function () {
        $(this).material_select();
    });
});

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
 * @returns {json} La respuesta válida del servidor al validar el token
 * @throws {Error} El error de que el token es inválido y por tanto no se pueden validar credenciales de acceso
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

/**
 * Creación de cookie.
 * 
 * Función que crea una cookie con un nombre determinado, el valor que corresponde al token y una duración determinada.
 * 
 * @param {name} var El nombre de la cookie
 * @param {value} var El valor de la cookie (token)
 * @param {duration} var La duración o el tiempo de expiración de la cookie  
 */
function setCookie(name, value, duration)
{
    document.cookie = name+"="+value+"; max-age="+duration;
}

/**
 * Obtención de la YPE cookie.
 * 
 * Función que obtiene la cookie de YPE creada previamente.
 * 
 * @param {name} var El nombre de la cookie
 * @returns El valor de la YPE cookie
 * @returns Un boolean falso si no se encontró la YPE cookie
 */
function getCookie(name)
{
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

/**
 * Obtención del canal de Youtube.
 * 
 * Función que realiza una petición GET para obtener el canal del usuario autenticado. Antes de enviarse la petición
 * coloca en el encabezado HTTP el token y al ser exitosa dicha petición, se llama la función que obtiene los playlists
 * del canal obtenido.
 * 
 * @param {token} var El token de acceso
 */
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

/**
 * Obtención de los playlists del usuario.
 * 
 * Función que realiza una petición GET para obtener los playlists del usuario autenticado. Antes de enviarse la
 * petición coloca en el encabezado HTTP el token y al ser exitosa dicha petición, se itera sobre el JSON de respuesta
 * para colocar todos los playlists en un arreglo y llamar la función que actualiza los playlists en la vista del popup.
 * 
 * @param {token} var El token de acceso
 * @param {idCanal} var El ID del canal del usuario autenticado
 */
function obtenerPlaylists(token, idCanal)
{
    $.ajax({
        url: "https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=20",
        beforeSend: function(xhr)
        {
            xhr.setRequestHeader("Authorization", "OAuth "+token);
        },
        success: function(data)
        {
            let playlists = [];
            for(var i=0;i<data.items.length;i++)
            {
                let playlist = {};
                playlist["id"] = data.items[i].id;
                playlist["title"] = data.items[i].snippet.title;
                playlists.push(playlist);
            }
            actualizarPlaylistList(playlists);
        }
    });
}

/**
 * Actualización de los playlists en el popup.
 * 
 * Función que actualiza la lista de playlists en la vista del popup. Realiza una iteración sobre un arreglo que contiene
 * los playlists y agrega una opción a la lista de playlists por playlist existente. Posteriormente se actualiza la lista
 * para renderizarla en la vista del popup.
 * 
 * @param {playlists} var El arreglo que contiene los playlists del usuario autenticado.
 */
function actualizarPlaylistList(playlists)
{
    for(var i=0;i<playlists.length;i++)
    {
        $('#playlistList').append('<option value="'+playlists[i].id+'">'+playlists[i].title+'</option>');
        $("#playlistList").trigger('contentChanged');
    }
    $('select').formSelect();
    console.log("Entro por acá con: "+JSON.stringify(playlists));
}

/**
 * Obtención de las canciones en los playlists del usuario.
 * 
 * Función que realiza una petición GET para obtener las canciones de los playlists del usuario autenticado. Antes de 
 * enviarse la petición coloca en el encabezado HTTP el token y al ser exitosa dicha petición, se revisa si el playlist
 * tiene más de 50 canciones o no para llamar a la función que actualiza el arreglo que contiene la lista de las canciones
 * de los playlists del usuario autenticado.
 * 
 * @param {playlistID} var El ID del playlist del cual se extraerán las canciones
 * @param {token} var El token de acceso
 * @param {pageToken} var El token de la siguiente página de canciones del playlist
 */
function getSongsInPlaylist(playlistID, token, pageToken)
{
    $.ajax({
        url: "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId="+playlistID+"&pageToken="+pageToken,
        beforeSend: function(xhr)
        {
            xhr.setRequestHeader("Authorization", "OAuth "+token);
        },
        success: function(data)
        {
            $('#inputSearch').prop('disabled', true);
            updateSongs(data, playlistID, token);
        },
        error: function(error)
        {
            $('#inputSearch').prop('disabled', false);
            console.log("Nada que temer por acá");
        }
    });
}

function updateSongs(songs, playlistID, token)
{
    for(var i=0;i<songs.items.length;i++)
    {
        let song = {};
        song["videoId"] = songs.items[i].snippet.resourceId.videoId;
        song["id"] = songs.items[i].id;
        song["title"] = songs.items[i].snippet.title;
        songsInPlaylist.push(song);
    }
    getSongsInPlaylist(playlistID, token, songs.nextPageToken);
}

function searchSongs(songToSearch)
{
    if($('#playlistList').val() === null )
    {
        $('#exRes').hide();
        $('#noExRes').hide();
        alert("No has seleccionado un playlist");
    }
    else if(songToSearch === "")
    {
        $('#exRes').hide();
        $('#noExRes').hide();
        alert("El campo de busqueda se encuentra vacio");
    }
    else
    {
        let results = [];
        for (var song of songsInPlaylist) 
        {
            if (((song.title).toUpperCase()).includes(songToSearch.toUpperCase()))
            {
                results.push(song);
                //findSpecificSongs(song.id, getCookie("YPE"));
                $("#songResults").append('<div class="row" style="margin-bottom: 0"><div class="col s2" style="padding-right: 0"><a id="deleteButton" data-value="'+song.id+'" style="cursor: pointer; color: #cc181e;" class="material-icons">delete</a></div><div class="col s10" style="padding-left: 0; margin-top: -9px;"><p><b>URL: </b> <a href="https://www.youtube.com/watch?v='+song.videoId+'" style="line-height: 2px;">https://www.youtube.com/watch?v='+song.videoId+'</a></p></div></div>');
            }
        }
        if(results.length === 0)
        {
            $('#exRes').hide();
            $('#noExRes').show();
        }
        else
        {
            console.log("Los resultados de la búsqueda fueron: "+JSON.stringify(results));
            $('#exRes').show();
            $('#noExRes').hide();
        }
    }
}

function deleteVideoFromPlaylist(videoId, token, element)
{
    $.ajax({
        url: "https://www.googleapis.com/youtube/v3/playlistItems?id="+videoId,
        type: 'DELETE',
        beforeSend: function(xhr)
        {
            xhr.setRequestHeader("Authorization", "OAuth "+token);
        },
        success: function(data)
        {
            songsInPlaylist.splice(0,songsInPlaylist.length);
            element.parent().parent().remove();
            alert("La cancion ha sido borrada de forma exitosa");
            getSongsInPlaylist($('#playlistList').val(), getCookie("YPE"), "");
        },
        error: function(error)
        {
            alert("Ocurrió un error borrando el video del playlist");
        }
    });
}

/**
 * Listener de la lista de playlists en la vista del popup.
 * 
 * Función que, al existir un cambio en la lista de playlists en la vista del popup, llama la función que obtiene las
 * canciones del playlist seleccionado por el usuario en la vista del popup.
 * 
 * @listens event:change
 */
$('#playlistList').on('change', function(e) 
{
    if(getCookie("YPE") == false)
        alert("No has iniciado sesión")
    else
    {
        songsInPlaylist.splice(0,songsInPlaylist.length);
        $('#exRes').hide();
        $('#noExRes').hide();
        getSongsInPlaylist($('#playlistList').val(), getCookie("YPE"), "");
    }
});

$(".buttonSearch").click(function()
{
    //console.log("Las canciones en el playlist son: "+JSON.stringify(songsInPlaylist));
    $("#songResults").empty();
    searchSongs($("#inputSearch").val());
});

$(document).on('click', '#deleteButton', function()
{
    var confirm = window.confirm("Desea continuar con el borrado?");
    if(confirm == true)
        deleteVideoFromPlaylist($(this).data("value"), getCookie("YPE"), $(this));
});

//Autenticación para Chrome
// let idCliente = "1068019676011-kt5qv58g0q5krvdeek58q94r9ojrcv7o.apps.googleusercontent.com";
/* chrome.identity.getAuthToken({interactive: true}, function(token)
{
    //alert(chrome.runtime.lastError.message);
    alert("Sali por aqui: "+token);
    console.log(token);
}); */