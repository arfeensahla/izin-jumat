// public/sw.js

self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: '/icon_spj.png',
            badge: '/icon_spj.png',
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            data: {
                url: data.url || '/'
            }
        };

        // 1. Eksekusi Notifikasi Utama (Prioritas 1)
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );

        // 2. Eksekusi Angka Badge (Prioritas 2, dieksekusi terpisah agar tidak memblokir)
        if (navigator && 'setAppBadge' in navigator) {
            navigator.setAppBadge(1).catch(err => console.log('Bawaan HP tidak support badge'));
        }
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});