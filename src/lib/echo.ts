import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Prevent TS error for window object
declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

if (typeof window !== 'undefined') {
  window.Pusher = Pusher;

  window.Echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'mj47xsyfbdkdaoy8xsyp',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
  });
}

export const echo = typeof window !== 'undefined' ? window.Echo : null;
