/* ═══════════════════════════════════════════════════════════════
   PRODUCT FAQs  —  js/product-faqs.js
   Dripping Secrets v9.83
   Injects SEO-rich FAQ sections into the top 20 product pages.
   FAQPage JSON-LD included for rich snippets.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── FAQ data keyed by product id ── */
  const FAQS = {
    1: { // The Machine
      product: 'The Machine',
      items: [
        { q: 'Is The Machine safe for solo use?', a: 'Yes. The Machine is designed for solo and partnered use. The heavy-duty frame keeps it stable, and the adjustable angle lets you dial in a comfortable position before use.' },
        { q: 'Does it require batteries?', a: 'No batteries needed. The Machine runs on plug-in AC power for consistent, uninterrupted performance.' },
        { q: 'How many attachments are included?', a: 'Six interchangeable attachments are included, giving you a variety of sensations and options in one device.' },
        { q: 'Is The Machine body-safe?', a: 'Yes. All included attachments are made from body-safe materials. Clean each attachment before and after use with a toy-safe cleaner.' },
        { q: 'How do I clean The Machine?', a: 'Wipe down the frame with a damp cloth. Remove and wash each attachment separately with warm water and a toy-safe cleaner. Allow to dry fully before storing.' }
      ]
    },
    2: { // The Piper
      product: 'The Piper',
      items: [
        { q: 'What makes The Piper different from other vibrators?', a: 'The Piper combines thrusting and vibration in one slim profile, making it versatile for internal and external use.' },
        { q: 'Is The Piper rechargeable?', a: 'Yes. The Piper is USB rechargeable, so no batteries are ever needed.' },
        { q: 'Is it waterproof?', a: 'Yes. The Piper is waterproof and safe to use in the shower or bath.' },
        { q: 'How many intensity levels does it have?', a: 'Multiple intensity levels let you go from subtle to powerful at your own pace.' },
        { q: 'How do I store The Piper?', a: 'Store in a cool, dry place in a pouch or the original packaging. Keep away from other toys unless separated by storage bags.' }
      ]
    },
    3: { // Always-On Strap
      product: 'Always-On Strap',
      items: [
        { q: 'What size waist does the Always-On Strap fit?', a: 'The waist straps adjust from 24 to 43 inches and the hip straps from 29 to 45 inches, fitting a wide range of body types.' },
        { q: 'Is the dildo removable?', a: 'The dildo is built-in and not removable on this particular harness, providing a secure, reliable connection every time.' },
        { q: 'What material is the dildo made from?', a: 'Medical-grade silicone — body-safe, non-porous, and free of phthalates, latex, and BPA.' },
        { q: 'Is the Always-On Strap waterproof?', a: 'Yes. Medical-grade silicone is fully waterproof and easy to clean.' },
        { q: 'Can it be used by all body types?', a: 'Absolutely. The wide adjustment range on both the waist and hip straps makes it designed for all bodies.' }
      ]
    },
    4: { // Light Show Dildo
      product: 'Light Show Dildo',
      items: [
        { q: 'Does the Light Show Dildo vibrate?', a: 'No. It is a non-vibrating dildo that glows from inside, creating a unique visual experience.' },
        { q: 'Is it body-safe?', a: 'Yes. It is made from body-safe TPE, free of harmful chemicals.' },
        { q: 'Does it have a suction cup base?', a: 'Yes. The strong suction cup base allows for hands-free play on flat surfaces.' },
        { q: 'Are batteries included?', a: 'Yes. Batteries are included so it is ready to use right out of the box.' },
        { q: 'Is it waterproof?', a: 'Yes. It is waterproof and shower-safe.' }
      ]
    },
    5: { // Naughty Nurse Set
      product: 'Naughty Nurse Set',
      items: [
        { q: 'What is included in the Naughty Nurse Set?', a: 'The set includes a themed costume and accessories to set the scene for a playful, intimate experience.' },
        { q: 'What sizes are available?', a: 'Please check the product page for current size availability. We carry a range of sizes to fit most bodies.' },
        { q: 'Is this a one-size-fits-all item?', a: 'The Naughty Nurse Set is available in multiple sizes. Select your size from the dropdown on the product page.' },
        { q: 'Can this be gifted?', a: 'Yes. It arrives in discreet, elegant packaging — perfect for an intimate gift.' },
        { q: 'Is this item eligible for same-day local delivery?', a: 'Same-day local delivery is available in the DFW Metro area for orders over $50.' }
      ]
    },
    6: { // Double Trouble
      product: 'Double Trouble',
      items: [
        { q: 'Is Double Trouble for solo or couples use?', a: 'Double Trouble is designed for both solo and couples use, offering dual stimulation for maximum versatility.' },
        { q: 'Is it rechargeable?', a: 'Yes, Double Trouble is USB rechargeable.' },
        { q: 'Is it waterproof?', a: 'Yes. Safe for shower and bath use.' },
        { q: 'How many vibration patterns does it have?', a: 'Multiple patterns and intensities give you plenty of ways to explore.' },
        { q: 'What material is it made from?', a: 'Body-safe silicone — non-porous, phthalate-free, and easy to clean.' }
      ]
    },
    7: { // Bound to Please
      product: 'Bound to Please',
      items: [
        { q: 'Is Bound to Please a beginner-friendly bondage set?', a: 'Yes. It is approachable for beginners and includes everything needed to get started safely.' },
        { q: 'What is included in the set?', a: 'The set includes restraints and accessories to set the scene for consensual, comfortable exploration.' },
        { q: 'Are the restraints adjustable?', a: 'Yes. Adjustable fasteners allow for a comfortable, secure fit.' },
        { q: 'What material are the restraints made from?', a: 'Soft, skin-safe materials that minimize discomfort during extended wear.' },
        { q: 'Is this eligible for discreet shipping?', a: 'Yes. All orders from Dripping Secrets ship in discreet, unmarked packaging.' }
      ]
    },
    8: { // Date Night Firecracker
      product: 'Date Night Firecracker',
      items: [
        { q: 'What is in the Date Night Firecracker kit?', a: 'The kit is packed with everything you need to spark a memorable date night — think games, accessories, and intimate surprises.' },
        { q: 'Is it a good gift?', a: 'One of our most popular gifts. It ships in discreet packaging and makes a memorable, thoughtful present.' },
        { q: 'Is it appropriate for new couples?', a: 'Yes. It is playful and approachable, making it great for couples at any stage of their relationship.' },
        { q: 'Does it qualify for same-day delivery?', a: 'Same-day local delivery is available in the DFW Metro area for orders over $50.' },
        { q: 'Can I add a note or message?', a: 'Yes. Add a personal message during checkout and we will include it with your order.' }
      ]
    },
    9: { // Pocket Body
      product: 'Pocket Body',
      items: [
        { q: 'Is the Pocket Body beginner-friendly?', a: 'Yes. Compact size and straightforward design make it one of our most approachable solo products.' },
        { q: 'What material is it made from?', a: 'Body-safe TPE that is soft, flexible, and easy to clean.' },
        { q: 'How do I clean it?', a: 'Rinse with warm water and use a toy-safe cleaner. Allow to dry completely before storing.' },
        { q: 'Is it discreetly packaged?', a: 'Yes. All Dripping Secrets orders arrive in plain, unmarked packaging with no product branding on the outside.' },
        { q: 'Does it require batteries or charging?', a: 'No power source required. This is a non-vibrating manual product.' }
      ]
    },
    10: { // The Goddess
      product: 'The Goddess',
      items: [
        { q: 'What makes The Goddess stand out?', a: 'The Goddess combines an elegant design with powerful multi-function vibration, making it as beautiful as it is effective.' },
        { q: 'Is it rechargeable?', a: 'Yes. USB rechargeable with a long battery life.' },
        { q: 'Is it waterproof?', a: 'Yes. Fully waterproof for shower and bath use.' },
        { q: 'How many functions does it have?', a: 'Multiple vibration patterns and intensities for a fully customizable experience.' },
        { q: 'Is it quiet?', a: 'Yes. The Goddess operates quietly and discreetly.' }
      ]
    },
    11: { // Lip Service
      product: 'Lip Service',
      items: [
        { q: 'Is Lip Service a suction toy?', a: 'Yes. It uses gentle air-pulse technology to create a suction-like sensation for intense external stimulation.' },
        { q: 'Is it rechargeable?', a: 'Yes. USB rechargeable.' },
        { q: 'Is it waterproof?', a: 'Yes. Shower-safe and easy to clean.' },
        { q: 'Is it good for beginners?', a: 'Absolutely. The gentle suction function is great for those exploring new types of stimulation.' },
        { q: 'How do I clean Lip Service?', a: 'Rinse with warm water and mild soap or a toy-safe cleaner. Dry thoroughly before storing.' }
      ]
    },
    12: { // Date Night Dice
      product: 'Date Night Dice',
      items: [
        { q: 'How many dice are in the Date Night Dice set?', a: 'Five solid pine wood dice, each assigned different categories — positions, actions, and locations — plus a placement plate.' },
        { q: 'Is this appropriate for all couples?', a: 'Yes. The dice are playful and fun, suitable for couples at any stage of their relationship.' },
        { q: 'Does it require batteries?', a: 'No batteries required. Just roll and play.' },
        { q: 'Is this a good gift?', a: 'One of our most popular gifts. Compact, fun, and arrives in a fabric drawstring bag.' },
        { q: 'How is it shipped?', a: 'In discreet, plain packaging — no product information visible on the outside.' }
      ]
    },
    13: { // Rose Charger
      product: 'Rose Charger',
      items: [
        { q: 'What is the Rose Charger compatible with?', a: 'The Rose Charger is a USB charging cable compatible with most rechargeable intimate devices.' },
        { q: 'Is this magnetic or plug-in?', a: 'Check the product detail page for the connector type — most are magnetic or USB-C.' },
        { q: 'Can I buy this as a replacement?', a: 'Yes. It is sold separately so you can always have a backup for your rechargeable devices.' },
        { q: 'Is it fast charging?', a: 'It provides standard charging speeds compatible with most intimate wellness devices.' },
        { q: 'Is this discreetly labeled?', a: 'Yes. No product names appear on the charger itself.' }
      ]
    },
    91: { // Full Figure
      product: 'Full Figure',
      items: [
        { q: 'Is Full Figure a realistic toy?', a: 'Yes. Full Figure is designed with a realistic form and soft, body-safe material for a natural feel.' },
        { q: 'What material is it made from?', a: 'Body-safe TPE — soft, flexible, and non-toxic.' },
        { q: 'Is it waterproof?', a: 'Yes. Safe to use in the shower or bath.' },
        { q: 'How do I clean Full Figure?', a: 'Warm water and a toy-safe cleaner. Dry completely before storing.' },
        { q: 'Is this eligible for same-day delivery in DFW?', a: 'Yes, for orders over $50 within the DFW Metro area.' }
      ]
    },
    92: { // The Ring Leader
      product: 'The Ring Leader',
      items: [
        { q: 'Is The Ring Leader for solo or couples use?', a: 'Primarily designed for couples to use together, though it can be adapted for solo use.' },
        { q: 'Is it rechargeable?', a: 'Yes. USB rechargeable with vibration functionality.' },
        { q: 'What sizes are available?', a: 'Stretchy, one-size-fits-most design accommodates a wide range of wearers.' },
        { q: 'Is it body-safe?', a: 'Yes. Made from medical-grade silicone — non-toxic and phthalate-free.' },
        { q: 'Is The Ring Leader waterproof?', a: 'Yes. Waterproof and shower-safe.' }
      ]
    },
    93: { // Purple Trouble
      product: 'Purple Trouble',
      items: [
        { q: 'What type of toy is Purple Trouble?', a: 'A versatile vibrating toy available in a signature purple color, designed for targeted stimulation.' },
        { q: 'Is it rechargeable?', a: 'Yes. USB rechargeable.' },
        { q: 'Is it waterproof?', a: 'Yes. Fully waterproof.' },
        { q: 'Is it quiet?', a: 'Designed to operate quietly for discreet use.' },
        { q: 'Is it made from body-safe materials?', a: 'Yes. Medical-grade silicone — non-porous and free from harmful chemicals.' }
      ]
    }
  };

  /* ── Render FAQs on product page ── */
  function renderFAQs(productId, containerEl) {
    const data = FAQS[productId];
    if (!data) return;

    /* Build HTML */
    const section = document.createElement('section');
    section.className = 'product-faqs';
    section.setAttribute('aria-label', 'Frequently Asked Questions about ' + data.product);
    section.innerHTML = `
      <h2 class="faq-heading">Frequently Asked Questions</h2>
      <div class="faq-list">
        ${data.items.map((item, i) => `
          <div class="faq-item">
            <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-${productId}-${i}">
              <span>${item.q}</span>
              <svg class="faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="faq-answer" id="faq-answer-${productId}-${i}" role="region" hidden>
              <p>${item.a}</p>
            </div>
          </div>
        `).join('')}
      </div>`;

    containerEl.appendChild(section);

    /* Accordion behaviour */
    section.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !expanded);
        const answer = document.getElementById(this.getAttribute('aria-controls'));
        if (answer) answer.hidden = expanded;
        this.querySelector('.faq-chevron').style.transform = expanded ? '' : 'rotate(180deg)';
      });
    });

    /* JSON-LD FAQPage schema */
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.items.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    });
    document.head.appendChild(ld);
  }

  /* ── Inject on DOMContentLoaded ── */
  document.addEventListener('DOMContentLoaded', function () {
    const id = parseInt(new URLSearchParams(location.search).get('id'));
    if (!id || !FAQS[id]) return;

    /* Look for the product detail main content area */
    const target =
      document.querySelector('.product-detail') ||
      document.querySelector('#product-detail') ||
      document.querySelector('main') ||
      document.body;

    if (target) renderFAQs(id, target);
  });

})();
