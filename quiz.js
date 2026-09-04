/* ============================================================
   FIND YOUR FERTILITY BLIND SPOT  —  Quiz logic
   Recreation of Sophie Byfield's tryinteract quiz.
   ------------------------------------------------------------
   HOW IT WORKS
   - 4 result "buckets" (archetypes). Each DIAGNOSTIC answer casts
     one vote for a bucket. STORY-ARC questions are unscored — they
     exist for engagement/narrative, matching the original quiz.
   - The bucket with the most votes wins. Ties break by TIE_PRIORITY.
   - After the quiz we capture name + email, hand them to your email
     tool (see CONFIG.emailEndpoint), then REDIRECT to the matching
     results page on sophiebyfield.com.

   Everything you'd want to change lives in CONFIG, BUCKETS and
   QUESTIONS below. You shouldn't need to touch the logic section.
   ============================================================ */

/* ---- 1. CONFIG -------------------------------------------- */
const CONFIG = {
  // Where each archetype's results page lives.
  // (Your existing live pages — used for the fallback redirect below.)
  resultUrls: {
    hopeful:  "https://sophiebyfield.com/results-hopeful/",
    precise:  "https://sophiebyfield.com/results-precise/",
    wellness: "https://sophiebyfield.com/results-wellness/",
    resister: "https://sophiebyfield.com/results-resister/",
  },

  // Collect email before showing results? (You'll want this ON.)
  collectEmail: true,

  // Show the intro/welcome screen first? When this quiz is embedded in
  // an iframe (the landing page already has the hero + "Start" button),
  // keep this false so it opens straight on question one.
  showIntro: false,

  /* -------- FLODESK --------
     The quiz shows the Flodesk inline form that matches the person's
     result. Each Flodesk form should be set up (in your Flodesk
     account) to:
        1. add the subscriber to that archetype's SEGMENT/TAG
           (which triggers that archetype's email sequence), and
        2. REDIRECT on submit to that archetype's results page.
     That way Flodesk handles capture + tagging + redirect for you.

     >>> ACTION NEEDED: paste each form's ID below.
     Find it in Flodesk → Forms → (your form) → Share/Embed. The embed
     code contains  formId: 'xxxxxxxxxxxxxxxx'  — copy that value.

     Until an ID is filled in, the quiz falls back to the built-in
     branded form and just redirects to resultUrls (so it works and is
     testable right now). */
  flodesk: {
    formIds: {
      hopeful:  "6a9a44868fc9b886ee31225f",
      precise:  "6a9a4713a417fd519e2aeb7b",
      wellness: "6a9a47a3e86962767f3e7c9a",
      resister: "6a9a485c3a65c9dd692f676b",
    },
  },

  // On a tie, the first bucket in this list wins. Ordered from the
  // most acute need to the least, so a tie leans toward more support.
  tiePriority: ["resister", "wellness", "precise", "hopeful"],
};

/* ---- 2. BUCKETS (the four archetypes) --------------------- */
const BUCKETS = {
  hopeful:  { name: "The Hopeful Tracker",  acronym: "THT", color: "#4c9a5a" },
  precise:  { name: "The Precise Planner",  acronym: "TPP", color: "#e0a92b" },
  wellness: { name: "The Wellness Warrior", acronym: "TWW", color: "#d0483f" },
  resister: { name: "The Quiet Resister",   acronym: "TQR", color: "#3f78c4" },
};

/* ---- 3. QUESTIONS ----------------------------------------- */
/* type: "diagnostic" answers vote for a bucket (set `bucket`).
   type: "story"      answers are unscored (no bucket needed). */
const QUESTIONS = [
  {
    type: "story",
    q: "Before we dive in, Sis. How are you feeling about trying for a baby right now?",
    sub: "No pressure. No wrong answers here.",
    options: [
      { label: "I'm ready to bring my baby home. Let's do this." },
      { label: "I'm hopeful, but honestly a little tired of waiting." },
      { label: "I want answers, but I'm scared to get my hopes up again." },
    ],
  },
  {
    type: "diagnostic",
    q: "How regular is your cycle, Sis?",
    sub: "Is she showing up like clockwork, or keeping you guessing?",
    options: [
      { label: "She's a legend. Shows up on time, every time.", bucket: "hopeful" },
      { label: "Some months are fine, some are funky. I can't find a pattern.", bucket: "precise" },
      { label: "I track everything, but nothing ever makes sense.", bucket: "wellness" },
      { label: "It's a hot mess. I never know when she's coming and I'm over it.", bucket: "resister" },
    ],
  },
  {
    type: "story",
    q: "When someone close to you announces they're pregnant, how does it hit you?",
    sub: "No judgment, no shame. We've all felt a mix of things.",
    options: [
      { label: "I smile and celebrate, but quietly wonder, “when will it be my turn?”" },
      { label: "I'm truly happy for them. No jealousy here, just excited." },
      { label: "It stings. I'm happy for them, but it reminds me of my own heartbreak." },
      { label: "I avoid announcements if I can. It's just too hard right now." },
    ],
  },
  {
    type: "diagnostic",
    q: "Ovulation tracking is a whole thing. How are you really feeling about tracking your fertile window?",
    sub: "Apps, temping, pee sticks. There's a lot out there.",
    options: [
      { label: "What's BBT again? I mostly just use an app and hope I'm doing it right.", bucket: "hopeful" },
      { label: "I use the sticks or strips, but honestly, I still feel a little lost on timing.", bucket: "precise" },
      { label: "I've done it all. BBT, strips, mucus, even bloodwork. And still no results.", bucket: "wellness" },
      { label: "I know exactly when I ovulate, but those monthly negatives still break me.", bucket: "resister" },
    ],
  },
  {
    type: "diagnostic",
    q: "Let's talk food, Sis. How's your relationship with food these days?",
    sub: "Turns out “you are what you eat” hits different when you're trying to conceive.",
    options: [
      { label: "I eat clean and avoid all the big triggers, but I still feel off, bloated, or inflamed.", bucket: "wellness" },
      { label: "I try to eat healthy, but between cravings and stress, I'm definitely not perfect.", bucket: "resister" },
      { label: "I've made solid changes lately. Less sugar, more hormone-friendly foods. I feel on track.", bucket: "precise" },
      { label: "I'm just starting to learn what foods support fertility. No pressure, but I've got questions.", bucket: "hopeful" },
    ],
  },
  {
    type: "story",
    q: "Auntie Flo is around the corner. Your boobs hurt, bacon smells like trash, and you're bloated AF. What do you do?",
    sub: "",
    options: [
      { label: "Google every early symptom and pee on a stick at 8DPO." },
      { label: "I try to wait, but that test starts calling my name." },
      { label: "I've tested so many times and been crushed. I don't even want to see a stick." },
      { label: "I don't always know when the two-week wait starts. Still figuring that part out." },
    ],
  },
  {
    type: "story",
    q: "When a family member hits you with “so when are y'all having a baby?” how do you handle it?",
    sub: "",
    options: [
      { label: "I smile and say, “we're working on it,” even if it stings." },
      { label: "I nod politely, then spiral the rest of the night." },
      { label: "I skip events where I'll get asked that. I just can't." },
      { label: "I shut it down quick. My boundaries are strong and I'm not here for that energy." },
    ],
  },
  {
    type: "diagnostic",
    q: "Okay, your fertile window is here. What's your move?",
    sub: "Are you lighting candles or quietly bracing for impact?",
    options: [
      { label: "I don't really know when that is yet. We're just seeing what happens.", bucket: "hopeful" },
      { label: "I time it and let my partner know, but whew, it's starting to feel like a chore.", bucket: "precise" },
      { label: "I've stopped saying anything. The pressure was too much and it started affecting us.", bucket: "resister" },
      { label: "I use a donor or time it super carefully, but I'm still unsure if I'm doing it right.", bucket: "wellness" },
    ],
  },
  {
    type: "diagnostic",
    q: "Where do you get most of your fertility info these days?",
    sub: "TikToks, blogs, experts, Auntie Carol. We've seen it all. But what's guiding you right now?",
    options: [
      { label: "I'm just getting started. Googling and crossing my fingers.", bucket: "hopeful" },
      { label: "I've watched all the YouTube videos and read the blogs, but I still feel confused.", bucket: "precise" },
      { label: "I follow experts and coaches. Tried everything from acupuncture to seed cycling.", bucket: "wellness" },
      { label: "Honestly? I've stopped looking. I've heard it all and I'm just tired.", bucket: "resister" },
    ],
  },
  {
    type: "story",
    q: "Be honest, how's your relationship with your body these days?",
    sub: "",
    options: [
      { label: "I trust it, but I also low-key question everything." },
      { label: "We've been through it. I'm doing my best to stay connected." },
      { label: "Honestly, I feel like my body's failing me." },
      { label: "I'm just starting to listen to it again." },
    ],
  },

  /* ---------------------------------------------------------------
     ⚠️  Q10 — DRAFTED (not in the source PDF).
     The original flow was "10 questions + 1 warm-up" but the export
     ended at Q9. This diagnostic question keeps the intended count and
     sets up the next step. Review the wording and answer→bucket
     mapping, or delete this block to ship 9 questions.
     --------------------------------------------------------------- */
  {
    type: "diagnostic",
    q: "Last one, Sis. When it comes to support right now, where are you?",
    sub: "Be honest. There's no wrong answer here.",
    options: [
      { label: "Mostly figuring it out solo. Googling and hoping for the best.", bucket: "hopeful" },
      { label: "I've got a plan and resources, but no one who really gets it.", bucket: "precise" },
      { label: "I've got a whole toolkit of experts, but I still feel unseen.", bucket: "wellness" },
      { label: "I've pulled back from support. It hurts to keep talking about it.", bucket: "resister" },
    ],
  },
];

/* ============================================================
   LOGIC — you shouldn't need to edit below here.
   ============================================================ */
(function () {
  const state = { index: 0, answers: [], result: null };

  const $ = (s) => document.querySelector(s);
  const screens = {};
  document.querySelectorAll("[data-screen]").forEach((s) => (screens[s.dataset.screen] = s));

  const el = {
    progressBar: $("#progress-bar"),
    progressLabel: $("#progress-label"),
    questionText: $("#question-text"),
    questionSub: $("#question-sub"),
    options: $("#options"),
    backBtn: $("#back-btn"),
    emailForm: $("#email-form"),
    builtInForm: $("#builtin-form"),
    flodeskMount: $("#flodesk-mount"),
    fieldName: $("#field-name"),
    fieldEmail: $("#field-email"),
    formError: $("#form-error"),
    emailSubmit: $("#email-submit"),
    manualRedirect: $("#manual-redirect"),
    year: $("#year"),
  };

  function show(name) {
    Object.values(screens).forEach((s) => (s.hidden = true));
    screens[name].hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    postHeight();
  }

  /* Tell the parent page how tall we are, so the iframe can auto-resize.
     (Pairs with the listener in the embed snippet — see README.) */
  function postHeight() {
    try {
      const h = document.body.scrollHeight;
      window.parent && window.parent.postMessage({ type: "fq-height", height: h }, "*");
    } catch (e) { /* not in an iframe, or blocked — ignore */ }
  }
  window.addEventListener("load", postHeight);
  window.addEventListener("resize", postHeight);
  if ("ResizeObserver" in window) {
    new ResizeObserver(postHeight).observe(document.documentElement);
  }

  /* ---- Questions ---- */
  function renderQuestion() {
    const item = QUESTIONS[state.index];
    const total = QUESTIONS.length;

    el.progressBar.style.width = `${(state.index / total) * 100}%`;
    el.progressLabel.textContent = `${state.index + 1} / ${total}`;
    el.questionText.textContent = item.q;
    el.questionSub.textContent = item.sub || "";
    el.questionSub.hidden = !item.sub;
    el.backBtn.hidden = state.index === 0;

    el.options.innerHTML = "";
    item.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.setAttribute("role", "radio");
      const chosen = state.answers[state.index] === i;
      btn.setAttribute("aria-checked", chosen ? "true" : "false");
      if (chosen) btn.classList.add("selected");
      btn.textContent = opt.label;
      btn.addEventListener("click", () => selectAnswer(i));
      el.options.appendChild(btn);
    });
  }

  function selectAnswer(optionIndex) {
    state.answers[state.index] = optionIndex;
    renderQuestion();
    setTimeout(() => {
      if (state.index < QUESTIONS.length - 1) {
        state.index++;
        renderQuestion();
      } else {
        finishQuiz();
      }
    }, 180);
  }

  function back() {
    if (state.index > 0) {
      state.index--;
      renderQuestion();
    }
  }

  /* ---- Scoring ---- */
  function computeResult() {
    const tally = { hopeful: 0, precise: 0, wellness: 0, resister: 0 };
    QUESTIONS.forEach((item, qi) => {
      if (item.type !== "diagnostic") return;
      const ans = state.answers[qi];
      if (ans == null) return;
      const bucket = item.options[ans].bucket;
      if (bucket && tally[bucket] != null) tally[bucket] += 1;
    });
    const max = Math.max(...Object.values(tally));
    // tie-break by configured priority
    const winner =
      CONFIG.tiePriority.find((b) => tally[b] === max) ||
      Object.keys(tally)[0];
    return { key: winner, tally, ...BUCKETS[winner] };
  }

  /* ---- Finish → email → redirect ---- */
  function finishQuiz() {
    el.progressBar.style.width = "100%";
    state.result = computeResult();
    if (!CONFIG.collectEmail) return redirect();

    const flodeskId = CONFIG.flodesk.formIds[state.result.key];
    show("email");
    if (flodeskId) {
      renderFlodeskForm(flodeskId);
    } else {
      // Fallback: built-in branded form (redirects itself).
      el.builtInForm.hidden = false;
      el.flodeskMount.hidden = true;
      setTimeout(() => el.fieldName && el.fieldName.focus(), 250);
    }
  }

  /* ---- Flodesk inline form (handles capture + tag + redirect) ---- */
  let flodeskLoaded = false;
  function loadFlodesk() {
    if (flodeskLoaded) return;
    flodeskLoaded = true;
    (function (w, d, t, h, s, n) {
      w.FlodeskObject = n;
      var fn = function () { (w[n].q = w[n].q || []).push(arguments); };
      w[n] = w[n] || fn;
      var f = d.getElementsByTagName(t)[0];
      var v = "?v=" + Math.floor(new Date().getTime() / (120 * 1000));
      var sm = d.createElement(t); sm.async = true; sm.type = "module";
      sm.src = h + s + ".mjs" + v; f.parentNode.insertBefore(sm, f);
      var l = d.createElement(t); l.async = true;
      l.src = h + s + ".js" + v; f.parentNode.insertBefore(l, f);
    })(window, document, "script", "https://assets.flodesk.com/universal", "/universal", "fd");
  }
  function renderFlodeskForm(formId) {
    el.builtInForm.hidden = true;
    el.flodeskMount.hidden = false;
    el.flodeskMount.innerHTML = '<div class="fd-form-' + formId + '"></div>';
    loadFlodesk();
    window.fd("form", { formId: formId, containerEl: "." + "fd-form-" + formId });
  }

  async function submitEmail(e) {
    e.preventDefault();
    const name = el.fieldName.value.trim();
    const email = el.fieldEmail.value.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !validEmail) {
      el.formError.textContent = !name
        ? "Please add your first name, Sis."
        : "That email doesn't look quite right. Mind checking it?";
      el.formError.hidden = false;
      return;
    }
    el.formError.hidden = true;
    el.emailSubmit.disabled = true;
    el.emailSubmit.textContent = "One sec…";

    /* This built-in form is only the FALLBACK shown before Flodesk form
       IDs are added (see CONFIG.flodesk). Once those IDs are in place,
       the real Flodesk form handles capture + tagging + redirect and
       this handler never runs. In fallback mode we just redirect. */
    redirect();
  }

  function redirect() {
    const url = CONFIG.resultUrls[state.result.key];
    el.manualRedirect.href = url;
    show("redirect");
    setTimeout(() => (window.location.href = url), 900);
  }

  /* ---- Wire up ---- */
  document.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", () => {
      const a = node.getAttribute("data-action");
      if (a === "start" || a === "restart") start();
      if (a === "back") back();
    });
  });
  if (el.emailForm) el.emailForm.addEventListener("submit", submitEmail);

  function start() {
    state.index = 0;
    state.answers = [];
    state.result = null;
    renderQuestion();
    show("question");
  }

  el.year.textContent = new Date().getFullYear();

  // Embedded in an iframe? Skip the intro and open on question one.
  if (CONFIG.showIntro === false) start();
})();
