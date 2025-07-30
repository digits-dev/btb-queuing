import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
});

window.Echo = echo;

echo.connector.pusher.connection.bind('connected', () => {
  console.log('%c[PUSHER] Connected!', 'color: green');
});

echo.connector.pusher.connection.bind('error', (err) => {
  console.error('[PUSHER] Error:', err);
});
