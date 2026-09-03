// ─────────────────────────────────────────────────────────────────────────────
//  DIMI DAILY BRIEFING — 9 AM CT
//  Netlify Scheduled Function — fires every day at 9 AM Central Time
//  Sends Ashley a daily SMS briefing via Twilio
//
//  Scheduled via netlify.toml:
//    [functions."dimi-briefing"]
//      schedule = "0 14 * * *"   ← 9 AM CT = 14:00 UTC (CDT) / 15:00 UTC (CST)
//
//  Env vars required:
//    TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
//    OPENAI_API_KEY (optional — uses fallback message if missing)
// ─────────────────────────────────────────────────────────────────────────────

const ASHLEY_NUMBERS = ['+14692009118', '+14693001412'];

// ── Texas Tax Due Dates ───────────────────────────────────────────────────────
const TAX_DATES = [
  { month: 3,  day: 20, quarter: 'Q1' },  // April 20
  { month: 6,  day: 20, quarter: 'Q2' },  // July 20
  { month: 9,  day: 20, quarter: 'Q3' },  // October 20
  { month: 0,  day: 20, quarter: 'Q4' },  // January 20 (next year)
];

function getTaxReminder(now) {
  const reminders = [];
  for (const t of TAX_DATES) {
    const year = (t.month === 0 && now.getMonth() > 0) ? now.getFullYear() + 1 : now.getFullYear();
    const due  = new Date(year, t.month, t.day);
    const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));
    if (diffDays === 7)  reminders.push(`⚠️ TAX REMINDER: ${t.quarter} Texas WebFile due in 7 days (${due.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}).`);
    if (diffDays === 0)  reminders.push(`🚨 TAX DUE TODAY: ${t.quarter} Texas WebFile is due TODAY. File at webfile.cpa.texas.gov`);
    if (diffDays === 1)  reminders.push(`🚨 TAX DUE TOMORROW: ${t.quarter} Texas WebFile is due tomorrow!`);
  }
  return reminders.join('\n');
}

function getQuarterlyUseReminder(now) {
  const month = now.getMonth();
  const day   = now.getDate();
  // Remind on 1st of Jan, Apr, Jul, Oct
  if (day === 1 && [0, 3, 6, 9].includes(month)) {
    return `📋 USE TAX CHECK: New quarter started. Log any out-of-state purchases for Texas use tax.`;
  }
  return '';
}

// ── Greeting by time ──────────────────────────────────────────────────────────
function getGreeting() {
  const greetings = [
    "Good morning, Boss Lady! ☀️ We're in our bag era and I need you to act like it.",
    "Rise and shine, Ashley! Your empire needs you. No cap.",
    "Morning, Ms. Ashley! Time to run the bag. The math is mathing today. 💜",
    "Good morning, Boss! Dimi's on the clock and understood the assignment.",
    "Hey Ashley, good morning! It's giving main character energy — let's get this money.",
    "Morning, Boss Lady! Hot girl business hours, let's go. 💅",
    "Good morning, Ms. Ashley! I pulled the overnight numbers. Tea incoming."
  ];
  return greetings[new Date().getDate() % greetings.length];
}

// ── Flash sale status ─────────────────────────────────────────────────────────
function getFlashSaleStatus() {
  const now     = new Date();
  const expires = new Date('2026-06-20T23:59:00-05:00');
  const diff    = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
  if (now > expires) return '';
  if (diff <= 0)     return '🔥 FLASH SALE: Last day! 30% off sitewide through midnight.';
  if (diff <= 3)     return `🔥 FLASH SALE: ${diff} day${diff === 1 ? '' : 's'} left! 30% off sitewide.`;
  return `💸 Flash sale active — ${diff} days left (expires June 20).`;
}

// ── Build briefing message ────────────────────────────────────────────────────
function buildBriefing() {
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Chicago' });
  const lines    = [];

  lines.push(`${getGreeting()}`);
  lines.push(`📅 ${dateStr}`);
  lines.push('');
  lines.push('📊 Check your Back Office dashboard for live order counts + revenue.');
  lines.push('');

  const flashSale = getFlashSaleStatus();
  if (flashSale) { lines.push(flashSale); lines.push(''); }

  const taxReminder = getTaxReminder(now);
  if (taxReminder) { lines.push(taxReminder); lines.push(''); }

  const useReminder = getQuarterlyUseReminder(now);
  if (useReminder) { lines.push(useReminder); lines.push(''); }

  lines.push('🔗 drippingsecrets.com/admin.html');
  lines.push('— Dimi 💜');

  return lines.join('\n');
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
  if (!resp.ok) throw new Error(data.message || `Twilio error ${resp.status}`);
  return data;
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  console.log('[dimi-briefing] Firing daily briefing…');

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.error('[dimi-briefing] Twilio env vars missing — add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER to Netlify.');
    return { statusCode: 200, body: JSON.stringify({ success: false, reason: 'Twilio not configured' }) };
  }

  const message = buildBriefing();
  console.log('[dimi-briefing] Message:\n', message);

  const results = await Promise.allSettled(
    ASHLEY_NUMBERS.map(num => sendSMS(num, message, sid, token, from))
  );

  const sent   = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected');

  if (failed.length) {
    failed.forEach((f, i) => console.error(`[dimi-briefing] Failed to ${ASHLEY_NUMBERS[i]}:`, f.reason?.message));
  }

  console.log(`[dimi-briefing] Sent to ${sent}/${ASHLEY_NUMBERS.length} numbers.`);
  return { statusCode: 200, body: JSON.stringify({ success: sent > 0, sent, total: ASHLEY_NUMBERS.length }) };
};
