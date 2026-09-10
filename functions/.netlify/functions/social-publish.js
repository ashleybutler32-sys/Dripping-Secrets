// ─────────────────────────────────────────────────────────────────────────────
//  DRIPPING SECRETS — SOCIAL PUBLISH  v1.0 (Cloudflare Pages Function)
//  Handles automated publishing to connected social platforms
//  After queue approval, Dimi routes posts through this function
//  Status: Scaffold — activates when platform OAuth tokens are connected
// ─────────────────────────────────────────────────────────────────────────────

export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers });
  }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  let body;
  try {
    const bodyText = await request.text();
    body = JSON.parse(bodyText || '{}');
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { platform, caption, image_url, token } = body;

  if (!platform || !token) {
    return new Response(JSON.stringify({ error: 'Missing platform or token', manual: true }), { status: 400, headers });
  }

  try {
    let result;
    switch (platform) {
      case 'instagram': result = await _publishInstagram(env, token, caption, image_url); break;
      case 'facebook':  result = await _publishFacebook(env, token, caption, image_url);  break;
      case 'tiktok':    result = await _publishTikTok(token, caption, image_url);    break;
      case 'x':         result = await _publishX(token, caption, image_url);         break;
      case 'pinterest': result = await _publishPinterest(env, token, caption, image_url); break;
      default:
        return new Response(JSON.stringify({ error: 'Unsupported platform', manual: true }), { status: 400, headers });
    }

    return new Response(JSON.stringify({ success: true, platform, post_url: result?.post_url || null, post_id: result?.post_id || null }), { status: 200, headers });

  } catch (err) {
    console.error(`Social publish error [${platform}]:`, err.message);
    return new Response(JSON.stringify({ success: false, manual: true, error: err.message, message: 'Auto-publish failed — falling back to manual posting.' }), { status: 200, headers });
  }
}

// ── Platform Handlers ─────────────────────────────────────────────────────────

async function _publishInstagram(env, token, caption, imageUrl) {
  // Instagram Graph API — requires Facebook Business + Instagram Business account
  // Step 1: Create media container; Step 2: Publish
  // Requires: ig_media_create + ig_publish_content permissions
  const igUserId = env.INSTAGRAM_USER_ID;
  if (!igUserId) throw new Error('INSTAGRAM_USER_ID env var not set');
  if (!imageUrl)  throw new Error('Image URL required for Instagram');

  // Create media container
  const containerRes = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: token })
  });
  const container = await containerRes.json();
  if (!container.id) throw new Error('Instagram container creation failed: ' + JSON.stringify(container));

  // Brief pause for media processing
  await new Promise(r => setTimeout(r, 3000));

  // Publish
  const publishRes = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: container.id, access_token: token })
  });
  const published = await publishRes.json();
  if (!published.id) throw new Error('Instagram publish failed: ' + JSON.stringify(published));

  return { post_id: published.id, post_url: `https://www.instagram.com/p/${published.id}/` };
}

async function _publishFacebook(env, token, caption, imageUrl) {
  // Facebook Graph API — post to page feed
  const pageId = env.FACEBOOK_PAGE_ID;
  if (!pageId) throw new Error('FACEBOOK_PAGE_ID env var not set');

  const body = imageUrl
    ? { message: caption, url: imageUrl, access_token: token }
    : { message: caption, access_token: token };

  const endpoint = imageUrl
    ? `https://graph.facebook.com/v18.0/${pageId}/photos`
    : `https://graph.facebook.com/v18.0/${pageId}/feed`;

  const res = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!data.id) throw new Error('Facebook publish failed: ' + JSON.stringify(data));
  return { post_id: data.id, post_url: `https://www.facebook.com/${pageId}/posts/${data.id}` };
}

async function _publishTikTok(token, caption, videoUrl) {
  // TikTok Content Posting API — requires content.publish scope
  // Note: TikTok requires VIDEO for standard posts. Image posts use TikTok Photo API (available to approved creators).
  if (!videoUrl) throw new Error('TikTok requires a video or image URL');
  const res = await fetch('https://open.tiktokapis.com/v2/post/publish/inbox/video/init/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      post_info: { title: caption.substring(0, 150), privacy_level: 'PUBLIC_TO_EVERYONE', disable_duet: false, disable_comment: false, disable_stitch: false },
      source_info: { source: 'FILE_UPLOAD', video_size: 0, chunk_size: 0, total_chunk_count: 1 }
    })
  });
  const data = await res.json();
  return { post_id: data.data?.publish_id, post_url: 'https://www.tiktok.com/@drippingsecretsbyashleyb' };
}

async function _publishX(token, caption, imageUrl) {
  // X (Twitter) API v2 — create tweet
  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ text: caption.substring(0, 280) })
  });
  const data = await res.json();
  if (!data.data?.id) throw new Error('X publish failed: ' + JSON.stringify(data));
  return { post_id: data.data.id, post_url: `https://x.com/DrippingSecrts/status/${data.data.id}` };
}

async function _publishPinterest(env, token, caption, imageUrl) {
  // Pinterest API v5 — create Pin
  if (!imageUrl) throw new Error('Pinterest requires an image URL');
  const boardId = env.PINTEREST_BOARD_ID;
  if (!boardId) throw new Error('PINTEREST_BOARD_ID env var not set');

  const res = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      board_id: boardId,
      media_source: { source_type: 'image_url', url: imageUrl },
      description: caption.substring(0, 500),
      link: 'https://drippingsecrets.com'
    })
  });
  const data = await res.json();
  if (!data.id) throw new Error('Pinterest publish failed: ' + JSON.stringify(data));
  return { post_id: data.id, post_url: `https://www.pinterest.com/pin/${data.id}/` };
}
