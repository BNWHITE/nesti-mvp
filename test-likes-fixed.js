const { supabase } = require('../src/lib/supabaseClient');
const { toggleLike, getLikeCount, getUserLikesForPosts } = require('../src/services/likeService');

async function testLikesFunctionality() {
  console.log('🧪 Testing Likes Functionality with Posts Table\n');

  try {
    // Test 1: Check if posts table exists and has data
    console.log('1. Checking posts table...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, created_at')
      .limit(3);

    if (postsError) {
      console.log('❌ Posts table error:', postsError.message);
      return;
    }

    console.log(`✅ Found ${posts.length} posts`);
    if (posts.length > 0) {
      console.log('Sample posts:', posts.map(p => ({ id: p.id, content: p.content?.substring(0, 50) })));
    }

    // Test 2: Check if post_reactions table exists
    console.log('\n2. Checking post_reactions table...');
    const { data: reactions, error: reactionsError } = await supabase
      .from('post_reactions')
      .select('id, post_id, user_id, reaction_type')
      .limit(3);

    if (reactionsError) {
      console.log('❌ Post reactions table error:', reactionsError.message);
      return;
    }

    console.log(`✅ Found ${reactions.length} reactions`);
    if (reactions.length > 0) {
      console.log('Sample reactions:', reactions);
    }

    // Test 3: Try to get current user
    console.log('\n3. Testing user authentication...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('❌ No authenticated user - cannot test likes');
      console.log('Please login first in the app');
      return;
    }

    console.log(`✅ Authenticated as user: ${user.email}`);

    // Test 4: Test like functionality if we have posts
    if (posts.length > 0) {
      const testPostId = posts[0].id;
      console.log(`\n4. Testing like functionality on post ${testPostId}...`);

      // Get current like count
      const currentCount = await getLikeCount(testPostId);
      console.log(`Current likes: ${currentCount}`);

      // Toggle like
      console.log('Toggling like...');
      const toggleResult = await toggleLike(testPostId);
      console.log('Toggle result:', toggleResult);

      // Get new like count
      const newCount = await getLikeCount(testPostId);
      console.log(`New likes count: ${newCount}`);

      // Get user likes for posts
      const userLikes = await getUserLikesForPosts([testPostId]);
      console.log('User likes for this post:', userLikes);
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for console use
if (typeof window !== 'undefined') {
  window.testLikesFunctionality = testLikesFunctionality;
} else {
  // Run if called directly
  testLikesFunctionality();
}

module.exports = { testLikesFunctionality };