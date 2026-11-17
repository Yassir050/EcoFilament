(() => {
  "use strict";

  const slides = [...document.querySelectorAll(".slide")];
  const progress = document.getElementById("progress");
  const dotsContainer = document.getElementById("dots");
  let currentSlide = 0;
  let languageMode = 0;
  let remainingSeconds = 10 * 60;
  let timerInterval = null;

  // Navigation controls
  const controls = document.createElement("nav");
  controls.className = "controls";
  controls.setAttribute("aria-label", "Presentation navigation");
  controls.innerHTML = `
    <button class="navbtn" id="prev" type="button">← Previous</button>
    <div class="dots" id="dots" aria-label="Choose a presentation section"></div>
    <span id="slideCount" class="footer-note" aria-live="polite"></span>
    <button class="navbtn" id="next" type="button">Next →</button>`;
  document.querySelector("main").appendChild(controls);

  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const slideCount = document.getElementById("slideCount");
  const dots = document.getElementById("dots");

  slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.title = slide.dataset.title || `Section ${index + 1}`;
    dot.setAttribute("aria-label", `Go to ${dot.title}`);
    dot.addEventListener("click", () => showSlide(index));
    dots.appendChild(dot);
  });

  const dotButtons = [...dots.querySelectorAll(".dot")];

  function showSlide(index) {
    currentSlide = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      const active = i === currentSlide;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });

    progress.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
    prevButton.disabled = currentSlide === 0;
    nextButton.disabled = currentSlide === slides.length - 1;
    slideCount.textContent = `${currentSlide + 1} / ${slides.length}`;

    dotButtons.forEach((dot, i) => {
      dot.classList.toggle("on", i === currentSlide);
      dot.setAttribute("aria-current", i === currentSlide ? "step" : "false");
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextSlide() { showSlide(currentSlide + 1); }
  function previousSlide() { showSlide(currentSlide - 1); }
  window.nextSlide = nextSlide;
  window.prevSlide = previousSlide;
  window.goTo = showSlide;

  prevButton.addEventListener("click", previousSlide);
  nextButton.addEventListener("click", nextSlide);

  // Language switch: bilingual, English only, Arabic only.
  document.getElementById("langBtn").addEventListener("click", () => {
    languageMode = (languageMode + 1) % 3;
    const modes = ["lang-both", "lang-en", "lang-ar"];
    document.body.classList.remove(...modes);
    document.body.classList.add(modes[languageMode]);
    const labels = ["EN / AR", "ENGLISH", "العربية"];
    document.getElementById("langBtn").textContent = labels[languageMode];
    document.documentElement.lang = languageMode === 2 ? "ar" : "en";
  });

  // Countdown timer: first click starts, next click pauses; after zero it can restart.
  const timerButton = document.getElementById("timerBtn");
  const timerDisplay = document.getElementById("timer");

  function renderTimer() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const value = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    timerDisplay.textContent = value;
    timerDisplay.setAttribute("aria-label", `${minutes} minutes and ${seconds} seconds remaining`);
    timerDisplay.style.color = remainingSeconds === 0 ? "#ff9999" : "";
  }

  timerButton.addEventListener("click", () => {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerButton.setAttribute("aria-label", "Resume presentation timer");
      return;
    }

    if (remainingSeconds <= 0) remainingSeconds = 10 * 60;
    timerButton.setAttribute("aria-label", "Pause presentation timer");
    renderTimer();
    timerInterval = window.setInterval(() => {
      remainingSeconds = Math.max(0, remainingSeconds - 1);
      renderTimer();
      if (remainingSeconds === 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerButton.setAttribute("aria-label", "Restart presentation timer");
      }
    }, 1000);
  });

  // Fullscreen control with graceful fallback.
  const fullscreenButton = document.getElementById("fullBtn");
  fullscreenButton.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      alert("Fullscreen is not available in this browser. You can still use the presentation normally.");
    }
  });

  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "⛶ Exit fullscreen" : "⛶ Fullscreen";
  });

  // Keyboard navigation. Do not hijack arrow keys while using quiz buttons.
  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight") nextSlide();
    if (event.key === "ArrowLeft") previousSlide();
  });

  // Audience quiz
  const questions = [
    {
      question: "What is the main goal of this project?",
      answers: ["To produce more plastic bottles", "To give suitable plastic waste a second life", "To replace every material with plastic"],
      correct: 1,
      explanation: "The project explores reusing suitable plastic waste as 3D-printing filament."
    },
    {
      question: "Which plastic is commonly used for many beverage bottles?",
      answers: ["PET", "Glass", "Paper"],
      correct: 0,
      explanation: "Many beverage bottles are made from PET, but materials must still be identified and tested."
    },
    {
      question: "Why is sorting important?",
      answers: ["All plastics behave the same", "Different plastics have different properties", "It changes plastic into metal"],
      correct: 1,
      explanation: "Different plastic types have different properties and are not all suitable for the same process."
    },
    {
      question: "What should be checked before using recycled filament?",
      answers: ["Its color only", "Its consistency, diameter, and printing performance", "Its packaging design"],
      correct: 1,
      explanation: "Quality control checks whether the filament is suitable for the printer."
    },
    {
      question: "What does a circular economy aim to do?",
      answers: ["Keep materials in use for as long as possible", "Throw products away faster", "Stop all technology"],
      correct: 0,
      explanation: "A circular economy tries to keep materials and products in use rather than wasting them."
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

  function loadQuestion() {
    hasAnswered = false;
    const question = questions[questionIndex];
    questionCount.textContent = `Question ${questionIndex + 1} of ${questions.length}`;
    questionText.textContent = question.question;
    quizProgress.style.width = `${(questionIndex / questions.length) * 100}%`;
    feedback.textContent = "";
    nextQuestionButton.disabled = true;
    nextQuestionButton.textContent = questionIndex === questions.length - 1 ? "See result →" : "Next question →";
    scoreDisplay.textContent = score;
    optionsContainer.replaceChildren();

    question.answers.forEach((answer, index) => {
      const option = document.createElement("button");
      option.className = "quiz-option";
      option.type = "button";
      option.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
      option.addEventListener("click", () => chooseAnswer(index, option));
      optionsContainer.appendChild(option);
    });
  }

  function chooseAnswer(selectedIndex, selectedButton) {
    if (hasAnswered) return;
    hasAnswered = true;

    const question = questions[questionIndex];
    const optionButtons = [...optionsContainer.querySelectorAll("button")];
    optionButtons.forEach((button, index) => {
      button.disabled = true;
      if (index === question.correct) button.classList.add("correct");
    });

    if (selectedIndex === question.correct) {
      score += 1;
      feedback.textContent = `✓ Correct! ${question.explanation}`;
    } else {
      selectedButton.classList.add("wrong");
      feedback.textContent = `Not quite. ${question.explanation}`;
    }

    scoreDisplay.textContent = score;
    nextQuestionButton.disabled = false;
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
    document.getElementById("finalScore").textContent = `${score}/${questions.length}`;
    document.getElementById("resultText").textContent =
      score === questions.length ? "Excellent work!" : score >= 3 ? "Good job!" : "Keep learning!";
    document.getElementById("resultMessage").textContent =
      `You answered ${score} out of ${questions.length} questions correctly. Review the presentation and try again to improve your score.`;
    quizProgress.style.width = "100%";
  });

  window.restartQuiz = () => {
    questionIndex = 0;
    score = 0;
    quizPanel.hidden = false;
    resultPanel.hidden = true;
    loadQuestion();
  };

  renderTimer();
  loadQuestion();
  showSlide(0);
})();
