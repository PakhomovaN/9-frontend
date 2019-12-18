const baseUrl = 'https://more-posts-9.herokuapp.com';

let lastSeenId = 0;
let firstSeenId = 0;
let lastPosts = [];

const rootEl = document.getElementById('root');
const addFormEl = document.createElement('form');
addFormEl.className = 'form-inline mb-2';
addFormEl.innerHTML = `
<form>
    <div class="form-group">
        <input class="form-control" data-id="content">
    </div>
    <select class="custom-select" data-id="type">
        <option value="regular">Обычный</option>
        <option value="image">Изображение</option>
        <option value="audio">Аудио</option>
        <option value="video">Видео</option>
    </select>  
    <button class="btn btn-primary">Ok</button>
</form> 
`;
rootEl.appendChild(addFormEl);

const newPostBtn = document.createElement('button');
newPostBtn.textContent = 'Новые записи';
newPostBtn.className = 'card mb-2';
newPostBtn.style.display = "none";
newPostBtn.addEventListener('click', () => {
    fetch(`${baseUrl}/posts/${firstSeenId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        }).then(function (data) {
            firstSeenId = 0;
            lastPosts.unshift(...data.reverse());
            rebuildList(postsEl, lastPosts);
            newPostBtn.style.display = "none";
        }).catch(error => {
            console.log(error);
        });
});
rootEl.appendChild(newPostBtn);

const contentEl = addFormEl.querySelector('[data-id=content]');
const typeEl = addFormEl.querySelector('[data-id=type]');
contentEl.value = localStorage.getItem('content');
contentEl.addEventListener('input', (evt) => {
    localStorage.setItem('content', evt.currentTarget.value);
});
if (localStorage.getItem('type') !== null) {
    typeEl.value = localStorage.getItem('type');
}
typeEl.addEventListener('input', (evt) => {
    localStorage.setItem('type', evt.currentTarget.value);
});

addFormEl.addEventListener('submit', function (evt) {
    evt.preventDefault();
    const post = {
        id: 0,
        content: contentEl.value,
        type: typeEl.value,
    };
    fetch(`${baseUrl}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
    }).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    }).then(data => {
        contentEl.value = '';
        typeEl.value = 'regular';
        localStorage.clear();
        lastPosts.unshift(data);
        firstSeenId = data.id;
        rebuildList(postsEl, lastPosts);
    }).catch(error => {
        console.log(error)
    });
});

const postsEl = document.createElement('div');
rootEl.appendChild(postsEl);

const renderPosts = fetch(`${baseUrl}/posts/seenPosts/${lastSeenId}`)
renderPosts.then(response => {
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}).then(function (data) {
    if (data.length !== 0) {
        if (data.length < 5) {
            lastPosts.push(...data.reverse());
        } else {
            lastSeenId = data[data.length - 5].id;
            lastPosts.push(...data.reverse());
            lastPostBtn.style.display = "block";
        }
        rebuildList(postsEl, lastPosts)
    }
}).catch(error => {
    console.log(error);
});

