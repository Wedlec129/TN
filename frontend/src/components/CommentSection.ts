import { $ } from './App';
import { addComment,fetchPosts } from '../api/api';

export async function renderCommentSection(postId: number, fromProfile: boolean): Promise<void> {
  const posts = await fetchPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const container = fromProfile ? $('#userPosts') : $('#posts');
  if (!container) return;

  const isLiked = post.likedBy?.includes(sessionStorage.getItem('currentUser') || '');

  const commentsHtml = post.comments.map(c => `
    <div class="comment-card">
      <header class="post-header">
        <img src="https://via.placeholder.com/24" class="post-avatar" alt="Аватар ${c.user}" />
        <h3 class="post-author">@${c.user}</h3>
      </header>
      <p class="post-text">${c.text}</p>
    </div>
  `).join('');

  const currentUser = sessionStorage.getItem('currentUser');
  const commentForm = currentUser ? `
    <div class="comment-form">
      <input id="cmt-${postId}" class="text-input medium" placeholder="Комментарий..." />
      <button class="button secondary comment-submit-button" data-post-id="${postId}" data-from-profile="${fromProfile}">Ок</button>
    </div>
  ` : '<p class="comment-notice">Войдите, чтобы комментировать</p>';

  container.innerHTML = `
    <article class="post-card">
      <header class="post-header">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFUAfyVe3Easiycyh3isP9wDQTYuSmGPsPQvLIJdEYvQ_DsFq5Ez2Nh_QjiS3oZ3B8ZPfK9cZQyIStmQMV1lDPLw" 
              class="post-avatar" alt="Аватар ${post.author}" />
        <h2 class="post-author">
          <span class="profile-link" data-username="${post.author}" style="cursor:pointer">@${post.author}</span>
        </h2>
      </header>
      <p class="post-text">${post.text}</p>
      <footer class="post-footer">
        <button class="like-button ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
          ❤️ ${post.likes}
        </button>
        <button class="back-button" data-from-profile="${fromProfile}" data-username="${post.author}">Назад</button>
      </footer>
      <div class="comment-section">
        ${commentsHtml}
        ${commentForm}
      </div>
    </article>
  `;

 
  const backBtn = container.querySelector('.back-button');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (fromProfile) {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { page: 'profile', username: post.author } 
        }));
      } else {
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'posts' }));
      }
    });
  }

  const commentSubmitBtn = container.querySelector('.comment-submit-button');
  if (commentSubmitBtn) {
    commentSubmitBtn.addEventListener('click', async () => {
      const input = $(`#cmt-${postId}`) as HTMLInputElement;
      if (!input || !input.value.trim()) return;

      try {
        await addComment(postId, currentUser!, input.value.trim());
        renderCommentSection(postId, fromProfile);
      } catch (error) {
        alert('Не удалось добавить комментарий');
      }
    });
  }
}