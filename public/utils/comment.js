let commentParams = new URLSearchParams(window.location.search);
const post = commentParams.get('post');
const username = commentParams.get('username');
let user = JSON.parse(getCookie('cookie'));

const socket = io();

const commentHelper = (comment) => {
    let commentDiv = document.querySelector('.comments_list');
    let comDiv = document.createElement('div');
    comDiv.className = 'comment_item';
    var commentItem = '';

    if (comment.username == user.username) {
        commentItem = `
            <div class='img_name'>
                <img src='../images/${comment.photo}' id='user_pic' /><br/>
                <b id='author_id'>${comment.username}</b>
            </div>
            <div class='comment_details'>
                <p class='comment_text'>${comment.comment}</p>
                <button class='del_btn' id='del'>delete</delete>
            </div>
        `;
    } else {
        commentItem = `
            <div class='img_name'>
                <img src='../images/${comment.photo}' id='user_pic' />
                <b id='author_id'>${comment.username}</b>
            </div>
            <div class='comment_details'>
                <p class='comment_text'>${comment.comment}</p>
            </div>
        `;
    }
    comDiv.innerHTML = commentItem;
    commentDiv.appendChild(comDiv)
    let delBtn = document.querySelectorAll('.del_btn');

    if (delBtn) {
        delBtn.forEach(btn => {
            btn.addEventListener('click', () => {
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
                        let parent = btn.parentElement.parentElement.parentElement;
                        let child = btn.parentElement.parentElement;
                        parent.removeChild(child);
                        socket.emit('removeComment', btn)
                        if (jsonResponse.message) {
                            displayError(jsonResponse['message'], 'dodgerblue');
                        } else {
                            displayError(jsonResponse['error'], 'red');
                        }
                    });
            });
        });
    }
}

socket.on('newComment', (comment) => {
    document.location.reload()
    // commentHelper(comment);
});

socket.on('deletedComment', (comment) => {
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
            if (user.username) {
                window.location.href = `${serverUrl}/index.html`;
            } else {
                window.location.href = `${serverUrl}/index.html`;
            }
        });

        const title = document.getElementById('post_title');
        let span = document.getElementById('edit_post');
        let i = document.createElement('i');
        i.textContent = ` Written by: ${jsonResponse.post.username}`;
        i.id = 'writer';
        span.appendChild(i);
        if (user.id === jsonResponse.post.author_id) {
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
                        if (jsonResponse.message) {
                            window.location.href = `index.html?message=${jsonResponse.message}`;
                            displayError(jsonResponse['message'], 'dodgerblue');
                        } else {
                            displayError(jsonResponse['error'], 'red');
                        }
                    });
            });

            let inputValue = jsonResponse.post.title;
            let txtValue = jsonResponse.post.body;
            
            let editPostForm = `
                <textarea
                    name="title"
                    placeholder="title"
                    cols="20"
                    rows="1"
                    id="title"
                    autoFocus
                >${inputValue}</textarea>
                <br />
                <textarea
                    name="body"
                    cols="20"
                    rows="5"
                    placeholder="body"
                    id="body"
                >${txtValue}</textarea><br>
                <button id='editBtn'>submit</button>
            `;
            let postFormDiv = document.createElement('form');
            postFormDiv.style.display = 'none';
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
                    if (jsonResponse.message) {
                        displayError(jsonResponse.message, 'dodgerblue');
                        window.location.href = `index.html${window.location.search}?message=${jsonResponse.message}`
                    } else {
                        displayError(jsonResponse.error, 'red');
                    }
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
        title.textContent = jsonResponse.post.title;
        body.textContent = jsonResponse.post.body;

        if (jsonResponse.status === 200) {
            // fetch comments
            
            fetch(`${fetchUrl}/${user.post}/comments`, {
                    mode: 'cors'
                })
                .then(res => {
                        return res.json();
                    },
                    networkError => console.log(networkError.message)
                ).then(jsonResponse => {
                    if (jsonResponse.comments) {
                        jsonResponse.comments.forEach(comment => {
                            commentHelper(comment);
                        });
                    }
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
                username: user.username

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
    
                document.location.reload()
                socket.emit('createComment', newComment)
            });
        } else {
            let b = `<b style='color:red;'>Please add a comment!</b>`;
            span.innerHTML = b;
        }
    });
});