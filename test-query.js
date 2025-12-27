import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || 'https://ozlbjohbzaommmtbwues.supabase.co',
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testQuery() {
  const familyId = '0c72f1bb-bdb7-4d93-ac70-1c613e5dddc2';
  
  console.log('Test 1: Posts sans join');
  const { data: posts1, error: error1 } = await supabase
    .from('posts')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });
  
  console.log('Résultat:', posts1?.length || 0, 'posts');
  if (error1) console.log('Erreur:', error1.message);
  
  console.log('\nTest 2: Posts avec join via posts_author_id_fkey');
  const { data: posts2, error: error2 } = await supabase
    .from('posts')
    .select(`
      *,
      user_profiles!posts_author_id_fkey (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });
  
  console.log('Résultat:', posts2?.length || 0, 'posts');
  if (error2) console.log('Erreur:', error2.message);
  
  console.log('\nTest 3: Posts avec join simple (sans foreign key explicite)');
  const { data: posts3, error: error3 } = await supabase
    .from('posts')
    .select(`
      *,
      user_profiles (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });
  
  console.log('Résultat:', posts3?.length || 0, 'posts');
  if (error3) console.log('Erreur:', error3.message);
  
  console.log('\nDétails des posts trouvés:');
  if (posts1) {
    posts1.forEach(p => {
      console.log('  -', p.id.substring(0,8), '| content:', (p.content || '').substring(0,20) || '(vide)', '| image:', p.image_url ? 'OUI' : 'non');
    });
  }
}

testQuery();
