import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ozlbjohbzaommmtbwues.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bGJqb2hiemFvbW10Ynd1ZXMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MzU5MzYwNywiZXhwIjoxOTg5MTY5NjA3fQ.8QHXzFgXa8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('🔍 Inspecting Database Schema\n');

  try {
    // Inspect user_profiles table
    console.log('=== USER_PROFILES TABLE ===');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.log('❌ Error:', profilesError.message);
    } else if (profiles && profiles.length > 0) {
      console.log('Columns:', Object.keys(profiles[0]));
      console.log('Sample data:', profiles[0]);
    } else {
      console.log('No data in user_profiles');
    }

    // Inspect families table
    console.log('\n=== FAMILIES TABLE ===');
    const { data: families, error: familiesError } = await supabase
      .from('families')
      .select('*')
      .limit(1);

    if (familiesError) {
      console.log('❌ Error:', familiesError.message);
    } else if (families && families.length > 0) {
      console.log('Columns:', Object.keys(families[0]));
      console.log('Sample data:', families[0]);
    } else {
      console.log('No data in families');
    }

    // Inspect users table
    console.log('\n=== USERS TABLE ===');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.log('❌ Error:', usersError.message);
    } else if (users && users.length > 0) {
      console.log('Columns:', Object.keys(users[0]));
      console.log('Sample data:', users[0]);
    } else {
      console.log('No data in users');
    }

    // Test current user
    console.log('\n=== CURRENT USER ===');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.log('❌ Auth error:', userError.message);
    } else if (user) {
      console.log('✅ Authenticated as:', user.email);
      console.log('User ID:', user.id);

      // Try to find user profile with different column names
      console.log('\n=== TRYING DIFFERENT COLUMN NAMES ===');

      // Try with id instead of user_id
      const { data: profileById, error: profileByIdError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileByIdError && profileById) {
        console.log('✅ Found profile with id column:', profileById);
      } else {
        console.log('❌ No profile found with id column');
      }

      // Try families with id
      const { data: familyById, error: familyByIdError } = await supabase
        .from('families')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!familyByIdError && familyById) {
        console.log('✅ Found family with id column:', familyById);
      } else {
        console.log('❌ No family found with id column');
      }

    } else {
      console.log('❌ Not authenticated');
    }

  } catch (error) {
    console.error('❌ Inspection failed:', error);
  }
}

inspectSchema();