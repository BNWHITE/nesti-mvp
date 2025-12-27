import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ozlbjohbzaommmtbwues.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bGJqb2hiemFvbW10Ynd1ZXMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MzU5MzYwNywiZXhwIjoxOTg5MTY5NjA3fQ.8QHXzFgXa8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8WJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRelationshipFix() {
  console.log('🔧 Applying Relationship Fixes\n');

  try {
    // Read the SQL migration file
    const sqlFilePath = path.join(process.cwd(), 'database', 'fix_relationships.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL Migration Content:');
    console.log('=' .repeat(50));
    console.log(sqlContent);
    console.log('=' .repeat(50));

    // Split SQL into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`\n⚡ Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });

          if (error) {
            console.log(`❌ Error in statement ${i + 1}:`, error.message);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`❌ Exception in statement ${i + 1}:`, err.message);
          // Continue with other statements
        }
      }
    }

    console.log('\n🔍 Testing the fix...\n');

    // Test the relationship that was broken
    const { data: testData, error: testError } = await supabase
      .from('posts')
      .select(`
        *,
        user_profiles!inner(*)
      `)
      .limit(1);

    if (testError) {
      console.log('❌ Test failed:', testError.message);
      console.log('💡 The relationship fix may need to be applied manually in Supabase SQL Editor');
    } else {
      console.log('✅ Relationship fix successful!');
      console.log('Sample joined data:', testData?.[0]);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

applyRelationshipFix();