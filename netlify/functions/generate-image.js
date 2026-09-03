// generate-image.js — DALL-E 3 / gpt-image-1 image generation for Social Studio + DimiVideoGen
// Endpoint: POST /.netlify/functions/generate-image
// Body: { prompt, size?, quality? }
// Always returns base64 data URL to avoid CORS issues when drawing to canvas
// Tries dall-e-3 first; auto-falls back to gpt-image-1 if model unavailable

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
    const { prompt, size = '1024x1024', quality = 'standard' } = JSON.parse(event.body || '{}');
    if (!prompt) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing prompt' }) };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'OpenAI API key not configured. Add OPENAI_API_KEY to Netlify environment variables.' })
    };

    // gpt-image-1 uses slightly different size names
    function mapSize(model, requestedSize) {
      if (model !== 'gpt-image-1') return requestedSize;
      if (requestedSize === '1792x1024') return '1536x1024';
      if (requestedSize === '1024x1792') return '1024x1536';
      return '1024x1024';
    }

    // Fetch a remote image URL and convert to base64 data URL
    // This avoids CORS issues when drawing OpenAI CDN images onto canvas
    async function urlToBase64(imageUrl) {
      try {
        const r = await fetch(imageUrl);
        if (!r.ok) return null;
        const contentType = r.headers.get('content-type') || 'image/png';
        const arrayBuf = await r.arrayBuffer();
        const b64 = Buffer.from(arrayBuf).toString('base64');
        return `data:${contentType};base64,${b64}`;
      } catch (e) {
        console.error('[generate-image] urlToBase64 failed:', e.message);
        return null;
      }
    }

    // Try dall-e-3 first, then gpt-image-1 as fallback
    const modelsToTry = ['dall-e-3', 'gpt-image-1'];
    let lastError = 'Image generation failed';

    for (const model of modelsToTry) {
      const requestSize = mapSize(model, size);
      const reqBody = { model, prompt, n: 1, size: requestSize };
      // dall-e-3 supports quality; gpt-image-1 does NOT support response_format
      if (model === 'dall-e-3') reqBody.quality = quality;

      const resp = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(reqBody)
      });

      const data = await resp.json();

      // dall-e-3 returns a CDN URL — fetch it server-side to avoid canvas CORS blocks
      if (data.data?.[0]?.url) {
        console.log(`[generate-image] ${model} returned URL — converting to base64…`);
        const dataUrl = await urlToBase64(data.data[0].url);
        if (dataUrl) {
          return { statusCode: 200, headers, body: JSON.stringify({ success: true, url: dataUrl, model }) };
        }
        // If fetch failed, fall through and try next model
        console.warn('[generate-image] base64 conversion failed, trying next model…');
        lastError = 'Image URL conversion failed';
        continue;
      }

      // gpt-image-1 returns base64 directly
      if (data.data?.[0]?.b64_json) {
        console.log(`[generate-image] ${model} returned b64_json`);
        const dataUrl = `data:image/png;base64,${data.data[0].b64_json}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, url: dataUrl, model }) };
      }

      const errCode = data.error?.code;
      const errMsg = data.error?.message || 'Unknown error';

      // Model not available for this account — try next
      if (errCode === 'model_not_found' || resp.status === 404 || errMsg.toLowerCase().includes('does not exist')) {
        console.log(`[generate-image] ${model} not available, trying next…`);
        lastError = errMsg;
        continue;
      }

      // Non-model error (billing, rate limit, etc.) — no point trying next model
      let helpMsg = '';
      if (resp.status === 401) {
        helpMsg = ' → Check your OPENAI_API_KEY in Netlify env vars.';
      } else if (resp.status === 429) {
        helpMsg = ' → OpenAI rate limit or billing quota reached. Check platform.openai.com/billing.';
      } else if (errMsg.toLowerCase().includes('billing') || errMsg.toLowerCase().includes('quota')) {
        helpMsg = ' → Add a payment method at platform.openai.com/billing to enable image generation.';
      } else if (errMsg.toLowerCase().includes('content_policy') || errMsg.toLowerCase().includes('safety')) {
        helpMsg = ' → Prompt was flagged — try rephrasing (avoid explicit descriptors).';
      }

      console.error(`[generate-image] ${model} error ${resp.status}:`, errMsg);
      return { statusCode: 400, headers, body: JSON.stringify({ error: errMsg + helpMsg }) };
    }

    // All models exhausted
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: lastError + ' → Your OpenAI account may need billing enabled for image generation. Visit platform.openai.com/billing.'
      })
    };

  } catch (err) {
    console.error('[generate-image] Caught:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
