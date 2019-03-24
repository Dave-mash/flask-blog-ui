const socket = io();

const userDetails = document.querySelector('.user_details');

let profileUrlParams = new URLSearchParams(window.location.search);
let username = profileUrlParams.get('username');
let store = JSON.parse(localStorage.getItem(username));


// user's posts
fetch(`http://127.0.0.1:5000/api/v1/profile/${store.id}`, {
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
        if (jsonResponse.error === 'Signature expired. Please log in again.') {
            window.location.href = 'http://127.0.0.1:3000/login.html';
        }
        console.log(jsonResponse)
        let h3 = document.createElement('h3');
        h3.textContent = jsonResponse.user.username;
        let home = document.getElementById('home_id');
        home.style.cursor = 'pointer';
        home.addEventListener('click', () => {
            window.location.href = `http://127.0.0.1:3000/index.html?username=` + username;
        });
        userDetails.appendChild(h3);
        let image = document.createElement('img');
        let name = document.createElement('i');
        let email = document.createElement('i');
        let br = document.createElement('br');
        let br2 = document.createElement('br');
        email.textContent = jsonResponse.user.email;
        name.textContent = `${jsonResponse.user.first_name} ${jsonResponse.user.last_name}`
        image.style.width = '100px';
        image.style.length = '100px';
        image.setAttribute('src', `../images/${jsonResponse.user.image}`)
        userDetails.appendChild(image);
        userDetails.appendChild(br);
        userDetails.appendChild(name);
        userDetails.appendChild(br2);
        userDetails.appendChild(email);

        // posts

        let posts = document.querySelector('.posts');
        jsonResponse.posts.forEach(post => {
            let postDiv = document.createElement('div');
            let postTitle = document.createElement('b');
            postTitle.textContent = post.title;
            postTitle.style.cursor = 'pointer';
            let postTime = document.createElement('i');
            postTime.textContent = post.createdAt;
            postDiv.appendChild(postTitle);
            postDiv.appendChild(postTime);
            let del = document.createElement('button');
            del.className = 'delete_btn';
            del.textContent = 'delete';
            postDiv.appendChild(del);
            posts.appendChild(postDiv);

            // const user = {
            //     first_name,
            //     last_name,
            //     email,
            //     username,
            //     password,
            //     image
            // };

            postTitle.addEventListener('click', () => {
                fetch(`http://127.0.0.1:5000/api/v1/profile/${store.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(post),
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${store.auth_token}`
                    }
                })
                .then(res => {
                    console.log(store.auth_token)
                    console.log(res)
                    return res.json();
                },
                networkError => console.log(networkError)
                ).then(jsonResponse => {
                    console.log(jsonResponse);
                });
            });
            console.log(del.parentElement.parentElement)

            del.addEventListener('click', () => {
                fetch(`http://127.0.0.1:5000/api/v1/${store.id}/posts/${post.id}`, {
                        method: 'DELETE',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${store.auth_token}`
                        }
                    })
                    .then(res => {
                            console.log(store.auth_token)
                            console.log(res)
                            return res.json();
                        },
                        networkError => console.log(networkError)
                    ).then(jsonResponse => {
                        console.log(postDiv);
                        let parent = del.parentElement.parentElement;
                        let child = del.parentElement;
                        parent.removeChild(child);
                        socket.emit('deletePost');
                    });
            });
        });
        console.log(jsonResponse);
    });

let edit_form = document.getElementById('edit_account_form');
edit_form.style.display = 'none';
let edit_button = document.getElementById('edit_button');

edit_button.addEventListener('click', (e) => {
    e.preventDefault();
    if (edit_form.style.display == 'none') {
        edit_form.style.display = 'block';
    } else {
        edit_form.style.display = 'none';
    }
})

// delete a post
socket.on('connect', () => {
    console.log('Profile page connected to Node server!');
})