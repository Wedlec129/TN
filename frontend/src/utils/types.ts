export interface Post {
  id: number;
  author: string;
  text: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
}

export interface Comment {
  user: string;
  text: string;
}

export interface User {
  username: string;
  password: string;
  description?: string;
}