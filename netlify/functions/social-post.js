// social-post.js — DrippingSecrets 1-click social posting
// Handles: Facebook (feed + photo), Instagram (feed + reel), Twitter/X
// TikTok video posting = Dimi creates video, Ashley uploads manually

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method Not Allowed' };

  try {
    const {
      platform, content, token, pageId, igUserId,
      imageUrl, postType = 'feed'   // postType: 'feed' | 'reel' | 'story' | 'photo'
    } = JSON.parse(event.body || '{}');

    if (!platform || !content || !token) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields: platform, content, token' }) };
    }

    // ── FACEBOOK ──────────────────────────────────────────────
    if (platform === 'facebook') {
      if (!pageId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Facebook Page ID required' }) };

      // Photo post (with image)
      if (imageUrl && (postType === 'photo' || postType === 'feed')) {
        const r = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption: content, url: imageUrl, access_token: token })
        });
        const data = await r.json();
        if (data.id) return { statusCode: 200, headers, body: JSON.stringify({ success: true, postId: data.id, platform: 'facebook', type: 'photo' }) };
        return { statusCode: 400, headers, body: JSON.stringify({ error: data.error?.message || 'Facebook photo post failed' }) };
      }

      // Video / Reel post (with video URL)
      if (imageUrl && postType === 'reel') {
        const r = await fetch(`https://graph.facebook.com/v18.0/${pageId}/videos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: content, file_url: imageUrl, access_token: token })
        });
        const data = await r.json();
        if (data.id) return { statusCode: 200, headers, body: JSON.stringify({ success: true, postId: data.id, platform: 'facebook', type: 'reel' }) };
        return { statusCode: 400, headers, body: JSON.stringify({ error: data.error?.message || 'Facebook reel failed' }) };
      }

      // Text-only feed post
      const r = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, access_token: token })
      });
      const data = await r.json();
      if (data.id) return { statusCode: 200, headers, body: JSON.stringify({ success: true, postId: data.id, platform: 'facebook' }) };
      return { statusCode: 400, headers, body: JSON.stringify({ error: data.error?.message || 'Facebook post failed' }) };
    }

    // ── INSTAGRAM ─────────────────────────────────────────────
    if (platform === 'instagram') {
      if (!igUserId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Instagram User ID required' }) };

      const imgUrl = imageUrl || 'https://drippingsecrets.com/images/ds-og.jpg';

      // Reel upload (requires publicly accessible video URL)
      if (postType === 'reel' && imageUrl) {
        const mediaR = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_type: 'REELS', video_url: imageUrl, caption: content, share_to_feed: true, access_token: token })
        });
        const mediaData = await mediaR.json();
        if (!mediaData.id) return { statusCode: 400, headers, body: JSON.stringify({ error: mediaData.error?.message || 'IG Reel container failed' }) };

        // Poll for processing
        let ready = false;
        for (let i = 0; i < 12; i++) {
          await new Promise(r => setTimeout(r, 5000));
          const statusR = await fetch(`https://graph.facebook.com/v18.0/${mediaData.id}?fields=status_code&access_token=${token}`);
          const statusData = await statusR.json();
          if (statusData.status_code === 'FINISHED') { ready = true; break; }
          if (statusData.status_code === 'ERROR') break;
        }

        if (!ready) return { statusCode: 202, headers, body: JSON.stringify({ success: false, processing: true, containerId: mediaData.id, message: 'Reel still processing — check IG in 1 min' }) };

        const pubR = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media_publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: mediaData.id, access_token: token })
        });
        const pubData = await pubR.json();
        if (pubData.id) return { statusCode: 200, headers, body: JSON.stringify({ success: true, postId: pubData.id, platform: 'instagram', type: 'reel' }) };
        return { statusCode: 400, headers, body: JSON.stringify({ error: pubData.error?.message || 'IG Reel publish failed' }) };
      }

      // Story
      if (postType === 'story') {
        const mediaR = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_type: 'STORIES', image_url: imgUrl, access_token: token })
        });
        const mediaData = await mediaR.json();
        if (!mediaData.id) return { statusCode: 400, headers, body: JSON.stringify({ error: mediaData.error?.message || 'IG Story container failed' }) };

        const pubR = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media_publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: mediaData.id, access_token: token })
        });
        const pubData = await pubR.json();
        if (pubData.id) return { statusCode: 200, headers, body: JSON.stringify({ success: true, postId: pubData.id, platform: 'instagram', type: 'story' }) };
        return { statusCode: 400, headers, body: JSON.stringify({ error: pubData.error?.message || 'IG Story publish failed' }) };
      }

      // Feed (image required)
      const mediaR = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: content, image_url: imgUrl, access_token: token })
      });
      const mediaData = await mediaR.json();
      if (!mediaData.id) return { statusCode: 400, headers, body: JSON.stringify({ error: mediaData.error?.message || 'IG media container failed' }) };

      const pubR = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: mediaData.id, access_token: token })
      });
      const pubData = await pubR.json();
      if (pubData.id) return { statusCode: 200, headers, body: JSON.stringify({ success: true, postId: pubData.id, platform: 'instagram' }) };
      return { statusCode: 400, headers, body: JSON.stringify({ error: pubData.error?.message || 'IG publish failed' }) };
    }

    // ── TWITTER / X ───────────────────────────────────────────
    if (platform === 'twitter') {
      const body = { text: content.slice(0, 280) };
      const r = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      if (data.data?.id) return { statusCode: 200, headers, body: JSON.stringify({ success: true, postId: data.data.id, platform: 'twitter' }) };
      const errMsg = data.errors?.[0]?.message || data.detail || data.error || 'Tweet failed';
      return { statusCode: 400, headers, body: JSON.stringify({ error: errMsg }) };
    }

    // ── TIKTOK ────────────────────────────────────────────────
    if (platform === 'tiktok') {
      return { statusCode: 200, headers, body: JSON.stringify({
        success: false, tiktokCreator: true,
        message: 'TikTok video ready — download and post manually. Script + caption have been copied.'
      })};
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown platform: ' + platform }) };

  } catch (err) {
    console.error('[social-post] error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
