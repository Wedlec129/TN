
let currentUser = sessionStorage.getItem('currentUser') || null;

function showLoginForm() {
  hideMainContent();
  document.getElementById('loginForm').style.display = 'block';
}

function showRegisterForm() {
  hideMainContent();
  document.getElementById('registerForm').style.display = 'block';
}

function hideForms() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'none';
}

function hideMainContent() {
  document.getElementById('posts').style.display = 'none';
  document.getElementById('profilePage').style.display = 'none';
  hideForms();
}

document.getElementById('logoLink').addEventListener('click', (e) => {
  e.preventDefault();
  loadPosts();
});

async function loadPosts() {
  hideMainContent();
  document.getElementById('posts').style.display = 'block';
  try {
    const res = await fetch('http://localhost:3000/api/posts');
    const posts = await res.json();
    const container = document.getElementById('posts');
    container.innerHTML = '';

    posts.forEach(post => {
      const isLiked = post.likedBy?.includes(currentUser);
      const el = document.createElement('article');
      el.className = 'post-card';
      el.innerHTML = `
        <header class="post-header">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFUAfyVe3Easiycyh3isP9wDQTYuSmGPsPQvLIJdEYvQ_DsFq5Ez2Nh_QjiS3oZ3B8ZPfK9cZQyIStmQMV1lDPLw" class="post-avatar" />
          <h2 class="post-author">
            <span class="profile-link" style="cursor:pointer" onclick="openProfile('${post.author}')">@${post.author}</span>
          </h2>
        </header>

        <p class="post-text">${post.text}</p>

        <footer class="post-footer">
          <button class="like-button ${isLiked ? 'liked' : ''}" onclick="likePost(${post.id})">
            ❤️ ${post.likes}
          </button>
          <button class="comment-button" onclick="toggleComments(${post.id})">
            Комментарии (${post.comments.length})
          </button>
        </footer>
      `;
      container.appendChild(el);
    });

    updateNav();
  } catch (e) {
    alert('Ошибка загрузки постов');
    console.error(e);
  }
}

