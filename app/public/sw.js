// public/sw.js

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
    // Odbieramy dane wysłane z naszego backendu
    const data = event.data ? event.data.json() : {};

    const title = data.title || 'HabitTracker Reminder';
    const options = {
        body: data.body || 'Time to complete your habit!',
        icon: '/favicon.ico', // Ikonka powiadomienia
        badge: '/favicon.ico', // Mała ikonka na pasku (głównie Android)
        vibrate: [200, 100, 200], // Wibracja na telefonie
    };

    // Wyświetlamy powiadomienie systemowe!
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Nasłuchujemy kliknięcia w powiadomienie
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});