(() => {
  "use strict";

  // =========================================
  // ECOFILAMENT — BILINGUAL PRESENTATION
  // English (default) / Arabic
  // =========================================

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const slides = $$(".slide");
  const progress = $("#progress");
  const langButton = $("#langBtn");
  const timerButton = $("#timerBtn");
  const timerDisplay = $("#timer");
  const fullscreenButton = $("#fullBtn");

  const main = $("#presentation");

  if (!slides.length || !main || !langButton || !progress) {
    console.error("EcoFilament: Required presentation elements are missing.");
    return;
  }

  let currentSlide = 0;
  let currentLanguage = "en";

  let remainingSeconds = 10 * 60;
  let timerInterval = null;

  // =========================================
  // PREMIUM MOTION + INTERACTION LAYER
  // =========================================

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // Self-contained styles: existing HTML/CSS selectors remain unchanged.
  const motionStyles = document.createElement("style");
  motionStyles.id = "ecofilament-motion-layer";
  motionStyles.textContent = `
    @keyframes efSlideEnter {
      from { opacity: 0; transform: translate3d(0, 14px, 0) scale(.992); filter: blur(3px); }
      to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
    }
    @keyframes efElementReveal {
      from { opacity: 0; transform: translate3d(0, 12px, 0); }
      to   { opacity: 1; transform: translate3d(0, 0, 0); }
    }
    .slide.ef-slide-enter {
      animation: efSlideEnter 620ms cubic-bezier(.2,.75,.25,1) both;
      will-change: opacity, transform, filter;
    }
    .slide .ef-reveal {
      animation: efElementReveal 560ms cubic-bezier(.2,.75,.25,1) both;
      animation-delay: var(--ef-reveal-delay, 0ms);
    }
    #progress { transition: width 520ms cubic-bezier(.2,.75,.25,1); }
    .controls .navbtn, .controls .dot, button, .quiz-option {
      transition: transform 220ms ease, box-shadow 220ms ease,
        background-color 220ms ease, border-color 220ms ease, opacity 220ms ease;
    }
    @media (hover: hover) and (pointer: fine) {
      button:not(:disabled):hover, .quiz-option:not(:disabled):hover {
        transform: translateY(-2px);
      }
      button:not(:disabled):active, .quiz-option:not(:disabled):active {
        transform: translateY(0) scale(.985);
      }
    }
    .ef-presentation-mode #presentation { width: 100%; max-width: none; }
    .ef-presentation-mode .controls { transition: opacity 220ms ease; }
    @media (prefers-reduced-motion: reduce) {
      .slide.ef-slide-enter, .slide .ef-reveal { animation: none !important; }
      #progress, .controls .navbtn, .controls .dot, button, .quiz-option {
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(motionStyles);

  function animateSlideEntry(slide) {
    if (!slide || reducedMotion.matches) return;

    slide.classList.remove("ef-slide-enter");
    const revealSelector =
      "h1, h2, h3, p, .card, .glass-card, .stat, .feature, li, .quiz-option";

    $$(revealSelector, slide).forEach((element, index) => {
      element.classList.remove("ef-reveal");
      element.style.setProperty(
        "--ef-reveal-delay",
        `${Math.min(index * 45, 360)}ms`
      );
    });

    void slide.offsetWidth;
    slide.classList.add("ef-slide-enter");

    $$(revealSelector, slide).forEach(element => {
      void element.offsetWidth;
      element.classList.add("ef-reveal");
    });
  }

  // =========================================
  // TRANSLATIONS
  // =========================================

  const translations = {
    en: {
      previous: "← Previous",
      next: "Next →",
      section: "Section",
      goTo: "Go to",
      navigation: "Presentation navigation",
      chooseSection: "Choose a presentation section",

      switchLanguage: "Switch to Arabic",

      fullscreen: "⛶ Fullscreen",
      exitFullscreen: "⛶ Exit fullscreen",
      fullscreenError:
        "Fullscreen is not available in this browser. You can still use the presentation normally.",

      question: "Question",
      of: "of",
      score: "Score",

      correct: "✓ Correct!",
      incorrect: "Not quite.",

      nextQuestion: "Next question →",
      seeResult: "See result →",

      excellent: "Excellent work!",
      good: "Good job!",
      keepLearning: "Keep learning!",

      resultMessage: (score, total) =>
        `You answered ${score} out of ${total} questions correctly. Review the presentation and try again to improve your score.`,

      minutesRemaining: (m, s) =>
        `${m} minutes and ${s} seconds remaining`,

      pauseTimer: "Pause presentation timer",
      resumeTimer: "Resume presentation timer",
      restartTimer: "Restart presentation timer"
    },

    ar: {
      previous: "→ السابق",
      next: "التالي ←",
      section: "القسم",
      goTo: "الانتقال إلى",
      navigation: "التنقل بين شرائح العرض",
      chooseSection: "اختر قسماً من العرض",

      switchLanguage: "التبديل إلى الإنجليزية",

      fullscreen: "⛶ ملء الشاشة",
      exitFullscreen: "⛶ الخروج من ملء الشاشة",
      fullscreenError:
        "ملء الشاشة غير متاح في هذا المتصفح. يمكنك متابعة العرض بشكل عادي.",

      question: "السؤال",
      of: "من",
      score: "النقاط",

      correct: "✓ إجابة صحيحة!",
      incorrect: "ليس تماماً.",

      nextQuestion: "السؤال التالي ←",
      seeResult: "عرض النتيجة ←",

      excellent: "عمل ممتاز!",
      good: "عمل جيد!",
      keepLearning: "واصل التعلم!",

      resultMessage: (score, total) =>
        `أجبت عن ${score} أسئلة صحيحة من أصل ${total}. راجع العرض وحاول مرة أخرى لتحسين نتيجتك.`,

      minutesRemaining: (m, s) =>
        `متبقي ${m} دقيقة و${s} ثانية`,

      pauseTimer: "إيقاف مؤقت للمؤقت",
      resumeTimer: "استئناف المؤقت",
      restartTimer: "إعادة تشغيل المؤقت"
    }
  };

  const t = (key, ...args) => {
    const value = translations[currentLanguage][key];

    return typeof value === "function"
      ? value(...args)
      : value ?? key;
  };

  // =========================================
  // QUIZ DATA
  // =========================================

  const questions = [
    {
      en: {
        question: "What is the main goal of this project?",
        answers: [
          "To produce more plastic bottles",
          "To give suitable plastic waste a second life",
          "To replace every material with plastic"
        ],
        explanation:
          "The project explores reusing suitable plastic waste as 3D-printing filament."
      },

      ar: {
        question: "ما الهدف الرئيسي من هذا المشروع؟",
        answers: [
          "إنتاج المزيد من القنينات البلاستيكية",
          "إعطاء النفايات البلاستيكية المناسبة حياة ثانية",
          "استبدال جميع المواد بالبلاستيك"
        ],
        explanation:
          "يستكشف المشروع إمكانية إعادة استخدام النفايات البلاستيكية المناسبة لصناعة خيوط الطباعة ثلاثية الأبعاد."
      },

      correct: 1
    },

    {
      en: {
        question: "Which plastic is commonly used for many beverage bottles?",
        answers: ["PET", "Glass", "Paper"],
        explanation:
          "Many beverage bottles are made from PET, but materials must still be identified and tested."
      },

      ar: {
        question: "أي نوع من البلاستيك يُستخدم غالباً في صناعة قنينات المشروبات؟",
        answers: ["PET", "الزجاج", "الورق"],
        explanation:
          "تُصنع العديد من قنينات المشروبات من PET، لكن يجب دائماً تحديد نوع المادة واختباره."
      },

      correct: 0
    },

    {
      en: {
        question: "Why is sorting important?",
        answers: [
          "All plastics behave the same",
          "Different plastics have different properties",
          "It changes plastic into metal"
        ],
        explanation:
          "Different plastic types have different properties and are not all suitable for the same process."
      },

      ar: {
        question: "لماذا تُعد عملية الفرز مهمة؟",
        answers: [
          "لأن جميع أنواع البلاستيك متشابهة",
          "لأن أنواع البلاستيك تختلف في خصائصها",
          "لأنها تحول البلاستيك إلى معدن"
        ],
        explanation:
          "تختلف أنواع البلاستيك في خصائصها، ولذلك لا تصلح جميعها لنفس عملية التصنيع."
      },

      correct: 1
    },

    {
      en: {
        question: "What should be checked before using recycled filament?",
        answers: [
          "Its color only",
          "Its consistency, diameter, and printing performance",
          "Its packaging design"
        ],
        explanation:
          "Quality control checks whether the filament is suitable for the printer."
      },

      ar: {
        question: "ما الذي يجب فحصه قبل استخدام خيوط البلاستيك المعاد تدويرها؟",
        answers: [
          "اللون فقط",
          "التجانس والقطر وأداء الطباعة",
          "تصميم العبوة"
        ],
        explanation:
          "تساعد مراقبة الجودة على التأكد من أن الخيوط مناسبة للطابعة ثلاثية الأبعاد."
      },

      correct: 1
    },

    {
      en: {
        question: "What does a circular economy aim to do?",
        answers: [
          "Keep materials in use for as long as possible",
          "Throw products away faster",
          "Stop all technology"
        ],
        explanation:
          "A circular economy tries to keep materials and products in use rather than wasting them."
      },

      ar: {
        question: "ما الذي يهدف إليه الاقتصاد الدائري؟",
        answers: [
          "الحفاظ على استخدام المواد لأطول مدة ممكنة",
          "التخلص من المنتجات بسرعة أكبر",
          "إيقاف جميع أشكال التكنولوجيا"
        ],
        explanation:
          "يسعى الاقتصاد الدائري إلى إبقاء المواد والمنتجات قيد الاستخدام بدلاً من إهدارها."
      },

      correct: 0
    }
  ];

  // =========================================
  // QUIZ STATE + DYNAMIC QUIZ SCREENS
  // =========================================

  let questionIndex = 0;
  let score = 0;
  let hasAnswered = false;
  let selectedAnswer = null;
  let quizFinished = false;

  let quizStage = "welcome";
  let quizMode = "full";
  let activeQuestionIndices = questions.map((_, index) => index);
  let runAnswers = [];
  let fullAttemptAnswers = questions.map(() => null);

  const questionCount = $("#qCount");
  const questionText = $("#question");
  const optionsContainer = $("#options");
  const feedback = $("#feedback");
  const scoreDisplay = $("#score");
  const quizProgress = $("#quizProgress");
  const quizProgressWrap = $("#quizProgressWrap");

  const nextQuestionButton = $("#nextQuestion");
  const quizPanel = $("#quizPanel");
  const resultPanel = $("#resultPanel");

  const quizWelcomePanel = document.createElement("section");
  quizWelcomePanel.className = "panel quiz-screen quiz-welcome";
  quizWelcomePanel.id = "quizWelcomePanel";
  quizWelcomePanel.setAttribute("aria-labelledby", "quizWelcomeTitle");
  quizWelcomePanel.innerHTML = `
    <div class="quiz-welcome-orb" aria-hidden="true"><span>EF</span></div>
    <div class="quiz-welcome-copy">
      <span class="quiz-eyebrow" id="quizWelcomeEyebrow"></span>
      <h3 id="quizWelcomeTitle"></h3>
      <p id="quizWelcomeDescription"></p>
      <div class="quiz-info-grid">
        <div class="quiz-info-card"><span class="quiz-info-icon" aria-hidden="true">✦</span><b id="quizInfoQuestions"></b><small id="quizInfoQuestionsLabel"></small></div>
        <div class="quiz-info-card"><span class="quiz-info-icon" aria-hidden="true">◷</span><b id="quizInfoTime"></b><small id="quizInfoTimeLabel"></small></div>
        <div class="quiz-info-card"><span class="quiz-info-icon" aria-hidden="true">◎</span><b id="quizInfoMode"></b><small id="quizInfoModeLabel"></small></div>
      </div>
      <p class="quiz-instructions" id="quizInstructions"></p>
      <button class="action primary quiz-start-button" id="quizStartButton" type="button"></button>
    </div>
  `;
  quizPanel.parentNode.insertBefore(quizWelcomePanel, quizPanel);

  const quizReviewPanel = document.createElement("section");
  quizReviewPanel.className = "panel quiz-screen quiz-review";
  quizReviewPanel.id = "quizReviewPanel";
  quizReviewPanel.hidden = true;
  quizReviewPanel.innerHTML = `
    <div class="quiz-review-header">
      <div><span class="quiz-eyebrow" id="quizReviewEyebrow"></span><h3 id="quizReviewTitle"></h3><p id="quizReviewDescription"></p></div>
      <button class="action quiz-review-back" id="quizReviewBack" type="button"></button>
    </div>
    <div class="quiz-review-list" id="quizReviewContent"></div>
  `;
  resultPanel.parentNode.insertBefore(quizReviewPanel, resultPanel.nextSibling);

  const quizResultDashboard = document.createElement("div");
  quizResultDashboard.className = "quiz-result-dashboard";
  quizResultDashboard.id = "quizResultDashboard";
  quizResultDashboard.innerHTML = `
    <div class="quiz-result-ring" id="quizResultRing"><div class="quiz-result-ring-inner"><strong id="quizPercent">0%</strong><span id="quizPercentLabel"></span></div></div>
    <div class="quiz-result-stats">
      <div class="quiz-stat-card"><strong id="quizCorrectCount">0</strong><span id="quizCorrectLabel"></span></div>
      <div class="quiz-stat-card"><strong id="quizWrongCount">0</strong><span id="quizWrongLabel"></span></div>
      <div class="quiz-stat-card"><strong id="quizTotalCount">0</strong><span id="quizTotalLabel"></span></div>
    </div>
    <div class="quiz-achievement" id="quizAchievement"><span class="quiz-achievement-icon" id="quizAchievementIcon">✦</span><div><small id="quizAchievementCaption"></small><strong id="quizAchievementName"></strong><p id="quizAchievementDescription"></p></div></div>
    <div class="quiz-result-actions">
      <button class="action" id="quizReviewButton" type="button"></button>
      <button class="action primary" id="quizRetryMistakesButton" type="button"></button>
    </div>
  `;
  const resultMessageAnchor = $("#resultMessage", resultPanel);
  resultMessageAnchor.insertAdjacentElement("afterend", quizResultDashboard);

  const quizCopy = {
    en: {
      welcomeEyebrow: "ECOFILAMENT KNOWLEDGE CHECK",
      welcomeTitle: "Ready to test what you learned?",
      welcomeDescription: "A short interactive challenge about plastic reuse, filament quality, and the circular economy.",
      questions: "5 questions", questionsLabel: "Quick knowledge check",
      time: "2–3 min", timeLabel: "Estimated duration",
      mode: "Multiple choice", modeLabel: "One answer per question",
      instructions: "Choose one answer for each question. You will see an explanation after every choice, and you can review your answers at the end.",
      start: "Start quiz →", startAgain: "Start a new attempt →",
      progress: (done, total) => `${done} of ${total} completed`,
      reviewEyebrow: "LEARNING REVIEW", reviewTitle: "Review your answers",
      reviewDescription: "Compare your choice with the correct answer and read the explanation.",
      backResults: "← Back to results", yourAnswer: "Your answer",
      correctAnswer: "Correct answer", explanation: "Why this is correct",
      notAnswered: "Not answered", correct: "Correct", incorrect: "Incorrect",
      percent: "Your score", correctLabel: "Correct", wrongLabel: "Incorrect", totalLabel: "Questions",
      badgeCaption: "YOUR ACHIEVEMENT", badgeBeginner: "Eco Beginner", badgeLearner: "Eco Learner", badgeExpert: "Eco Expert", badgePerfect: "Perfect Score",
      badgeBeginnerDesc: "A starting point for your eco-learning journey.", badgeLearnerDesc: "You are building a solid understanding.", badgeExpertDesc: "Strong understanding of the key ideas.", badgePerfectDesc: "A flawless result. Excellent work!",
      reviewButton: "Review answers", retryButton: "Retry mistakes ↻", noMistakes: "No mistakes to retry — excellent work!",
      retryIntro: "This round includes only the questions you missed in your last attempt.",
      retryResult: "Mistake review complete", retryAgain: "Try the full quiz again →",
      resultFull: (s, total) => `You answered ${s} out of ${total} questions correctly. Use the review below to strengthen what you learned.`,
      resultRetry: (s, total) => `You corrected ${s} out of ${total} questions in your mistake review.`,
      question: "Question", of: "of", next: "Next question →", finish: "View results →",
      correctFeedback: "✓ Correct!", wrongFeedback: "Not quite.",
      retryUnavailable: "Complete the full quiz first to unlock mistake review."
    },
    ar: {
      welcomeEyebrow: "اختبار معلومات ECOFILAMENT",
      welcomeTitle: "هل أنت مستعد لاختبار ما تعلمته؟",
      welcomeDescription: "تحدٍّ تفاعلي قصير حول إعادة استخدام البلاستيك وجودة الخيوط والاقتصاد الدائري.",
      questions: "5 أسئلة", questionsLabel: "اختبار سريع للمعلومات",
      time: "2–3 دقائق", timeLabel: "المدة التقديرية",
      mode: "اختيار متعدد", modeLabel: "إجابة واحدة لكل سؤال",
      instructions: "اختر إجابة واحدة لكل سؤال. ستظهر لك ملاحظة تفسيرية بعد كل اختيار، ويمكنك مراجعة إجاباتك في النهاية.",
      start: "ابدأ الاختبار ←", startAgain: "ابدأ محاولة جديدة ←",
      progress: (done, total) => `أكملت ${done} من أصل ${total}`,
      reviewEyebrow: "مراجعة التعلم", reviewTitle: "راجع إجاباتك",
      reviewDescription: "قارن اختيارك بالإجابة الصحيحة واقرأ التفسير العلمي.",
      backResults: "العودة إلى النتائج ←", yourAnswer: "إجابتك",
      correctAnswer: "الإجابة الصحيحة", explanation: "لماذا هذه هي الإجابة الصحيحة؟",
      notAnswered: "لم تتم الإجابة", correct: "صحيحة", incorrect: "خاطئة",
      percent: "نتيجتك", correctLabel: "إجابات صحيحة", wrongLabel: "إجابات خاطئة", totalLabel: "عدد الأسئلة",
      badgeCaption: "إنجازك", badgeBeginner: "مبتدئ بيئي", badgeLearner: "متعلم بيئي", badgeExpert: "خبير بيئي", badgePerfect: "نتيجة مثالية",
      badgeBeginnerDesc: "هذه بداية رحلتك في التعلم البيئي.", badgeLearnerDesc: "أنت تبني فهماً جيداً للمفاهيم.", badgeExpertDesc: "فهم قوي للأفكار الأساسية.", badgePerfectDesc: "نتيجة كاملة، عمل ممتاز!",
      reviewButton: "مراجعة الإجابات", retryButton: "أعد الأسئلة الخاطئة ↻", noMistakes: "لا توجد أخطاء لإعادتها — عمل ممتاز!",
      retryIntro: "ستتضمن هذه الجولة الأسئلة التي أخطأت فيها في المحاولة السابقة فقط.",
      retryResult: "اكتملت مراجعة الأخطاء", retryAgain: "أعد الاختبار كاملاً ←",
      resultFull: (s, total) => `أجبت إجابة صحيحة عن ${s} من أصل ${total} أسئلة. استخدم المراجعة أدناه لترسيخ ما تعلمته.`,
      resultRetry: (s, total) => `صححت ${s} من أصل ${total} أسئلة في جولة مراجعة الأخطاء.`,
      question: "السؤال", of: "من", next: "السؤال التالي ←", finish: "عرض النتائج ←",
      correctFeedback: "✓ إجابة صحيحة!", wrongFeedback: "ليست الإجابة الصحيحة.",
      retryUnavailable: "أكمل الاختبار كاملاً أولاً لفتح مراجعة الأخطاء."
    }
  };

  const qc = key => quizCopy[currentLanguage][key];

  if (feedback) {
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    feedback.setAttribute("aria-atomic", "true");
  }

  // Premium quiz styling is scoped to the quiz only; the rest of the deck is untouched.
  const quizStyles = document.createElement("style");
  quizStyles.id = "ecofilament-quiz-premium-styles";
  quizStyles.textContent = `
    .quiz-screen[hidden], #quizPanel[hidden], #resultPanel[hidden] { display:none !important; }
    .quiz-screen, #quizPanel, #resultPanel { position:relative; overflow:hidden; border:1px solid rgba(182,243,107,.17); background:linear-gradient(145deg,rgba(36,58,47,.94),rgba(16,26,23,.97)); box-shadow:0 22px 60px rgba(0,0,0,.22),inset 0 1px 0 rgba(241,245,242,.04); }
    .quiz-welcome { display:grid; grid-template-columns:minmax(120px,.55fr) minmax(0,1.8fr); gap:clamp(18px,4vw,42px); align-items:center; padding:clamp(22px,4vw,42px); }
    .quiz-welcome-orb { width:min(100%,190px); aspect-ratio:1; display:grid; place-items:center; justify-self:center; border-radius:38%; color:#102018; font-size:2.4rem; font-weight:950; letter-spacing:-.08em; background:radial-gradient(circle at 30% 25%,#d5ff9c 0,#78e5a0 30%,#239b68 72%,#1d3028 100%); box-shadow:0 0 0 12px rgba(57,217,138,.055),0 0 70px rgba(57,217,138,.2); transform:rotate(-12deg); animation:efQuizFloat 5s ease-in-out infinite; }
    .quiz-welcome-orb span { transform:rotate(12deg); }
    @keyframes efQuizFloat { 50% { transform:translateY(-9px) rotate(-7deg); } }
    .quiz-eyebrow { display:inline-block; margin-bottom:10px; color:#B6F36B; font-size:.72rem; font-weight:900; letter-spacing:.14em; }
    .quiz-welcome h3,.quiz-review h3 { margin:0 0 10px; color:#F1F5F2; font-size:clamp(1.45rem,3vw,2.15rem); line-height:1.25; }
    .quiz-welcome-copy>p,.quiz-review-header p { max-width:720px; margin:0; color:#B4C7BC; line-height:1.8; }
    .quiz-info-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin:23px 0 15px; }
    .quiz-info-card { min-width:0; padding:13px; border:1px solid rgba(182,243,107,.14); border-radius:15px; background:rgba(16,26,23,.56); }
    .quiz-info-icon { display:block; margin-bottom:5px; color:#B6F36B; font-size:1.1rem; }
    .quiz-info-card b,.quiz-info-card small { display:block; overflow-wrap:anywhere; }
    .quiz-info-card b { color:#F1F5F2; font-size:.92rem; }
    .quiz-info-card small { margin-top:3px; color:#9FB5A8; font-size:.72rem; line-height:1.5; }
    .quiz-instructions { margin:13px 0 18px !important; padding-inline-start:13px; border-inline-start:3px solid #39D98A; font-size:.9rem; }
    .quiz-start-button { min-width:190px; }
    #quizPanel { padding:clamp(18px,3vw,30px); }
    .quiz-meta { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px; color:#DCE9E0; }
    #quizProgressWrap { height:8px; margin-bottom:12px; background:rgba(182,243,107,.12); border-radius:30px; overflow:hidden; }
    #quizProgress { background:linear-gradient(90deg,#39D98A,#B6F36B); border-radius:30px; transition:width 500ms cubic-bezier(.2,.75,.25,1); }
    .quiz-live-status { margin:0 0 18px; color:#9FB5A8; font-size:.78rem; }
    .quiz-question { color:#F1F5F2; font-size:clamp(1.12rem,2.5vw,1.45rem); line-height:1.5; margin:0 0 16px; }
    .quiz-option { display:flex; align-items:center; gap:12px; min-height:54px; padding:13px 16px; border:1px solid rgba(182,243,107,.15); border-radius:14px; background:rgba(16,26,23,.62); color:#F1F5F2; text-align:start; line-height:1.65; }
    .quiz-option::before { content:attr(data-option-letter); flex:0 0 28px; width:28px; height:28px; display:grid; place-items:center; border-radius:9px; color:#B6F36B; background:rgba(57,217,138,.1); font-size:.78rem; font-weight:900; }
    .quiz-option:hover:not(:disabled) { border-color:#39D98A; background:rgba(57,217,138,.1); transform:translateY(-2px); }
    .quiz-option.correct { color:#E3FFED; border-color:#39D98A; background:rgba(23,75,53,.82); }
    .quiz-option.wrong { color:#FFE3E3; border-color:#FF8B8B; background:rgba(81,43,50,.82); }
    .quiz-option:disabled { opacity:1; cursor:default; }
    .feedback { min-height:38px; margin:12px 0; color:#B6F36B; font-size:.9rem; line-height:1.8; }
    .quiz-next { margin-top:5px; }
    .quiz-results { padding:clamp(22px,4vw,38px); }
    .quiz-result-dashboard { display:grid; grid-template-columns:minmax(130px,.7fr) minmax(0,1.3fr); gap:18px 28px; align-items:center; margin:22px 0; }
    .quiz-result-ring { --quiz-score:0%; width:min(100%,170px); aspect-ratio:1; display:grid; place-items:center; justify-self:center; border-radius:50%; background:conic-gradient(#39D98A var(--quiz-score),rgba(182,243,107,.12) 0); position:relative; transition:background 700ms ease; }
    .quiz-result-ring::before { content:""; position:absolute; inset:10px; border-radius:50%; background:#172720; border:1px solid rgba(182,243,107,.13); }
    .quiz-result-ring-inner { position:relative; z-index:1; display:grid; text-align:center; }
    .quiz-result-ring-inner strong { color:#B6F36B; font-size:2rem; line-height:1.1; }
        .quiz-result-ring-inner span { color:#9FB5A8; font-size:.72rem; margin-top:5px; }
    .quiz-result-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:9px; }
    .quiz-stat-card { padding:13px 9px; border:1px solid rgba(182,243,107,.13); border-radius:14px; background:rgba(16,26,23,.5); text-align:center; }
    .quiz-stat-card strong,.quiz-stat-card span { display:block; }
    .quiz-stat-card strong { color:#F1F5F2; font-size:1.35rem; }
    .quiz-stat-card span { color:#9FB5A8; font-size:.7rem; line-height:1.5; }
    .quiz-achievement { grid-column:1/-1; display:flex; align-items:center; gap:14px; padding:15px; border:1px solid rgba(182,243,107,.2); border-radius:16px; background:linear-gradient(110deg,rgba(57,217,138,.1),rgba(182,243,107,.045)); }
    .quiz-achievement-icon { width:46px; height:46px; flex:0 0 46px; display:grid; place-items:center; border-radius:14px; color:#102018; background:linear-gradient(135deg,#39D98A,#B6F36B); font-size:1.35rem; }
    .quiz-achievement small,.quiz-achievement strong { display:block; }
    .quiz-achievement small { color:#9FB5A8; font-size:.68rem; text-transform:uppercase; letter-spacing:.1em; }
    .quiz-achievement strong { color:#F1F5F2; margin-top:2px; }
    .quiz-achievement p { color:#B4C7BC; margin:3px 0 0; font-size:.82rem; }
    .quiz-result-actions { grid-column:1/-1; display:flex; flex-wrap:wrap; gap:10px; }
    .quiz-result-actions .action { flex:1 1 180px; }
    .quiz-perfect .quiz-achievement { box-shadow:0 0 30px rgba(182,243,107,.12); animation:efQuizGlow 2.4s ease-in-out infinite; }
    @keyframes efQuizGlow { 50% { box-shadow:0 0 34px rgba(182,243,107,.24); } }
    .quiz-review { padding:clamp(18px,3vw,30px); }
    .quiz-review-header { display:flex; justify-content:space-between; align-items:flex-start; gap:18px; margin-bottom:20px; }
    .quiz-review-back { flex:0 0 auto; }
    .quiz-review-item { margin:12px 0; padding:17px; border:1px solid rgba(182,243,107,.14); border-radius:15px; background:rgba(16,26,23,.55); }
    .quiz-review-item h4 { color:#F1F5F2; margin:0 0 12px; font-size:1rem; line-height:1.6; }
    .quiz-review-answer { margin:7px 0; color:#B4C7BC; font-size:.88rem; line-height:1.7; }
    .quiz-review-answer b { color:#F1F5F2; }
    .quiz-review-answer.is-correct b { color:#8EE6AC; }
    .quiz-review-answer.is-wrong b { color:#FFAAAA; }
    .quiz-review-explanation { margin:12px 0 0; padding:11px 13px; border-inline-start:3px solid #39D98A; border-radius:8px; color:#B6F36B; background:rgba(57,217,138,.07); font-size:.86rem; line-height:1.8; }
    .quiz-review-status { display:inline-block; margin-bottom:8px; padding:4px 9px; border-radius:20px; color:#B6F36B; background:rgba(57,217,138,.1); font-size:.7rem; font-weight:800; }
    .quiz-review-status.wrong { color:#FFB6B6; background:rgba(255,139,139,.1); }
    .quiz-empty-review { padding:22px; text-align:center; color:#B4C7BC; }
    body.lang-ar .quiz-welcome, body.lang-ar .quiz-review { direction:rtl; }
    body.lang-ar .quiz-option { direction:rtl; text-align:right; }
    @media(max-width:680px) { .quiz-welcome { grid-template-columns:1fr; } .quiz-welcome-orb { width:112px; } .quiz-result-dashboard { grid-template-columns:1fr; } .quiz-result-stats { width:100%; } .quiz-review-header { flex-direction:column; } .quiz-review-back { align-self:flex-start; } }
    @media(max-width:420px) { .quiz-info-grid { grid-template-columns:1fr; } .quiz-info-card { display:grid; grid-template-columns:25px 1fr; column-gap:8px; align-items:center; } .quiz-info-icon { grid-row:span 2; margin:0; } .quiz-stat-card { padding:10px 5px; } .quiz-stat-card span { font-size:.62rem; } }
    @media(prefers-reduced-motion:reduce) { .quiz-welcome-orb,.quiz-perfect .quiz-achievement { animation:none !important; } #quizProgress,.quiz-result-ring { transition:none !important; } }
  `;
  document.head.appendChild(quizStyles);

  // =========================================
  // TRANSLATION ENGINE
  // =========================================

  function applyTranslations() {
    document.documentElement.lang = currentLanguage;

    document.documentElement.dir =
      currentLanguage === "ar" ? "rtl" : "ltr";

    document.body.classList.remove("lang-en", "lang-ar");

    document.body.classList.add(`lang-${currentLanguage}`);

    // Text translations
    $$("[data-i18n]").forEach(element => {
      const key = element.dataset.i18n;
      const value = translations[currentLanguage][key];

      if (typeof value === "string") {
        element.textContent = value;
      }
    });

    // Attribute translations
    $$("[data-i18n-attr]").forEach(element => {
      const entries = element.dataset.i18nAttr.split(";");

      entries.forEach(entry => {
        const [attribute, key] = entry
          .split(":")
          .map(value => value.trim());

        const value = translations[currentLanguage][key];

        if (attribute && typeof value === "string") {
          element.setAttribute(attribute, value);
        }
      });
    });

    // Language button
    langButton.textContent =
      currentLanguage === "en" ? "العربية" : "English";

    langButton.setAttribute(
      "aria-pressed",
      String(currentLanguage === "ar")
    );

    langButton.setAttribute("aria-label", t("switchLanguage"));
    langButton.setAttribute("title", t("switchLanguage"));

    updateNavigationLanguage();
    renderTimer();
    updateFullscreenLabel();

    // Preserve the current quiz stage and answers when changing language.
    renderQuizStage();
  }

  langButton.addEventListener("click", () => {
    currentLanguage =
      currentLanguage === "en" ? "ar" : "en";

    applyTranslations();
  });

  // =========================================
  // PRESENTATION NAVIGATION
  // =========================================

  const controls = document.createElement("nav");

  controls.className = "controls";
  controls.setAttribute("aria-label", t("navigation"));

  controls.innerHTML = `
    <button class="navbtn" id="prev" type="button"></button>
    <div class="dots" id="dots"></div>
    <span id="slideCount" class="footer-note" aria-live="polite"></span>
    <button class="navbtn" id="next" type="button"></button>
  `;

  main.appendChild(controls);

  const prevButton = $("#prev");
  const nextButton = $("#next");
  const slideCount = $("#slideCount");
  const dots = $("#dots");

  const dotButtons = [];

  slides.forEach((slide, index) => {
    const dot = document.createElement("button");

    dot.className = "dot";
    dot.type = "button";

    dot.addEventListener("click", () => {
      showSlide(index);
    });

    dots.appendChild(dot);
    dotButtons.push(dot);
  });

  function getSlideTitle(slide, index) {
    const title =
      currentLanguage === "ar"
        ? slide.dataset.titleAr || slide.dataset.title
        : slide.dataset.title;

    return title || `${t("section")} ${index + 1}`;
  }

  function updateNavigationLanguage() {
    controls.setAttribute("aria-label", t("navigation"));

    dots.setAttribute("aria-label", t("chooseSection"));

    prevButton.textContent = t("previous");
    nextButton.textContent = t("next");

    slides.forEach((slide, index) => {
      const title = getSlideTitle(slide, index);

      dotButtons[index].title = title;

      dotButtons[index].setAttribute(
        "aria-label",
        `${t("goTo")} ${title}`
      );
    });
  }

  function showSlide(index) {
    const nextIndex = Math.max(
      0,
      Math.min(slides.length - 1, Number(index) || 0)
    );

    currentSlide = nextIndex;

    slides.forEach((slide, i) => {
      const active = i === currentSlide;

      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));

      // Prevent keyboard focus inside inactive slides.
      slide.inert = !active;

      if (active) {
        animateSlideEntry(slide);
      } else {
        slide.classList.remove("ef-slide-enter");
      }
    });

    const percentage = ((currentSlide + 1) / slides.length) * 100;

    progress.style.width = `${percentage}%`;
    progress.setAttribute("aria-valuenow", String(Math.round(percentage)));

    const progressBar = $("#presentationProgress");
    if (progressBar) {
      progressBar.setAttribute(
        "aria-valuenow",
        String(Math.round(percentage))
      );
    }

    prevButton.disabled = currentSlide === 0;
    nextButton.disabled = currentSlide === slides.length - 1;

    slideCount.textContent = `${currentSlide + 1} / ${slides.length}`;
    slideCount.setAttribute(
      "aria-label",
      `${t("section")} ${currentSlide + 1} ${t("of")} ${slides.length}`
    );

    dotButtons.forEach((dot, i) => {
      const active = i === currentSlide;
      dot.classList.toggle("on", active);

      if (active) {
        dot.setAttribute("aria-current", "step");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
    }
  }

  function previousSlide() {
    if (currentSlide > 0) {
      showSlide(currentSlide - 1);
    }
  }

  // Compatibility with existing HTML buttons
  window.nextSlide = nextSlide;
  window.prevSlide = previousSlide;
  window.goTo = showSlide;

  prevButton.addEventListener("click", previousSlide);
  nextButton.addEventListener("click", nextSlide);

  // Declarative actions keep presentation markup free of inline JavaScript.
  $$('[data-action="next-slide"]').forEach(button => {
    button.addEventListener("click", nextSlide);
  });

  $$('[data-action="restart-quiz"]').forEach(button => {
    button.addEventListener("click", () => window.restartQuiz());
  });

  $$('[data-go-to]').forEach(button => {
    button.addEventListener("click", () => {
      const target = Number.parseInt(button.dataset.goTo, 10);

      if (Number.isInteger(target)) {
        showSlide(target);
      }
    });
  });

  // =========================================
  // PRESENTATION TIMER
  // =========================================

  function renderTimer() {
    if (!timerDisplay) return;

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    timerDisplay.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    timerDisplay.setAttribute(
      "aria-label",
      t("minutesRemaining", minutes, seconds)
    );

    timerDisplay.style.color =
      remainingSeconds === 0 ? "#ff9999" : "";
  }

  if (timerButton) {
    timerButton.addEventListener("click", () => {
      if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;

        timerButton.setAttribute(
          "aria-label",
          t("resumeTimer")
        );

        return;
      }

      if (remainingSeconds <= 0) {
        remainingSeconds = 10 * 60;
      }

      timerButton.setAttribute(
        "aria-label",
        t("pauseTimer")
      );

      renderTimer();

      timerInterval = window.setInterval(() => {
        remainingSeconds = Math.max(
          0,
          remainingSeconds - 1
        );

        renderTimer();

        if (remainingSeconds === 0) {
          clearInterval(timerInterval);
          timerInterval = null;

          timerButton.setAttribute(
            "aria-label",
            t("restartTimer")
          );
        }
      }, 1000);
    });
  }

  // =========================================
  // FULLSCREEN
  // =========================================

  function updateFullscreenLabel() {
    const isFullscreen = Boolean(document.fullscreenElement);

    document.documentElement.classList.toggle(
      "ef-presentation-mode",
      isFullscreen
    );

    if (!fullscreenButton) return;

    fullscreenButton.textContent =
      isFullscreen
        ? t("exitFullscreen")
        : t("fullscreen");

    fullscreenButton.setAttribute(
      "aria-label",
      isFullscreen
        ? t("exitFullscreen")
        : t("fullscreen")
    );
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.error("Fullscreen error:", error);
        alert(t("fullscreenError"));
      }
    });
  }

  document.addEventListener(
    "fullscreenchange",
    updateFullscreenLabel
  );
    // =========================================
  // KEYBOARD SHORTCUTS
  // =========================================

  function isTypingTarget(element) {
    if (!element) return false;
    const tag = element.tagName;

    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      element.isContentEditable
    );
  }

  document.addEventListener("keydown", event => {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      isTypingTarget(document.activeElement)
    ) {
      return;
    }

    const activeElement = document.activeElement;
    const focusedControl = activeElement &&
      activeElement !== document.body &&
      activeElement !== document.documentElement &&
      /^(BUTTON|A|SUMMARY)$/.test(activeElement.tagName);

    // Preserve native activation for focused controls and quiz answers.
    if (focusedControl && (event.key === " " || event.key === "Enter")) {
      return;
    }

    if (event.key.toLowerCase() === "f" && fullscreenButton) {
      event.preventDefault();
      fullscreenButton.click();
      return;
    }

    const handledKeys = [
      "ArrowRight", "ArrowLeft", "PageDown", "PageUp",
      " ", "Backspace", "Home", "End"
    ];

    if (handledKeys.includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === "Home") {
      showSlide(0);
      return;
    }

    if (event.key === "End") {
      showSlide(slides.length - 1);
      return;
    }

    if (event.key === "PageDown" || event.key === " ") {
      nextSlide();
      return;
    }

    if (event.key === "PageUp" || event.key === "Backspace") {
      previousSlide();
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      if (currentLanguage === "ar") {
        event.key === "ArrowRight" ? previousSlide() : nextSlide();
      } else {
        event.key === "ArrowRight" ? nextSlide() : previousSlide();
      }
    }
  });

  // =========================================
  // QUIZ — SCREEN MANAGEMENT
  // =========================================

  function setQuizScreen(stage) {
    quizStage = stage;
    quizWelcomePanel.hidden = stage !== "welcome";
    quizPanel.hidden = stage !== "active";
    resultPanel.hidden = stage !== "result";
    quizReviewPanel.hidden = stage !== "review";
  }

  function renderWelcome() {
    $("#quizWelcomeEyebrow").textContent = qc("welcomeEyebrow");
    $("#quizWelcomeTitle").textContent = qc("welcomeTitle");
    $("#quizWelcomeDescription").textContent = qc("welcomeDescription");
    $("#quizInfoQuestions").textContent = qc("questions");
    $("#quizInfoQuestionsLabel").textContent = qc("questionsLabel");
    $("#quizInfoTime").textContent = qc("time");
    $("#quizInfoTimeLabel").textContent = qc("timeLabel");
    $("#quizInfoMode").textContent = qc("mode");
    $("#quizInfoModeLabel").textContent = qc("modeLabel");
    $("#quizInstructions").textContent = qc("instructions");
    $("#quizStartButton").textContent = qc("start");
  }

  function renderQuizStage() {
    if (quizStage === "welcome") {
      setQuizScreen("welcome");
      renderWelcome();
    } else if (quizStage === "active") {
      setQuizScreen("active");
      loadQuestion();
    } else if (quizStage === "result") {
      setQuizScreen("result");
      updateResult();
    } else if (quizStage === "review") {
      setQuizScreen("review");
      renderReview();
    }
  }

function startQuiz(mode = "full") {
  quizMode = mode;

  if (mode === "mistakes") {
    activeQuestionIndices = fullAttemptAnswers
      .map((answer, index) =>
        answer && !answer.isCorrect ? index : -1
      )
      .filter(index => index !== -1);

    if (!activeQuestionIndices.length) {
      quizStage = "result";
      renderQuizStage();
      return;
    }
  } else {
    activeQuestionIndices = questions.map((_, index) => index);
    fullAttemptAnswers = questions.map(() => null);
  }

  runAnswers = activeQuestionIndices.map(() => null);
  questionIndex = 0;
  score = 0;
  hasAnswered = false;
  selectedAnswer = null;
  quizFinished = false;

  // هذا هو السطر الذي كان ناقصاً
  quizStage = "active";

  renderQuizStage();
}
  // =========================================
  // QUIZ — PROGRESS + QUESTION RENDERING
  // =========================================

  function updateQuizProgress() {
    const total = activeQuestionIndices.length;
    const completed = questionIndex + (hasAnswered ? 1 : 0);
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    if (quizProgress) quizProgress.style.width = `${percentage}%`;
    if (quizProgressWrap) {
      quizProgressWrap.setAttribute("aria-valuenow", String(percentage));
      quizProgressWrap.setAttribute("aria-valuetext", qc("progress")(completed, total));
      quizProgressWrap.setAttribute("aria-label", currentLanguage === "ar" ? "تقدم الاختبار" : "Quiz progress");
    }

    let status = $("#quizLiveStatus");
    if (!status && quizProgressWrap) {
      status = document.createElement("p");
      status.className = "quiz-live-status";
      status.id = "quizLiveStatus";
      quizProgressWrap.insertAdjacentElement("afterend", status);
    }
    if (status) status.textContent = qc("progress")(completed, total);
  }

  function getCurrentQuestion() {
    const sourceIndex = activeQuestionIndices[questionIndex];
    return questions[sourceIndex][currentLanguage];
  }

  function loadQuestion() {
    if (!questionText || !optionsContainer || !activeQuestionIndices.length) return;

    const sourceIndex = activeQuestionIndices[questionIndex];
    const question = getCurrentQuestion();
    const savedAnswer = runAnswers[questionIndex];

    hasAnswered = Boolean(savedAnswer);
    selectedAnswer = savedAnswer ? savedAnswer.selectedIndex : null;

    questionCount.textContent = `${qc("question")} ${questionIndex + 1} ${qc("of")} ${activeQuestionIndices.length}`;
    questionText.textContent = question.question;
    scoreDisplay.textContent = String(score);

    updateQuizProgress();
    optionsContainer.replaceChildren();

    question.answers.forEach((answer, index) => {
      const option = document.createElement("button");
      option.className = "quiz-option";
      option.type = "button";
      option.dataset.optionLetter = String.fromCharCode(65 + index);
      option.textContent = answer;
      option.disabled = hasAnswered;
      option.setAttribute("aria-pressed", String(selectedAnswer === index));

      if (hasAnswered && index === questions[sourceIndex].correct) {
        option.classList.add("correct");
      }
      if (hasAnswered && index === selectedAnswer && selectedAnswer !== questions[sourceIndex].correct) {
        option.classList.add("wrong");
      }

      option.addEventListener("click", () => chooseAnswer(index, option));
      optionsContainer.appendChild(option);
    });

    if (hasAnswered && savedAnswer) {
      const isCorrect = savedAnswer.isCorrect;
      feedback.textContent = `${isCorrect ? qc("correctFeedback") : qc("wrongFeedback")} ${question.explanation}`;
    } else {
      feedback.textContent = "";
    }

    nextQuestionButton.disabled = !hasAnswered;
    nextQuestionButton.textContent = questionIndex === activeQuestionIndices.length - 1 ? qc("finish") : qc("next");
  }

  // =========================================
  // QUIZ — ANSWER HANDLING
  // =========================================

  function chooseAnswer(selectedIndex, selectedButton) {
    if (hasAnswered || quizFinished || quizStage !== "active") return;

    const sourceIndex = activeQuestionIndices[questionIndex];
    const correctIndex = questions[sourceIndex].correct;
    const isCorrect = selectedIndex === correctIndex;

    hasAnswered = true;
    selectedAnswer = selectedIndex;

    runAnswers[questionIndex] = {
      sourceIndex,
      selectedIndex,
      correctIndex,
      isCorrect
    };

    if (quizMode === "full") {
      fullAttemptAnswers[sourceIndex] = runAnswers[questionIndex];
    }

    if (isCorrect) score += 1;

    $$("button", optionsContainer).forEach((button, index) => {
      button.disabled = true;
      button.setAttribute("aria-pressed", String(index === selectedIndex));
      if (index === correctIndex) button.classList.add("correct");
    });

    if (!isCorrect && selectedButton) selectedButton.classList.add("wrong");

    const localizedQuestion = questions[sourceIndex][currentLanguage];
    feedback.textContent = `${isCorrect ? qc("correctFeedback") : qc("wrongFeedback")} ${localizedQuestion.explanation}`;
    scoreDisplay.textContent = String(score);
    nextQuestionButton.disabled = false;
    updateQuizProgress();
  }

  // =========================================
  // QUIZ — RESULTS DASHBOARD + ACHIEVEMENTS
  // =========================================

  function updateResult() {
    const finalScore = $("#finalScore");
    const resultText = $("#resultText");
    const resultMessage = $("#resultMessage");
    if (!finalScore || !resultText || !resultMessage) return;

    const total = activeQuestionIndices.length || questions.length;
    const correctCount = score;
    const wrongCount = Math.max(0, total - correctCount);
    const percentage = total ? Math.round((correctCount / total) * 100) : 0;

    finalScore.textContent = `${correctCount}/${total}`;
    resultText.textContent = quizMode === "mistakes"
      ? qc("retryResult")
      : correctCount === total ? t("excellent") : correctCount >= 3 ? t("good") : t("keepLearning");
    resultMessage.textContent = quizMode === "mistakes"
      ? qc("resultRetry")(correctCount, total)
      : qc("resultFull")(correctCount, total);

    const badge = percentage === 100
      ? { name: qc("badgePerfect"), description: qc("badgePerfectDesc"), icon: "✦" }
      : percentage >= 80
        ? { name: qc("badgeExpert"), description: qc("badgeExpertDesc"), icon: "◆" }
        : percentage >= 40
          ? { name: qc("badgeLearner"), description: qc("badgeLearnerDesc"), icon: "◈" }
          : { name: qc("badgeBeginner"), description: qc("badgeBeginnerDesc"), icon: "✧" };

    $("#quizPercent").textContent = `${percentage}%`;
    $("#quizPercentLabel").textContent = qc("percent");
    $("#quizResultRing").style.setProperty("--quiz-score", `${percentage}%`);
    $("#quizCorrectCount").textContent = String(correctCount);
    $("#quizWrongCount").textContent = String(wrongCount);
    $("#quizTotalCount").textContent = String(total);
    $("#quizCorrectLabel").textContent = qc("correctLabel");
    $("#quizWrongLabel").textContent = qc("wrongLabel");
    $("#quizTotalLabel").textContent = qc("totalLabel");
    $("#quizAchievementCaption").textContent = qc("badgeCaption");
    $("#quizAchievementName").textContent = badge.name;
    $("#quizAchievementDescription").textContent = badge.description;
    $("#quizAchievementIcon").textContent = badge.icon;

    resultPanel.classList.toggle("quiz-perfect", percentage === 100);

    const reviewButton = $("#quizReviewButton");
    const retryButton = $("#quizRetryMistakesButton");
    reviewButton.textContent = qc("reviewButton");
    retryButton.textContent = qc("retryButton");

    const hasFullAttempt = fullAttemptAnswers.some(Boolean);
    const mistakes = fullAttemptAnswers.filter(answer => answer && !answer.isCorrect).length;
    reviewButton.hidden = !hasFullAttempt;
    retryButton.hidden = quizMode === "mistakes" || !hasFullAttempt;
    retryButton.disabled = mistakes === 0;
    retryButton.title = mistakes === 0 ? qc("noMistakes") : qc("retryButton");
    retryButton.setAttribute("aria-label", mistakes === 0 ? qc("noMistakes") : qc("retryButton"));

    if (quizMode === "full" && percentage === 100) {
      retryButton.hidden = false;
      retryButton.disabled = true;
      retryButton.textContent = qc("noMistakes");
    }
  }
    // =========================================
  // QUIZ — REVIEW ANSWERS
  // =========================================

  function renderReview() {
    $("#quizReviewEyebrow").textContent = qc("reviewEyebrow");
    $("#quizReviewTitle").textContent = qc("reviewTitle");
    $("#quizReviewDescription").textContent = qc("reviewDescription");
    $("#quizReviewBack").textContent = qc("backResults");

    const content = $("#quizReviewContent");
    content.replaceChildren();

    const completedAnswers = fullAttemptAnswers.some(Boolean) ? fullAttemptAnswers : runAnswers;
    const reviewItems = questions.map((question, index) => ({ question, answer: completedAnswers[index], index }));

    reviewItems.forEach(({ question, answer, index }) => {
      const localized = question[currentLanguage];
      const item = document.createElement("article");
      item.className = "quiz-review-item";

      const status = document.createElement("span");
      status.className = `quiz-review-status${answer && !answer.isCorrect ? " wrong" : ""}`;
      status.textContent = answer ? (answer.isCorrect ? qc("correct") : qc("incorrect")) : qc("notAnswered");

      const heading = document.createElement("h4");
      heading.textContent = `${index + 1}. ${localized.question}`;

      const yourAnswer = document.createElement("p");
      yourAnswer.className = `quiz-review-answer${answer && !answer.isCorrect ? " is-wrong" : answer ? " is-correct" : ""}`;
      const yourLabel = document.createElement("b");
      yourLabel.textContent = `${qc("yourAnswer")}: `;
      yourAnswer.append(yourLabel, document.createTextNode(answer ? localized.answers[answer.selectedIndex] : qc("notAnswered")));

      const correctAnswer = document.createElement("p");
      correctAnswer.className = "quiz-review-answer is-correct";
      const correctLabel = document.createElement("b");
      correctLabel.textContent = `${qc("correctAnswer")}: `;
      correctAnswer.append(correctLabel, document.createTextNode(localized.answers[question.correct]));

      const explanation = document.createElement("p");
      explanation.className = "quiz-review-explanation";
      const explanationLabel = document.createElement("b");
      explanationLabel.textContent = `${qc("explanation")}: `;
      explanation.append(explanationLabel, document.createTextNode(localized.explanation));

      item.append(status, heading, yourAnswer, correctAnswer, explanation);
      content.appendChild(item);
    });
  }

  $("#quizReviewButton").addEventListener("click", () => {
    if (fullAttemptAnswers.some(Boolean) || runAnswers.some(Boolean)) {
      quizStage = "review";
      renderQuizStage();
    }
  });

  $("#quizReviewBack").addEventListener("click", () => {
    quizStage = "result";
    renderQuizStage();
  });

  $("#quizRetryMistakesButton").addEventListener("click", () => {
    if (!fullAttemptAnswers.some(answer => answer && !answer.isCorrect)) return;
    startQuiz("mistakes");
  });

  // =========================================
  // QUIZ — NEXT QUESTION + FINISH
  // =========================================

  if (nextQuestionButton) {
    nextQuestionButton.addEventListener("click", () => {
      if (!hasAnswered || quizFinished || quizStage !== "active") return;

      if (questionIndex < activeQuestionIndices.length - 1) {
        questionIndex += 1;
        hasAnswered = false;
        selectedAnswer = null;
        loadQuestion();
        return;
      }

      quizFinished = true;
      quizStage = "result";
      renderQuizStage();
      updateQuizProgress();
    });
  }

  // =========================================
  // QUIZ — RESTART
  // =========================================

  window.restartQuiz = () => {
    quizMode = "full";
    activeQuestionIndices = questions.map((_, index) => index);
    runAnswers = [];
    questionIndex = 0;
    score = 0;
    hasAnswered = false;
    selectedAnswer = null;
    quizFinished = false;
    quizStage = "welcome";
    fullAttemptAnswers = questions.map(() => null);
    resultPanel.classList.remove("quiz-perfect");
    renderQuizStage();
  };

  // =========================================
  // INITIALIZATION
  // =========================================

  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-valuemin", "0");
  progress.setAttribute("aria-valuemax", "100");

  updateNavigationLanguage();

  renderTimer();

  renderQuizStage();

  showSlide(0);

  updateFullscreenLabel();

  console.info("EcoFilament presentation initialized successfully.");

})();
