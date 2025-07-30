const API_BASE_URL = 'http://localhost:3000/api';

export interface Comment {
  user: string;
  text: string;
}

export interface Post {
  id: number;
  author: string;
  text: string;
  likes: number;
  comments: Comment[];
  likedBy?: string[];
}

export interface User {
  username: string;
  description?: string;
}

export async function fetchPosts(): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts`);
  if (!response.ok) throw new Error('Ошибка загрузки постов');
  return response.json();
}

export async function fetchUser(username: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${username}`);
  if (!response.ok) throw new Error('Пользователь не найден');
  return response.json();
}

export async function loginUser(username: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Неверный логин или пароль');
  }
}

export async function registerUser(username: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });
  
  if (!response.ok) {
    let errorMessage = 'Ошибка регистрации';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      const text = await response.text();
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }
}

export async function createPost(author: string, text: string): Promise<void> {
  await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ author, text })
  });
}

export async function addComment(postId: number, user: string, text: string): Promise<void> {
  await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ user, text })
  });
}

export async function likePost(postId: number, user: string): Promise<void> {
  await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ user })
  });
}

export async function updateUserDescription(username: string, description: string): Promise<void> {
  await fetch(`${API_BASE_URL}/users/${username}/description`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ description })
  });
}