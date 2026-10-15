// public/sw.js

// 1. Menerima sinyal Push dari Supabase
self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body, // Isi pesan
            icon: '/icon_spj.png', // Logo pondok
            badge: '/icon_spj.png', // Ikon monokrom di status bar
            vibrate: [200, 100, 200, 100, 200, 100, 200], // Pola getaran
            data: {
                url: data.url || '/' // Link yang dibuka saat notif diklik
            }
        };

        // Tampilkan notifikasi di atas layar
        const showNotifPromise = self.registration.showNotification(data.title, options);

        // Tambahkan angka/titik merah di Ikon Aplikasi PWA
        let setBadgePromise = Promise.resolve();
        if ('setAppBadge' in navigator) {
            // Memasang angka 1 sebagai indikator ada notif baru
            setBadgePromise = navigator.setAppBadge(1).catch(err => console.error('Gagal set badge:', err));
        }

        // Jalankan keduanya secara bersamaan
        event.waitUntil(Promise.all([showNotifPromise, setBadgePromise]));
    }
});

// 2. Aksi ketika Notifikasi di-klik oleh Sekretaris
self.addEventListener('notificationclick', function (event) {
    event.notification.close(); // Tutup notifnya

    // Buka halaman aplikasi
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});