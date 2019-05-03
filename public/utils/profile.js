const socket = io();

const userDetails = document.querySelector('.user_details');
let edit_form = document.getElementById('edit_account_form');
let profileUrlParams = new URLSearchParams(window.location.search);
let username = profileUrlParams.get('username');
let store = JSON.parse(getCookie(username));

// displayError(errors, 'red');

// user's posts
fetch(`${fetchUrl}/profile/${store.id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${store.auth_token}`
        }
    })
    .then(res => {
            return res.json()
        },
        networkError => console.log(networkError)
    ).then(jsonResponse => {
        let home = document.getElementById('home_id');

        home.addEventListener('click', () => {
            window.location.href = `${serverUrl}/index.html?username=${username}`;
        });

        let details = `
            <h3>${jsonResponse.user.username}</h3>
            <img id='img' src='../images/${jsonResponse.user.image}'/><br />
            <i id='edit_account'>Update account</i>
            <input id='profile-pic' type='file' capture/>
            <form name="update_user_form" id="update_user_form">
                <input name='first_name' id='first_name' type='text' value=${jsonResponse.user.first_name} required/><br />
                <input name='last_name' id='last_name' type='text' value=${jsonResponse.user.last_name} required/><br />
                <input name='email' id='email' type='email' value=${jsonResponse.user.email} required/><br />
                <input name='username' id='username' type='text' value=${jsonResponse.user.username} required/><br />
                <input name='new_pass' id='new_pass' type='password' placeholder='New password' required/><br />
                <input name='confirm_pass' id='confirm_pass' type='password' placeholder='Confirm new password' required/><br />
                <button>update</button>
            </form>
        `;
        userDetails.innerHTML = details;

        let fName = document.getElementById('first_name');
        let lName = document.getElementById('last_name');
        let email = document.getElementById('email');
        let userName = document.getElementById('username');
        let newPass = document.getElementById('new_pass');
        let confirmPass = document.getElementById('confirm_pass');
        let img = document.getElementById('img');

        let updatedObj = {
            "first_name": fName.value,
            "last_name": lName.value,
            "email": email.value,
            "username": userName.value,
            "password": 'old',
            "confirm_password": 'new',
            "image": "user.png"
        }

        fName.addEventListener('change', (e) => { updatedObj['first_name'] = e.target.value; });
        lName.addEventListener('change', (e) => { updatedObj['last_name'] = e.target.value; });
        email.addEventListener('change', (e) => { updatedObj['email'] = e.target.value; });
        userName.addEventListener('change', (e) => { updatedObj['username'] = e.target.value; });
        newPass.addEventListener('change', (e) => { updatedObj['password'] = e.target.value; });
        confirmPass.addEventListener('change', (e) => { updatedObj['confirm_password'] = e.target.value; });
        img.addEventListener('change', (e) => { updatedObj['image'] = e.target.value; });

        let oldDetails = JSON.parse(getCookie(jsonResponse.user.username));
        let time = new Date();
        time.setTime(time.getDate('1-1-1970'));
        let oldCookie = jsonResponse.user.username + "=" + JSON.stringify(oldDetails) + ";expires=" + time + ";path=/;";

        document.getElementById('update_user_form').addEventListener('submit', (e) => {
            e.preventDefault();
            fetch(`${fetchUrl}/profile/${store.id}`, {
                    method: 'PUT',
                    mode: 'cors',
                    body: JSON.stringify(updatedObj),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${store.auth_token}`
                    }
                })
                .then(res => {
                        return res.json()
                    },
                    networkError => console.log(networkError)
                ).then(jsonResponse => {
        
                    if (jsonResponse.message) {
                        setCookie(updatedObj['username'], JSON.stringify(oldDetails), 1);
                        window.location.href = `profile.html?username=${updatedObj['username']}`;
                        document.cookie = oldCookie;
                        displayError(jsonResponse.message, 'dodgerblue');
                    } else {
                        displayError(jsonResponse.error, 'red');
                    }
                });
        });

    });

socket.on('connect', () => {
    console.log('Profile page connected to Node server!');
})