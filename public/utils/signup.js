// user sign up event

const form = document.getElementById('signup_form')
console.log(form)
const userUrl = 'http://127.0.0.1:5000/api/v1/auth/signup';

let span = document.getElementById('error_span')


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
            console.log(jsonResponse.error)
            if (jsonResponse.error) {
                let b = `<b class="error_message" style="color:red;">${value}</b>`;
                document.getElementById('error_span').innerHTML = b;
            } else {
                window.location.replace('http://127.0.0.1:3000/login.html');
            }
    });
});