function updateNav() {
  if (currentUser) {
    document.getElementById('userNav').style.display = 'inline';
    document.getElementById('navUser').textContent = currentUser;

    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('registerBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline';
  } else {
    document.getElementById('userNav').style.display = 'none';
    document.getElementById('navUser').textContent = '';

    document.getElementById('loginBtn').style.display = 'inline';
    document.getElementById('registerBtn').style.display = 'inline';
    document.getElementById('logoutBtn').style.display = 'none';
  }
}

async function toggleComments(postId, fromProfile = false) {
  try {
    const res = await fetch('http://localhost:3000/api/posts');
    const posts = await res.json();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const container = fromProfile ? document.getElementById('userPosts') : document.getElementById('posts');
    container.innerHTML = '';

    const isLiked = post.likedBy?.includes(currentUser);

    const el = document.createElement('article');
    el.className = 'post-card';
    el.innerHTML = `
      <header class="post-header">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFUAfyVe3Easiycyh3isP9wDQTYuSmGPsPQvLIJdEYvQ_DsFq5Ez2Nh_QjiS3oZ3B8ZPfK9cZQyIStmQMV1lDPLw" class="post-avatar" />
        <h2 class="post-author">
          <span class="profile-link" style="cursor:pointer" onclick="openProfile('${post.author}')">@${post.author}</span>
        </h2>
      </header>

      <p class="post-text">${post.text}</p>

      <footer class="post-footer">
        <button class="like-button ${isLiked ? 'liked' : ''}" onclick="likePost(${post.id})">
          ❤️ ${post.likes}
        </button>
        <button class="comment-button" onclick="${fromProfile ? `openProfile('${post.author}')` : 'loadPosts()'}">Назад</button>
      </footer>

      <div class="comment-section">
        ${post.comments.map(c => `
          <div class="comment-card">
            <header class="post-header">
              <img src="https://via.placeholder.com/24" class="post-avatar" />
              <h3 class="post-author">@${c.user}</h3>
            </header>
            <p class="post-text">${c.text}</p>
          </div>
        `).join('')}
        ${currentUser ? `
          <input id="cmt-${post.id}" class="text-input medium" placeholder="Комментарий..." />
          <button class="button secondary" onclick="commentPost(${post.id}, ${fromProfile})">Ок</button>
        ` : '<p>Войдите, чтобы комментировать</p>'}
      </div>
    `;
    container.appendChild(el);
  } catch (e) {
    alert('Ошибка загрузки комментариев');
    console.error(e);
  }
}

async function commentPost(postId, fromProfile = false) {
  const input = document.getElementById(`cmt-${postId}`);
  if (!input || !input.value.trim()) return;

  try {
    await fetch(`http://localhost:3000/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ user: currentUser, text: input.value.trim() })
    });
    input.value = '';
    toggleComments(postId, fromProfile);
  } catch (e) {
    alert('Ошибка добавления комментария');
    console.error(e);
  }
}

async function likePost(postId) {
  try {
    await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ user: currentUser })
    });
    // Если мы на странице профиля, обновим профиль, иначе обновим ленту
    if (document.getElementById('profilePage').style.display === 'block') {
      openProfile(currentUser);
    } else {
      loadPosts();
    }
  } catch (e) {
    alert('Ошибка лайка');
    console.error(e);
  }
}

async function login(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Неверный логин или пароль');

    currentUser = username;
    sessionStorage.setItem('currentUser', currentUser);
    hideMainContent();
    loadPosts();
    updateNav();
  } catch (e) {
    alert(e.message);
  }
}

async function register(event) {
  event.preventDefault();
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  try {
    const res = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Ошибка регистрации');
    }

    alert('Регистрация успешна, войдите');
    showLoginForm();
  } catch (e) {
    alert(e.message);
  }
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('currentUser');
  updateNav();
  loadPosts();
}

async function openProfile(username) {
  hideMainContent();
  document.getElementById('profilePage').style.display = 'block';

  try {
   
    const userRes = await fetch(`http://localhost:3000/api/users/${username}`);
    if (!userRes.ok) throw new Error('Пользователь не найден');
    const userData = await userRes.json();

    document.getElementById('profileUsername').textContent = username;
    document.getElementById('profileDescription').textContent = userData.description || '';
    document.getElementById('editDescription').value = userData.description || '';

    document.getElementById('editDescBtn').style.display = (currentUser === username) ? 'inline-block' : 'none';
    document.getElementById('saveDescBtn').style.display = 'none';
    document.getElementById('editDescription').style.display = 'none';


    document.getElementById('newPostForm').style.display = (currentUser === username) ? 'block' : 'none';

    
    const postsRes = await fetch('http://localhost:3000/api/posts');
    const posts = await postsRes.json();

    const userPosts = posts.filter(p => p.author === username);
    const container = document.getElementById('userPosts');
    container.innerHTML = '';

    userPosts.forEach(post => {
      const isLiked = post.likedBy?.includes(currentUser);
      const el = document.createElement('article');
      el.className = 'post-card';
      el.innerHTML = `
        <header class="post-header">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFUAfyVe3Easiycyh3isP9wDQTYuSmGPsPQvLIJdEYvQ_DsFq5Ez2Nh_QjiS3oZ3B8ZPfK9cZQyIStmQMV1lDPLw" class="post-avatar" />
          <h2 class="post-author">@${post.author}</h2>
        </header>

        <p class="post-text">${post.text}</p>

        <footer class="post-footer">
          <button class="like-button ${isLiked ? 'liked' : ''}" onclick="likePost(${post.id})">
            ❤️ ${post.likes}
          </button>
          <button class="comment-button" onclick="toggleComments(${post.id}, true)">
            Комментарии (${post.comments.length})
          </button>
        </footer>
      `;
      container.appendChild(el);
    });
  } catch (e) {
    alert('Ошибка загрузки профиля');
    console.error(e);
  }
}

async function addNewPost() {
  const text = document.getElementById('newPostText').value.trim();
  if (!text) return alert('Введите текст поста');

  try {
    await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ author: currentUser, text })
    });
    document.getElementById('newPostText').value = '';
    openProfile(currentUser);
  } catch (e) {
    alert('Ошибка добавления поста');
    console.error(e);
  }
}

function toggleEditDescription() {
  const descP = document.getElementById('profileDescription');
  const textarea = document.getElementById('editDescription');
  const editBtn = document.getElementById('editDescBtn');
  const saveBtn = document.getElementById('saveDescBtn');

  descP.style.display = 'none';
  textarea.style.display = 'block';
  editBtn.style.display = 'none';
  saveBtn.style.display = 'inline-block';
}

async function saveDescription() {
  const newDesc = document.getElementById('editDescription').value.trim();
  const username = document.getElementById('profileUsername').textContent;

  try {
    const res = await fetch(`http://localhost:3000/api/users/${username}/description`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ description: newDesc })
    });
    if (!res.ok) throw new Error('Ошибка сохранения описания');

    document.getElementById('profileDescription').textContent = newDesc;

    document.getElementById('profileDescription').style.display = 'block';
    document.getElementById('editDescription').style.display = 'none';
    document.getElementById('editDescBtn').style.display = 'inline-block';
    document.getElementById('saveDescBtn').style.display = 'none';

    alert('Описание сохранено');
  } catch (e) {
    alert(e.message);
  }
}

updateNav();
loadPosts();

