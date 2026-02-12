// test-fetch.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("ERROR: Missing environment variables!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    console.log("--- Supabase Data Check ---");
    console.log("URL:", supabaseUrl);

    // Check Santri
    const { count: totalSantri, error: sErr1 } = await supabase.from('santri').select('*', { count: 'exact', head: true });
    const { count: activeSantri, error: sErr2 } = await supabase.from('santri').select('*', { count: 'exact', head: true }).eq('status', 'active');
    console.log("Santri:", { total: totalSantri, active: activeSantri, error: sErr1 || sErr2 });

    // Check Payments
    const { data: payAll, error: pErr1 } = await supabase.from('payments').select('*');
    console.log("Total Payments rows:", payAll ? payAll.length : 0, pErr1 || "");

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const { count: payMonth, error: pErr2 } = await supabase.from('payments').select('*', { count: 'exact', head: true })
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .eq('status', 'paid');
    console.log(`Payments (${currentMonth}/${currentYear}):`, payMonth, pErr2 || "");

    // Check Grades
    const { count: gradesCount, error: gErr } = await supabase.from('grades').select('*', { count: 'exact', head: true });
    console.log("Grades count:", gradesCount, gErr || "");

    // Check Profile
    const { data: profiles, error: prErr } = await supabase.from('profiles').select('*').limit(1);
    console.log("Profile check (Connectivity):", profiles ? "OK" : "FAILED", prErr || "");
}

test();
