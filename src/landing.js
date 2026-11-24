/* =========================================================
   WonderLab Motion Badminton — Landing Page, 30-Min Trial & Event Pass
   src/landing.js
   ========================================================= */

const SUPABASE_URL = 'https://zptfctcsjauobncvenne.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdGZjdGNzamF1b2JuY3Zlbm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NTM2NjEsImV4cCI6MjEwODUyOTY2MX0.U3j4XIiK2HWEX_O4ZPT7RTJo9E8HpI7kBe_Cs5KKSCM';

const PORTAL_URL = 'https://susanthavfx-art.github.io/WonderLab-Play/';
const FREE_DURATION_SEC = 30 * 60; // 30 minutes
const FREE_RESET_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h window per browser

const STORAGE_FREE = 'wl_badminton_free_v1';
const STORAGE_PAID = 'wl_badminton_paid_v1';
const STORAGE_LANG = 'wl_badminton_lang_v1';

const COPY = {
  en: {
    backPortal: 'WonderLab Play',
    navHow: 'How It Works',
    navPlans: 'Plans & Events',
    langToggle: 'සිංහල',
    heroBadge: '🏸 REAL BODY-MOTION 3D BADMINTON · NO CODE NEEDED',
    heroTitleHtml: 'Move Your Body.<br><span class="wlb-grad">Smash Every Rally.</span>',
    heroSub:
      'Step in front of your laptop, phone, or TV webcam and swing your hand in real time! Try 30 minutes free right now, or book Unlimited Play for Family Gatherings, Birthday Parties & Events.',
    ctaFree: '▶ Play Free (30 Mins)',
    ctaEvent: '🎉 Events & Parties',
    tagNoCode: '⚡ No Room Code Needed',
    tagCam: '📷 Webcam + Keyboard Ready',
    tagTv: '📺 Big Screen TV Friendly',
    artTitle: 'Live 3D Stadium & AI Pose Tracking',
    artSub: 'Casual · Club · Pro AI Rivals',
    artReady: '● Ready in Browser',
    step1Title: 'Open & Play Instantly',
    step1Desc: 'Works directly in your browser on Laptop, Mobile, or Smart TV + Webcam. Zero downloads or room codes.',
    step2Title: 'Swing Your Hand to Hit',
    step2Desc: 'Stand ~2m from the camera so your upper body is visible, then swing left, right, or overhead! Keyboard also supported.',
    step3Title: 'Party & Tournament Fun',
    step3Desc: 'Take turns with family & friends on a TV or projector with live stadium crowd cheers and scoreboard.',
    plansEyebrow: 'CHOOSE YOUR MODE',
    plansTitle: 'Free 30-Minute Experience or Full Event Pass',
    plansSub: 'Try the full game free for 30 minutes — or call us to unlock Unlimited Play for your next party or event!',
    freeKicker: 'INSTANT EXPERIENCE · NO CODE',
    freeName: 'Free Trial Play',
    freePrice: 'FREE',
    freePriceSub: '/ 30 Minutes Gameplay',
    freeF1: 'Full 3D Stadium, Webcam Motion Tracking & Sound Effects',
    freeF2: 'All 3 AI Difficulty Levels (Casual, Club & Pro)',
    freeF3: 'No registration, no credit card, no room code required',
    freeF4: '30 minutes of active court time to test & enjoy',
    freeBtn: '▶ Start 30-Min Free Play',
    freeExpiredBtn: '⏰ 30-Min Free Trial Used — Unlock Below',
    paidRibbon: 'POPULAR FOR EVENTS',
    paidKicker: 'UNLIMITED PLAY · FULL EVENT',
    paidName: 'Family, Party & Event Pass',
    paidPriceDefault: 'Call for Rates',
    paidPriceSub: 'Custom Event & Party Pricing',
    chip1: '👨‍👩‍👧‍👦 Family Gatherings',
    chip2: '🎂 Birthday Parties',
    chip3: '🏫 School & Corporate Events',
    paidF1: 'Unlimited Play Time — play non-stop all day & night!',
    paidF2: 'Ideal for Big Screen TVs, Projectors & Party Competitions',
    paidF3: 'Instant unlock with an Event PIN after calling us',
    paidF4: 'Zero setup hassle — works on your laptop/PC right away',
    callBtn: '📞 Call to Book',
    waBtn: '💬 WhatsApp Us',
    pinLabel: '🔓 Already called us? Enter your Event PIN for Unlimited Play:',
    pinPlaceholder: 'Enter Event PIN',
    pinBtn: 'Unlock & Play →',
    endedTitle: '⏰ Your 30-Minute Free Trial Has Ended!',
    endedDesc:
      'Hope you loved rallying in WonderLab Motion Badminton! Planning a Family Gathering, Birthday Party, or Event? Call or WhatsApp us right now to get an Event PIN for Unlimited Play!',
    backLandingBtn: '← Back to Landing Page'
  },
  si: {
    backPortal: 'WonderLab Play',
    navHow: 'ක්‍රීඩා කරන ආකාරය',
    navPlans: 'පැකේජ සහ උත්සව',
    langToggle: 'English',
    heroBadge: '🏸 සජීවී ශරීර චලන 3D බැඩ්මින්ටන් · කෝඩ් අවශ්‍ය නැත',
    heroTitleHtml: 'අත වනා සජීවීව<br><span class="wlb-grad">3D බැඩ්මින්ටන් ගහමු!</span>',
    heroSub:
      'කිසිම App එකක් හෝ Code එකක් අවශ්‍ය නැත! Laptop, Phone හෝ TV Webcam එක ඉදිරියට පැමිණ ඔබේ අතේ චලනයෙන් සජීවීව ක්‍රීඩා කරන්න. දැන්ම විනාඩි 30ක් නොමිලේ අත්හදා බලන්න!',
    ctaFree: '▶ විනාඩි 30ක් නොමිලේ (Free Try)',
    ctaEvent: '🎉 උත්සව සහ සාද සඳහා',
    tagNoCode: '⚡ Code අවශ්‍ය නැත',
    tagCam: '📷 Webcam + Keyboard පහසුකම',
    tagTv: '📺 TV / Projector සඳහා සුදුසුයි',
    artTitle: 'සජීවී 3D ක්‍රීඩාංගණය සහ AI චලන හඳුනාගැනීම',
    artSub: 'Casual · Club · Pro තරඟ මට්ටම් 3ක්',
    artReady: '● ක්‍රීඩාව සූදානම්',
    step1Title: 'Browser එකෙන් කෙලින්ම ක්‍රීඩා කරන්න',
    step1Desc: 'Laptop, Mobile හෝ TV + Webcam හරහා කිසිම Download එකක් හෝ Code එකක් නොමැතිව ක්‍රීඩා කළ හැක.',
    step2Title: 'අත වනා ෂටලයට පහර දෙන්න',
    step2Desc: 'කැමරාවට අඩි 6ක් පමණ පිටුපසින් සිට අත වනන්න! අවශ්‍ය නම් Keyboard එකෙන්ද සෙල්ලම් කළ හැක.',
    step3Title: 'පවුලේ සැමට සහ සාදවලට සුපිරි විනෝදයක්',
    step3Desc: 'උපන්දින සාද, පවුලේ හමුවීම් සහ උත්සව වලදී TV හෝ Projector තිරයක සියලු දෙනාටම තරඟ කළ හැක.',
    plansEyebrow: 'පැකේජය තෝරන්න',
    plansTitle: 'විනාඩි 30ක් නොමිලේ හෝ සම්පූර්ණ උත්සව පැකේජය',
    plansSub: 'ක්‍රීඩාව අත්හදා බැලීමට විනාඩි 30ක් නොමිලේ! උත්සව සහ සාද සඳහා සීමාවකින් තොරව ක්‍රීඩා කිරීමට අපව අමතන්න.',
    freeKicker: 'නොමිලේ අත්හදා බැලීම · CODE අවශ්‍ය නැත',
    freeName: 'Free Trial (විනාඩි 30)',
    freePrice: 'නොමිලේ',
    freePriceSub: '/ විනාඩි 30ක ක්‍රීඩා කාලයක්',
    freeF1: 'සම්පූර්ණ 3D ක්‍රීඩාංගණය සහ Webcam Motion Tracking',
    freeF2: 'Casual, Club සහ Pro AI තරඟ මට්ටම් සියල්ලම',
    freeF3: 'ලියාපදිංචි වීමක් හෝ Room Code කිසිවක් අවශ්‍ය නැත',
    freeF4: 'ක්‍රීඩාව හොඳින් අත්හදා බැලීමට විනාඩි 30ක සම්පූර්ණ කාලයක්',
    freeBtn: '▶ විනාඩි 30 Free Play අරඹන්න',
    freeExpiredBtn: '⏰ විනාඩි 30 අවසන් — Event PIN එකෙන් Unlock කරන්න',
    paidRibbon: 'උත්සව සඳහා විශේෂයි',
    paidKicker: 'සීමාවකින් තොරව · UNLIMITED PLAY',
    paidName: 'Family, Party & Event Pass',
    paidPriceDefault: 'මිල ගණන් සඳහා අමතන්න',
    paidPriceSub: 'උත්සව සහ සාද සඳහා විශේෂ පැකේජ',
    chip1: '👨‍👩‍👧‍👦 පවුලේ සුහද හමුවීම්',
    chip2: '🎂 උපන්දින සාද (Birthday Parties)',
    chip3: '🏫 පාසල් සහ ආයතනික උත්සව',
    paidF1: 'කාල සීමාවක් නොමැතිව (Unlimited) දවස පුරාම ක්‍රීඩා කරන්න!',
    paidF2: 'TV සහ Projector විශාල තිර සඳහා ඉතාමත් සුදුසුයි',
    paidF3: 'දුරකථනයෙන් අමතා ලබාගන්නා Event PIN එකෙන් ක්ෂණිකව ක්‍රියාත්මක වේ',
    paidF4: 'කිසිම අමතර උපාංගයක් නැතිව ඔබේ Laptop එකෙන්ම ක්‍රියා කරයි',
    callBtn: '📞 දැන්ම අමතන්න',
    waBtn: '💬 WhatsApp පණිවිඩයක්',
    pinLabel: '🔓 අපව අමතා Event PIN එකක් ලබාගත්තාද? මෙහි ඇතුළත් කරන්න:',
    pinPlaceholder: 'Event PIN අංකය',
    pinBtn: 'Unlock කරන්න →',
    endedTitle: '⏰ ඔබේ විනාඩි 30 නොමිලේ කාලය අවසන්!',
    endedDesc:
      'WonderLab Motion Badminton ඔබ රසවින්දා යැයි සිතමු! පවුලේ හමුවීමකට, උපන්දින සාදයකට හෝ උත්සවයකට සීමාවකින් තොරව (Unlimited) ක්‍රීඩා කිරීමට දැන්ම අපව අමතා Event PIN එක ලබාගන්න.',
    backLandingBtn: '← මුල් පිටුවට යන්න'
  }
};

function supaHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };
}

async function supaRpc(fnName, params = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: supaHeaders(),
    body: JSON.stringify(params)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
  }
  return data;
}

function formatMMSS(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function readFreeState(overrideSec = null) {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_FREE) || 'null');
    const now = Date.now();
    if (raw && typeof raw.remainingSec === 'number' && typeof raw.resetAt === 'number' && raw.resetAt > now) {
      return raw;
    }
  } catch {}
  const fresh = {
    remainingSec: overrideSec ?? FREE_DURATION_SEC,
    resetAt: Date.now() + FREE_RESET_WINDOW_MS
  };
  try {
    localStorage.setItem(STORAGE_FREE, JSON.stringify(fresh));
  } catch {}
  return fresh;
}

function saveFreeState(st) {
  try {
    localStorage.setItem(STORAGE_FREE, JSON.stringify(st));
  } catch {}
}

function readPaidState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_PAID) || 'null');
    if (raw && raw.validUntil && raw.validUntil > Date.now()) {
      return raw;
    }
    if (raw) localStorage.removeItem(STORAGE_PAID);
  } catch {}
  return null;
}

function savePaidState(label, validUntil) {
  const st = { label: label || 'Event Pass', validUntil };
  try {
    localStorage.setItem(STORAGE_PAID, JSON.stringify(st));
  } catch {}
  return st;
}

