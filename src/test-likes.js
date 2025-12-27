// src/test-likes.js - SCRIPT DE DIAGNOSTIC POUR LES LIKES
import { supabase, getCurrentUser, debugSession } from './lib/supabaseClient';

export async function testLikes() {
  console.log('🔍 DIAGNOSTIC LIKES - DÉBUT');

  try {
    // 1. Vérifier la session
    console.log('1️⃣ Vérification session...');
    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ Aucun utilisateur connecté');
      await debugSession();
      return false;
    }
    console.log('✅ Utilisateur connecté:', user.id);

    // 2. Tester la connexion à Supabase
    console.log('2️⃣ Test connexion Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur connexion Supabase:', testError);
      return false;
    }
    console.log('✅ Connexion Supabase OK');

    // 3. Vérifier les tables
    console.log('3️⃣ Vérification tables...');
    const tables = ['users', 'user_profiles', 'posts', 'post_reactions'];
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error(`❌ Table ${table} erreur:`, error);
        } else {
          console.log(`✅ Table ${table}: ${count} enregistrements`);
        }
      } catch (e) {
        console.error(`❌ Table ${table} exception:`, e);
      }
    }

    // 4. Tester un like factice
    console.log('4️⃣ Test like factice...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .limit(1);

    if (postsError) {
      console.error('❌ Erreur récupération posts:', postsError);
      return false;
    }

    if (posts && posts.length > 0) {
      const postId = posts[0].id;
      console.log('📝 Test like sur post:', postId);

      // Vérifier si déjà liké
      const { data: existingLike } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', 'like')
        .maybeSingle();

      if (existingLike) {
        console.log('➖ Like existe, suppression...');
        const { error: deleteError } = await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) {
          console.error('❌ Erreur suppression like:', deleteError);
        } else {
          console.log('✅ Like supprimé');
        }
      } else {
        console.log('➕ Like n\'existe pas, ajout...');
        const { error: insertError } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: 'like'
          });

        if (insertError) {
          console.error('❌ Erreur ajout like:', insertError);
        } else {
          console.log('✅ Like ajouté');
        }
      }
    } else {
      console.log('⚠️ Aucun post trouvé pour test');
    }

    console.log('🔍 DIAGNOSTIC LIKES - FIN');
    return true;

  } catch (error) {
    console.error('❌ Exception diagnostic:', error);
    return false;
  }
}

// Fonction pour lancer le diagnostic depuis la console
window.testLikes = testLikes;