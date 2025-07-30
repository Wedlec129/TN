import { $ } from './App';
import { fetchUser, fetchPosts, createPost, updateUserDescription } from '../api/api';
import { createPostElement } from './PostCard';

export async function renderProfilePage(username: string): Promise<string> {
  const currentUser = sessionStorage.getItem('currentUser');
  const isCurrentUser = currentUser === username;
  
  try {
    const userData = await fetchUser(username);
    const posts = await fetchPosts();
    const userPosts = posts.filter(p => p.author === username);

    return `
      <section id="profilePage" class="content">
        <h2 class="profile-heading">Профиль</h2>
        <div id="profileInfo" class="profile-info">
          <div class="profile-avatar">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFUAfyVe3Easiycyh3isP9wDQTYuSmGPsPQvLIJdEYvQ_DsFq5Ez2Nh_QjiS3oZ3B8ZPfK9cZQyIStmQMV1lDPLw" alt="Аватар" />
            ${isCurrentUser ? `<button id="editPhotoBtn" class="button secondary">Изменить фото</button>` : ''}
          </div>
          <div class="profile-main">
            <h3 class="profile-name"><span id="profileUsername">${username}</span></h3>
            <p id="profileDescription">${userData.description || ''}</p>
            <textarea id="editDescription" class="text-input large" rows="4" style="display:none;"></textarea>
            ${isCurrentUser ? `
              <button id="editDescBtn" class="button secondary">Изменить описание</button>
              <button id="saveDescBtn" class="button primary" style="display:none;">Сохранить описание</button>
            ` : ''}
          </div>
        </div>

        ${isCurrentUser ? `
          <div id="newPostForm" class="new-post-form">
            <textarea id="newPostText" class="text-input large" placeholder="Напишите новый пост..." rows="4"></textarea>
            <button id="publishPostBtn" class="button primary">Опубликовать</button>
          </div>
        ` : ''}

        <div id="userPosts" class="user-posts">
           ${userPosts.map(post => createPostElement(post, currentUser, true).outerHTML).join('')}
        </div>
        <button id="backToFeedBtn" class="button secondary back-button">Назад к ленте</button>
      </section>
    `;
  } catch (error) {
    return `
      <section class="content">
        <h2>Ошибка загрузки профиля</h2>
        <p>Не удалось загрузить профиль пользователя ${username}</p>
        <button id="backToFeedBtn" class="button secondary">Назад к ленте</button>
      </section>
    `;
  }
}

export function setupProfileEvents(): void {
  $('#editDescBtn')?.addEventListener('click', () => {
    $('#profileDescription')!.style.display = 'none';
    $('#editDescription')!.style.display = 'block';
    $('#editDescBtn')!.style.display = 'none';
    $('#saveDescBtn')!.style.display = 'inline-block';
  });

  $('#saveDescBtn')?.addEventListener('click', async () => {
    const newDesc = ($('#editDescription') as HTMLTextAreaElement).value.trim();
    const username = $('#profileUsername')!.textContent;

    if (!username) return;

    try {
      await updateUserDescription(username, newDesc);
      $('#profileDescription')!.textContent = newDesc;
      $('#profileDescription')!.style.display = 'block';
      $('#editDescription')!.style.display = 'none';
      $('#editDescBtn')!.style.display = 'inline-block';
      $('#saveDescBtn')!.style.display = 'none';
      alert('Описание успешно сохранено!');
    } catch (error) {
      alert('Не удалось сохранить описание');
    }
  });

  $('#publishPostBtn')?.addEventListener('click', async () => {
    const text = ($('#newPostText') as HTMLTextAreaElement).value.trim();
    if (!text) {
      alert('Введите текст поста');
      return;
    }

    try {
      const currentUser = sessionStorage.getItem('currentUser');
      if (!currentUser) throw new Error('Пользователь не авторизован');
      
      await createPost(currentUser, text);
      ($('#newPostText') as HTMLTextAreaElement).value = '';
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { page: 'profile', username: currentUser } 
      }));
    } catch (error) {
      alert('Не удалось добавить пост');
    }
  });

  $('#backToFeedBtn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'posts' }));
  });
}