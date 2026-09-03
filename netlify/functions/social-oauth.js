// social-oauth.js — DrippingSecrets OAuth token exchange
// Handles: Meta (Facebook + Instagram), Twitter/X PKCE, TikTok
// Required Netlify env vars:
//   META_APP_ID, META_APP_SECRET
//   TWITTER_CLIENT_ID
//   TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': 'https://drippingsecrets.com',
    'Content-Type': 'application/json'
  };

  try {
    const { platform, code, redirectUri, codeVerifier } = JSON.parse(event.body || '{}');

    if (!platform || !code || !redirectUri) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing: platform, code, redirectUri' }) };
    }

    // ── META (Facebook + Instagram) ────────────────────────────────────────
    if (platform === 'facebook') {
      const appId = process.env.META_APP_ID;
      const appSecret = process.env.META_APP_SECRET;

      if (!appId || !appSecret) {
        return { statusCode: 400, headers, body: JSON.stringify({
          error: 'META_APP_ID and META_APP_SECRET must be set as Netlify environment variables'
        })};
      }

      // Exchange code → short-lived token
      const tokenR = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
      );
      const tokenData = await tokenR.json();

      if (!tokenData.access_token) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: tokenData.error?.message || 'Meta token exchange failed' }) };
      }

      // Exchange → long-lived token (60-day)
      const llR = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`
      );
      const llData = await llR.json();
      const longToken = llData.access_token || tokenData.access_token;

      // Get user's managed Pages (each page has its own long-lived token)
      const pagesR = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${longToken}&fields=id,name,access_token`);
      const pagesData = await pagesR.json();

      return {
        statusCode: 200, headers,
        body: JSON.stringify({ success: true, token: longToken, pages: pagesData.data || [] })
      };
    }

    // ── TWITTER / X (OAuth 2.0 PKCE) ──────────────────────────────────────
    if (platform === 'twitter') {
      const clientId = process.env.TWITTER_CLIENT_ID;

      if (!clientId) {
        return { statusCode: 400, headers, body: JSON.stringify({
          error: 'TWITTER_CLIENT_ID must be set as a Netlify environment variable'
        })};
      }

      const clientSecret = process.env.TWITTER_CLIENT_SECRET;

      const params = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier || ''
      });

      // Confidential client: add Basic auth with client_id:client_secret
      const twitterHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
      if (clientSecret) {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        twitterHeaders['Authorization'] = `Basic ${credentials}`;
      }

      const r = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: twitterHeaders,
        body: params.toString()
      });
      const data = await r.json();

      if (data.access_token) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, token: data.access_token }) };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: data.error_description || data.error || 'X auth failed' }) };
    }

    // ── TIKTOK ─────────────────────────────────────────────────────────────
    if (platform === 'tiktok') {
      const clientKey = process.env.TIKTOK_CLIENT_KEY;
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

      if (!clientKey || !clientSecret) {
        return { statusCode: 400, headers, body: JSON.stringify({
          error: 'TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET must be set as Netlify environment variables'
        })};
      }

      const params = new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      });

      const r = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
        body: params.toString()
      });
      const data = await r.json();

      if (data.access_token) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, token: data.access_token }) };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: data.message || data.error || 'TikTok auth failed' }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown platform: ' + platform }) };

  } catch (err) {
    console.error('[social-oauth] error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
