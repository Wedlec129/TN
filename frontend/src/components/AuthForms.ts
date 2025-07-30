import { $ } from './App';
import { loginUser, registerUser } from '../api/api';

export function renderLoginForm(): string {
  return `
    <section id="loginForm" class="content">
      <form id="loginFormEl" class="login-dialog">
        <header class="login-title">Вход</header>
        <div class="login-fields">
          <label class="field-row">
            <input id="loginUsername" class="text-input large" type="text" placeholder="Логин" required />
          </label>
          <label class="field-row">
            <input id="loginPassword" class="text-input large" type="password" placeholder="Пароль" required />
          </label>
        </div>
        <footer class="login-footer">
          <button type="button" id="showRegisterBtn" class="button secondary">Зарегистрироваться</button>
          <button type="submit" class="button primary">Войти</button>
        </footer>
      </form>
    </section>
  `;
}

export function renderRegisterForm(): string {
  return `
    <section id="registerForm" class="content">
      <form id="registerFormEl" class="login-dialog">
        <header class="login-title">Регистрация</header>
        <div class="login-fields">
          <label class="field-row">
            <input id="registerUsername" class="text-input large" type="text" placeholder="Логин" required />
          </label>
          <label class="field-row">
            <input id="registerPassword" class="text-input large" type="password" placeholder="Пароль" required />
          </label>
        </div>
        <footer class="login-footer">
          <button type="button" id="showLoginBtn" class="button secondary">Уже есть аккаунт</button>
          <button type="submit" class="button primary">Зарегистрироваться</button>
        </footer>
      </form>
    </section>
  `;
}

export function setupAuthFormsEvents(): void {
 
  $('#loginFormEl')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = ($('#loginUsername') as HTMLInputElement).value.trim();
    const password = ($('#loginPassword') as HTMLInputElement).value.trim();

    try {
      await loginUser(username, password);
      sessionStorage.setItem('currentUser', username);
      window.dispatchEvent(new CustomEvent('login-success', { detail: username }));
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'posts' }));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка входа');
    }
  });

  
  $('#registerFormEl')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = ($('#registerUsername') as HTMLInputElement).value.trim();
    const password = ($('#registerPassword') as HTMLInputElement).value.trim();

    try {
      await registerUser(username, password);
      alert('Регистрация успешна! Пожалуйста, войдите в систему.');
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка регистрации');
    }
  });

 
  $('#showRegisterBtn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'register' }));
  });

  $('#showLoginBtn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }));
  });
}