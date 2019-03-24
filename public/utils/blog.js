const mainDiv = document.querySelector('.post_container');
const socket = io();
const fetchUrl = 'https://flask-blog-api.herokuapp.com/api/v1';
const serverUrl = 'http://127.0.0.1:3000';

const setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;";
}

const getCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const postsHandler = (post) => {
    let postDiv = `
        <h3 id="topic_id"><i id="author_name">${post['author']}: </i><b class="post_comment">${post['title']}</b></h3>
        <p>${post['body']}</p>
        <b>${new Date(post.createdOn).toString().split(' G')[0]}</b>
    `;

    let postItem = document.createElement('div');
    postItem.className = 'post_item';
    postItem.innerHTML = postDiv;

    mainDiv.insertBefore(postItem, mainDiv.childNodes[0]);

    let postComment = document.querySelector('.post_comment');

    postComment.addEventListener('click', () => {
        console.log('clicked');
        let urlSearch = new URLSearchParams(window.location.search);
        let username = urlSearch.get('username');
        if (username) {
            let user = JSON.parse(getCookie(username));
            user['post'] = post['id'];
            setCookie(username, user, 1);
            window.location.href = `${serverUrl}/comment.html?username=${username}&post=${post['title']}&body=${post['body']}`;
        } else {
            window.location.href = `${serverUrl}/comment.html?post=${post['title']}&body=${post['body']}`;
        }
    });
}

socket.on('disconnect', () => {
    console.log('Disconnected from server!')
});

// Incoming posts

socket.on('newPost', (post) => {
    postsHandler(post);
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
        let a = document.getElementById('log_state');
        a.textContent = window.location.search ? 'logout' : 'login';
        a.style.cursor = 'pointer';
        mainDiv.innerHTML = '';
        jsonResponse['posts'].forEach(post => {
            postsHandler(post);
        });

        console.log(jsonResponse)
    });


const profile = document.getElementById('profile_anchor_tag');
profile.addEventListener('click', () => {
    let profileParams = new URLSearchParams(window.location.search);
    let myParams = profileParams.get('username');
    let span = document.getElementById('login_prompt');
    if (myParams) {
        span.innerHTML = '';
        window.location.href = `${serverUrl}/profile.html?username=${myParams}`;
    } else {
        span.textContent = 'Please log in first to access your profile page!';
        span.style.color = 'red';
    }
});


const home = document.getElementById('home_anchor_tag');
home.addEventListener('click', () => {
    let profileParams = new URLSearchParams(window.location.search);
    let myParams = profileParams.get('username');
    let span = document.getElementById('login_prompt');
    if (myParams) {
        span.innerHTML = '';
        window.location.href = `${serverUrl}/index.html?username=${myParams}`;
    } else {
        window.location.href = `${serverUrl}/index.html`;
    }
});


const log = document.getElementById('log_state');

log.addEventListener('click', (e) => {
    if (log.textContent == 'logout') {
        console.log(log)
        let blogParams = new URLSearchParams(window.location.search);
        let myParams = blogParams.get('username');
        let storedUser = JSON.parse(getCookie(myParams));

        console.log(storedUser)

        fetch(`${fetchUrl}/auth/${storedUser.id}/logout`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${storedUser.auth_token}`
                }
            })
            .then(res => {
                    console.log(res)
                    return res.json()
                },
                networkError => console.log(networkError.message))
            .then(jsonResponse => {
                console.log(jsonResponse);
                document.cookie = `${myParams}=${JSON.stringify(storedUser)}; expires=Thu, 18 Dec 2013 12:00:00 UTC; path=/`
                window.location.replace(`${serverUrl}/index.html`);
                console.log(document.cookie)
            });
    } else if (log.textContent == 'login') {
        window.location.href = `${serverUrl}/login.html`;
    }
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
        let username = JSON.parse(getCookie(myParams)); // Local storage key

        if (!username) {
            console.log('log in first')
            span.innerHTML = '';
            let b = '<b style="color:red;">You are not logged in!</b>';
            span.innerHTML = b;
        } else {

            if (title && body) {

                span.innerHTML = ''
                /* grabbing items from the url */

                let post = {
                    author: myParams,
                    title,
                    body,
                    createdOn: new Date().toString().split(' G')[0]
                }

                fetch(`${fetchUrl}/${username.id}/posts`, {
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
                    let b = `<b style="color:red;">${text}</b>`;
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