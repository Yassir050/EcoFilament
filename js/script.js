
(() => {
  "use strict";

  // =========================================
  // ECOFILAMENT — BILINGUAL SYSTEM
  // English (default) / Arabic
  // =========================================

  const slides = [...document.querySelectorAll(".slide")];
  const progress = document.getElementById("progress");
  const langButton = document.getElementById("langBtn");

  let currentSlide = 0;
  let currentLanguage = "en";
  let remainingSeconds = 10 * 60;
  let timerInterval = null;

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
      fullscreenError: "Fullscreen is not available in this browser. You can still use the presentation normally.",
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
      fullscreenError: "ملء الشاشة غير متاح في هذا المتصفح. يمكنك متابعة العرض بشكل عادي.",
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
    return typeof value === "function" ? value(...args) : value;
  };

  // =========================================
  // TRANSLATION ENGINE
  // HTML elements will use data-i18n attributes.
  // =========================================

  function applyTranslations() {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir =
      currentLanguage === "ar" ? "rtl" : "ltr";

    document.body.classList.remove("lang-en", "lang-ar");
    document.body.classList.add(`lang-${currentLanguage}`);

    document.querySelectorAll("[data-i18n]").forEach(element => {
      const key = element.dataset.i18n;
      const value = translations[currentLanguage][key];

      if (typeof value === "string") {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(element => {
      const entries = element.dataset.i18nAttr.split(";");

      entries.forEach(entry => {
        const [attribute, key] = entry.split(":").map(value => value.trim());
        const value = translations[currentLanguage][key];

        if (attribute && typeof value === "string") {
          element.setAttribute(attribute, value);
        }
      });
    });

    langButton.textContent =
      currentLanguage === "en" ? "العربية" : "English";

    langButton.setAttribute("aria-label", t("switchLanguage"));
    langButton.setAttribute("title", t("switchLanguage"));

    updateNavigationLanguage();
    renderTimer();
    updateFullscreenLabel();

    if (!resultPanel.hidden) {
      updateResult();
    } else {
      loadQuestion();
    }
  }

  langButton.addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "ar" : "en";
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

  document.querySelector("main").appendChild(controls);

  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const slideCount = document.getElementById("slideCount");
  const dots = document.getElementById("dots");

  const dotButtons = [];

  slides.forEach((slide, index) => {
    const dot = document.createElement("button");

    dot.className = "dot";
    dot.type = "button";
    dot.addEventListener("click", () => showSlide(index));

    dots.appendChild(dot);
    dotButtons.push(dot);
  });

  function updateNavigationLanguage() {
    controls.setAttribute("aria-label", t("navigation"));
    dots.setAttribute("aria-label", t("chooseSection"));

    prevButton.textContent = t("previous");
    nextButton.textContent = t("next");

    slides.forEach((slide, index) => {
      const title =
        slide.dataset.title ||
        `${t("section")} ${index + 1}`;

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
      slide.setAttribute("aria-hidden", String(!active));
    });

    progress.style.width =
      `${((currentSlide + 1) / slides.length) * 100}%`;

    prevButton.disabled = currentSlide === 0;
    nextButton.disabled = currentSlide === slides.length - 1;

    slideCount.textContent =
      `${currentSlide + 1} / ${slides.length}`;

    dotButtons.forEach((dot, i) => {
      dot.classList.toggle("on", i === currentSlide);
      dot.setAttribute(
        "aria-current",
        i === currentSlide ? "step" : "false"
      );
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function previousSlide() {
    showSlide(currentSlide - 1);
  }

  window.nextSlide = nextSlide;
  window.prevSlide = previousSlide;
  window.goTo = showSlide;

  prevButton.addEventListener("click", previousSlide);
  nextButton.addEventListener("click", nextSlide);

  // =========================================
  // PRESENTATION TIMER
  // =========================================

  const timerButton = document.getElementById("timerBtn");
  const timerDisplay = document.getElementById("timer");

  function renderTimer() {
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

  timerButton.addEventListener("click", () => {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerButton.setAttribute("aria-label", t("resumeTimer"));
      return;
    }

    if (remainingSeconds <= 0) {
      remainingSeconds = 10 * 60;
    }

    timerButton.setAttribute("aria-label", t("pauseTimer"));
    renderTimer();

    timerInterval = window.setInterval(() => {
      remainingSeconds = Math.max(0, remainingSeconds - 1);
      renderTimer();

      if (remainingSeconds === 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerButton.setAttribute("aria-label", t("restartTimer"));
      }
    }, 1000);
  });

  // =========================================
  // FULLSCREEN
  // =========================================

  const fullscreenButton = document.getElementById("fullBtn");

  function updateFullscreenLabel() {
    fullscreenButton.textContent =
      document.fullscreenElement
        ? t("exitFullscreen")
        : t("fullscreen");
  }

  fullscreenButton.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      alert(t("fullscreenError"));
    }
  });

  document.addEventListener("fullscreenchange", updateFullscreenLabel);

  // =========================================
  // KEYBOARD NAVIGATION
  // =========================================

  document.addEventListener("keydown", event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const tag = document.activeElement?.tagName;

    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (event.key === "ArrowRight") {
      currentLanguage === "ar"
        ? previousSlide()
        : nextSlide();
    }

    if (event.key === "ArrowLeft") {
      currentLanguage === "ar"
        ? nextSlide()
        : previousSlide();
    }
  });

  // =========================================
  // AUDIENCE QUIZ — ENGLISH & ARABIC
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

  let questionIndex = 0;
  let score = 0;
  let hasAnswered = false;

  const questionCount = document.getElementById("qCount");
  const questionText = document.getElementById("question");
  const optionsContainer = document.getElementById("options");
  const feedback = document.getElementById("feedback");
  const scoreDisplay = document.getElementById("score");
  const quizProgress = document.getElementById("quizProgress");
  const nextQuestionButton = document.getElementById("nextQuestion");
  const quizPanel = document.getElementById("quizPanel");
  const resultPanel = document.getElementById("resultPanel");

  function getCurrentQuestion() {
    return questions[questionIndex][currentLanguage];
  }

  function loadQuestion() {
    hasAnswered = false;

    const question = getCurrentQuestion();

    questionCount.textContent =
      `${t("question")} ${questionIndex + 1} ${t("of")} ${questions.length}`;

    questionText.textContent = question.question;

    quizProgress.style.width =
      `${(questionIndex / questions.length) * 100}%`;

    feedback.textContent = "";
    nextQuestionButton.disabled = true;

    nextQuestionButton.textContent =
      questionIndex === questions.length - 1
        ? t("seeResult")
        : t("nextQuestion");

    scoreDisplay.textContent = score;
    optionsContainer.replaceChildren();

    question.answers.forEach((answer, index) => {
      const option = document.createElement("button");

      option.className = "quiz-option";
      option.type = "button";
      option.textContent =
        `${String.fromCharCode(65 + index)}. ${answer}`;

      option.addEventListener("click", () => {
        chooseAnswer(index, option);
      });

      optionsContainer.appendChild(option);
    });
  }

  function chooseAnswer(selectedIndex, selectedButton) {
    if (hasAnswered) return;

    hasAnswered = true;

    const question = questions[questionIndex][currentLanguage];
    const optionButtons =
      [...optionsContainer.querySelectorAll("button")];

    optionButtons.forEach((button, index) => {
      button.disabled = true;

      if (index === questions[questionIndex].correct) {
        button.classList.add("correct");
      }
    });

    if (selectedIndex === questions[questionIndex].correct) {
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

  function updateResult() {
    document.getElementById("finalScore").textContent =
      `${score}/${questions.length}`;

    document.getElementById("resultText").textContent =
      score === questions.length
        ? t("excellent")
        : score >= 3
          ? t("good")
          : t("keepLearning");

    document.getElementById("resultMessage").textContent =
      t("resultMessage", score, questions.length);
  }

  nextQuestionButton.addEventListener("click", () => {
    if (!hasAnswered) return;

    if (questionIndex < questions.length - 1) {
      questionIndex += 1;
      loadQuestion();
      return;
    }

    quizPanel.hidden = true;
    resultPanel.hidden = false;

    updateResult();
    quizProgress.style.width = "100%";
  });

  window.restartQuiz = () => {
    questionIndex = 0;
    score = 0;

    quizPanel.hidden = false;
    resultPanel.hidden = true;

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

})();
