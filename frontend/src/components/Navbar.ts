import { $ } from './App';

export function renderNavbar(currentUser: string | null): string {
  return `
    <header class="header">
      <div class="container nav-container">
        <a href="#" id="logoLink" class="logo-link" aria-label="T-News">
          <img src="../src/img/t-bank.svg" alt="Логотип T-News" class="logo" />
        </a>

        <form class="search-form" role="search">
          <input type="text" class="search-input" placeholder="Поиск по T-News" />
        </form>

        <nav class="auth-buttons" aria-label="Авторизация">
          <span id="userNav" class="user-nav" style="display:${currentUser ? 'inline' : 'none'}">
            <a href="#" class="profile-link" id="profileLink">
              @<span id="navUser">${currentUser || ''}</span>
            </a>
          </span>
          <button id="registerBtn" class="auth-link" style="display:${currentUser ? 'none' : 'inline'}">Зарегистрироваться</button>
          <button id="loginBtn" class="auth-link" style="display:${currentUser ? 'none' : 'inline'}">Войти</button>
          <button id="logoutBtn" class="auth-link" style="display:${currentUser ? 'inline' : 'none'}">Выйти</button>
        </nav>
      </div>
    </header>
  `;
}

export function setupNavbarEvents(): void {
  $('#logoLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'posts' }));
  });

  // Обработка клика по ссылке профиля
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const profileLink = target.closest('#profileLink');
    
    if (profileLink) {
      e.preventDefault();
      const currentUser = sessionStorage.getItem('currentUser');
      if (currentUser) {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { page: 'profile', username: currentUser } 
        }));
      }
    }
  });

  $('#loginBtn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }));
  });

  $('#registerBtn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'register' }));
  });

  $('#logoutBtn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('logout'));
  });
}