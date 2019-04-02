let commentParams = new URLSearchParams(window.location.search);
const post = commentParams.get('post');
const bodyText = commentParams.get('body');
const username = commentParams.get('username');
let user = JSON.parse(getCookie(username));

const socket = io();

const commentHelper = (comment) => {
    let commentDiv = document.querySelector('.comments_list');
    let comDiv = document.createElement('div');
    comDiv.className = 'comment_item';
    var commentItem = '';

    if (comment.username == username) {
        commentItem = `
            <b id='author_id'>${comment.username}</b>
            <p class='comment_text'>${comment.comment}</p>
            <button id='del'>delete</delete>
        `;
    } else {
        console.log(comment)
        commentItem = `
            <b id='author_id'>${comment.username}</b>
            <p class='comment_text'>${comment.comment}</p>
        `;
    }
    comDiv.innerHTML = commentItem;
    commentDiv.appendChild(comDiv)
    let delBtn = document.getElementById('del');
    console.log(commentDiv);
    if (delBtn) {
        console.log(delBtn.parentElement);
        if (delBtn) {
            delBtn.addEventListener('click', () => {
                console.log('clicked')
                fetch(`${fetchUrl}/${comment.user_id}/${comment.post_id}/comments/${comment.id}`, {
                        method: 'DELETE',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.auth_token}`,
                        }
                    })
                    .then(res => {
                            return res.json();
                        },
                        networkError => console.log(networkError)
                    ).then(jsonResponse => {
                        console.log(jsonResponse);
                        let parent = delBtn.parentElement.parentElement;
                        let child = delBtn.parentElement;
                        parent.removeChild(child);
                        socket.emit('removeComment', delBtn)
                    });
            });
        }
    }
}

socket.on('newComment', (comment) => {
    commentHelper(comment);
    console.log('New comment!', comment);
});

socket.on('deletedComment', (comment) => {
    console.log('Comment deleted');
    console.log(comment);
    document.location.reload()
});

// fetch post
console.log(user);
fetch(`${fetchUrl}/posts/${user.post}`, {
        mode: 'cors'
    })
    .then(res => {
            return res.json();
        },
        networkError => console.log(networkError.message)
    ).then(jsonResponse => {
        let home = document.getElementById('home_id');
        home.style.cursor = 'pointer';
        home.addEventListener('click', () => {
            if (window.location.href.includes('username')) {
                const username = commentParams.get('username');
                window.location.href = `${serverUrl}/index.html?username=` + username;
            } else {
                window.location.href = `${serverUrl}/index.html`;
            }
        });

        const title = document.getElementById('post_title');
        if (user.id === jsonResponse.post.author_id) {
            console.log('matched')
            let span = document.getElementById('edit_post');
            let editDetails = document.createElement('div');
            let buttons = `
                <button id='update_button' style='cursor:pointer'>update</button>
                <button id='delete_button' style='cursor:pointer'>delete</button>
            `;
            editDetails.innerHTML = buttons;
            span.appendChild(editDetails);
            let deleteBtn = document.getElementById('delete_button');
            let updateBtn = document.getElementById('update_button');

            deleteBtn.addEventListener('click', () => {
                fetch(`${fetchUrl}/${jsonResponse.post.author_id}/posts/${jsonResponse.post.id}`, {
                        method: 'DELETE',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.auth_token}`
                        }
                    })
                    .then(res => {
                            return res.json();
                        },
                        networkError => console.log(networkError.message)
                    ).then(jsonResponse => {
                        window.location.href = `index.html?username=${user.username}&message=${jsonResponse.message}`;
                        console.log(jsonResponse);
                    });
            });

            let inputValue = jsonResponse.post.title;
            let txtValue = jsonResponse.post.body;
            
            let editPostForm = `
                <input
                    value=${inputValue}
                    type="text"
                    name="title"
                    placeholder="title"
                    id="title"
                    autoFocus
                >
                <br />
                <textarea
                    name="body"
                    cols="20"
                    rows="5"
                    placeholder="body"
                    id="body"
                >${txtValue}</textarea><br>
                <button id='editBtn'>update</button>
            `;
            let postFormDiv = document.createElement('form');
            postFormDiv.name = 'edit_post_form';
            postFormDiv.id = 'edit_post_form';

            let postDiv = document.querySelector('.post_div');
            postFormDiv.innerHTML = editPostForm;
            postDiv.appendChild(postFormDiv);

            let title = document.getElementById('title');
            let body = document.getElementById('body');

            const update = {
                title: title.value,
                body: body.value
            }            

            body.addEventListener('change', (e) => { update.body = e.target.value });
            title.addEventListener('change', (e) => { update.title = e.target.value });

            postFormDiv.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log(update);
                fetch(`${fetchUrl}/${jsonResponse.post.author_id}/posts/${jsonResponse.post.id}`, {
                    method: 'PUT',
                    mode: 'cors',
                    body: JSON.stringify(update),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.auth_token}`
                    }
                })
                .then(res => {
                        return res.json();
                    },
                    networkError => console.log(networkError.message)
                ).then(jsonResponse => {
                    window.location.href = `index.html${window.location.search}&message=${jsonResponse.message}`
                });
            });

            updateBtn.addEventListener('click', () => {
                if (postFormDiv.style.display === 'none') {
                    postFormDiv.style.display = 'block'
                } else {
                    postFormDiv.style.display = 'none'
                }
            });
        }
        const body = document.getElementById('post_body');
        console.log(jsonResponse)
        title.textContent = jsonResponse.post.title;
        body.textContent = jsonResponse.post.body;

    });

// fetch comments

fetch(`${fetchUrl}/${user.post}/comments`, {
        mode: 'cors'
    })
    .then(res => {
            return res.json();
        },
        networkError => console.log(networkError.message)
    ).then(jsonResponse => {

        console.log(jsonResponse)
        if (jsonResponse.comments) {
            jsonResponse.comments.forEach(comment => {
                commentHelper(comment);
            });
        }
    });

// post a comment

const commentForm = document.getElementById('comment_form');

socket.on('connect', () => {
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(commentForm);
        let span = document.getElementById('span');

        if (formData.get('comment')) {

            span.innerHTML = ''

            let comment = {
                "comment": formData.get('comment')
            };

            let newComment = {
                comment: comment.comment,
                username: username

            }

            commentForm.reset();

            fetch(`${fetchUrl}/${user.id}/${user.post}/comments`, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify(comment),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.auth_token}`
                }
            }).then(res => {
                    return res.json()
                },
                networkError => console.log(networkError.message)
            ).then(jsonResponse => {
                console.log(jsonResponse)
                document.location.reload()
                socket.emit('createComment', newComment)
            });
        } else {
            let b = `<b style='color:red;'>Please add a comment!</b>`;
            span.innerHTML = b;
        }
    });
});



/*
// posts
        let posts = document.querySelector('.posts');
        jsonResponse.posts.forEach(post => {
            let postDetails = `
                <b style='cursor:pointer;' class='post_title'>${post.title}</b>
                <i class='timestamp'>${post.createdAt}</i>
                <button class='delete_btn'>delete</button>
            `;
            let postItem = document.createElement('div');
            postItem.className = 'post_details';
            postItem.innerHTML = postDetails;
            posts.insertBefore(postItem, posts.childNodes[0]);

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
*/