// ─────────────────────────────────────────────────────────────────────────────
//  DIMI MONTHLY ANALYTICS REVIEW — 1st of each month, 2 PM CT
//  Netlify Scheduled Function
//
//  Scheduled via netlify.toml:
//    [functions."dimi-analytics"]
//      schedule = "0 19 1 * *"   ← 2 PM CT = 19:00 UTC (CDT)
//
//  Env vars required:
//    TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
//    EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY (optional)
//    OPENAI_API_KEY (optional — for AI analysis text)
// ─────────────────────────────────────────────────────────────────────────────

const ASHLEY_NUMBERS   = ['+14692009118', '+14693001412'];
const EMAILJS_SERVICE  = process.env.EMAILJS_SERVICE_ID  || 'service_kkp11nt';
const EMAILJS_TEMPLATE = process.env.EMAILJS_TEMPLATE_ID || 'template_nbiinbo';
const EMAILJS_KEY      = process.env.EMAILJS_PUBLIC_KEY  || 'KpF8LPtlgYmBZIRUW';
const TO_EMAIL         = 'ashleybutler322@gmail.com';

// ── Texas quarterly tax due dates ─────────────────────────────────────────────
const TAX_SCHEDULE = [
  { month: 3,  day: 20, quarter: 'Q1 (Jan–Mar)' },
  { month: 6,  day: 20, quarter: 'Q2 (Apr–Jun)' },
  { month: 9,  day: 20, quarter: 'Q3 (Jul–Sep)' },
  { month: 0,  day: 20, quarter: 'Q4 (Oct–Dec)' }, // next year
];

function getNextTaxDue(now) {
  for (const t of TAX_SCHEDULE) {
    const year = (t.month === 0 && now.getMonth() > 0) ? now.getFullYear() + 1 : now.getFullYear();
    const due  = new Date(year, t.month, t.day);
    if (due > now) {
      const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));
      return { quarter: t.quarter, due: due.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), diffDays };
    }
  }
  return null;
}

// ── Twilio SMS helper ─────────────────────────────────────────────────────────
async function sendSMS(to, body, sid, token, from) {
  const url    = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth   = Buffer.from(`${sid}:${token}`).toString('base64');
  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const resp   = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.message || `Twilio ${resp.status}`);
  return data;
}

// ── Send email via EmailJS REST ───────────────────────────────────────────────
async function sendEmail(content, monthYear) {
  const payload = {
    service_id:  EMAILJS_SERVICE,
    template_id: EMAILJS_TEMPLATE,
    user_id:     EMAILJS_KEY,
    template_params: {
      to_email:       TO_EMAIL,
      to_name:        'Ashley',
      order_number:   `ANALYTICS-${new Date().toISOString().slice(0,7)}`,
      order_items:    content,
      order_total:    'Monthly Review',
      payment_method: `Dimi's Monthly Analytics — ${monthYear}`,
      shipping_addr:  'Back Office → Analytics tab for full data',
      from_name:      'Dimi @ Dripping Secrets',
      reply_to:       'Assistant.Manager@DrippingSecrets.com'
    }
  };
  const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`EmailJS ${resp.status}: ${txt}`);
  }
  return true;
}

// ── Build monthly report text ─────────────────────────────────────────────────
async function buildReport(now) {
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'America/Chicago' });
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthName = prevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const nextTax = getNextTaxDue(now);

  let aiAnalysis = '';
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `You are Dimi — digital executive concierge for Dripping Secrets, a premium adult boutique for women run by Ashley Butler. It's the 1st of ${monthYear} and you're delivering your monthly analytics review email.

Write a friendly, professional monthly review message in first person with Millennial/Gen Y energy — natural use of phrases like "it's giving," "the math is mathing," "we're in our bag era," "understood the assignment" — not overdone, just Dimi's authentic voice. Include:
1. A warm opener addressing Ashley
2. A note to check the Analytics tab in Back Office for exact ${prevMonthName} numbers
3. 3 strategic suggestions for this month based on seasonal trends (June/summer 2026 context — adult boutique, women's audience, DFW metro)
4. A reminder to log any out-of-state purchases for Texas use tax this quarter
5. A note about roses being the bestselling category and to keep them stocked
6. Reminder to review any products with 0 sales in 30 days for potential removal
7. Sign off as Dimi

Keep it concise, warm, and actionable. First person only.`
          }],
          temperature: 0.75,
          max_tokens: 500
        })
      });
      const data = await resp.json();
      if (data.choices?.[0]?.message?.content) {
        aiAnalysis = data.choices[0].message.content;
      }
    } catch (err) {
      console.warn('[dimi-analytics] OpenAI error:', err.message);
    }
  }

  const taxSection = nextTax
    ? `\n📅 NEXT TAX DUE: ${nextTax.quarter} — ${nextTax.due} (${nextTax.diffDays} days away)\nFile at: webfile.cpa.texas.gov\n`
    : '';

  const report = aiAnalysis || `Good afternoon, Boss Lady! It's the 1st — time for your monthly review. 📊

Head to Back Office → Analytics tab for your ${prevMonthName} numbers: orders, revenue, and top products.

MY SUGGESTIONS FOR ${monthYear.toUpperCase()}:
1. 🌹 Keep roses fully stocked — they're your #1 seller every single month.
2. 📦 Review any product with 0 sales in the last 30 days — consider dropping or discounting.
3. 📱 This month: post at least 2 TikTok videos featuring unboxing or "which one should I get" style content.
4. 💌 Consider a loyalty email to customers who haven't ordered in 60+ days.

${taxSection}
Yours in secrets,
Dimi 💜
drippingsecrets.com/admin.html`;

  return { report, monthYear, taxSection };
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  console.log('[dimi-analytics] Firing monthly analytics review…');
  const now = new Date();
  const { report, monthYear } = await buildReport(now);

  const errors = [];

  // Send email
  try {
    await sendEmail(report, monthYear);
    console.log('[dimi-analytics] Email sent.');
  } catch (err) {
    console.error('[dimi-analytics] Email error:', err.message);
    errors.push(`email: ${err.message}`);
  }

  // Send SMS summary
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;

  if (sid && token && from) {
    const smsText = `📊 DIMI MONTHLY REVIEW — ${monthYear}\nCheck your email for the full report + strategic suggestions.\n🌹 Roses: keep stocked. Review zero-sale items. Full data in Back Office → Analytics.\n— Dimi 💜`;
    try {
      await Promise.allSettled(ASHLEY_NUMBERS.map(num => sendSMS(num, smsText, sid, token, from)));
      console.log('[dimi-analytics] SMS sent.');
    } catch (err) {
      console.error('[dimi-analytics] SMS error:', err.message);
      errors.push(`sms: ${err.message}`);
    }
  } else {
    console.warn('[dimi-analytics] Twilio not configured — SMS skipped.');
  }

  return { statusCode: 200, body: JSON.stringify({ success: errors.length === 0, errors }) };
};
