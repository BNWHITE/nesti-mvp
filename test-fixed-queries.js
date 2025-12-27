import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ozlbjohbzaommmtbwues.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bGJqb2hiemFvbW10Ynd1ZXMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MzU5MzYwNywiZXhwIjoxOTg5MTY5NjA3fQ.8QHXzFgXa8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFixedQueries() {
  console.log('🧪 Testing Fixed Database Queries\n');

  try {
    // Simulate a user ID (from the logs you showed)
    const testUserId = 'f0fd8dcd-ac0c-4e0d-a0e4-940d64eff945';

    console.log('=== TESTING USER PROFILE QUERY ===');
    // Test the fixed user_profiles query
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (profileError) {
      console.log('❌ Profile query failed:', profileError.message);
    } else {
      console.log('✅ Profile query successful:', profile);
    }

    console.log('\n=== TESTING USER DATA QUERY ===');
    // Test getting user data first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', testUserId)
      .single();

    if (userError) {
      console.log('❌ User data query failed:', userError.message);
    } else {
      console.log('✅ User data query successful:', userData);

      if (userData?.family_id) {
        console.log('\n=== TESTING FAMILY QUERY ===');
        // Test the fixed families query
        const { data: familyData, error: familyError } = await supabase
          .from('families')
          .select('*')
          .eq('id', userData.family_id)
          .single();

        if (familyError) {
          console.log('❌ Family query failed:', familyError.message);
        } else {
          console.log('✅ Family query successful:', familyData);
        }
      } else {
        console.log('ℹ️ User has no family_id');
      }
    }

    console.log('\n=== TESTING POSTS QUERY ===');
    // Test posts query (should work)
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (postsError) {
      console.log('❌ Posts query failed:', postsError.message);
    } else {
      console.log('✅ Posts query successful:', posts?.length, 'posts found');
    }

    console.log('\n🎉 All queries tested!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFixedQueries();