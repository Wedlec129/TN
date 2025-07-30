import { Post, likePost } from '../api/api';

export function createPostElement(post: Post, currentUser: string | null, inProfile: boolean = false): HTMLElement {
  const isLiked = post.likedBy?.includes(currentUser || '');
  const postEl = document.createElement('article');
  postEl.className = 'post-card';
  postEl.innerHTML = `
    <header class="post-header">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFUAfyVe3Easiycyh3isP9wDQTYuSmGPsPQvLIJdEYvQ_DsFq5Ez2Nh_QjiS3oZ3B8ZPfK9cZQyIStmQMV1lDPLw" 
            class="post-avatar" alt="Аватар ${post.author}" />
      <h2 class="post-author">
        <span class="profile-link" data-username="${post.author}" style="cursor:pointer">@${post.author}</span>
      </h2>
    </header>
    <div class="post-content">
      <p class="post-text">${post.text}</p>
    </div>
    <footer class="post-footer">
      <button class="like-button ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
        ❤️ ${post.likes}
      </button>
      <button class="comment-button" data-post-id="${post.id}" data-from-profile="${inProfile}">
        Комментарии (${post.comments.length})
      </button>
    </footer>
  `;
  
  return postEl;
}

 
export function setupPostEvents(): void {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    
     
    if (target.classList.contains('like-button')) {
      const postId = target.getAttribute('data-post-id');
      const currentUser = sessionStorage.getItem('currentUser');
      if (postId && currentUser) {
        likePost(parseInt(postId), currentUser)
          .then(() => window.dispatchEvent(new CustomEvent('refresh-content')))
          .catch(err => alert('Ошибка при лайке: ' + err.message));
      } else if (!currentUser) {
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }));
      }
    }
    
     
    if (target.classList.contains('comment-button')) {
      const postId = target.getAttribute('data-post-id');
      const fromProfile = target.getAttribute('data-from-profile') === 'true';
      if (postId) {
        window.dispatchEvent(new CustomEvent('show-comments', {
          detail: { 
            postId: parseInt(postId), 
            fromProfile 
          }
        }));
      }
    }
    
     
    const profileLink = target.closest('.profile-link');
    if (profileLink) {
      e.preventDefault();
      const username = profileLink.getAttribute('data-username');
      if (username) {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { page: 'profile', username } 
        }));
      }
    }
  });
}