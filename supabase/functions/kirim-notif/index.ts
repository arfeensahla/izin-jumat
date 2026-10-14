import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import webpush from "npm:web-push@3.6.7"

// Mengambil kunci rahasia dari server Supabase
const publicVapidKey = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const privateVapidKey = Deno.env.get('VAPID_PRIVATE_KEY') || '';

webpush.setVapidDetails(
  'mailto:arfeensahla@gmail.com',
  publicVapidKey,
  privateVapidKey
);

Deno.serve(async (req) => {
    try {
        // 1. Tangkap data perizinan baru dari Webhook Supabase
        const payload = await req.json();
        const record = payload.record;

        if (!record || !record.nama_santri) {
            return new Response("Bukan data perizinan baru", { status: 200 });
        }

        // 2. Konek ke Database
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 3. Cari alamat Token HP milik Sekretaris Mudir
        const { data: tokens, error } = await supabase
            .from('push_tokens')
            .select('token')
            .eq('role', 'SEKRETARIS_MUDIR');

        if (error || !tokens || tokens.length === 0) {
            return new Response("Tidak ada token terdaftar", { status: 200 });
        }

        // 4. Siapkan isi Surat Notifikasi
        const notificationPayload = JSON.stringify({
            title: 'Ajuan Izin Baru! 🔔',
            body: `${record.nama_santri} (${record.kelas}) mengajukan izin: ${record.keperluan}.`,
            url: '/' 
        });

        // 5. Kirim notifikasi ke semua HP Sekretaris yang terdaftar
        const sendPromises = tokens.map(t => {
            return webpush.sendNotification(t.token, notificationPayload).catch(e => console.error("Error kirim:", e));
        });

        await Promise.all(sendPromises);

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });

    } catch (err: any) {
        return new Response(String(err?.message ?? err), { status: 500 });
    }
});