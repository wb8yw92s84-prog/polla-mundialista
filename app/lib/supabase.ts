import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xeejjvilagtjwfbupekx.supabase.co'
const supabaseKey = 'sb_publishable_t0M1b4XZ573_jM3sC7wdYw_qKWlCkaY'

export const supabase = createClient(supabaseUrl, supabaseKey)