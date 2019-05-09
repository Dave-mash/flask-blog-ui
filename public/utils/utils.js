// message
let message = []
let errors = []
let msgParams = new URLSearchParams(window.location.search);

// display errors
let spanMsg = document.getElementById('message');
let spanDiv = document.querySelector('.span_div');
const displayError = (msg, color) => {
    let span = document.getElementById('message');
    if (msg) {
        spanDiv.className += ' span_message';
        let b = `<b style='color:${color};'>${msg}</b>`;
        spanMsg.innerHTML = b;
        span.parentElement.style.display = 'block';
        span.parentElement.style.background = '#ccc';
        setTimeout(() => {
            span.parentElement.style.display = 'none';
        }, 5000);
    }
}

// set cookie value
const setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;";
}

// get cookie value
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

// log out
const log = document.getElementById('log_state');
if (log) {
    log.addEventListener('click', (e) => {
        if (log.textContent === 'Logout') {
            let blogParams = new URLSearchParams(window.location.search);
            let myParams = blogParams.get('username');
            let storedUser = JSON.parse(getCookie(myParams));
    
            fetch(`${fetchUrl}/auth/${storedUser.id}/logout`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Authorization': `Bearer ${storedUser.auth_token}`
                    }
                })
                .then(res => {
                        return res.json()
                    },
                    networkError => console.log(networkError.message))
                .then(jsonResponse => {
                    console.log(jsonResponse);
                    document.cookie = `${myParams}=${JSON.stringify(storedUser)}; expires=Thu, 18 Dec 2013 12:00:00 UTC; path=/`
                    window.location.replace(`${serverUrl}/index.html`);
                    message.push(jsonResponse.message)
                });
        } else if (log.textContent == 'Login') {
            window.location.href = `${serverUrl}/login.html`;
        }
    });
}

// profile page
const profile = document.getElementById('profile_anchor_tag');
profile.addEventListener('click', () => {
    let profileParams = new URLSearchParams(window.location.search);
    let myParams = profileParams.get('username');
    if (myParams) {
        window.location.href = `${serverUrl}/profile.html?username=${myParams}`;
    } else {
        displayError('Please log in first to access the profile page!', 'red');
    }
});

// home page
const home = document.getElementById('home_anchor_tag');
home.addEventListener('click', () => {
    let profileParams = new URLSearchParams(window.location.search);
    let myParams = profileParams.get('username');
    let span = document.getElementById('login_prompt');
    if (myParams) {
        span.innerHTML = '';
        window.location.href = `${serverUrl}/index.html?username=${myParams}`;
    } else {
        window.location.href = `${serverUrl}/index.html`;
    }
});

// login/logout
let a = document.getElementById('log_state');
a.textContent = window.location.search ? 'Logout' : 'Login';
a.style.cursor = 'pointer';

// urls
const serverUrl = window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:3000' : 'https://flask-blogify.herokuapp.com';
const fetchUrl = window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:5000/api/v1' : 'https://flask-blog-api.herokuapp.com/api/v1';



