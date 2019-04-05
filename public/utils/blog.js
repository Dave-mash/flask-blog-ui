let blogParams = new URLSearchParams(window.location.search);
let spanMsg = document.getElementById('message');
console.log(message);

if (message) {
    let spanDiv = document.querySelector('.span_div');
    spanDiv.classList = 'span_message';
    let b = `<b style='color:dodgerblue;'>${message}</b>`;
    let span = document.getElementById('message');
    spanMsg.innerHTML = b;
    span.style.background = '#5F5F75';
    setTimeout(() => {
        span.style.display = 'none';
    }, 5000);
}

const mainDiv = document.querySelector('.post_container');
const socket = io();

const postsHandler = (post) => {
    let postDiv = `
        <div class="profile_photo">
            <img src="../images/user.png"/>
        </div>
        <div class="post_item">
            <span class="post_span">
                <h3 id="topic_id">${post['author']}</h3>
                <i id="timestamp">${new Date(post.createdOn).toString().split(' G')[0]}</i>
            </span>
            <div class="post_item_details">
                <div class="post_item_wrapped">
                    <b class="post_title">${post['title']}</b>
                    <p id="post_body">${post['body']}</p>
                </div>
            </div>
        </div>
    `;

    let postItem = document.createElement('div');
    postItem.className = 'post_item_div';
    postItem.innerHTML = postDiv;

    mainDiv.insertBefore(postItem, mainDiv.childNodes[0]);

    let postComment = document.querySelector('.post_title');

    postComment.addEventListener('click', () => {
        console.log('clicked');
        let urlSearch = new URLSearchParams(window.location.search);
        let username = urlSearch.get('username');
        if (username) {
            console.log(getCookie(username))
            let user = JSON.parse(getCookie(username));
            user['post'] = post['id'];
            setCookie(username, JSON.stringify(user), 1);
            window.location.href = `${serverUrl}/comment.html?username=${username}`;
        } else {
            let span = document.getElementById('login_prompt');
            span.innerHTML = '';
            span.textContent = 'Please log in first!';
            span.style.color = 'red';
        }
    });
}

socket.on('disconnect', () => {
    console.log('Disconnected from server!')
});

// Incoming posts

socket.on('newPost', (post) => {
    postsHandler(post);
    document.location.reload()
    console.log('New post!', post)
});

socket.on('removePost', () => {
    document.location.reload();
});

// GET blog posts

fetch(`${fetchUrl}/posts`)
    .then(res => {
            if (res.ok) {
                return res.json();
            }
            throw new Error('Request failed!')
        },
        networkError => console.log(networkError.message))
    .then(jsonResponse => {
        let reg = document.getElementById('register_state');
        if (window.location.search) {
            reg.style.display = 'none';
        } else {
            reg.style.display = 'block';
        }
        mainDiv.innerHTML = '';
        jsonResponse['posts'].forEach(post => {
            postsHandler(post);
        });

        console.log(jsonResponse)
    });

const form = document.getElementById('post_form');


socket.on('connect', () => {
    console.log('Blog page connected to Node server!')

    // POST blog
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const title = formData.get('title');
        const body = formData.get('textarea');
        let span = document.getElementById('span');

        let urlParams = new URLSearchParams(window.location.search);
        let myParams = urlParams.get('username');
        let username = getCookie(myParams); // Local storage key

        if (!username) {
            console.log('log in first')
            span.innerHTML = '';
            let b = '<b style="color:red;">You are not logged in!</b>';
            span.innerHTML = b;
        } else {

            username = JSON.parse(username);

            if (title && body) {

                span.innerHTML = '';
                span.style.display = 'none';
                /* grabbing items from the url */

                let post = {
                    author: myParams,
                    title,
                    body,
                    createdOn: new Date().toString().split(' G')[0]
                }

                fetch(`${fetchUrl}/${username.id}/posts`, {
                    mode: 'cors',
                    method: 'POST',
                    body: JSON.stringify(post),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${username.auth_token}`
                    }
                }).then(res => {
                        return res.json()
                    },
                    networkError => console.log(networkError.message)
                ).then(jsonResponse => {
                    console.log(jsonResponse);
                    if (jsonResponse.error) {
                        span.innerHTML = '';
                        let b = `<p style="color:red;">${jsonResponse.error}</p>`;
                        span.innerHTML = b;
                    }
                    socket.emit('createPost', post);
                    form.reset();
                });
            } else {

                const error = (text) => {
                    span.innerHTML = '';
                    let b = `<b id="error_b">${text}</b>`;
                    span.innerHTML = b;
                }

                if (!title && body) {
                    error('Please provide a title!');
                } else if (title && !body) {
                    error('Please provide a body!');
                } else if (!title && !body) {
                    error('Please provide a title and a body!');
                }
            }
        }
    });

});