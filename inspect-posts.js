import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ozlbjohbzaommmtbwues.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bGJqb2hiemFvbW10Ynd1ZXMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MzU5MzYwNywiZXhwIjoxOTg5MTY5NjA3fQ.8QHXzFgXa8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectPostsTable() {
  console.log('🔍 Inspecting POSTS Table Schema\n');

  try {
    // Inspect posts table
    console.log('=== POSTS TABLE ===');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (postsError) {
      console.log('❌ Error:', postsError.message);
      console.log('❌ Details:', postsError.details);
      console.log('❌ Hint:', postsError.hint);
    } else if (posts && posts.length > 0) {
      console.log('✅ Columns:', Object.keys(posts[0]));
      console.log('✅ Sample data:', posts[0]);

      // Check if there's a user_id column
      if (posts[0].user_id) {
        console.log('✅ Has user_id column');
      } else {
        console.log('❌ Missing user_id column');
      }

      // Check if there's an author_id or similar
      const possibleUserColumns = Object.keys(posts[0]).filter(key =>
        key.includes('user') || key.includes('author') || key.includes('creator')
      );
      if (possibleUserColumns.length > 0) {
        console.log('ℹ️  Possible user-related columns:', possibleUserColumns);
      }

    } else {
      console.log('No data in posts table');
    }

    // Try to get posts with user info via join
    console.log('\n=== TESTING POSTS WITH USER JOIN ===');
    const { data: postsWithUsers, error: joinError } = await supabase
      .from('posts')
      .select(`
        *,
        user_profiles!inner(*)
      `)
      .limit(1);

    if (joinError) {
      console.log('❌ Join Error:', joinError.message);
      console.log('❌ This confirms the relationship issue!');
    } else {
      console.log('✅ Join successful');
      console.log('Sample joined data:', postsWithUsers?.[0]);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

inspectPostsTable();