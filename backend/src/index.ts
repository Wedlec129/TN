import express, { Request, Response } from 'express';
import cors from 'cors';


interface Comment {
  user: string;
  text: string;
}

interface Post {
  id: number;
  author: string;
  text: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
}

interface User {
  username: string;
  password: string;
  description?: string;
}

const app = express();
app.use(cors());
app.use(express.json());

// Начальные данные
let posts: Post[] = [
  { 
    id: 1, 
    author: "user1", 
    text: "Первый пост", 
    likes: 2, 
    likedBy: ["user2"], 
    comments: [{ user: "user2", text: "Отлично!" }] 
  },
  { 
    id: 2, 
    author: "user2", 
    text: "Второй пост", 
    likes: 1, 
    likedBy: [], 
    comments: [] 
  }
];

let users: User[] = [
  { username: "user1", password: "123", description: "Описание пользователя user1" },
  { username: "user2", password: "123", description: "Описание пользователя user2" }
];

// Получить все посты
app.get('/api/posts', (req: Request, res: Response) => {
  res.json(posts);
});

// Добавить новый пост
app.post('/api/posts', (req: Request, res: Response) => {
  const { author, text } = req.body;
  if (!author || !text) return res.status(400).send('Некорректные данные');
  
  const newPost: Post = {
    id: posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1,
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
app.post('/api/posts/:id/like', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { user } = req.body;
  
  if (!user) return res.status(400).send('Не указан пользователь');
  
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).send('Пост не найден');

  const userIndex = post.likedBy.indexOf(user);
  
  if (userIndex === -1) {
    post.likedBy.push(user);
    post.likes++;
  } else {
    post.likedBy.splice(userIndex, 1);
    post.likes--;
  }
  
  res.json(post);
});

// Добавить комментарий
app.post('/api/posts/:id/comment', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { user, text } = req.body;
  
  if (!user || !text) return res.status(400).send('Некорректные данные');
  
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).send('Пост не найден');

  post.comments.push({ user, text });
  res.json(post);
});

// Получить данные пользователя
app.get('/api/users/:username', (req: Request, res: Response) => {
  const username = req.params.username;
  const user = users.find(u => u.username === username);
  
  if (!user) return res.status(404).send('Пользователь не найден');
  
  res.json({ 
    username: user.username, 
    description: user.description || '' 
  });
});

// Обновить описание пользователя
app.put('/api/users/:username/description', (req: Request, res: Response) => {
  const username = req.params.username;
  const { description } = req.body;
  
  if (typeof description !== 'string') {
    return res.status(400).send('Некорректные данные');
  }

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).send('Пользователь не найден');

  user.description = description;
  res.send('Описание обновлено');
});

// Регистрация
app.post('/api/register', (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).send('Некорректные данные');
  }
  
  if (users.find(u => u.username === username)) {
    return res.status(400).send('Пользователь уже существует');
  }

  // Добавляем поле description по умолчанию
  users.push({ 
    username, 
    password, 
    description: 'Это мое описание в профиле.' 
  });
  
  res.status(201).send('Пользователь зарегистрирован');
});

// Вход
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find(u => 
    u.username === username && u.password === password
  );
  
  if (!user) return res.status(401).send('Неверный логин или пароль');
  
  res.send('Успешный вход');
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});