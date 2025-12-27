import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || 'https://ozlbjohbzaommmtbwues.supabase.co',
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testPostsStructure() {
  console.log('🧪 TEST: Vérification des posts avec la nouvelle structure\n');
  
  // Test 1: Récupérer les posts avec toutes les colonnes
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, content, image_url, video_url, has_photo, has_video, user_id, author_id, family_id')
    .limit(5);
  
  if (error) {
    console.log('❌ Erreur:', error.message);
    return;
  }
  
  console.log('✅ Structure des posts OK!');
  console.log('Posts trouvés:', posts.length);
  
  if (posts.length > 0) {
    console.log('\nExemple de post:');
    console.log(JSON.stringify(posts[0], null, 2));
  }
  
  // Test 2: Vérifier le join avec user_profiles
  console.log('\n🔗 Test du join avec user_profiles...');
  const { data: postsWithUser, error: joinError } = await supabase
    .from('posts')
    .select(`
      *,
      user_profiles (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .limit(1);
  
  if (joinError) {
    console.log('❌ Erreur join:', joinError.message);
  } else {
    console.log('✅ Join avec user_profiles OK!');
    if (postsWithUser && postsWithUser.length > 0) {
      console.log('Post avec auteur:', JSON.stringify(postsWithUser[0], null, 2));
    }
  }
  
  console.log('\n🎉 Tests terminés!');
}

testPostsStructure();
