const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let posts = [
  { id: 1, author: "user1", text: "Первый пост", likes: 2, likedBy: ["user2"], comments: [{ user: "user2", text: "Отлично!" }] },
  { id: 2, author: "user2", text: "Второй пост", likes: 1, likedBy: [], comments: [] }
];

let users = [
  { username: "user1", password: "123", description: "Описание пользователя user1" },
  { username: "user2", password: "123", description: "Описание пользователя user2" }
];



// Получить все посты
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// Добавить новый пост
app.post('/api/posts', (req, res) => {
  const { author, text } = req.body;
  if (!author || !text) return res.status(400).send('Некорректные данные');
  const newPost = {
    id: posts.length ? posts[posts.length - 1].id + 1 : 1,
    author,
    text,
    likes: 0,
    likedBy: [],
    comments: []
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Лайк поста
app.post('/api/posts/:id/like', (req, res) => {
  const id = parseInt(req.params.id);
  const { user } = req.body;
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).send('Пост не найден');
  if (!user) return res.status(400).send('Не указан пользователь');

  if (!post.likedBy.includes(user)) {
    post.likedBy.push(user);
    post.likes++;
  } else {
    post.likedBy = post.likedBy.filter(u => u !== user);
    post.likes--;
  }
  res.json(post);
});

// Добавить комментарий
app.post('/api/posts/:id/comment', (req, res) => {
  const id = parseInt(req.params.id);
  const { user, text } = req.body;
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).send('Пост не найден');
  if (!user || !text) return res.status(400).send('Некорректные данные');

  post.comments.push({ user, text });
  res.json(post);
});

// Получить данные пользователя
app.get('/api/users/:username', (req, res) => {
  const username = req.params.username;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).send('Пользователь не найден');
  res.json({ username: user.username, description: user.description || '' });
});

// Обновить описание пользователя
app.put('/api/users/:username/description', (req, res) => {
  const username = req.params.username;
  const { description } = req.body;
  if (typeof description !== 'string') return res.status(400).send('Некорректные данные');

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).send('Пользователь не найден');

  user.description = description;
  res.send('Описание обновлено');
});

// Регистрация
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Некорректные данные');
  if (users.find(u => u.username === username)) return res.status(400).send('Пользователь уже существует');

  // Добавляем поле description по умолчанию
  const defaultDescription = 'Это мое описание в профиле.';
  users.push({ username, password, description: defaultDescription });
  res.status(201).send('Пользователь зарегистрирован');
});

// Вход
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).send('Неверный логин или пароль');
  res.send('Успешный вход');
});

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});
