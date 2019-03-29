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
            <img src='../images/${jsonResponse.user.image}' style='width:100px;length:100px;'/><br />
            <i>${jsonResponse.user.first_name} ${jsonResponse.user.last_name}</i><br />
            <i>${jsonResponse.user.email}</i>
        `
        userDetails.innerHTML = details;

        // posts
        let posts = document.querySelector('.posts');
        jsonResponse.posts.forEach(post => {
            let postDetails = `
                <div class='post_details'>
                    <b style='cursor:pointer;' class='post_title'>${post.title}</b>
                    <i class='timestamp'>${post.createdAt}</i>
                    <button class='delete_btn'>delete</button>
                </div>
            `
            posts.innerHTML = postDetails;

            // const formData = new FormData(form);
            // const first_name = formData.get('first_name');
            // const last_name = formData.get('last_name');
            // const email = formData.get('email');
            // const username = formData.get('username');
            // const password = formData.get('password');
            // const confirm_password = formData.get('confirm_password');

            // const user = {
            //     first_name,
            //     last_name,
            //     email,
            //     username,
            //     password,
            //     image
            // };

            edit_form.addEventListener('submit', (e) => {
                e.preventDefault();
                fetch(`${fetchUrl}/profile/${store.id}`, {
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

            let del = document.querySelector('.delete_btn');
            console.log(del.parentElement.parentElement)

            del.addEventListener('click', () => {
                fetch(`${fetchUrl}/${store.id}/posts/${post.id}`, {
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
                        let parent = del.parentElement.parentElement;
                        let child = del.parentElement;
                        parent.removeChild(child);
                        socket.emit('deletePost');
                    });
            });
        });
        console.log(jsonResponse);
    });

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

    // commentData = new FormData(commentForm)
    // textarea.value = p.textContent;
    // const onChange = (e) => {
    //     console.log(textarea.value);
    //     console.log(commentData.get('updateComment'));
    //     textarea.value = e.target.value;
    //     console.log(textarea.value);
    // }
    // textarea.onchange = onChange;
    // let updateComment = document.createElement('button');
    // updateComment.textContent = 'update';
    // commentForm.appendChild(textarea);
    // commentForm.appendChild(updateComment);
    // console.log(textarea);
    // commentValue = commentData.get('updateComment')
    // updatedComment = {
    //     comment: textarea.value
    // }
    // console.log(updatedComment)
    // commentForm.style.display = 'none';
    // commentForm.addEventListener('submit', (e) => {
    //     e.preventDefault();
    //     fetch(`http://127.0.0.1:5000/api/v1/${comment.user_id}/comments/${comment.id}`, {
    //         method: 'PUT',
    //         mode: 'cors',
    //         body: JSON.stringify(updatedComment),
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${user.auth_token}`,
    //         }
    //     }).then(res => {
    //             return res.json();
    //         },
    //         networkError => console.log(networkError)
    //     ).then(jsonResponse => {
    //         console.log(jsonResponse);
    //         commentForm.previousElementSibling.textContent = jsonResponse.comment
    //         console.log(commentForm.previousElementSibling);
    //     });
    // });
    // p.parentElement.appendChild(commentForm);
    // b.style.cursor = 'pointer';

    // b.addEventListener('click', () => {
    //     if (commentForm.style.display == 'none') {
    //         commentForm.style.display = 'block';
    //     } else {
    //         commentForm.style.display = 'none';
    //     }
    // });