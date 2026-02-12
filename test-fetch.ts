// test-fetch.ts
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
    console.log("Checking Supabase Connection...")

    const { data: santri, count: santriCount, error: santriErr } = await supabase
        .from('santri')
        .select('*', { count: 'exact' })

    console.log("Santri Result:", { count: santriCount, error: santriErr })

    const { data: payments, error: payErr } = await supabase
        .from('payments')
        .select('*')

    console.log("Total Payments in DB:", payments?.length, payErr)

    const { data: grades, count: gradesCount, error: gradeErr } = await supabase
        .from('grades')
        .select('*', { count: 'exact' })

    console.log("Grades Result:", { count: gradesCount, error: gradeErr })

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const { data: monthlyPayments, error: monthErr } = await supabase
        .from('payments')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear)

    console.log(`Payments for ${currentMonth}/${currentYear}:`, monthlyPayments?.length, monthErr)
}

test()
