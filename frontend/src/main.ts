import './style/style.css'
import { initApp } from './components/App';
import { setupPostEvents } from './components/PostCard';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupPostEvents();
});