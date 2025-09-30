import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

// Check if window is defined (browser) or not (server)
const isBrowser = typeof window !== 'undefined';

// Only initialize Pusher on the client side
let echo: any = null;

if (isBrowser) {
  window.Pusher = Pusher;
  
  echo = new Echo({
  broadcaster: 'pusher',
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
  forceTLS: true,
  authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
  authorizer: (channel: any, options: any) => {
    return {
      authorize: (socketId: string, callback: (error: any, authInfo: any) => void) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
          .then(response => response.json())
          .then(data => {
            callback(null, data);
          })
          .catch(error => {
            callback(error, null);
          });
        } else {
          callback(new Error('No auth token found'), null);
        }
      },
    };
  },
  });
}

export default echo;
