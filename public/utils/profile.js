const socket = io();

const userDetails = document.querySelector('.user_details');
let edit_form = document.getElementById('edit_account_form');
let profileUrlParams = new URLSearchParams(window.location.search);
let username = profileUrlParams.get('username');
let store = JSON.parse(getCookie(username));

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
        console.log(jsonResponse)
        let home = document.getElementById('home_id');

        home.addEventListener('click', () => {
            window.location.href = `${serverUrl}/index.html?username=${username}`;
        });

        let details = `
            <h3>${jsonResponse.user.username}</h3>
            <img id='img' src='../images/${jsonResponse.user.image}' style='width:100px;length:100px;'/><br />
            <form name="update_user_form" id="update_user_form">
                <input id='first_name' type='text' value=${jsonResponse.user.first_name} required/><br />
                <input id='last_name' type='text' value=${jsonResponse.user.last_name} required/><br />
                <input id='email' type='email' value=${jsonResponse.user.email} required/><br />
                <input id='username' type='text' value=${jsonResponse.user.username} required/><br />
                <input id='new_pass' type='password' placeholder='New password' required/><br />
                <input id='confirm_pass' type='password' placeholder='Confirm new password' required/><br />
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
            "image": img.getAttribute('src')
        }
        console.log(updatedObj)

        fName.addEventListener('change', (e) => { updatedObj['first_name'] = e.target.value; });
        lName.addEventListener('change', (e) => { updatedObj['last_name'] = e.target.value; });
        email.addEventListener('change', (e) => { updatedObj['email'] = e.target.value; });
        userName.addEventListener('change', (e) => { updatedObj['username'] = e.target.value; });
        newPass.addEventListener('change', (e) => { updatedObj['password'] = e.target.value; });
        confirmPass.addEventListener('change', (e) => { updatedObj['confirm_password'] = e.target.value; });
        img.addEventListener('change', (e) => { updatedObj['image'] = e.target.value; });

        console.log(jsonResponse.user.username)
        let oldDetails = JSON.parse(getCookie(jsonResponse.user.username));
        let time = new Date();
        time.setTime(time.getDate('1-1-1970'));
        let oldCookie = jsonResponse.user.username + "=" + JSON.stringify(oldDetails) + ";expires=" + time + ";path=/;";
        console.log(oldCookie);

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
                    console.log(jsonResponse);
                    if (!jsonResponse.error) {
                        setCookie(updatedObj['username'], JSON.stringify(oldDetails), 1);
                        window.location.href = `profile.html?username=${updatedObj['username']}`;
                        document.cookie = oldCookie;
                    }
                });
        });

    });

socket.on('connect', () => {
    console.log('Profile page connected to Node server!');
})