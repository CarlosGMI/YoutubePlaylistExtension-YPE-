$(document).ready(function(){
    $('select').formSelect();
});

console.log("Popup activated");
let url = "https://accounts.google.com/o/oauth2/auth?";
let idCliente = "1068019676011-i8foh6s791hgvalphsesukblafn6src8.apps.googleusercontent.com";
let redirect_uri = "https://127.0.0.1";
let scope = "https://www.googleapis.com/auth/youtube";
let response_type = "token";
$.get(url+'&client_id='+idCliente+'&redirect_uri='+redirect_uri+'&response_type='+response_type+'&scope='+scope, function(response, data, some)
{
  console.log(url+'&client_id='+idCliente+'&redirect_uri='+redirect_uri+'&response_type='+response_type+'&scope='+scope)
  console.log("Somos "+JSON.stringify(some));
});