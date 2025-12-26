import { supabase } from './lib/supabaseClient'

export async function testConnection() {
  console.log('🧪 Testing Supabase connection...')
  
  try {
    // Test 1: Authentication
    const { data: authData, error: authError } = await supabase.auth.getUser()
    console.log('🔐 Auth test:', { authData, authError })
    
    // Test 2: Database
    const { data: dbData, error: dbError } = await supabase
      .from('activities')
      .select('count')
      .limit(1)
    console.log('🗃️ DB test:', { dbData, dbError })
    
    return { authData, authError, dbData, dbError }
  } catch (error) {
    console.error('💥 Connection test failed:', error)
    return { error }
  }
}
