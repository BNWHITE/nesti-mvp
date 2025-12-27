import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ozlbjohbzaommmtbwues.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bGJqb2hiemFvbW10Ynd1ZXMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MzU5MzYwNywiZXhwIjoxOTg5MTY5NjA3fQ.8QHXzFgXa8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRelationships() {
  console.log('🧪 Testing Database Relationships\n');

  try {
    // Test 1: Posts with user_profiles join
    console.log('=== TEST 1: Posts with User Profiles ===');
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        user_profiles!inner(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .limit(3);

    if (postsError) {
      console.log('❌ Posts join failed:', postsError.message);
    } else {
      console.log('✅ Posts join successful!');
      console.log(`Found ${postsData.length} posts with user data`);
      if (postsData.length > 0) {
        console.log('Sample:', {
          post_id: postsData[0].id,
          content: postsData[0].content,
          author: postsData[0].user_profiles
        });
      }
    }

    // Test 2: Post reactions with user_profiles join
    console.log('\n=== TEST 2: Post Reactions with User Profiles ===');
    const { data: reactionsData, error: reactionsError } = await supabase
      .from('post_reactions')
      .select(`
        id,
        reaction_type,
        user_profiles!inner(
          id,
          first_name,
          avatar_url
        )
      `)
      .limit(3);

    if (reactionsError) {
      console.log('❌ Post reactions join failed:', reactionsError.message);
    } else {
      console.log('✅ Post reactions join successful!');
      console.log(`Found ${reactionsData.length} reactions with user data`);
    }

    // Test 3: Comments with user_profiles join
    console.log('\n=== TEST 3: Comments with User Profiles ===');
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        user_profiles!inner(
          id,
          first_name,
          avatar_url
        )
      `)
      .limit(3);

    if (commentsError) {
      console.log('❌ Comments join failed:', commentsError.message);
    } else {
      console.log('✅ Comments join successful!');
      console.log(`Found ${commentsData.length} comments with user data`);
    }

    // Test 4: Notifications with user_profiles join
    console.log('\n=== TEST 4: Notifications with User Profiles ===');
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        message,
        user_profiles!notifications_user_id_fkey(
          id,
          first_name
        )
      `)
      .limit(3);

    if (notificationsError) {
      console.log('❌ Notifications join failed:', notificationsError.message);
    } else {
      console.log('✅ Notifications join successful!');
      console.log(`Found ${notificationsData.length} notifications with user data`);
    }

    console.log('\n🎉 All relationship tests completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRelationships();