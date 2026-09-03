/* ============================================================
   DRIPPING SECRETS — Wellness Hub JS  (v9.86)
   Firestore collection: wellness_content
   ============================================================ */

'use strict';

const DSWellness = (() => {
  /* ── State ─────────────────────────────────────────────── */
  let db = null;
  let currentUser = null;
  let allContent = [];
  let favorites = [];
  let activeCategory = 'all';
  let articleTarget = null;

  /* ── Init ──────────────────────────────────────────────── */
  async function init() {
    // Render built-in content immediately — never block on Firestore
    allContent = getSampleContent();
    renderGrid(allContent);
    renderSeries();
    bindCategories();
    bindSearch();

    if (!window.firebase) return;
    db = firebase.firestore();
    firebase.auth().onAuthStateChanged(async u => {
      currentUser = u;
      if (u) await loadFavorites();
    });

    // Try to enrich with Firestore data in background (5 s timeout)
    try {
      const snap = await Promise.race([
        db.collection('wellness_content')
          .where('status', '==', 'published')
          .orderBy('publishedAt', 'desc')
          .limit(50)
          .get(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
      ]);
      const live = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (live.length > 0) {
        allContent = live;
        renderGrid(filterContent());
      }
    } catch (_) { /* keep sample content already rendered */ }
  }

  /* ── Firestore (background refresh only) ──────────────── */
  async function loadContent() {
    // Legacy call kept for compatibility — logic now lives in init()
  }

  async function loadFavorites() {
    if (!currentUser) return;
    try {
      const snap = await db.collection('users').doc(currentUser.uid)
        .collection('saved_content').get();
      favorites = snap.docs.map(d => d.id);
      renderFavIndicators();
    } catch (e) { favorites = []; }
  }

  async function toggleFavorite(id) {
    if (!currentUser) { alert('Sign in to save content.'); return; }
    try {
      const ref = db.collection('users').doc(currentUser.uid).collection('saved_content').doc(id);
      if (favorites.includes(id)) {
        await ref.delete();
        favorites = favorites.filter(f => f !== id);
      } else {
        await ref.set({ savedAt: firebase.firestore.FieldValue.serverTimestamp() });
        favorites.push(id);
      }
      renderFavIndicators();
    } catch (e) { console.error('Favorite toggle error:', e); }
  }

  function renderFavIndicators() {
    document.querySelectorAll('.wl-save-btn').forEach(btn => {
      const id = btn.dataset.id;
      btn.classList.toggle('saved', favorites.includes(id));
      btn.setAttribute('aria-pressed', favorites.includes(id) ? 'true' : 'false');
    });
  }

  function getSampleContent() {
    return [
      { id: 'wl1', title: '7 Self-Care Rituals That Actually Work', category: 'selfcare', type: 'article',
        excerpt: 'Transform your evening routine with these evidence-based practices that nourish mind, body, and connection.',
        icon: '🌙', readTime: '5 min', tags: ['routine','selfcare','evening'], featured: true,
        body: `<h1>7 Self-Care Rituals That Actually Work</h1><p>Real self-care isn't a face mask once a month — it's a consistent practice that honors your body and mind. Here are seven rituals our community swears by.</p><h2>1. The 10-Minute Body Scan</h2><p>Before sleep, lie still and mentally visit each part of your body — releasing tension as you go. This mindfulness technique reduces anxiety and improves sleep quality dramatically.</p><h2>2. Sensory Reset Baths</h2><p>A bath isn't just cleaning — it's a ritual. Add Epsom salts, dim the lights, and give yourself 20 uninterrupted minutes. The magnesium alone improves muscle recovery and mood.</p><h2>3. Journal Without Judgment</h2><p>Three pages, stream of consciousness, every morning. Don't re-read it. This practice clears mental clutter and helps you process emotions before the day begins.</p><h2>4. Pleasure as Medicine</h2><p>Research confirms that pleasure — in all its forms — reduces cortisol, boosts oxytocin, and strengthens immune function. Prioritizing what feels good is not selfish; it's science.</p><h2>5. Move Your Body Daily</h2><p>It doesn't have to be a gym session. A 20-minute walk, a dance in your kitchen, or a stretching routine counts. Movement is non-negotiable for mental health.</p><h2>6. Curate Your Inputs</h2><p>What you consume — content, conversations, food — shapes your nervous system. Audit your social media and news intake regularly.</p><h2>7. Connection as Healing</h2><p>Intimacy — emotional and physical — is one of the most powerful wellness tools available to you. Don't minimize its importance in your overall health picture.</p>` },
      { id: 'wl2', title: 'Communication Guides for Couples', category: 'couples', type: 'guide',
        excerpt: 'Practical scripts and techniques for deeper, more honest conversations about intimacy and connection.',
        icon: '💬', readTime: '8 min', tags: ['communication','couples','intimacy'],
        body: `<h1>Communication Guides for Couples</h1><p>The number one predictor of long-term relationship satisfaction isn't compatibility — it's communication quality. Here's how to build that skill together.</p><h2>The 3-Part Check-In</h2><p>Once a week, sit together and each person answers: (1) What am I feeling? (2) What do I need? (3) What do I appreciate about you? This simple practice builds emotional fluency.</p><h2>Desire Mapping</h2><p>Use index cards. Each person writes desires, fantasies, and things they're curious about — without judgment. Trade cards and discuss one at a time. This removes the vulnerability of real-time rejection.</p><h2>The Yes/No/Maybe List</h2><p>A classic tool for sexual communication — independently fill out a list of activities as Yes, No, or Maybe. Compare lists and only pursue overlapping Yeses. Maybes become ongoing conversations.</p>` },
      { id: 'wl3', title: 'Beginner\'s Guide to Sensual Wellness', category: 'education', type: 'guide',
        excerpt: 'A shame-free introduction to understanding your body, pleasure, and the products designed to support your journey.',
        icon: '🌸', readTime: '10 min', tags: ['beginner','education','wellness'],
        body: `<h1>Beginner's Guide to Sensual Wellness</h1><p>There is no such thing as "too late" to begin exploring your own pleasure. This guide meets you exactly where you are — with zero judgment and complete respect for your boundaries.</p><h2>Why This Matters</h2><p>Sensual wellness is a legitimate component of overall health. Research in sexual health consistently shows that positive intimate experiences correlate with reduced anxiety, better sleep, and stronger immune function.</p><h2>Start With Education</h2><p>Before purchasing anything, educate yourself on anatomy, body-safe materials, and what different categories of products do. Knowledge removes mystery — and mystery is often where shame hides.</p><h2>Choosing Your First Product</h2><p>Start simple. A quality body-safe vibrator or a luxurious massage oil is an excellent first step. Look for body-safe materials: silicone, stainless steel, borosilicate glass. Avoid porous materials.</p>` },
      { id: 'wl4', title: 'Building Your Intimacy Practice', category: 'relationships', type: 'article',
        excerpt: 'Intimacy isn\'t spontaneous — it\'s cultivated. Learn how to intentionally build deeper connection.',
        icon: '✨', readTime: '6 min', tags: ['intimacy','relationships','practice'],
        body: `<h1>Building Your Intimacy Practice</h1><p>The most satisfying relationships aren't the ones where things "just happen." They're the ones where both people show up intentionally, consistently, and curiously.</p><h2>Presence Before Everything</h2><p>You cannot be intimate with someone you're not fully present with. That means phones down, distractions minimized, and genuine attention given. This is harder than it sounds in 2026 — and more valuable than ever.</p><h2>Curiosity as a Practice</h2><p>Assume you don't fully know your partner, and remain curious. Ask new questions. Explore new experiences together. Long-term relationships thrive on novelty — but novelty requires intentional pursuit.</p>` },
      { id: 'wl5', title: 'Solo Pleasure: A Complete Guide', category: 'selfcare', type: 'guide',
        excerpt: 'Your relationship with yourself is the foundation of all other intimacy. Here\'s how to nurture it.',
        icon: '🪷', readTime: '7 min', tags: ['solo','selfcare','education'],
        body: `<h1>Solo Pleasure: A Complete Guide</h1><p>Self-intimacy is not a consolation prize — it is a primary relationship. How you relate to your own body shapes every other intimate experience you'll have.</p><h2>Reframe the Narrative</h2><p>Cultural messaging around solo pleasure has historically been shame-laden. The research tells a different story: regular self-exploration improves body image, reduces stress, and leads to better communication with partners about desires.</p><h2>Create the Environment</h2><p>You deserve the same care you'd give a date. Create an environment that feels safe, comfortable, and pleasurable — lighting, scents, temperature, music. These sensory cues signal your nervous system to relax.</p>` },
      { id: 'wl6', title: 'Hormones, Mood & Desire', category: 'education', type: 'article',
        excerpt: 'Understanding the hormonal cycles that shape your desire — and how to work with your body, not against it.',
        icon: '🔬', readTime: '9 min', tags: ['hormones','health','education'],
        body: `<h1>Hormones, Mood & Desire</h1><p>Your desire doesn't exist in a vacuum — it's deeply tied to the hormonal rhythms of your body. Understanding these rhythms is one of the most powerful things you can do for your intimate life.</p><h2>The Monthly Cycle & Desire</h2><p>Estrogen peaks around ovulation, typically creating a natural window of heightened desire and energy. Progesterone in the luteal phase often brings introspection and a desire for emotional connection over physical intensity. Neither is wrong — both deserve honoring.</p><h2>Testosterone & Libido</h2><p>Often thought of as a "male hormone," testosterone plays a crucial role in libido for all bodies. Chronic stress, poor sleep, and nutrient deficiency can all suppress it. Supporting testosterone naturally — through strength training, quality sleep, and stress reduction — can have a meaningful impact on desire levels.</p><h2>Cortisol: The Libido Killer</h2><p>Cortisol, your primary stress hormone, directly suppresses sex hormones when chronically elevated. If you feel like you "should" want intimacy but just can't access it, chronic stress may be the culprit. Prioritizing rest, nervous system regulation, and cortisol-lowering activities isn't optional — it's foundational.</p><h2>Working With Your Body</h2><p>Rather than fighting your natural cycles, try tracking them. Note your energy, mood, and desire across 30 days. Patterns will emerge. You can then plan your intimate life — and your self-care — to align with your body's natural rhythms rather than against them.</p>` },
      { id: 'wl7', title: 'The Art of Slow Intimacy', category: 'relationships', type: 'article',
        excerpt: 'In a world that rewards speed, slowing down in your intimate life is a radical and transformative act.',
        icon: '🕯️', readTime: '7 min', tags: ['intimacy','mindfulness','couples'],
        body: `<h1>The Art of Slow Intimacy</h1><p>Everything in modern life is optimized for speed. Slow intimacy is the antidote — a deliberate, present, unhurried approach to connection that transforms both the quality and depth of intimate experience.</p><h2>Why Slowing Down Changes Everything</h2><p>The nervous system cannot access deep pleasure when it is in fight-or-flight mode. Slowing down — breathing deeply, extending foreplay, removing time pressure — signals safety to your body. Safety is where real pleasure lives.</p><h2>The 20-Minute Rule</h2><p>Research on female arousal shows that many bodies require at least 20 minutes of sustained attention before reaching optimal arousal. This isn't a problem to solve — it's a feature to work with. Give yourselves time.</p><h2>Practicing Sensate Focus</h2><p>Developed by Masters and Johnson, sensate focus is a practice where touch is purely exploratory — no performance, no goals, no orgasm required. Partners take turns giving and receiving touch with full attention. Many couples report this is the single most impactful intimacy practice they've ever done.</p><h2>Incorporating Slow Intimacy Daily</h2><p>You don't need hours. A genuine 5-minute hug, eye contact held for 30 seconds, or a mindful massage can build the slow-intimacy habit incrementally. It's a practice — not a destination.</p>` },
      { id: 'wl8', title: 'Body Acceptance & Pleasure', category: 'selfcare', type: 'article',
        excerpt: 'You cannot fully experience pleasure in a body you are at war with. Here is how to build peace.',
        icon: '🌺', readTime: '8 min', tags: ['bodyimage','selfcare','confidence'], featured: true,
        body: `<h1>Body Acceptance & Pleasure</h1><p>One of the most significant barriers to pleasure is not a product, a partner, or a technique — it is the relationship you have with your own body. Body shame is a pleasure thief, and it's time to reclaim what it has taken.</p><h2>The Research Is Clear</h2><p>Studies consistently show that positive body image is one of the strongest predictors of sexual satisfaction. This holds across ages, sizes, and relationship types. How you feel about your body matters more than what your body looks like.</p><h2>Moving From Shame to Appreciation</h2><p>Start with function, not form. Your body keeps you alive, processes experience, creates sensation, and deserves gratitude for what it does — not criticism for what it looks like. Begin practicing appreciation for capability before aesthetics.</p><h2>The Mirror Practice</h2><p>Stand in front of a mirror and say one kind thing to your body every day. It will feel ridiculous at first. Do it anyway. After 30 days, something shifts. This practice has research behind it — it rewires neural pathways over time.</p><h2>Pleasure as a Path to Acceptance</h2><p>Here's the counterintuitive truth: pursuing pleasure — not waiting until you feel "good enough" — is one of the fastest paths to body acceptance. When your body becomes a source of joy rather than just appearance, your relationship with it transforms.</p>` },
      { id: 'wl9', title: 'Lubrication 101: Why It Matters & How to Choose', category: 'education', type: 'guide',
        excerpt: 'Everything you should know about lubrication — the science, the options, and the common mistakes to avoid.',
        icon: '💧', readTime: '6 min', tags: ['education','products','health'],
        body: `<h1>Lubrication 101: Why It Matters & How to Choose</h1><p>Lubrication is one of the most impactful and underappreciated wellness tools in intimate life. Here is what you need to know.</p><h2>Why Natural Lubrication Varies</h2><p>Natural lubrication is influenced by hormone levels, hydration, arousal time, medications, stress, and cycle phase. Variation is completely normal — and supplementing with a quality lubricant is never a sign that something is "wrong." It is simply good self-care.</p><h2>Water-Based Lubricants</h2><p>Safe with all toys and most condoms. Easy to clean. The most versatile choice for most people. Look for formulas free from glycerin (can disrupt vaginal pH) and parabens. Our recommendation: keep it simple and pH-balanced.</p><h2>Silicone-Based Lubricants</h2><p>Longer lasting than water-based. Excellent for water play. Important note: do not use with silicone toys — it can degrade the material over time. Ideal for external use and with glass or stainless steel.</p><h2>Oil-Based Lubricants</h2><p>Long-lasting and excellent for massage, but not condom-compatible and can alter vaginal microbiome if used internally. Best reserved for external massage and non-penetrative intimacy.</p><h2>What to Avoid</h2><ul><li>Warming lubricants with benzocaine or lidocaine — they mask sensation signals your body needs</li><li>Flavored lubricants with sugar — disrupt vaginal pH</li><li>Petroleum-based products (Vaseline) — not designed for intimate use</li></ul>` },
      { id: 'wl10', title: 'Creating a Sensory Sanctuary at Home', category: 'selfcare', type: 'guide',
        excerpt: 'Your environment is a wellness tool. Learn how to design spaces that support relaxation, pleasure, and presence.',
        icon: '🏡', readTime: '7 min', tags: ['environment','selfcare','ritual'],
        body: `<h1>Creating a Sensory Sanctuary at Home</h1><p>You don't need a luxury spa — you need intentionality. The right environment signals your nervous system to relax, open, and receive pleasure. Here's how to create it.</p><h2>Lighting Is Everything</h2><p>Harsh overhead lighting activates the analytical mind and suppresses the sensory body. Swap to warm bulbs, salt lamps, or candles for intimate spaces. Dimmer switches are one of the highest-return investments in your home environment.</p><h2>Scent as a Mood Signal</h2><p>Smell is the only sense with a direct pathway to the limbic system — your emotional brain. Establish scent associations: light the same candle every time you want to relax deeply. Over time, the scent alone triggers the state.</p><h2>Temperature & Texture</h2><p>Your environment's physical comfort directly affects your body's capacity for pleasure. Soft sheets, warm towels, a bath at the right temperature — these are not luxuries. They are physiological tools.</p><h2>Sound & Silence</h2><p>Create a playlist specifically for relaxation and intimacy. Consider binaural beats or nature sounds for solo wellness practices. For intimate times with a partner, music that sets a shared mood can ease self-consciousness and signal intention.</p><h2>The Phone Rule</h2><p>Nothing disrupts a sanctuary faster than a notification. Your wellness time deserves a phone-free boundary. Even 30 minutes makes a difference.</p>` },
      { id: 'wl11', title: 'Desire Discrepancy in Relationships', category: 'couples', type: 'guide',
        excerpt: 'Mismatched desire is the most common relationship challenge — and the most solvable with the right tools.',
        icon: '⚖️', readTime: '9 min', tags: ['couples','communication','relationships'],
        body: `<h1>Desire Discrepancy in Relationships</h1><p>If you and your partner have different levels of sexual desire, you are not broken — you are statistically normal. Desire discrepancy affects the majority of long-term couples at some point. The issue is not the discrepancy itself; it's whether you have the tools to navigate it with compassion.</p><h2>Understanding Two Types of Desire</h2><p><strong>Spontaneous desire</strong> arises seemingly from nowhere — you're just in the mood. <strong>Responsive desire</strong> emerges in response to stimulus — you're not in the mood until something initiates it. Most people lean one way, and neither is superior. The mismatch often comes from a spontaneous-desiring partner waiting for their responsive-desiring partner to "want it first."</p><h2>The Solution: Responsive Desire First</h2><p>If you're the responsive partner, experiment with agreeing to begin — not to have sex necessarily, but to begin engaging — even when not initially in the mood. For many responsive-desire bodies, arousal follows engagement. This requires mutual understanding and pressure-free framing.</p><h2>When to Seek Support</h2><p>If desire discrepancy is creating persistent distress, conflict, or disconnection, a sex-positive therapist or couples counselor is a powerful resource. This is not a failure — it is wisdom. The couples who thrive are the ones who ask for help when they need it.</p>` },
      { id: 'wl12', title: 'Mindful Masturbation: A Wellness Practice', category: 'selfcare', type: 'article',
        excerpt: 'Reframe solo intimacy as a legitimate mindfulness and wellness practice backed by real science.',
        icon: '🧘', readTime: '6 min', tags: ['solo','mindfulness','wellness'],
        body: `<h1>Mindful Masturbation: A Wellness Practice</h1><p>Solo intimacy is one of the most common human experiences, yet it remains clouded by shame, secrecy, and disconnection. Bringing mindfulness to this practice transforms it from a habitual release into a genuine act of self-care and body knowledge.</p><h2>What Mindfulness Adds</h2><p>Most people approach solo intimacy in autopilot — rushing toward a goal. Mindfulness invites you to slow down, notice sensation, breathe, and be present in your body rather than lost in fantasy or distraction. The result is qualitatively different.</p><h2>The Practice</h2><p>Begin with a few deep breaths. Set a timer if needed — at least 15 minutes. Start with non-genital touch. Explore sensation without goal. When the mind wanders (it will), return to physical sensation. Treat each moment of return as the practice, not the wandering as a failure.</p><h2>The Benefits</h2><ul><li>Increased body literacy — you learn what you actually like</li><li>Better communication with partners — you can articulate your desires clearly</li><li>Reduced anxiety and improved mood via endorphin release</li><li>Better orgasm quality through practiced attention</li></ul>` },
      { id: 'wl13', title: 'After Trauma: Reclaiming Your Sensual Self', category: 'education', type: 'article',
        excerpt: 'Healing your intimate life after difficult experiences is possible. Here is a compassionate guide to beginning.',
        icon: '🌱', readTime: '11 min', tags: ['healing','trauma','wellness'],
        body: `<h1>After Trauma: Reclaiming Your Sensual Self</h1><p>This article is written with deep respect for anyone navigating intimacy after difficult experiences. There is no timeline for healing, no "right way" to reclaim your sensual self, and nothing wrong with exactly where you are right now.</p><h2>Understanding the Body's Response to Trauma</h2><p>Trauma is stored in the body as much as in memory. Hypervigilance, dissociation, numbness, or triggering in intimate moments are not signs of weakness — they are the nervous system's survival mechanisms doing their job. Healing begins with understanding, not forcing through.</p><h2>Safety Before Pleasure</h2><p>No genuine pleasure is possible without felt safety. Before working on intimacy, invest in nervous system regulation: somatic therapy, breathwork, therapy with a trauma-informed practitioner. These are not optional extras — they are foundations.</p><h2>Gradual Re-Engagement</h2><p>Reclaiming your sensual self is a gradual process. Start with non-sexual touch that feels safe: self-massage, baths, skin care rituals. Expand only as your body signals readiness — not as your mind thinks you "should" be ready.</p><h2>A Note on Professional Support</h2><p>EMDR therapy, somatic experiencing, and sex-positive therapy have strong evidence bases for supporting recovery. If this resonates with your experience, professional support is not weakness — it is the most powerful tool available. You deserve it.</p>` },
      { id: 'wl14', title: 'Menopause & Midlife Sensuality', category: 'education', type: 'article',
        excerpt: 'Menopause changes the intimate landscape — but it doesn\'t diminish your capacity for pleasure. In many ways, it expands it.',
        icon: '🔥', readTime: '8 min', tags: ['menopause','health','education','midlife'],
        body: `<h1>Menopause & Midlife Sensuality</h1><p>The cultural narrative around menopause and sexuality is almost entirely wrong. The story that women become less sexual after menopause is a myth perpetuated by ageism, not biology. Many women report their most fulfilling intimate lives in their 50s, 60s, and beyond.</p><h2>What Actually Changes</h2><p>Estrogen decline brings real physical shifts: vaginal tissue changes, natural lubrication decreases, arousal may take longer. These are real and they deserve acknowledgment — and they are all manageable with the right information and products.</p><h2>What Doesn't Change</h2><p>Your capacity for pleasure doesn't diminish with age — it often deepens with experience, self-knowledge, and the removal of performance anxiety. Many women report the best orgasms of their lives post-menopause.</p><h2>Practical Support</h2><ul><li><strong>Lubrication</strong> — becomes more important, not an indulgence</li><li><strong>Vaginal moisturizers</strong> — non-hormonal options that maintain tissue health</li><li><strong>Vibration</strong> — increased vibratory stimulation often increases blood flow and arousal; many menopausal women find vibrators more useful than ever</li><li><strong>Communication</strong> — with partners and healthcare providers; advocate for your pleasure unapologetically</li></ul>` },
      { id: 'wl15', title: 'Pleasure During Pregnancy & Postpartum', category: 'education', type: 'guide',
        excerpt: 'Your intimate life doesn\'t stop when life changes. A compassionate guide to pleasure across the full spectrum of the reproductive journey.',
        icon: '🤱', readTime: '9 min', tags: ['pregnancy','postpartum','health','education'],
        body: `<h1>Pleasure During Pregnancy & Postpartum</h1><p>Pregnancy and postpartum represent one of the most significant physiological shifts a body can experience — and yet open conversation about intimacy during these periods remains rare. Let's change that.</p><h2>During Pregnancy</h2><p>For most uncomplicated pregnancies, sexual activity is safe throughout all trimesters. Desire fluctuates enormously — and unpredictably — during pregnancy. Increased blood flow in the second trimester often creates heightened sensitivity and desire. First and third trimesters often bring fatigue and discomfort that suppresses desire. All of this is normal.</p><h2>Positions & Comfort</h2><p>As pregnancy progresses, certain positions become uncomfortable or inadvisable. Side-lying, rear-entry, and woman-on-top positions are generally more comfortable as belly size increases. Avoid positions requiring prolonged lying flat on the back after the first trimester.</p><h2>The Postpartum Landscape</h2><p>The postpartum body has been through an extraordinary experience. Healing takes time — typically a minimum of 6 weeks before intercourse is medically cleared, and often much longer before desire returns. This is physiologically normal and not cause for alarm.</p><h2>Rebuilding After Birth</h2><p>Pelvic floor physical therapy is one of the highest-impact investments in postpartum intimate health. Lubrication is essential (estrogen suppression during breastfeeding often creates significant dryness). Communication with your partner about the timeline is crucial. Pleasure will return — give your body the grace it deserves.</p>` },

      { id: 'wl16', title: 'Your Menstrual Cycle & Intimacy', category: 'health', type: 'guide',
        excerpt: 'Understanding the four phases of your cycle — and how desire, energy, and pleasure shift through each one.',
        icon: '🌑', readTime: '9 min', tags: ['menstrual','cycle','health','education'], featured: true,
        body: `<h1>Your Menstrual Cycle & Intimacy</h1><p>Your cycle is not an inconvenience — it is a sophisticated four-phase hormonal rhythm that shapes your energy, mood, creativity, and desire every single month. When you understand it, you stop fighting your body and start working with it.</p><h2>Phase 1: Menstrual (Days 1–5)</h2><p>Estrogen and progesterone are at their lowest. Energy tends to be inward, reflective, and quiet. Many people experience reduced desire during this phase — this is completely normal and doesn't require fixing. For those who do feel desire during menstruation, orgasms can actually reduce cramping by releasing oxytocin and relaxing uterine muscles. Period discs or soft cups can make intimacy more comfortable if you choose to engage.</p><h2>Phase 2: Follicular (Days 6–13)</h2><p>Estrogen begins rising, bringing increased energy, creativity, and optimism. Desire often starts to climb. This is a great phase for exploration, trying something new in the bedroom, and initiating intimacy.</p><h2>Phase 3: Ovulatory (Days 14–16)</h2><p>Estrogen peaks and testosterone spikes — many people experience their highest desire of the month during this window. Confidence, charisma, and libido are all elevated. The body is biologically primed for connection. Use this window intentionally.</p><h2>Phase 4: Luteal (Days 17–28)</h2><p>Progesterone rises. Energy becomes more inward, sensory experiences may intensify, and emotional sensitivity increases. Some people feel heightened sensuality despite lower spontaneous desire. Responsive desire is especially common in this phase — beginning physical intimacy even without initial mood can lead to deep pleasure once the body warms up.</p><h2>Tracking Your Cycle</h2><p>Even 30 days of simple tracking (mood, energy, desire rating 1–10) will reveal your personal patterns. Apps like Natural Cycles, Clue, or a simple journal all work. This data is one of the most powerful wellness tools you can have.</p>` },

      { id: 'wl17', title: 'Period Sex: What Nobody Tells You', category: 'health', type: 'article',
        excerpt: 'Honest, stigma-free facts about intimacy during menstruation — including the benefits most people don\'t know about.',
        icon: '💧', readTime: '6 min', tags: ['menstrual','period','health','education'],
        body: `<h1>Period Sex: What Nobody Tells You</h1><p>The taboo around period sex is cultural, not biological. The reality is that intimacy during menstruation is completely safe for most people — and for many, it's actually more pleasurable. Here's what the research actually says.</p><h2>The Benefits Are Real</h2><ul><li><strong>Cramping relief:</strong> Orgasm triggers the release of oxytocin and dopamine, which cause uterine muscle contractions followed by relaxation — often reducing cramp intensity significantly. Many people report their worst cramp pain disappears after orgasm.</li><li><strong>Natural lubrication:</strong> Menstrual flow provides additional lubrication, which many people find makes sex more comfortable than usual.</li><li><strong>Elevated sensitivity:</strong> Increased blood flow to the pelvic region during menstruation heightens sensitivity for many people.</li><li><strong>Headache relief:</strong> Orgasm-induced endorphin release can alleviate menstrual headaches and migraines.</li></ul><h2>Practical Considerations</h2><p>Communication and preparation make everything easier. A dark towel, period disc, or soft menstrual cup can significantly reduce mess if penetrative sex is involved. The shower is also a practical option. Always use protection — conception is less likely but not impossible during menstruation, and STI transmission risk is unchanged.</p><h2>For Solo Pleasure</h2><p>Masturbation during your period is one of the most effective natural remedies for cramps available. No partner required. No mess beyond what you're already managing. The case is medically sound — embrace it without guilt.</p><h2>Dismantling the Stigma</h2><p>If a partner expresses discomfort, that's a valid feeling to work through together — but disgust or shame directed at your body is not acceptable. Your cycle is not dirty. Your body is not inconvenient. You deserve pleasure every day of the month.</p>` },

      { id: 'wl18', title: 'Bedroom Position Guide for Every Body', category: 'couples', type: 'guide',
        excerpt: 'A practical, body-inclusive guide to positions that maximize pleasure, comfort, and connection — for all bodies and mobility levels.',
        icon: '✨', readTime: '12 min', tags: ['positions','couples','education','pleasure'],
        body: `<h1>Bedroom Position Guide for Every Body</h1><p>The best position is the one that feels best for your body — not the one that looks most impressive or gets the most screen time in media. This guide covers positions by sensation type, comfort level, and what they're uniquely good for, with real talk about adaptation for different bodies and mobility needs.</p><h2>For Maximum Clitoral Stimulation</h2><p><strong>Modified Missionary (CAT — Coital Alignment Technique):</strong> The penetrating partner rides higher than usual so that their pelvis aligns with and grinds against the clitoris rather than thrusting. Research shows this dramatically increases orgasm rates for people with vulvas. Add a pillow under the receiving partner's hips for even better alignment.</p><p><strong>Cowgirl/Rider on Top:</strong> The receiving partner controls the angle, depth, and rhythm entirely — making it one of the highest-rated positions for vulva-owners. Leaning slightly forward increases clitoral contact. A vibrating toy held between bodies elevates this further.</p><h2>For G-Spot Stimulation</h2><p><strong>Doggy Style (Modified):</strong> The receiving partner lowers their chest toward the bed while keeping their hips elevated — this tilts the pelvis to create direct anterior wall pressure. The penetrating partner's angle matters: slightly downward pressure increases G-spot contact.</p><p><strong>Reverse Cowgirl:</strong> The rider faces away, which naturally changes the angle of penetration to target the anterior wall. The rider controls depth and tilt.</p><h2>For Deep Connection & Eye Contact</h2><p><strong>Yab-Yum (Seated Tantric):</strong> One partner sits cross-legged; the other sits in their lap facing them, wrapping legs around the back. Minimal movement — maximum presence, eye contact, and synchronized breathing. This position is deeply intimate and often emotionally powerful beyond the physical.</p><p><strong>Face-to-Face Side-Lying (Scissors):</strong> Both partners lie on their sides facing each other. Slow, connected, deeply comfortable for longer sessions or when energy is lower. Excellent for pregnancy and when back pain is present.</p><h2>For Deeper Penetration</h2><p><strong>Legs Up / Anvil:</strong> The receiving partner lies on their back and raises legs toward their chest or over the penetrating partner's shoulders. This tilts the pelvis and allows deeper access — communicate throughout as depth increases significantly.</p><p><strong>Prone Bone:</strong> The receiving partner lies flat on their stomach; the penetrating partner enters from behind. The angle creates pressure against the anterior wall and the closed position adds tightness. A pillow under the hips adjusts the angle.</p><h2>For Reduced Mobility or Chronic Pain</h2><p><strong>Spooning:</strong> Both partners lie on their sides facing the same direction — the penetrating partner enters from behind. Zero weight-bearing, ideal for back issues, pregnancy, joint pain, or fatigue. Also among the most emotionally intimate positions.</p><p><strong>Edge of Bed:</strong> The receiving partner lies on their back at the edge of a bed or table; the penetrating partner stands. No bending required for the standing partner. Excellent for knee, hip, and lower back limitations.</p><h2>A Note on Adaptation</h2><p>Every position can be modified. Pillows, wedge pillows (the Liberator brand makes excellent ones), and furniture positioning change everything. Chronic pain, disability, size difference, and mobility variation are not barriers to pleasurable intimacy — they are design parameters. Work with your body, not against it, and communicate openly throughout.</p>` },

      { id: 'wl19', title: 'Pelvic Floor Health: Kegels & Beyond', category: 'health', type: 'guide',
        excerpt: 'Your pelvic floor affects arousal, orgasm intensity, bladder control, and postpartum recovery. Here\'s how to actually train it — and when to rest it.',
        icon: '💪', readTime: '8 min', tags: ['pelvicfloor','health','kegel','selfcare'],
        body: `<h1>Pelvic Floor Health: Kegels & Beyond</h1><p>The pelvic floor is a hammock-shaped group of muscles at the base of your pelvis, and it affects far more than most people realize — including arousal intensity, orgasm quality, bladder control, pain during sex, postpartum recovery, and overall core stability.</p><h2>What the Pelvic Floor Does</h2><ul><li>Supports pelvic organs (bladder, uterus, rectum)</li><li>Controls bladder and bowel function</li><li>Enhances sensation and orgasm intensity</li><li>Plays a direct role in arousal and lubrication</li><li>Provides stability for the spine and hips</li></ul><h2>Kegel Exercises — The Right Way</h2><p>Many people do Kegels incorrectly — they squeeze too hard, hold too briefly, or engage the wrong muscles entirely. Here's the correct technique:</p><ol><li>Identify the muscles: next time you urinate, briefly stop the flow. The muscles you used are your pelvic floor muscles. (Only do this to identify — don't train on the toilet.)</li><li>Clear your mind of engaging your abs, glutes, or inner thighs — only the pelvic floor.</li><li>Contract for 5 seconds, fully release for 5 seconds. The release is as important as the contraction.</li><li>Do 10–15 reps, three times per day.</li></ol><h2>When NOT to Do Kegels</h2><p>Pelvic floor tension disorders are real and underdiagnosed. If you experience pain during sex, difficulty with penetration, chronic pelvic pain, or a constant feeling of pelvic tightness — your pelvic floor may already be hypertonic (too tight). Doing Kegels in this state makes it worse. A pelvic floor physical therapist can assess your needs and prescribe the right approach.</p><h2>Beyond Kegels: Advanced Training</h2><p><strong>Pelvic floor trainers and biofeedback devices</strong> (like Elvie, Perifit, or Minna Life) give real-time visual feedback on contraction quality — dramatically improving training accuracy. <strong>Yoga and stretching</strong> (especially deep squat, butterfly, and hip flexor stretches) support pelvic floor release. <strong>Postpartum physiotherapy</strong> is genuinely one of the highest-ROI health investments available to new mothers — standard care in many European countries and criminally underutilized in the US.</p><h2>The Payoff</h2><p>A healthy pelvic floor means stronger orgasms, greater arousal, better bladder control, reduced pain during sex, and faster postpartum recovery. It is the most underrated wellness investment most women can make.</p>` },

      { id: 'wl20', title: 'The Confidence-Pleasure Connection', category: 'selfcare', type: 'article',
        excerpt: 'Confidence isn\'t a prerequisite for pleasure — but pleasure is one of the fastest ways to build confidence. Here\'s the research.',
        icon: '👑', readTime: '7 min', tags: ['confidence','selfcare','pleasure','mindset'],
        body: `<h1>The Confidence-Pleasure Connection</h1><p>Most people assume confidence is the prerequisite for pleasure — that you need to feel good about yourself first before you can fully enjoy intimacy. The research tells a more interesting story: the relationship runs both ways. Pleasure builds confidence as reliably as confidence enables pleasure.</p><h2>What the Research Shows</h2><p>Studies on body image and sexual satisfaction consistently find that engaging in pleasurable activities — rather than waiting until you feel confident enough — is one of the most reliable paths to improved self-image. When your body becomes a reliable source of joy, your relationship with it shifts. You stop evaluating it from the outside and start inhabiting it from the inside.</p><h2>The Shame Interruption</h2><p>Shame is the single greatest barrier between you and your pleasure. Shame is a full-body experience — it literally contracts the muscles, tightens the breath, and constricts sensation. Pleasure requires the opposite: expansion, breath, openness, safety. You cannot access full pleasure while shame is running in the background.</p><h2>Practical Confidence Builders</h2><ul><li><strong>Dress intentionally for yourself</strong> — not for a partner or occasion, but purely because it makes you feel powerful in your body</li><li><strong>Solo pleasure practice</strong> — knowing your own body is the foundation of all other intimate confidence</li><li><strong>Movement that you enjoy</strong> — not punishment exercise, but movement that creates a sense of capability and aliveness</li><li><strong>Boundary practice</strong> — each time you communicate a boundary and it's honored, your trust in yourself deepens</li></ul><h2>The Dripping Secrets Perspective</h2><p>You deserve a secret this good — and part of that secret is knowing that you are already enough. Pleasure is not earned. It is not contingent on your weight, your relationship status, your past, or your productivity. It is your birthright. Claim it.</p>` },

      { id: 'wl21', title: 'Understanding Your Arousal Map', category: 'education', type: 'guide',
        excerpt: 'Arousal is not the same for everyone. Understanding your personal arousal map — what turns you on and what shuts you down — changes everything.',
        icon: '🗺️', readTime: '10 min', tags: ['arousal','education','bodyknowledge','selfcare'],
        body: `<h1>Understanding Your Arousal Map</h1><p>Emily Nagoski's research on the dual control model of sexual response is some of the most practically useful sexual science of the last decade. Here's the core concept: arousal has both an accelerator and a brake — and for most people, especially those socialized as women, the brake system is far more influential than the accelerator.</p><h2>The Sexual Excitation System (Accelerator)</h2><p>Your brain's accelerator responds to sexual stimuli — touch, context, thoughts, sensory input — and generates arousal signals. Most sex education focuses exclusively here: do the right things and arousal follows. But this misses half the picture.</p><h2>The Sexual Inhibition System (Brake)</h2><p>Your brain's brake is constantly scanning for reasons NOT to be aroused: stress, body image concerns, relationship tension, fear of being heard, worry about performance, distraction, pain history, and hundreds of other inputs. When the brake is activated, no amount of accelerator input will generate arousal.</p><h2>Mapping Your Accelerators</h2><p>Take time to honestly inventory what genuinely turns you on — not what you think should, but what actually does. Certain environments? Types of touch? Words? Scenarios? Emotional states? Context? Physical sensations? Be specific and nonjudgmental. This is your accelerator map.</p><h2>Mapping Your Brakes</h2><p>More importantly: what reliably shuts arousal down for you? Unresolved argument energy? Low lighting that feels harsh? Feeling rushed? Certain smells or sounds? Anxiety about a specific thing? Pressure to perform? These are your brakes. Removing brake input is often more powerful than adding accelerator input.</p><h2>Applying Your Map</h2><p>Share your maps with a trusted partner — not as a complaint, but as useful data. Create environments that minimize your brakes and activate your accelerators. This is not manipulation; it is intelligent partnership. Your arousal map is one of the most valuable things you can know about yourself.</p>` },

      { id: 'wl22', title: 'Temperature & Sensation Play', category: 'couples', type: 'guide',
        excerpt: 'Expanding your intimate toolkit with temperature, texture, and sensation — a beginner-friendly guide to safe, exciting exploration.',
        icon: '🧊', readTime: '8 min', tags: ['sensation','couples','exploration','play'],
        body: `<h1>Temperature & Sensation Play</h1><p>One of the fastest ways to expand intimacy without adding complexity is to engage more of the body's sensory system. Temperature, texture, and sensation play are beginner-accessible, require minimal investment, and can dramatically elevate the quality of intimate experience.</p><h2>Why Sensation Play Works</h2><p>The skin is your largest sensory organ, and the nervous system craves variety. When the body doesn't know what's coming next, attention sharpens, presence increases, and sensation amplifies. Anticipation — the moment before touch — is itself a source of intense pleasure. Sensation play leverages all of this.</p><h2>Temperature Play: Cold</h2><p>Ice is the most accessible cold sensation tool. Run an ice cube along the inner arm, collarbone, neck, or wherever your partner is sensitive. The contrast between warm skin and cold temperature creates a shock of sensation that most people find intensely pleasurable when unexpected. Ice cubes held in the mouth before oral contact add a dimension of sensation that is widely reported as exceptional.</p><h2>Temperature Play: Heat</h2><p>Warm massage candles (specifically formulated massage candles with low melting points — never regular candles) drip warm oil at safe temperatures. Body-safe warming lubricants increase blood flow and sensation. Warm towels pre-applied to skin heighten sensitivity before touch. Never use wax candles not designed for body use — the temperature is unsafe.</p><h2>Texture Exploration</h2><p>Feather ticklers, soft fur mitts, silk scarves, and textured toys all engage different nerve endings than fingertips alone. Contrast is the key — move between textures and watch attention heighten. Blindfolding a partner before texture play amplifies sensation dramatically because the brain routes more processing power to remaining senses when sight is removed.</p><h2>Getting Started Safely</h2><p>Always establish a clear "stop" signal before beginning any sensation play. For temperature: test new tools on the inner wrist first. Never use household candles for wax play. Avoid numbing products — you need to feel sensation signals your body sends. Start slow, communicate throughout, and debrief afterward — that conversation builds the map for next time.</p>` },

      { id: 'wl23', title: 'Emotional Intimacy: The Foundation of Physical Connection', category: 'relationships', type: 'guide',
        excerpt: 'Physical intimacy lives on the foundation of emotional intimacy. Here\'s how to build it intentionally — and what happens when you do.',
        icon: '🫀', readTime: '9 min', tags: ['intimacy','emotional','relationships','connection'],
        body: `<h1>Emotional Intimacy: The Foundation of Physical Connection</h1><p>No product, technique, or position closes the gap that emotional distance creates. Conversely, when emotional intimacy is strong, physical connection becomes easier, more pleasurable, and more meaningful. Understanding this relationship — and investing in emotional intimacy deliberately — transforms intimate life.</p><h2>What Emotional Intimacy Actually Is</h2><p>Emotional intimacy is not simply talking more or spending more time together. It is the experience of being truly known by another person — including the parts you've been conditioned to hide — and being accepted, not despite them, but with them. It requires vulnerability. And vulnerability requires trust built over repeated moments of being met without judgment.</p><h2>The Gottman Research</h2><p>Researcher John Gottman can predict relationship outcomes with remarkable accuracy by tracking the ratio of positive to negative interactions. Couples in stable, satisfying relationships maintain approximately a 5:1 ratio — five positive interactions (a warm touch, a compliment, a moment of genuine interest) for every negative one. This is not about avoiding conflict; it's about building an emotional bank account that can absorb conflict without rupturing trust.</p><h2>Building Blocks of Emotional Intimacy</h2><ul><li><strong>Bids and turning toward:</strong> A "bid" is any bid for connection — a comment, a touch, a look. Turning toward bids (rather than ignoring them) is the single most predictive behavior of relationship longevity.</li><li><strong>Honest, non-reactive sharing:</strong> Sharing your inner world — fears, desires, insecurities, dreams — without defensiveness or criticism when received.</li><li><strong>Active repair:</strong> After conflict, returning to connection rather than prolonged distance. How you repair matters more than whether you fight.</li><li><strong>Shared meaning:</strong> Rituals, traditions, inside references, and shared narrative ("our story") create a sense of being on the same team.</li></ul><h2>When Emotional Intimacy Is Low</h2><p>Low emotional intimacy doesn't always announce itself as conflict. It often shows up as roommate energy — physical proximity without real connection. Sex becomes mechanical or rare. Neither partner may be able to articulate why — they just feel disconnected. This is recoverable, but it requires intention and often professional support to rebuild trust that has eroded gradually.</p><h2>The Payoff</h2><p>Partners who describe their relationships as emotionally intimate report dramatically higher physical intimacy satisfaction, greater sexual adventurousness, and higher overall life satisfaction scores. Emotional intimacy is not the soft, lesser part of a relationship. It is the architecture everything else is built on.</p>` },
    ];
  }

  /* ── Render Grid ───────────────────────────────────────── */
  function renderGrid(items) {
    const grid = document.getElementById('wl-grid');
    if (!grid) return;
    if (!items || !items.length) {
      grid.innerHTML = '<div class="wl-fav-empty" style="grid-column:1/-1"><p>No content found.</p></div>'; return;
    }
    grid.innerHTML = items.map(c => buildCard(c)).join('');
    renderFavIndicators();
  }

  function buildCard(c) {
    const isFav = favorites.includes(c.id);
    return `
    <article class="wl-card" onclick="DSWellness.openArticle('${c.id}')" role="button" tabindex="0" aria-label="${c.title}">
      <div class="wl-card-thumb">
        <span class="wl-card-tag">${c.type || 'article'}</span>
        <div>${c.icon || '🌸'}</div>
      </div>
      <div class="wl-card-body">
        <h3 class="wl-card-title">${c.title}</h3>
        <p class="wl-card-excerpt">${c.excerpt || ''}</p>
        <div class="wl-card-meta">${c.readTime || ''} read · ${(c.tags||[]).slice(0,2).join(' · ')}</div>
      </div>
      <div class="wl-card-footer" onclick="event.stopPropagation()">
        <span class="wl-card-cta">Read →</span>
        <button class="wl-save-btn" data-id="${c.id}" onclick="DSWellness.toggleFavorite('${c.id}')" aria-label="Save article" aria-pressed="${isFav}">
          ${isFav ? '♥' : '♡'}
        </button>
      </div>
    </article>`;
  }

  /* ── Series ────────────────────────────────────────────── */
  function renderSeries() {
    const container = document.getElementById('wl-series-grid');
    if (!container) return;
    const series = [
      { icon: '🌙', title: 'Evening Rituals', count: '6 guides' },
      { icon: '💑', title: 'Couples Toolkit', count: '10 articles' },
      { icon: '🌸', title: 'Solo Wellness', count: '5 guides' },
      { icon: '🔬', title: 'Body Literacy', count: '6 deep dives' },
      { icon: '💬', title: 'Communication', count: '7 guides' },
      { icon: '✨', title: 'Beginner Series', count: '3 articles' },
      { icon: '🌑', title: 'Cycle & Health', count: '4 guides' },
      { icon: '👑', title: 'Confidence & Pleasure', count: '3 articles' },
    ];
    container.innerHTML = series.map(s => `
      <div class="wl-series-card">
        <div class="wl-series-icon">${s.icon}</div>
        <div class="wl-series-title">${s.title}</div>
        <div class="wl-series-count">${s.count}</div>
      </div>`).join('');
  }

  /* ── Article Modal ─────────────────────────────────────── */
  function openArticle(id) {
    articleTarget = allContent.find(c => c.id === id);
    if (!articleTarget) return;
    const overlay = document.getElementById('wl-article-overlay');
    const content = document.getElementById('wl-article-content');
    if (!overlay || !content) return;
    content.innerHTML = `
      <div class="wl-featured-tag">${articleTarget.type || 'article'}</div>
      <div class="wl-article-content">${articleTarget.body || `<h1>${articleTarget.title}</h1><p>${articleTarget.excerpt}</p>`}</div>`;
    overlay.classList.add('open');
    // Track view
    if (db && currentUser) {
      db.collection('wellness_views').add({ contentId: id, userId: currentUser.uid, viewedAt: firebase.firestore.FieldValue.serverTimestamp() }).catch(()=>{});
    }
  }

  function closeArticle() {
    const overlay = document.getElementById('wl-article-overlay');
    if (overlay) overlay.classList.remove('open');
    articleTarget = null;
  }

  /* ── Categories ────────────────────────────────────────── */
  function bindCategories() {
    document.querySelectorAll('.wl-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.cat || 'all';
        document.querySelectorAll('.wl-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGrid(filterContent());
      });
    });
  }

  function filterContent() {
    if (activeCategory === 'all') return allContent;
    if (activeCategory === 'saved') return allContent.filter(c => favorites.includes(c.id));
    return allContent.filter(c => c.category === activeCategory);
  }

  /* ── Search ────────────────────────────────────────────── */
  function bindSearch() {
    const input = document.getElementById('wl-search-input');
    if (!input) return;
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = input.value.toLowerCase().trim();
        if (!q) { renderGrid(filterContent()); return; }
        const results = allContent.filter(c =>
          c.title.toLowerCase().includes(q) ||
          (c.excerpt||'').toLowerCase().includes(q) ||
          (c.tags||[]).some(t => t.includes(q))
        );
        renderGrid(results);
      }, 250);
    });
  }

  function searchFromBar() {
    const input = document.getElementById('wl-search-input');
    if (input) input.dispatchEvent(new Event('input'));
  }

  /* ── Admin ─────────────────────────────────────────────── */
  async function adminLoadContent() {
    if (!db) return;
    const container = document.getElementById('admin-wellness-list');
    if (!container) return;
    container.innerHTML = '<p style="color:rgba(255,255,255,.5)">Loading...</p>';
    try {
      const snap = await db.collection('wellness_content').orderBy('publishedAt','desc').limit(50).get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!items.length) { container.innerHTML = '<p style="color:rgba(255,255,255,.4)">No content yet. Publish your first article below.</p>'; return; }
      container.innerHTML = items.map(c => `
        <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <strong style="color:#fff">${c.icon||'🌸'} ${c.title}</strong>
            <div style="color:rgba(255,255,255,.5);font-size:.82rem;margin-top:4px">${c.category||''} · ${c.type||'article'} · Status: <span style="color:${c.status==='published'?'#4CAF50':'#ff9800'}">${c.status||'draft'}</span></div>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="DSWellness.adminToggleContent('${c.id}','${c.status}')" style="background:rgba(233,30,140,.15);color:#E91E8C;border:1px solid rgba(233,30,140,.3);padding:7px 14px;border-radius:8px;cursor:pointer;font-size:.82rem">${c.status==='published'?'Unpublish':'Publish'}</button>
          </div>
        </div>`).join('');
    } catch (err) {
      container.innerHTML = `<p style="color:rgba(255,100,100,.7)">Error loading content.</p>`;
    }
  }

  async function adminToggleContent(id, current) {
    if (!db) return;
    await db.collection('wellness_content').doc(id).update({ status: current==='published'?'draft':'published' });
    adminLoadContent();
  }

  async function adminPublishContent() {
    if (!db) return;
    const title    = document.getElementById('wl-admin-title')?.value.trim();
    const category = document.getElementById('wl-admin-cat')?.value;
    const type     = document.getElementById('wl-admin-type')?.value;
    const excerpt  = document.getElementById('wl-admin-excerpt')?.value.trim();
    const body     = document.getElementById('wl-admin-body')?.value.trim();
    const icon     = document.getElementById('wl-admin-icon')?.value.trim() || '🌸';
    if (!title || !body) { alert('Title and body are required.'); return; }
    try {
      await db.collection('wellness_content').add({
        title, category, type, excerpt, body, icon,
        readTime: `${Math.ceil(body.split(' ').length / 200)} min`,
        status: 'published',
        publishedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Content published!');
      adminLoadContent();
    } catch (err) { alert('Error publishing. Try again.'); }
  }

  /* ── Public API ────────────────────────────────────────── */
  return {
    init, openArticle, closeArticle, toggleFavorite, searchFromBar,
    adminLoadContent, adminToggleContent, adminPublishContent
  };
})();

document.addEventListener('DOMContentLoaded', DSWellness.init);
