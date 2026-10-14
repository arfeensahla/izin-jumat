// public/sw.js

// 1. Menerima sinyal Push dari Supabase
self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body, // Isi pesan: "Ada 1 ajuan izin baru dari Ismail..."
            icon: '/icon_spj.png', // Ganti dengan nama file logo pondok Bapak di folder public
            badge: '/icon_spj.png', // Ikon kecil monokrom di status bar Android
            vibrate: [200, 100, 200, 100, 200, 100, 200], // Pola getaran HP
            data: {
                url: data.url || '/' // Link yang dibuka saat notif diklik
            }
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// 2. Aksi ketika Notifikasi di-klik oleh Sekretaris
self.addEventListener('notificationclick', function (event) {
    event.notification.close(); // Tutup notifnya

    // Buka halaman aplikasi (misal: langsung ke tab screening)
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});