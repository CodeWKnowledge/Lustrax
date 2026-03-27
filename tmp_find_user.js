import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function findTestUser() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'testuser1@lustrax.com')
    .single()
  
  if (error) {
    console.error('Error finding test user:', error)
    // List all to be sure
    const { data: all } = await supabase.from('profiles').select('email, id')
    console.log('All profiles:', all)
  } else {
    console.log('Test user found:', data)
  }
}

findTestUser()
