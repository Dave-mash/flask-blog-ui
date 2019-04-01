let b = 'hello'
const setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;";
}

const getCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const serverUrl = window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:3000' : 'https://flask-blogify.herokuapp.com';
const fetchUrl = window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:5000/api/v1' : 'https://flask-blog-api.herokuapp.com/api/v1';
console.log(serverUrl)
console.log(fetchUrl)
