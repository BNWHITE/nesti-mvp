import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || 'https://ozlbjohbzaommmtbwues.supabase.co',
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function debugPostCreation() {
  console.log('🔍 DEBUG: Vérification de la création des posts\n');
  
  // 1. Vérifier les posts existants
  console.log('=== POSTS EXISTANTS ===');
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, content, image_url, video_url, user_id, author_id, family_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (postsError) {
    console.log('❌ Erreur posts:', postsError.message);
  } else {
    console.log('Posts trouvés:', posts.length);
    posts.forEach((p, i) => {
      console.log(`\n${i+1}. Post ${p.id.substring(0,8)}...`);
      console.log(`   Content: ${p.content?.substring(0,50) || '(vide)'}...`);
      console.log(`   Image: ${p.image_url || 'null'}`);
      console.log(`   Video: ${p.video_url || 'null'}`);
      console.log(`   Created: ${p.created_at}`);
    });
  }
  
  // 2. Vérifier les utilisateurs dans users vs user_profiles
  console.log('\n\n=== UTILISATEURS ===');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, first_name, family_id')
    .limit(5);
  
  if (usersError) {
    console.log('❌ Erreur users:', usersError.message);
  } else {
    console.log('Users trouvés:', users.length);
    users.forEach(u => {
      console.log(`  - ${u.id.substring(0,8)}... | ${u.email} | family: ${u.family_id || 'null'}`);
    });
  }
  
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('id, first_name, family_id')
    .limit(5);
  
  if (profilesError) {
    console.log('❌ Erreur user_profiles:', profilesError.message);
  } else {
    console.log('\nUser_profiles trouvés:', profiles.length);
    profiles.forEach(p => {
      console.log(`  - ${p.id.substring(0,8)}... | ${p.first_name} | family: ${p.family_id || 'null'}`);
    });
  }
  
  // 3. Vérifier les familles
  console.log('\n\n=== FAMILLES ===');
  const { data: families, error: familiesError } = await supabase
    .from('families')
    .select('id, family_name')
    .limit(5);
  
  if (familiesError) {
    console.log('❌ Erreur families:', familiesError.message);
  } else {
    console.log('Families trouvées:', families.length);
    families.forEach(f => {
      console.log(`  - ${f.id.substring(0,8)}... | ${f.family_name}`);
    });
  }
  
  // 4. Vérifier les clés étrangères
  console.log('\n\n=== PROBLÈME POTENTIEL ===');
  console.log('La table posts a:');
  console.log('  - posts.user_id -> users(id) ✅');
  console.log('  - posts.author_id -> user_profiles(id) ✅');
  console.log('  - posts.family_id -> families(id) ✅');
  console.log('\nSi un utilisateur existe dans user_profiles mais pas dans users,');
  console.log('la création de post échouera à cause de la FK posts_user_id_fkey!');
  
  // 5. Comparer les IDs
  if (users && profiles) {
    const userIds = new Set(users.map(u => u.id));
    const profileIds = new Set(profiles.map(p => p.id));
    
    const inProfilesNotUsers = profiles.filter(p => !userIds.has(p.id));
    const inUsersNotProfiles = users.filter(u => !profileIds.has(u.id));
    
    if (inProfilesNotUsers.length > 0) {
      console.log('\n⚠️ Utilisateurs dans user_profiles mais PAS dans users:');
      inProfilesNotUsers.forEach(p => console.log(`  - ${p.id}`));
    }
    
    if (inUsersNotProfiles.length > 0) {
      console.log('\n⚠️ Utilisateurs dans users mais PAS dans user_profiles:');
      inUsersNotProfiles.forEach(u => console.log(`  - ${u.id}`));
    }
  }
}

debugPostCreation();
