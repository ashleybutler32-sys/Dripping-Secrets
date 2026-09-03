// ============================================================
// reviews.js — Dripping Secrets Customer Reviews System
// Firestore: collection('reviews') per-product
// ============================================================

window.DS_Reviews = (function() {

  // ── Render star SVGs ─────────────────────────────────────
  function renderStars(rating, interactive = false, productId = null) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= Math.round(rating);
      if (interactive) {
        stars.push(`<span class="rev-star rev-star-interactive ${filled ? 'filled' : ''}"
          data-val="${i}" data-pid="${productId}"
          onclick="DS_Reviews.setStarRating(this, ${i}, '${productId}')"
          onmouseover="DS_Reviews.hoverStars(this, ${i})"
          onmouseout="DS_Reviews.unhoverStars('${productId}')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${filled ? '#B76E79' : 'none'}" stroke="#B76E79" stroke-width="1.5">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </span>`);
      } else {
        stars.push(`<span class="rev-star ${filled ? 'filled' : ''}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${filled ? '#B76E79' : 'none'}" stroke="#B76E79" stroke-width="1.5">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </span>`);
      }
    }
    return `<span class="rev-stars">${stars.join('')}</span>`;
  }

  // ── Interactive star hover ────────────────────────────────
  function hoverStars(el, val) {
    const pid = el.dataset.pid;
    document.querySelectorAll(`.rev-star-interactive[data-pid="${pid}"]`).forEach(s => {
      const sv = parseInt(s.dataset.val);
      const svgFill = sv <= val ? '#B76E79' : 'none';
      s.querySelector('svg polygon').setAttribute('fill', svgFill);
    });
  }
  function unhoverStars(pid) {
    const current = parseInt(document.querySelector(`.rev-star-rating-value[data-pid="${pid}"]`)?.value || 0);
    document.querySelectorAll(`.rev-star-interactive[data-pid="${pid}"]`).forEach(s => {
      const sv = parseInt(s.dataset.val);
      const svgFill = sv <= current ? '#B76E79' : 'none';
      s.querySelector('svg polygon').setAttribute('fill', svgFill);
    });
  }
  function setStarRating(el, val, pid) {
    // Store rating in hidden input
    let inp = document.querySelector(`.rev-star-rating-value[data-pid="${pid}"]`);
    if (!inp) {
      inp = document.createElement('input');
      inp.type = 'hidden';
      inp.className = 'rev-star-rating-value';
      inp.dataset.pid = pid;
      el.closest('.rev-stars').appendChild(inp);
    }
    inp.value = val;
    document.querySelectorAll(`.rev-star-interactive[data-pid="${pid}"]`).forEach(s => {
      const sv = parseInt(s.dataset.val);
      s.querySelector('svg polygon').setAttribute('fill', sv <= val ? '#B76E79' : 'none');
      s.classList.toggle('filled', sv <= val);
    });
  }

  // ── Submit a review ───────────────────────────────────────
  async function submitReview(productId, rating, text, productName) {
    if (!window.currentUser || !window.FIREBASE_READY) {
      throw new Error('Must be signed in to leave a review.');
    }
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Please select a star rating.');
    }
    if (!text || text.trim().length < 10) {
      throw new Error('Review must be at least 10 characters.');
    }

    const db = firebase.firestore();
    const uid = window.currentUser.uid;

    // Check for verified purchase
    let verified = false;
    try {
      const ordersSnap = await db.collection('orders')
        .where('uid', '==', uid).limit(50).get();
      ordersSnap.forEach(doc => {
        const o = doc.data();
        const items = o.items || o.cart || [];
        if (items.some(i => String(i.id) === String(productId) || String(i.productId) === String(productId))) {
          verified = true;
        }
      });
    } catch(e) { /* non-fatal */ }

    const displayName = window.currentUser.displayName ||
      window.currentUser.email?.split('@')[0] || 'Secret Keeper';

    const reviewData = {
      productId: String(productId),
      productName: productName || '',
      userId: uid,
      userName: displayName,
      rating: parseInt(rating),
      text: text.trim(),
      verified,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      helpful: 0
    };

    // Check if user already reviewed this product
    const existing = await db.collection('reviews')
      .where('productId', '==', String(productId))
      .where('userId', '==', uid).limit(1).get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({ rating: reviewData.rating, text: reviewData.text, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    } else {
      await db.collection('reviews').add(reviewData);
    }

    return reviewData;
  }

  // ── Fetch reviews for a product ───────────────────────────
  async function getProductReviews(productId) {
    if (!window.FIREBASE_READY) return [];
    try {
      const snap = await firebase.firestore().collection('reviews')
        .where('productId', '==', String(productId))
        .orderBy('createdAt', 'desc')
        .limit(50).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { return []; }
  }

  // ── Fetch all reviews by a user ───────────────────────────
  async function getUserReviews(userId) {
    if (!window.FIREBASE_READY) return [];
    try {
      const snap = await firebase.firestore().collection('reviews')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { return []; }
  }

  // ── Get top reviews for homepage social proof ─────────────
  async function getTopReviews(limit = 6) {
    if (!window.FIREBASE_READY) return [];
    try {
      const snap = await firebase.firestore().collection('reviews')
        .where('rating', '>=', 4)
        .orderBy('rating', 'desc')
        .limit(limit).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { return []; }
  }

  // ── Get average rating for a product ─────────────────────
  async function getAverageRating(productId) {
    const reviews = await getProductReviews(productId);
    if (!reviews.length) return { avg: 0, count: 0 };
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return { avg: Math.round(avg * 10) / 10, count: reviews.length };
  }

  // ── Get aggregate ratings for many products at once ───────
  async function getBatchRatings(productIds) {
    const result = {};
    if (!window.FIREBASE_READY || !productIds.length) return result;
    try {
      // Firestore 'in' query supports up to 30 items
      const chunks = [];
      for (let i = 0; i < productIds.length; i += 30) {
        chunks.push(productIds.slice(i, i + 30).map(String));
      }
      for (const chunk of chunks) {
        const snap = await firebase.firestore().collection('reviews')
          .where('productId', 'in', chunk).get();
        snap.docs.forEach(d => {
          const r = d.data();
          if (!result[r.productId]) result[r.productId] = { sum: 0, count: 0 };
          result[r.productId].sum += r.rating;
          result[r.productId].count += 1;
        });
      }
    } catch(e) { /* silent */ }
    return result;
  }

  // ── Render a review card ──────────────────────────────────
  function renderReviewCard(rev, showProduct = false) {
    const date = rev.createdAt?.toDate
      ? rev.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
    const initials = (rev.userName || 'SK').slice(0, 2).toUpperCase();
    return `<div class="rev-card">
      <div class="rev-card-header">
        <div class="rev-avatar">${initials}</div>
        <div class="rev-meta">
          <span class="rev-name">${escHtml(rev.userName || 'Secret Keeper')}</span>
          ${rev.verified ? '<span class="rev-verified">✓ Verified Purchase</span>' : ''}
          <span class="rev-date">${date}</span>
        </div>
        <div class="rev-rating">${renderStars(rev.rating)}</div>
      </div>
      ${showProduct && rev.productName ? `<p class="rev-product-name">Re: ${escHtml(rev.productName)}</p>` : ''}
      <p class="rev-text">${escHtml(rev.text)}</p>
    </div>`;
  }

  // ── Render product reviews section (for product modal) ────
  async function renderProductReviewsSection(productId, productName, container) {
    if (!container) return;
    const reviews = await getProductReviews(productId);
    const { avg, count } = await getAverageRating(productId);
    const userReviewed = reviews.some(r => r.userId === window.currentUser?.uid);

    container.innerHTML = `
      <div class="rev-section">
        <div class="rev-summary">
          <div class="rev-avg">
            <span class="rev-avg-num">${count ? avg.toFixed(1) : '—'}</span>
            ${count ? renderStars(avg) : ''}
            <span class="rev-avg-count">${count ? `${count} review${count !== 1 ? 's' : ''}` : 'No reviews yet'}</span>
          </div>
          ${window.currentUser && !userReviewed ? `
            <button class="rev-write-btn" onclick="DS_Reviews.openReviewForm('${productId}', '${escHtml(productName)}', this)">
              Write a Review
            </button>
          ` : ''}
          ${!window.currentUser ? `<p class="rev-signin-note"><a onclick="openAuthModal('login')" style="cursor:pointer;color:var(--rose);">Sign in</a> to leave a review.</p>` : ''}
          ${userReviewed ? '<p class="rev-already-note" style="color:var(--rose);font-size:0.8rem;">You reviewed this product ✓</p>' : ''}
        </div>
        <div id="rev-form-${productId}"></div>
        <div class="rev-list">
          ${reviews.length ? reviews.map(r => renderReviewCard(r)).join('') : '<p class="rev-empty">Be the first to leave a review!</p>'}
        </div>
      </div>`;
  }

  // ── Open inline review form ───────────────────────────────
  function openReviewForm(productId, productName, triggerBtn) {
    const container = document.getElementById(`rev-form-${productId}`);
    if (!container) return;
    if (triggerBtn) triggerBtn.style.display = 'none';
    container.innerHTML = `
      <div class="rev-form" id="rev-form-inner-${productId}">
        <h4 class="rev-form-title">Your Review</h4>
        <div class="rev-form-stars">
          ${renderStars(0, true, productId)}
          <input type="hidden" class="rev-star-rating-value" data-pid="${productId}" value="0" />
        </div>
        <textarea class="rev-form-text" id="rev-text-${productId}" placeholder="Tell us about your experience... (10 characters minimum)" rows="4"></textarea>
        <div class="rev-form-actions">
          <button class="btn-primary rev-submit-btn" onclick="DS_Reviews.handleSubmit('${productId}', '${escHtml(productName)}')">Post Review</button>
          <button class="btn-ghost rev-cancel-btn" onclick="DS_Reviews.cancelReviewForm('${productId}', this)">Cancel</button>
        </div>
        <p class="rev-form-msg" id="rev-msg-${productId}"></p>
      </div>`;
  }

  function cancelReviewForm(productId, btn) {
    const container = document.getElementById(`rev-form-${productId}`);
    if (container) container.innerHTML = '';
    // Re-show write button
    document.querySelector(`.rev-write-btn[onclick*="${productId}"]`)?.style.removeProperty('display');
  }

  async function handleSubmit(productId, productName) {
    const ratingInput = document.querySelector(`.rev-star-rating-value[data-pid="${productId}"]`);
    const textEl = document.getElementById(`rev-text-${productId}`);
    const msgEl = document.getElementById(`rev-msg-${productId}`);
    const rating = parseInt(ratingInput?.value || 0);
    const text = textEl?.value || '';

    const submitBtn = document.querySelector(`#rev-form-inner-${productId} .rev-submit-btn`);
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Posting...'; }

    try {
      await submitReview(productId, rating, text, productName);
      if (msgEl) { msgEl.style.color = '#7ec87e'; msgEl.textContent = '✓ Review posted! Thank you, girlfriend.'; }
      setTimeout(() => {
        const section = document.querySelector('.rev-section');
        if (section) renderProductReviewsSection(productId, productName, section.parentElement);
      }, 1500);
    } catch(e) {
      if (msgEl) { msgEl.style.color = '#e87e7e'; msgEl.textContent = e.message; }
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Post Review'; }
    }
  }

  // ── Inject rating badge onto product cards ────────────────
  async function injectRatingBadges() {
    if (!window.FIREBASE_READY) return;
    const cards = document.querySelectorAll('.product-card[data-pid]');
    if (!cards.length) return;
    const ids = [...cards].map(c => c.dataset.pid);
    const ratings = await getBatchRatings(ids);
    cards.forEach(card => {
      const pid = card.dataset.pid;
      if (!ratings[pid] || !ratings[pid].count) return;
      const avg = ratings[pid].sum / ratings[pid].count;
      const existing = card.querySelector('.prod-rating-badge');
      if (existing) return;
      const badge = document.createElement('div');
      badge.className = 'prod-rating-badge';
      badge.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="#B76E79" stroke="#B76E79" stroke-width="1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg> ${avg.toFixed(1)} <span style="opacity:0.6;">(${ratings[pid].count})</span>`;
      const nameEl = card.querySelector('.prod-name, .product-name');
      if (nameEl) nameEl.insertAdjacentElement('afterend', badge);
      else card.appendChild(badge);
    });
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // ── Public API ────────────────────────────────────────────
  return {
    renderStars, hoverStars, unhoverStars, setStarRating,
    submitReview, getProductReviews, getUserReviews,
    getTopReviews, getAverageRating, getBatchRatings,
    renderReviewCard, renderProductReviewsSection,
    openReviewForm, cancelReviewForm, handleSubmit,
    injectRatingBadges
  };
})();
