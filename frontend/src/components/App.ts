import { renderNavbar, setupNavbarEvents } from './Navbar';
import { renderLoginForm, renderRegisterForm, setupAuthFormsEvents } from './AuthForms';
import { renderCommentSection } from './CommentSection';
import { renderProfilePage, setupProfileEvents } from './ProfilePage';
import { fetchPosts } from '../api/api';
import { createPostElement } from './PostCard';

export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

export function hideElement(el: HTMLElement | null): void {
  if (el) el.style.display = 'none';
}

export function showElement(el: HTMLElement | null, display: string = 'block'): void {
  if (el) el.style.display = display;
}

export function updateNavigation(): void {
  const currentUser = sessionStorage.getItem('currentUser');
  const userNav = $('#userNav');
  const loginBtn = $('#loginBtn');
  const registerBtn = $('#registerBtn');
  const logoutBtn = $('#logoutBtn');
  
  if (currentUser) {
    showElement(userNav, 'inline');
    const navUser = $('#navUser');
    if (navUser) navUser.textContent = currentUser;
    hideElement(loginBtn);
    hideElement(registerBtn);
    showElement(logoutBtn, 'inline');
  } else {
    hideElement(userNav);
    hideElement(logoutBtn);
    showElement(loginBtn, 'inline');
    showElement(registerBtn, 'inline');
  }
}

 
export async function initApp(): Promise<void> {
  
  const appContainer = $('#app');
  if (!appContainer) return;
  
  
  const currentUser = sessionStorage.getItem('currentUser');
  
  
  appContainer.innerHTML = renderNavbar(currentUser);
  
   
  const mainContent = document.createElement('main');
  mainContent.className = 'main-content';
  mainContent.id = 'mainContent';
  appContainer.appendChild(mainContent);
  
   
  window.dispatchEvent(new CustomEvent('navigate', { detail: 'posts' }));
  
  setupNavbarEvents();
  setupAppEvents();
}

function setupAppEvents(): void {
 
  window.addEventListener('navigate', async (e: any) => {
    const mainContent = $('#mainContent');
    if (!mainContent) return;
    
   
    document.querySelectorAll('.content').forEach(el => {
      el.classList.remove('active');
    });
    
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (e.detail === 'posts') {
      // Загрузка ленты постов
      try {
        const posts = await fetchPosts();
        const postsHtml = posts.map(post => 
          createPostElement(post, currentUser).outerHTML
        ).join('');
        
        mainContent.innerHTML = `
          <section id="posts" class="content active">
            <div class="post-list">
              ${postsHtml}
            </div>
          </section>
        `;
      } catch (error) {
        mainContent.innerHTML = `
          <section class="content active">
            <h2>Ошибка загрузки постов</h2>
            <p>Не удалось загрузить ленту. Попробуйте обновить страницу.</p>
          </section>
        `;
      }
    }
    else if (e.detail === 'login') {
      // Показываем форму входа
      mainContent.innerHTML = renderLoginForm();
      const loginForm = $('#loginForm');
      if (loginForm) {
        loginForm.classList.add('active');
        setupAuthFormsEvents();
      }
    }
    else if (e.detail === 'register') {
      // Показываем форму регистрации
      mainContent.innerHTML = renderRegisterForm();
      const registerForm = $('#registerForm');
      if (registerForm) {
        registerForm.classList.add('active');
        setupAuthFormsEvents();
      }
    }
    else if (e.detail.page === 'profile') {
      // Показываем профиль пользователя
      const profileHtml = await renderProfilePage(e.detail.username);
      mainContent.innerHTML = profileHtml;
      const profilePage = $('#profilePage');
      if (profilePage) {
        profilePage.classList.add('active');
        setupProfileEvents();
      }
    }
  });
  
  // Показ комментариев
  window.addEventListener('show-comments', (e: any) => {
    renderCommentSection(e.detail.postId, e.detail.fromProfile);
  });
  
  // Обновление контента
  window.addEventListener('refresh-content', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'posts' }));
  });
  
  // Выход из системы
  window.addEventListener('logout', () => {
    sessionStorage.removeItem('currentUser');
    updateNavigation();
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'posts' }));
  });
  
  // Успешный вход
  window.addEventListener('login-success', () => {
    updateNavigation();
  });
}

document.addEventListener('DOMContentLoaded', initApp);