function rebuildList(containerEl, items) {
    containerEl.innerHTML = '';
    for (const item of items) {
        const postEl = document.createElement('div');
        postEl.className = 'card mb-2';
        if (item.type === 'regular') {
            postEl.innerHTML = `
                <div class="card-body">
                    <div class="card-text">${item.content}</div>
                    <button class="btn">♡ ${item.likes}</button>
                    <button class="btn btn-primary" data-action="like">like</button>
                    <button class="btn btn-danger" data-action="dislike">dislike</button>
                    <button class="btn btn-danger" data-action="remove>x</button> 
                </div>
            `;
        } else if (item.type === 'image') {
            postEl.innerHTML = `
                    <img src="${item.content}" class="card-img-top">
                    <div class="card-body">
                        <button class="btn">♡ ${item.likes}</button>
                        <button class="btn btn-primary" data-action="like">like</button>
                        <button class="btn btn-danger" data-action="dislike">dislike</button>
                        <button class="btn btn-danger" data-action="remove>x</button>
                        <button class="btn">id: ${item.id}</button>
                    </div>
                `;
        } else if (item.type === 'audio') {
            postEl.innerHTML = `
                    <audio src="${item.content}" class="card-audio-top">
                    <div class="card-body">
                        <button class="btn">♡ ${item.likes}</button>
                        <button class="btn btn-primary" data-action="like">like</button>
                        <button class="btn btn-danger" data-action="dislike">dislike</button>
                        <button class="btn btn-danger" data-action="remove>x</button>
                        <button class="btn">id: ${item.id}</button>
                    </div>
                `;
        } else if (item.type === 'video') {
            postEl.innerHTML = `
                    <video src="${item.content}" class="card-video-top">
                    <div class="card-body">
                        <button class="btn">♡ ${item.likes}</button>
                        <button class="btn btn-primary" data-action="like">like</button>
                        <button class="btn btn-danger" data-action="dislike">dislike</button>
                        <button class="btn btn-danger" data-action="remove>x</button>
                        <button class="btn">id: ${item.id}</button>
                        </div>
                `;
            };
            
            postEl.querySelector('[data-action=remove]').addEventListener('click', function () {
                fetch(`${baseUrl}/posts/${item.id}`, {
                    method: 'DELETE',
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
                    return response.json();
                }).then(data => {
                    const index = lastPosts.findIndex((post) => {
                        return post.id === item.id
                    })
                    lastPosts.splice(index, 1)
                    rebuildList(postsEl, lastPosts);
                }).catch(error => {
                    console.log(error)
                });
            });
    
            postEl.querySelector('[data-action=like]').addEventListener('click', function () {
                fetch(`${baseUrl}/posts/${item.id}/likes`, {
                    method: 'POST',
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
                    return response.json();
                }).then(data => {
                    const index = lastPosts.findIndex((post) => {
                        return post.id === item.id
                    })
                    lastPosts[index].likes++;
                    rebuildList(postsEl, lastPosts);
                }).catch(error => {
                    console.log(error)
                });
            });
    
            postEl.querySelector('[data-action=dislike]').addEventListener('click', function () {
                fetch(`${baseUrl}/posts/${item.id}/likes`, {
                    method: 'DELETE',
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
                    return response.json();
                }).then(data => {
                    const index = lastPosts.findIndex((post) => {
                        return post.id === item.id
                    })
                    lastPosts[index].likes--;
                    rebuildList(postsEl, lastPosts);
                }).catch(error => {
                    console.log(error)
                });
            });
            containerEl.appendChild(postEl);
        }
};

const lastPostBtn = document.createElement('button');
lastPostBtn.textContent = 'Загрузить еще';
lastPostBtn.className = 'card mb-2';
lastPostBtn.style.display = "none";
lastPostBtn.addEventListener('click', () => {
    fetch(`${baseUrl}/posts/seenPosts/${lastSeenId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    }).then(function (data) {
        if (data.length === 0) {
            lastPostBtn.style.display = "none";
        }
        else {
            if (data.length < 5) {
                lastSeenId = data[data.length - 1].id;
                lastPosts.push(...data.reverse());
                lastPostBtn.style.display = "none";
            } else {
                lastSeenId = data[data.length - 5].id;
                lastPosts.push(...data.reverse());
                lastPostBtn.style.display = "block";
            }
            rebuildList(postsEl, lastPosts);
        }
    }).catch(error => {
        console.log(error);
    });
})
rootEl.appendChild(lastPostBtn);

setInterval(() => {
    const promise = fetch(`${baseUrl}/posts/${firstSeenId}`)
    promise.then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    }).then(function (data) {
        if (data.length === 0) {
            console.log('Постов нет');
            newPostBtn.style.display = "none";
        }
        else {
            if (firstSeenId === 0) {
                firstSeenId = data[data.length - 1].id;
                newPostBtn.style.display = "none";
            } else {
                newPostBtn.style.display = "block";
            }
        }
        console.log(data)
        console.log('firstSeenId = ' + firstSeenId)
    }).catch(error => {
        console.log(error);
    });
}, 5000);
