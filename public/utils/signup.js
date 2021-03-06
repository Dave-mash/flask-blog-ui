// user sign up event

const form = document.getElementById('signup_form')
const userUrl = `${fetchUrl}/auth/signup`;

let span = document.getElementById('error_span');


form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const email = formData.get('email');
    const username = formData.get('username');
    const password = formData.get('password');
    const confirm_password = formData.get('confirm_password');

    span.style.width = '100%';
    span.style.marginTop = '10px';
    span.style.textAlign = 'center';

    const user = {
        first_name,
        last_name,
        email,
        username,
        password,
        confirm_password
    };


    fetch(userUrl, {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }, networkError => console.log(networkError.message))
        .then(jsonResponse => {
            if (jsonResponse.message) {
                displayError(jsonResponse['message'], 'dodgerblue');
                window.location.replace(`${serverUrl}/login.html`);
            } else {
                displayError(jsonResponse['error'], 'red');
            }
    });
});