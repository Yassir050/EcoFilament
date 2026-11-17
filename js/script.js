
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
  // QUIZ STATE
  // =========================================

  let questionIndex = 0;
  let score = 0;
  let hasAnswered = false;
  let selectedAnswer = null;
  let quizFinished = false;

  const questionCount = $("#qCount");
  const questionText = $("#question");
  const optionsContainer = $("#options");
  const feedback = $("#feedback");
  const scoreDisplay = $("#score");
  const quizProgress = $("#quizProgress");

  const nextQuestionButton = $("#nextQuestion");
  const quizPanel = $("#quizPanel");
  const resultPanel = $("#resultPanel");

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

    langButton.setAttribute("aria-label", t("switchLanguage"));
    langButton.setAttribute("title", t("switchLanguage"));

    updateNavigationLanguage();
    renderTimer();
    updateFullscreenLabel();

    // Preserve quiz state when changing language
    if (quizFinished) {
      updateResult();
    } else {
      loadQuestion();
    }
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
    currentSlide = Math.max(
      0,
      Math.min(slides.length - 1, index)
    );

    slides.forEach((slide, i) => {
      const active = i === currentSlide;

      slide.classList.toggle("active", active);

      slide.setAttribute(
        "aria-hidden",
        String(!active)
      );

      // Prevent keyboard focus inside inactive slides
      slide.inert = !active;
    });

    const percentage =
      ((currentSlide + 1) / slides.length) * 100;

    progress.style.width = `${percentage}%`;

    const progressBar = $("#presentationProgress");

    if (progressBar) {
      progressBar.setAttribute(
        "aria-valuenow",
        String(Math.round(percentage))
      );
    }

    prevButton.disabled = currentSlide === 0;

    nextButton.disabled =
      currentSlide === slides.length - 1;

    slideCount.textContent =
      `${currentSlide + 1} / ${slides.length}`;

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
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth"
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
    if (!fullscreenButton) return;

    fullscreenButton.textContent =
      document.fullscreenElement
        ? t("exitFullscreen")
        : t("fullscreen");

    fullscreenButton.setAttribute(
      "aria-label",
      document.fullscreenElement
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
  // KEYBOARD NAVIGATION
  // =========================================

  document.addEventListener("keydown", event => {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    const activeElement = document.activeElement;

    const tag = activeElement?.tagName;

    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      activeElement?.isContentEditable
    ) {
      return;
    }

    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowLeft"
    ) {
      event.preventDefault();

      if (currentLanguage === "ar") {
        event.key === "ArrowRight"
          ? previousSlide()
          : nextSlide();
      } else {
        event.key === "ArrowRight"
          ? nextSlide()
          : previousSlide();
      }
    }
  });

  // =========================================
  // QUIZ — RENDER QUESTION
  // =========================================

  function getCurrentQuestion() {
    return questions[questionIndex][currentLanguage];
  }

  function loadQuestion() {
    if (!questionText || !optionsContainer) return;

    const question = getCurrentQuestion();

    questionCount.textContent =
      `${t("question")} ${questionIndex + 1} ${t("of")} ${questions.length}`;

    questionText.textContent = question.question;

    quizProgress.style.width =
      `${(questionIndex / questions.length) * 100}%`;

    optionsContainer.replaceChildren();

    question.answers.forEach((answer, index) => {
      const option = document.createElement("button");

      option.className = "quiz-option";
      option.type = "button";

      option.textContent =
        `${String.fromCharCode(65 + index)}. ${answer}`;

      option.disabled = hasAnswered;

      if (hasAnswered) {
        if (index === questions[questionIndex].correct) {
          option.classList.add("correct");
        }

        if (
          index === selectedAnswer &&
          selectedAnswer !== questions[questionIndex].correct
        ) {
          option.classList.add("wrong");
        }
      }

      option.addEventListener("click", () => {
        chooseAnswer(index, option);
      });

      optionsContainer.appendChild(option);
    });

    // Restore previous answer feedback after language change
    if (hasAnswered) {
      const isCorrect =
        selectedAnswer === questions[questionIndex].correct;

      feedback.textContent =
        `${isCorrect ? t("correct") : t("incorrect")} ${question.explanation}`;
    } else {
      feedback.textContent = "";
    }

    nextQuestionButton.disabled = !hasAnswered;

    nextQuestionButton.textContent =
      questionIndex === questions.length - 1
        ? t("seeResult")
        : t("nextQuestion");

    scoreDisplay.textContent = score;
  }

  // =========================================
  // QUIZ — ANSWER HANDLING
  // =========================================

  function chooseAnswer(selectedIndex, selectedButton) {
    if (hasAnswered || quizFinished) return;

    hasAnswered = true;
    selectedAnswer = selectedIndex;

    const question = getCurrentQuestion();

    const correctIndex = questions[questionIndex].correct;

    const optionButtons =
      $$("button", optionsContainer);

    optionButtons.forEach((button, index) => {
      button.disabled = true;

      if (index === correctIndex) {
        button.classList.add("correct");
      }
    });

    if (selectedIndex === correctIndex) {
      score += 1;

      feedback.textContent =
        `${t("correct")} ${question.explanation}`;
    } else {
      selectedButton.classList.add("wrong");

      feedback.textContent =
        `${t("incorrect")} ${question.explanation}`;
    }

    scoreDisplay.textContent = score;

    nextQuestionButton.disabled = false;
  }

  // =========================================
  // QUIZ — RESULTS
  // =========================================

  function updateResult() {
    const finalScore = $("#finalScore");
    const resultText = $("#resultText");
    const resultMessage = $("#resultMessage");

    if (!finalScore || !resultText || !resultMessage) {
      return;
    }

    finalScore.textContent =
      `${score}/${questions.length}`;

    resultText.textContent =
      score === questions.length
        ? t("excellent")
        : score >= 3
          ? t("good")
          : t("keepLearning");

    resultMessage.textContent =
      t("resultMessage", score, questions.length);
  }

  // =========================================
  // QUIZ — NEXT QUESTION
  // =========================================

  if (nextQuestionButton) {
    nextQuestionButton.addEventListener("click", () => {
      if (!hasAnswered || quizFinished) return;

      if (questionIndex < questions.length - 1) {
        questionIndex += 1;

        hasAnswered = false;
        selectedAnswer = null;

        loadQuestion();

        return;
      }

      quizFinished = true;

      quizPanel.hidden = true;
      resultPanel.hidden = false;

      updateResult();

      quizProgress.style.width = "100%";

      const quizProgressWrap = $("#quizProgressWrap");

      if (quizProgressWrap) {
        quizProgressWrap.setAttribute(
          "aria-valuenow",
          "100"
        );
      }
    });
  }

  // =========================================
  // QUIZ — RESTART
  // =========================================

  window.restartQuiz = () => {
    questionIndex = 0;
    score = 0;

    hasAnswered = false;
    selectedAnswer = null;
    quizFinished = false;

    quizPanel.hidden = false;
    resultPanel.hidden = true;

    quizProgress.style.width = "0%";

    const quizProgressWrap = $("#quizProgressWrap");

    if (quizProgressWrap) {
      quizProgressWrap.setAttribute(
        "aria-valuenow",
        "0"
      );
    }

    loadQuestion();
  };

  // =========================================
  // INITIALIZATION
  // =========================================

  updateNavigationLanguage();

  renderTimer();

  loadQuestion();

  showSlide(0);

  updateFullscreenLabel();

  console.info("EcoFilament presentation initialized successfully.");

})();
