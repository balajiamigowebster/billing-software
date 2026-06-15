// Configuration for frontend API endpoints
// In development, requests are proxied via Vite. In production, they are sent to the cPanel Node.js server.
const API_BASE = import.meta.env.DEV ? '' : 'https://amigowebster.in/dental-billing';

export { API_BASE };
