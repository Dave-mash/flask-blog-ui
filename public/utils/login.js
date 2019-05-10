// user log in event

const form = document.getElementById('login-form')

const loginUrl = `${fetchUrl}/auth/login`;
let span = document.getElementById('error_span')


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
        }, networkError => console.log(networkError.message))
        .then(jsonResponse => {

            if (!jsonResponse.error) {
                let details = {
                    id: jsonResponse.id,
                    auth_token: jsonResponse.auth_token,
                    username: jsonResponse.username
                }
                setCookie('cookie', JSON.stringify(details), 1);
                if (!document.referrer.includes('username')) {
                    window.location.replace(`${serverUrl}/index.html`);
                } else {
                    window.location.href = document.referrer;
                }
                displayError(jsonResponse.message, 'dodgerblue');
            } else {
                displayError(jsonResponse.error, 'red');                
            }
        });
});