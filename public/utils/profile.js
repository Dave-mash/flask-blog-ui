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