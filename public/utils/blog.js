let blogParams = new URLSearchParams(window.location.search);
console.log(message)

const mainDiv = document.querySelector('.post_container');
const socket = io();

const postsHandler = (post) => {
    let postDiv = `
        <div class="profile_photo">
            <img src="../images/${post['photo']}"/>
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
            displayError('Please log in first!', 'red');
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
            displayError('You are not logged in!', 'red');
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
                    if (jsonResponse['message']) {
                        displayError(jsonResponse['message'], 'dodgerblue');
                        socket.emit('createPost', post);
                        form.reset();
                    } else if (jsonResponse['error']) {
                        displayError(jsonResponse['error'], 'red');
                    }
                });
            }
        }
    });

});