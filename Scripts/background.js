console.log("Background script activated");

let urlOauth2 = "https://accounts.google.com/o/oauth2/auth?";
let idCliente = "1068019676011-3q6tfmrv9oiv5vn3nrdie0bb82n4plo3.apps.googleusercontent.com";//"1068019676011-i8foh6s791hgvalphsesukblafn6src8.apps.googleusercontent.com";
let redirect_uri = "http%3A%2F%2Flocalhost%2Foauth2callback";//chrome.identity.getRedirectURL("oauth2"); //'https://'+chrome.runtime.id+'.chromiumapp.org'; //"http%3A%2F%2Flocalhost%2Foauth2callback";
let scope = "https://www.googleapis.com/auth/youtube";
let response_type = "token";
let authUrl = urlOauth2+'&client_id='+idCliente+'&redirect_uri='+redirect_uri+'&response_type='+response_type+'&scope='+scope;

/* chrome.identity.launchWebAuthFlow({'url': authUrl, 'interactive': true}, function(redUrl)
{
  console.log("Entramos acá");
  var q = redUrl.substr(redUrl.indexOf('#')+1);
  var parts = q.split('&');
  for (var i = 0; i < parts.length; i++) {
    var kv = parts[i].split('=');
    if (kv[0] == 'access_token') {
      token = kv[1];
      console.log('token is', token);
    }
  }
  console.log(redUrl);
}) */

/* $.get(authUrl,obtenerToken);

function obtenerToken(response)
{
  chrome.tabs.update({url: authUrl});
} */

/* chrome.identity.getAuthToken({'interactive': true}, function(token)
{
  if (chrome.runtime.lastError) 
  {
    alert(chrome.runtime.lastError.message);
  }
    console.log(token);
}); */