import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import webpush from "npm:web-push@3.6.7"

Deno.serve(async (req) => {
    try {
        // 1. KITA PINDAHKAN KE DALAM SINI & HARDCODE KUNCINYA
        // Ini menjamin robot membaca kunci yang 100% akurat setiap kali menembak!
        const publicVapidKey = 'BGnAM_kEFyyCMO5sjIjcrqHW4L9tY_j3hk_dI_wFdROaxEWqrw2eRaygGwHcrdE6l4YznULxRjIzHaZIDiK61Ro';
        const privateVapidKey = 'HTKtwvrrTWe4hVbqsKzIHlIOwyTADPkPlaSKfhawLAA';

        webpush.setVapidDetails(
            'mailto:arfeensahla@gmail.com',
            publicVapidKey,
            privateVapidKey
        );

        const payload = await req.json();
        const record = payload.record;

        if (!record || !record.nama_santri) {
            return new Response("Bukan data perizinan baru", { status: 200 });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: tokens, error } = await supabase
            .from('push_tokens')
            .select('*')
            .eq('role', 'SEKRETARIS_MUDIR');

        if (error || !tokens || tokens.length === 0) {
            return new Response("Tidak ada token terdaftar", { status: 200 });
        }

        const notificationPayload = JSON.stringify({
            title: 'Ajuan Izin Baru! 🔔',
            body: `${record.nama_santri} (${record.kelas}) mengajukan izin: ${record.keperluan}.`,
            url: '/' 
        });

        // Loop untuk mengirim ke semua token
        const sendPromises = tokens.map(async (t) => {
            try {
                await webpush.sendNotification(t.token, notificationPayload);
                console.log(`SUKSES kirim ke ID ${t.id}`);
            } catch (err: any) {
                console.error(`Gagal kirim ke ID ${t.id} - Status: ${err.statusCode}`);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await supabase.from('push_tokens').delete().eq('id', t.id);
                    console.log(`Token ID ${t.id} dihapus (Kadaluarsa/410).`);
                }
            }
        });

        await Promise.allSettled(sendPromises);

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });

    } catch (err: any) {
        return new Response(String(err?.message ?? err), { status: 500 });
    }
});