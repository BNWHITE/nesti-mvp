import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ozlbjohbzaommmtbwues.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bGJqb2hiemFvbW10Ynd1ZXMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MzU5MzYwNywiZXhwIjoxOTg5MTY5NjA3fQ.8QHXzFgXa8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickCheck() {
  console.log('🔍 Quick Database Check for Nesti\n');

  try {
    // Check tables
    console.log('=== TABLES ===');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_info')
      .select('*');

    if (tablesError) {
      console.log('❌ Cannot check tables via RPC, trying direct queries...');
    }

    // Check posts table
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, created_at')
      .limit(2);

    if (postsError) {
      console.log('❌ Posts table error:', postsError.message);
    } else {
      console.log(`✅ Posts table: ${posts.length} records found`);
      if (posts.length > 0) {
        console.log('Sample:', posts[0]);
      }
    }

    // Check post_reactions table
    const { data: reactions, error: reactionsError } = await supabase
      .from('post_reactions')
      .select('id, post_id, reaction_type')
      .limit(2);

    if (reactionsError) {
      console.log('❌ Post reactions table error:', reactionsError.message);
    } else {
      console.log(`✅ Post reactions table: ${reactions.length} records found`);
    }

    // Check user auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (user) {
      console.log(`✅ Authenticated as: ${user.email}`);
    } else {
      console.log('❌ Not authenticated');
    }

    console.log('\n🎯 Database check completed!');

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

quickCheck();