export function initBadmintonLanding({ baseUrl = '/', onPauseArena = () => {} } = {}) {
  const params = new URLSearchParams(window.location.search);
  const qaSec = Number(params.get('testTimerSec'));
  const initialOverride = Number.isFinite(qaSec) && qaSec > 0 && qaSec <= 1800 ? qaSec : null;

  let lang = 'en';
  try {
    const savedLang = localStorage.getItem(STORAGE_LANG);
    if (savedLang === 'si' || savedLang === 'en') lang = savedLang;
  } catch {}

  let contact = {
    phoneDisplay: '',
    phoneTel: '',
    whatsappNumber: '',
    pricingLabel: ''
  };

  let freeState = initialOverride ? { remainingSec: initialOverride, resetAt: Date.now() + FREE_RESET_WINDOW_MS } : readFreeState();
  if (initialOverride) saveFreeState(freeState);

  let paidState = readPaidState();
  let inArena = false;
  let ownerPassSession = '';

  const landingEl = document.createElement('div');
  landingEl.id = 'wlbLanding';
  landingEl.className = 'wlb-landing';

  const endedModal = document.createElement('div');
  endedModal.id = 'wlbTrialEndedModal';
  endedModal.className = 'wlb-modal';
  endedModal.hidden = true;

  const ownerModal = document.createElement('div');
  ownerModal.id = 'wlbOwnerModal';
  ownerModal.className = 'wlb-modal';
  ownerModal.hidden = true;

  const contactModal = document.createElement('div');
  contactModal.id = 'wlbContactModal';
  contactModal.className = 'wlb-modal';
  contactModal.hidden = true;

  document.body.append(landingEl, endedModal, ownerModal, contactModal);
  document.body.classList.add('wlb-on-landing');

  // Inject session pill directly into #app header (visible across Desktop, Tablet, Mobile & TV!)
  const appHeader = document.querySelector('#app header');
  const headerRight = document.querySelector('#app header .header-right');
  const sessionPill = document.createElement('button');
  sessionPill.type = 'button';
  sessionPill.id = 'wlbSessionBadge';
  sessionPill.className = 'wlb-session-pill';
  sessionPill.title = 'Click to view plan or switch mode';
  sessionPill.addEventListener('click', () => openLanding());
  if (appHeader) {
    appHeader.insertBefore(sessionPill, headerRight || null);
  }

  function buildWhatsAppUrl() {
    const msg = encodeURIComponent(
      'Hello WonderLab AR! 🏸✨ I would like to get pricing & an Event PIN for WonderLab Motion Badminton (Family Gathering / Birthday Party / Event).'
    );
    if (contact.whatsappNumber) {
      return `https://wa.me/${contact.whatsappNumber}?text=${msg}`;
    }
    return `https://wa.me/?text=${msg}`;
  }

  function handleCallAction(e) {
    if (contact.phoneTel) {
      window.location.href = `tel:${contact.phoneTel}`;
      return;
    }
    if (e) e.preventDefault();
    renderContactModal();
    contactModal.hidden = false;
  }

  function renderSessionPill() {
    paidState = readPaidState();
    if (paidState) {
      sessionPill.className = 'wlb-session-pill is-paid';
      sessionPill.textContent = '👑 EVENT PASS · UNLIMITED';
      return;
    }
    const low = freeState.remainingSec <= 300;
    sessionPill.className = `wlb-session-pill${low ? ' is-low' : ''}`;
    sessionPill.textContent = `⏱ FREE TRIAL · ${formatMMSS(freeState.remainingSec)}`;
  }

  function renderLanding() {
    const t = COPY[lang];
    paidState = readPaidState();
    const hasFreeTime = freeState.remainingSec > 0;
    const isDefaultPrice = !contact.pricingLabel || contact.pricingLabel === 'Call for Event & Party Rates' || contact.pricingLabel === 'Call for Rates';
    const priceText = isDefaultPrice ? t.paidPriceDefault : contact.pricingLabel;
    const callLabel = contact.phoneDisplay ? `📞 ${contact.phoneDisplay}` : t.callBtn;

    landingEl.innerHTML = `
      <div class="wlb-topbar">
        <div class="wlb-container wlb-topbar-inner">
          <div class="wlb-brand-group">
            <a class="wlb-back-portal" href="${PORTAL_URL}">← <span>${t.backPortal}</span></a>
            <img class="wlb-logo-img" src="${baseUrl}ui/logo.png" alt="WonderLab Motion Badminton" />
          </div>
          <div class="wlb-nav-links">
            <a href="#wlbHow">${t.navHow}</a>
            <a href="#wlbPlans">${t.navPlans}</a>
          </div>
          <div class="wlb-top-actions">
            <button type="button" class="wlb-pill-btn" data-act="toggle-lang">🌐 ${t.langToggle}</button>
            <button type="button" class="wlb-pill-btn" data-act="open-owner" title="Owner Settings & Event PIN Generator">🔒 Owner</button>
          </div>
        </div>
      </div>

      <section class="wlb-hero">
        <div class="wlb-container wlb-hero-grid">
          <div>
            <div class="wlb-eyebrow">${t.heroBadge}</div>
            <h2 class="wlb-hero-title">${t.heroTitleHtml}</h2>
            <p class="wlb-hero-sub">${t.heroSub}</p>
            <div class="wlb-hero-ctas">
              ${
                paidState
                  ? `<button type="button" class="wlb-btn-gold" data-act="enter-paid">👑 Continue Unlimited Event Play →</button>`
                  : `<button type="button" class="wlb-btn-primary" data-act="start-free">${
                      hasFreeTime ? `${t.ctaFree} · ${formatMMSS(freeState.remainingSec)}` : t.freeExpiredBtn
                    }</button>`
              }
              <a href="#wlbPlans" class="wlb-btn-outline">${t.ctaEvent}</a>
            </div>
            <div class="wlb-hero-tags">
              <span>${t.tagNoCode}</span>
              <span>${t.tagCam}</span>
              <span>${t.tagTv}</span>
            </div>
          </div>

          <div class="wlb-hero-visual">
            <div class="wlb-art-frame">
              <img src="${baseUrl}ui/stadium.png" alt="WonderLab Motion Badminton 3D Stadium" />
              <div class="wlb-art-overlay">
                <div class="wlb-art-caption">
                  <strong>${t.artTitle}</strong>
                  <span>${t.artSub}</span>
                </div>
                <span class="wlb-ready-pill">${t.artReady}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="wlb-steps" id="wlbHow">
        <div class="wlb-container wlb-steps-grid">
          <div class="wlb-step-card">
            <span class="wlb-step-num">1</span>
            <h3 class="wlb-step-title">${t.step1Title}</h3>
            <p class="wlb-step-desc">${t.step1Desc}</p>
          </div>
          <div class="wlb-step-card">
            <span class="wlb-step-num">2</span>
            <h3 class="wlb-step-title">${t.step2Title}</h3>
            <p class="wlb-step-desc">${t.step2Desc}</p>
          </div>
          <div class="wlb-step-card">
            <span class="wlb-step-num">3</span>
            <h3 class="wlb-step-title">${t.step3Title}</h3>
            <p class="wlb-step-desc">${t.step3Desc}</p>
          </div>
        </div>
      </section>

      <section class="wlb-plans" id="wlbPlans">
        <div class="wlb-container">
          <div class="wlb-section-head">
            <span class="wlb-eyebrow">${t.plansEyebrow}</span>
            <h2 class="wlb-section-title">${t.plansTitle}</h2>
            <p class="wlb-section-sub">${t.plansSub}</p>
          </div>

          <div class="wlb-plans-grid">
            <!-- FREE 30-MIN CARD -->
            <div class="wlb-plan-card">
              <div class="wlb-plan-kicker">${t.freeKicker}</div>
              <h3 class="wlb-plan-name">${t.freeName}</h3>
              <div class="wlb-plan-price">
                <strong>${t.freePrice}</strong>
                <span>${t.freePriceSub}</span>
              </div>
              <ul class="wlb-plan-list">
                <li><span class="wlb-check">✓</span><span>${t.freeF1}</span></li>
                <li><span class="wlb-check">✓</span><span>${t.freeF2}</span></li>
                <li><span class="wlb-check">✓</span><span>${t.freeF3}</span></li>
                <li><span class="wlb-check">✓</span><span>${t.freeF4}</span></li>
              </ul>
              <div class="wlb-plan-spacer">
                <div class="wlb-trial-meter">
                  <span>⏱ Remaining Free Time</span>
                  <strong>${formatMMSS(freeState.remainingSec)} / 30:00</strong>
                </div>
                <button type="button" class="wlb-btn-primary" style="width:100%" data-act="start-free" ${
                  !hasFreeTime && !paidState ? 'disabled' : ''
                }>
                  ${hasFreeTime ? t.freeBtn : t.freeExpiredBtn}
                </button>
              </div>
            </div>

            <!-- PAID EVENT & PARTY PASS CARD -->
            <div class="wlb-plan-card wlb-plan-card--event">
              <span class="wlb-plan-ribbon">${t.paidRibbon}</span>
              <div class="wlb-plan-kicker">${t.paidKicker}</div>
              <h3 class="wlb-plan-name">${t.paidName}</h3>
              <div class="wlb-plan-price">
                <strong>${priceText}</strong>
                <span>${t.paidPriceSub}</span>
              </div>
              <div class="wlb-event-chips">
                <span>${t.chip1}</span>
                <span>${t.chip2}</span>
                <span>${t.chip3}</span>
              </div>
              <ul class="wlb-plan-list">
                <li><span class="wlb-check">✓</span><span>${t.paidF1}</span></li>
                <li><span class="wlb-check">✓</span><span>${t.paidF2}</span></li>
                <li><span class="wlb-check">✓</span><span>${t.paidF3}</span></li>
                <li><span class="wlb-check">✓</span><span>${t.paidF4}</span></li>
              </ul>

              <div class="wlb-plan-spacer">
                <div class="wlb-contact-row">
                  <button type="button" class="wlb-btn-call" data-act="call-now">${callLabel}</button>
                  <a class="wlb-btn-wa" href="${buildWhatsAppUrl()}" target="_blank" rel="noopener noreferrer">${t.waBtn}</a>
                </div>

                ${
                  paidState
                    ? `<button type="button" class="wlb-btn-gold" style="width:100%" data-act="enter-paid">👑 Event Pass Active — Enter Arena →</button>`
                    : `<form class="wlb-pin-box" data-form="unlock-pin">
                        <label class="wlb-pin-label" for="wlbPinInput">${t.pinLabel}</label>
                        <div class="wlb-pin-row">
                          <input id="wlbPinInput" class="wlb-input" name="pin" type="text" autocomplete="off" maxlength="16" placeholder="${t.pinPlaceholder}" />
                          <button type="submit" class="wlb-pin-submit">${t.pinBtn}</button>
                        </div>
                        <div class="wlb-pin-msg" data-role="pin-msg"></div>
                      </form>`
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="wlb-foot">
        <div class="wlb-container">
          © 2026 <strong>WonderLab AR</strong> · WonderLab Motion Badminton · Powered by Real-Time Webcam AI
        </div>
      </div>
    `;
  }

  function renderEndedModal() {
    const t = COPY[lang];
    const callLabel = contact.phoneDisplay ? `📞 ${contact.phoneDisplay}` : t.callBtn;
    endedModal.innerHTML = `
      <div class="wlb-modal-card">
        <div class="wlb-eyebrow">FREE SESSION COMPLETE</div>
        <h2>${t.endedTitle}</h2>
        <p>${t.endedDesc}</p>
        <div class="wlb-contact-row">
          <button type="button" class="wlb-btn-call" data-act="call-now">${callLabel}</button>
          <a class="wlb-btn-wa" href="${buildWhatsAppUrl()}" target="_blank" rel="noopener noreferrer">${t.waBtn}</a>
        </div>
        <form class="wlb-pin-box" data-form="unlock-pin" style="margin-bottom:14px">
          <label class="wlb-pin-label">${t.pinLabel}</label>
          <div class="wlb-pin-row">
            <input class="wlb-input" name="pin" type="text" autocomplete="off" maxlength="16" placeholder="${t.pinPlaceholder}" />
            <button type="submit" class="wlb-pin-submit">${t.pinBtn}</button>
          </div>
          <div class="wlb-pin-msg" data-role="pin-msg"></div>
        </form>
        <button type="button" class="wlb-btn-outline" style="width:100%" data-act="back-landing">${t.backLandingBtn}</button>
      </div>
    `;
  }

  function renderContactModal() {
    const phoneInfo = contact.phoneDisplay
      ? `<p style="font-size:18px;font-weight:800;color:#ffe45e;margin-bottom:14px">📞 ${contact.phoneDisplay}</p>`
      : `<p>Message us directly on WhatsApp below for instant Event & Party rates and your Unlimited Event PIN!</p>`;
    contactModal.innerHTML = `
      <div class="wlb-modal-card">
        <button type="button" class="wlb-modal-close" data-act="close-contact">✕</button>
        <div class="wlb-eyebrow">BOOK FOR EVENTS & PARTIES</div>
        <h2>Contact WonderLab AR</h2>
        ${phoneInfo}
        <div class="wlb-contact-row" style="grid-template-columns:1fr">
          ${
            contact.phoneTel
              ? `<a class="wlb-btn-call" href="tel:${contact.phoneTel}">📞 Call ${contact.phoneDisplay}</a>`
              : ''
          }
          <a class="wlb-btn-wa" href="${buildWhatsAppUrl()}" target="_blank" rel="noopener noreferrer">💬 Chat on WhatsApp Now</a>
        </div>
      </div>
    `;
  }

  async function renderOwnerModal(pinsData = null) {
    if (!ownerPassSession) {
      ownerModal.innerHTML = `
        <div class="wlb-modal-card">
          <button type="button" class="wlb-modal-close" data-act="close-owner">✕</button>
          <div class="wlb-eyebrow">WONDERLAB OWNER</div>
          <h2>🔒 Badminton Admin</h2>
          <p>Sign in with your WonderLab Play owner password to set your Phone/WhatsApp number or generate 24h Event PINs.</p>
          <form data-form="owner-login">
            <div class="wlb-field">
              <label>Owner Password</label>
              <input class="wlb-input" style="width:100%" type="password" name="pass" placeholder="Enter owner password" required />
            </div>
            <div class="wlb-pin-msg" data-role="owner-msg"></div>
            <button type="submit" class="wlb-btn-primary" style="width:100%;margin-top:8px">Unlock Admin →</button>
          </form>
        </div>
      `;
      return;
    }

    const pins = (pinsData && pinsData.pins) || [];
    ownerModal.innerHTML = `
      <div class="wlb-modal-card">
        <button type="button" class="wlb-modal-close" data-act="close-owner">✕</button>
        <div class="wlb-eyebrow">CLOUD SYNCED · SUPABASE</div>
        <h2>⚙️ Badminton Settings & Event PINs</h2>

        <form data-form="owner-settings">
          <div class="wlb-field">
            <label>📞 Display Phone Number (e.g. 077 123 4567)</label>
            <input class="wlb-input" style="width:100%" name="phone" value="${contact.phoneDisplay || ''}" placeholder="077 XXX XXXX" />
          </div>
          <div class="wlb-field">
            <label>💬 WhatsApp Number (e.g. 94771234567 or 0771234567)</label>
            <input class="wlb-input" style="width:100%" name="wa" value="${contact.whatsappNumber || ''}" placeholder="077XXXXXXX" />
          </div>
          <div class="wlb-field">
            <label>🏷️ Paid Card Price Text</label>
            <input class="wlb-input" style="width:100%" name="pricing" value="${contact.pricingLabel || 'Call for Rates'}" placeholder="Call for Rates" />
          </div>
          <button type="submit" class="wlb-pin-submit" style="width:100%">💾 Save Contact Details Live</button>
          <div class="wlb-pin-msg" data-role="settings-msg"></div>
        </form>

        <div class="wlb-owner-section">
          <label class="wlb-pin-label">🔑 Generate Temporary Customer Event PIN (Auto-Deletes When Expired)</label>
          <form data-form="owner-create-pin" style="display:grid;grid-template-columns:1fr 110px auto;gap:8px">
            <input class="wlb-input" name="label" placeholder="Event name (e.g. Birthday)" />
            <select class="wlb-input" name="hours" style="margin:0;padding:8px">
              <option value="24">24 Hours</option>
              <option value="48">48 Hours</option>
              <option value="168">7 Days</option>
            </select>
            <button type="submit" class="wlb-pin-submit">+ PIN</button>
          </form>
          <div class="wlb-pin-list">
            ${pins
              .map(
                (p) => `
              <div class="wlb-pin-item">
                <span><code>${p.pin}</code> · ${p.label} ${p.expiresAt ? `(${p.durationHours}h)` : '(Master)'}</span>
                <button type="button" class="wlb-pill-btn" style="padding:3px 9px;font-size:11px" data-del-pin="${p.pin}">✕</button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="wlb-owner-section">
          <button type="button" class="wlb-btn-outline" style="width:100%;font-size:12.5px;padding:9px" data-act="reset-local-trial">
            🔄 Reset My Browser's 30-Min Free Timer (For Owner Testing)
          </button>
        </div>
      </div>
    `;
  }

  function enterArena() {
    landingEl.hidden = true;
    endedModal.hidden = true;
    document.body.classList.remove('wlb-on-landing');
    inArena = true;
    renderSessionPill();
    window.dispatchEvent(new Event('resize'));
  }

  function openLanding() {
    inArena = false;
    onPauseArena();
    endedModal.hidden = true;
    landingEl.hidden = false;
    document.body.classList.add('wlb-on-landing');
    renderLanding();
  }

  async function verifyPinForm(form) {
    const input = form.querySelector('input[name="pin"]');
    const msgEl = form.querySelector('[data-role="pin-msg"]');
    const pin = (input?.value || '').trim().toUpperCase();
    if (!pin) return;
    msgEl.className = 'wlb-pin-msg';
    msgEl.textContent = 'Checking Event PIN...';
    try {
      const res = await supaRpc('badminton_verify_event_pin', { p_pin: pin });
      if (!res || !res.ok) {
        msgEl.textContent = lang === 'si' ? 'වැරදි හෝ කල් ඉකුත් වූ PIN අංකයකි.' : 'Invalid or expired Event PIN. Please call us!';
        return;
      }
      paidState = savePaidState(res.label, res.validUntil);
      msgEl.className = 'wlb-pin-msg is-ok';
      msgEl.textContent = '✓ Unlimited Event Pass Unlocked!';
      renderSessionPill();
      setTimeout(() => enterArena(), 350);
    } catch {
      msgEl.textContent = 'Network error checking PIN. Please check internet & retry.';
    }
  }

  // Event delegation across landing & modals
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act], [data-del-pin]');
    if (!btn) return;

    if (btn.dataset.delPin && ownerPassSession) {
      const data = await supaRpc('badminton_manage_pins', {
        p_owner_pass: ownerPassSession,
        p_action: 'delete',
        p_pin: btn.dataset.delPin
      });
      renderOwnerModal(data);
      return;
    }

    switch (btn.dataset.act) {
      case 'toggle-lang':
        lang = lang === 'en' ? 'si' : 'en';
        try {
          localStorage.setItem(STORAGE_LANG, lang);
        } catch {}
        renderLanding();
        break;
      case 'start-free':
        paidState = readPaidState();
        if (!paidState && freeState.remainingSec <= 0) {
          renderEndedModal();
          endedModal.hidden = false;
          return;
        }
        enterArena();
        break;
      case 'enter-paid':
        enterArena();
        break;
      case 'call-now':
        handleCallAction(e);
        break;
      case 'close-contact':
        contactModal.hidden = true;
        break;
      case 'back-landing':
        openLanding();
        break;
      case 'open-owner':
        if (ownerPassSession) {
          const data = await supaRpc('badminton_manage_pins', { p_owner_pass: ownerPassSession, p_action: 'list' }).catch(() => null);
          await renderOwnerModal(data);
        } else {
          await renderOwnerModal();
        }
        ownerModal.hidden = false;
        break;
      case 'close-owner':
        ownerModal.hidden = true;
        break;
      case 'reset-local-trial':
        freeState = { remainingSec: FREE_DURATION_SEC, resetAt: Date.now() + FREE_RESET_WINDOW_MS };
        saveFreeState(freeState);
        localStorage.removeItem(STORAGE_PAID);
        paidState = null;
        renderSessionPill();
        renderLanding();
        ownerModal.hidden = true;
        break;
    }
  });

  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();

    const kind = form.dataset.form;
    if (kind === 'unlock-pin') {
      await verifyPinForm(form);
    } else if (kind === 'owner-login') {
      const pass = form.querySelector('input[name="pass"]').value.trim();
      const msg = form.querySelector('[data-role="owner-msg"]');
      msg.textContent = 'Verifying...';
      try {
        const ok = await supaRpc('portal_verify_owner', { p_pass: pass });
        if (!ok) {
          msg.textContent = 'Incorrect owner password.';
          return;
        }
        ownerPassSession = pass;
        const pinsData = await supaRpc('badminton_manage_pins', { p_owner_pass: pass, p_action: 'list' });
        await renderOwnerModal(pinsData);
      } catch (err) {
        msg.textContent = err.message || 'Verification failed.';
      }
    } else if (kind === 'owner-settings') {
      const phone = form.querySelector('input[name="phone"]').value.trim();
      const wa = form.querySelector('input[name="wa"]').value.trim();
      const pricing = form.querySelector('input[name="pricing"]').value.trim();
      const msg = form.querySelector('[data-role="settings-msg"]');
      msg.textContent = 'Saving to Supabase...';
      try {
        const row = await supaRpc('badminton_update_settings', {
          p_owner_pass: ownerPassSession,
          p_phone_display: phone,
          p_whatsapp: wa,
          p_pricing_label: pricing
        });
        contact = {
          phoneDisplay: row.phone_display || '',
          phoneTel: row.phone_tel || '',
          whatsappNumber: row.whatsapp_number || '',
          pricingLabel: row.pricing_label || ''
        };
        msg.className = 'wlb-pin-msg is-ok';
        msg.textContent = '✓ Saved live! Call & WhatsApp buttons updated.';
        renderLanding();
      } catch (err) {
        msg.className = 'wlb-pin-msg';
        msg.textContent = err.message || 'Failed to save.';
      }
    } else if (kind === 'owner-create-pin') {
      const label = form.querySelector('input[name="label"]').value.trim() || 'Party Event Pass';
      const hours = Number(form.querySelector('select[name="hours"]').value) || 24;
      const pinsData = await supaRpc('badminton_manage_pins', {
        p_owner_pass: ownerPassSession,
        p_action: 'create',
        p_label: label,
        p_hours: hours
      });
      await renderOwnerModal(pinsData);
    }
  });

  // Intercept brand link & Home button inside the game so clicking them opens the Landing Page cleanly!
  const brandLink = document.querySelector('#app header a.brand');
  const homeBtn = document.querySelector('#app .hud-tools a');
  for (const link of [brandLink, homeBtn]) {
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openLanding();
      });
    }
  }

  // 1-second active arena countdown timer
  setInterval(() => {
    if (!inArena) return;
    paidState = readPaidState();
    if (paidState) {
      renderSessionPill();
      return;
    }
    if (freeState.remainingSec > 0) {
      freeState.remainingSec = Math.max(0, freeState.remainingSec - 1);
      saveFreeState(freeState);
      renderSessionPill();
    }
    if (freeState.remainingSec <= 0) {
      inArena = false;
      onPauseArena();
      renderEndedModal();
      endedModal.hidden = false;
    }
  }, 1000);

  // Fetch live contact settings from Supabase on boot
  (async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/badminton_settings?id=eq.1&select=*`, {
        headers: supaHeaders()
      });
      const rows = await res.json();
      if (Array.isArray(rows) && rows[0]) {
        contact = {
          phoneDisplay: rows[0].phone_display || '',
          phoneTel: rows[0].phone_tel || '',
          whatsappNumber: rows[0].whatsapp_number || '',
          pricingLabel: rows[0].pricing_label || ''
        };
        if (!landingEl.hidden) renderLanding();
      }
    } catch {}
  })();

  renderLanding();
  renderSessionPill();

  return {
    openLanding,
    isBlocked: () => !readPaidState() && freeState.remainingSec <= 0
  };
}
