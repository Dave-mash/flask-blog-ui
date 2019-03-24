// user log in event

const form = document.getElementById('login-form')
const loginUrl = 'https://flask-blog-api.herokuapp.com/api/v1/auth/login';

let span = document.getElementById('error_span')
let b = document.createElement('b')

const setCookie = (cname, cvalue, exdays) => {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = `${cname}=${JSON.stringify(cvalue)}; ${expires}; path=/;`;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    let span = document.getElementById('error_span');
    let b = document.createElement('b');
    span.style.width = '100%';
    span.style.marginTop = '10px';
    span.style.textAlign = 'center';

    const user = {
        email,
        password
    };

    // highlights empty fields

    fetch(loginUrl, {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': true
        }
    }).then(response => {
        return response.json();
    }, networkError => console.log(networkError.message)).then(jsonResponse => {
        console.log(jsonResponse)
        span.innerHTML = '';
        let emailInput = document.getElementById(`email`)
        let passwordInput = document.getElementById(`password`)

        if (!email) {
            let b = `<b class="error_message" style="color:red;">Email is required!</b>`
            span.innerHTML = b
            emailInput.style.border = '1.8px solid red'
        } else if (!password) {
            let b = `<b class="error_message" style="color:red;">Password is required!</b>`
            span.innerHTML = b
            passwordInput.style.border = '1.8px solid red'
        } else {
            span.innerHTML = '';
            passwordInput.style.border = 'none'
            emailInput.style.border = 'none'
        }

        if (span.children.length == 0) {
            console.log(jsonResponse)
            if (jsonResponse.error) {
                let b = `<b class="error_message" style="color:red;">${jsonResponse.error}</b>`
                document.getElementById('error_span').innerHTML = b
            } else {
                document.getElementById('error_span').innerHTML = ''
            }
            console.log(jsonResponse.error)
        }
        if (!jsonResponse.error) {
            let details = {
                id: jsonResponse.id,
                auth_token: jsonResponse.auth_token,
                username: jsonResponse.username
            }
            setCookie(jsonResponse.username, details, 1)
            if (!document.referrer.includes('username')) {
                window.location.replace('http://127.0.0.1:3000/index.html?username=' + jsonResponse.username);
            } else {
                window.location.href = document.referrer;
                console.log(window.location.href);
            }
        }
    });
});