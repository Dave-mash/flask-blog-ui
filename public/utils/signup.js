// user sign up event

const form = document.getElementById('signup_form')
console.log(form)
const userUrl = 'http://127.0.0.1:5000/api/v1/auth/signup';

let span = document.getElementById('error_span')
let b = document.createElement('b')

emptyFields = (user) => {
    span.innerHTML = '';
    fields = Object.entries(user);
    fields.forEach(field => {
        let input = document.getElementById(`${field[0]}`)

        if (!field[1]) {
            b.textContent = 'Some fields are missing!'
            b.style.color = 'red'
            b.className = 'error_message'
            span.appendChild(b)
            highlighter(input)
        } else {
            span.innerHTML = '';
            if (input) input.className = 'no_highlighter';
        }
    });
}

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

    const errors = {
        first_name: "Your first name should be between 4 to 24 characters long!",
        last_name: "Your last name should be between 4 to 24 characters long!",
        username: "Your username should be between 4 to 24 characters long!",
        email: "Invalid email address!",
        password: "Weak password!",
        unmatching_pass: "Your passwords don't match!",
        valid_Fname: "please enter valid first name!",
        valid_Lname: "please enter valid last name!",
        valid_username: "please enter valid username!",
    }

    highlighter = (option = '') => {
        if (option) {
            return option.className = 'highlighter'
        }
    }

    // highlights empty fields

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
            emptyFields(user)
            if (span.children.length == 0) {
                let entries = Object.entries(errors)
                entries.forEach(entry => {
                    let key = entry[0]
                    let value = entry[1]

                    if (value === jsonResponse.error) {
                        b.textContent = `${value}`;
                        b.style.color = 'red';
                        b.className = 'error_message';
                        document.getElementById('error_span').appendChild(b);
                        document.getElementById(`${key}`).className = 'highlighter';
                    } else {
                        let input = document.getElementById(`${key}`);
                        if (input) input.className = 'no_highlighter';
                    }
                });

                let dupEmail = 'This email already exists try logging in!'
                let input = document.getElementById('email')

                if (jsonResponse.error === dupEmail) {
                    console.log('duplicate account!')
                    b.textContent = `${dupEmail}`;
                    b.style.color = 'red';
                    b.className = 'error_message';
                    input.className = 'highlighter';
                    document.getElementById('error_span').appendChild(b);
                } else {
                    input.className = 'no_highlighter';
                }
                console.log(jsonResponse.error)
            }
            if (!jsonResponse.error) {
                window.location.replace('http://127.0.0.1:3000/login.html')
            }
        });
});