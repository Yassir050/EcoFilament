
/* =========================================================
   ECOFILAMENT AI PRESENTER — PHASE 1A
   Read-only presentation bridge + local browser speech.
   Arabic: Microsoft Naayf (ar-SA) preferred.
   English: available English browser voice.
   OpenAI chat is intentionally reserved for Phase 1B.
========================================================= */
(() => {
  "use strict";

  const init = () => {
    if (document.getElementById("aiPresenterPanel")) return;

    const labels = {
      en: {
        launch: "AI Presenter", title: "EcoFilament AI Presenter", subtitle: "Your presentation companion",
        context: "CURRENT SLIDE", explain: "Read slide content", speak: "Read aloud", pause: "Pause", resume: "Resume", stop: "Stop voice",
        welcome: "I can follow your current slide and read its visible content aloud. AI-generated explanations and live questions will be enabled in Phase 1B.",
        content: "SLIDE CONTENT", noContent: "There is no readable slide text to read on this screen.",
        status: "AI chat is not connected yet. <b>Phase 1B</b> will securely connect this panel to OpenAI.",
        footer: "Speech uses voices available in your browser or operating system.",
        slide: "Slide", of: "of", quiz: "Quiz slide detected. Your quiz remains untouched; voice reading is available for visible text.",
        speaking: "Reading current slide…", stopped: "Voice stopped.",
      },
      ar: {
        launch: "المقدّم الذكي", title: "مقدّم EcoFilament الذكي", subtitle: "مرافقك أثناء العرض",
        context: "الشريحة الحالية", explain: "عرض محتوى الشريحة", speak: "قراءة بصوت", pause: "إيقاف مؤقت", resume: "استئناف", stop: "إيقاف الصوت",
        welcome: "يمكنني متابعة الشريحة الحالية وقراءة محتواها الظاهر بصوت مسموع. سيتم تفعيل الشرح المولّد بالذكاء الاصطناعي والأسئلة المباشرة في المرحلة 1B.",
        content: "محتوى الشريحة", noContent: "لا يوجد نص قابل للقراءة في هذه الشاشة.",
        status: "المحادثة الذكية غير متصلة حالياً. في <b>المرحلة 1B</b> سنربط هذه النافذة بـ OpenAI بطريقة آمنة.",
        footer: "تعتمد القراءة الصوتية على الأصوات المتوفرة في المتصفح أو نظام التشغيل.",
        slide: "الشريحة", of: "من", quiz: "تم اكتشاف شريحة الاختبار. لن نغيّر الاختبار؛ ويمكن قراءة النص الظاهر بصوت.",
        speaking: "تتم قراءة الشريحة الحالية…", stopped: "تم إيقاف الصوت.",
      }
    };

    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "ai-presenter-launcher";
    launcher.id = "aiPresenterLauncher";
    launcher.setAttribute("aria-controls", "aiPresenterPanel");
    launcher.setAttribute("aria-expanded", "false");

    const panel = document.createElement("section");
    panel.className = "ai-presenter-panel";
    panel.id = "aiPresenterPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "aipTitle");
    panel.hidden = true;

    panel.innerHTML = `
      <header class="aip-header">
        <div class="aip-brand">
          <div class="aip-mark" aria-hidden="true">✳</div>
          <div class="aip-heading"><strong id="aipTitle"></strong><span id="aipSubtitle"></span></div>
        </div>
        <button class="aip-icon-btn" id="aipClose" type="button" aria-label="Close assistant">×</button>
      </header>
      <div class="aip-body">
        <div class="aip-context"><span id="aipContextLabel"></span><strong id="aipSlideName"></strong></div>
        <div class="aip-message" id="aipWelcome"></div>
        <div class="aip-explain">
          <button class="aip-action primary" id="aipExplain" type="button">✦ <span></span></button>
          <button class="aip-action" id="aipSpeak" type="button">▶ <span></span></button>
          <button class="aip-action" id="aipPause" type="button" disabled>Ⅱ <span></span></button>
          <button class="aip-action" id="aipResume" type="button" disabled>↻ <span></span></button>
          <button class="aip-action" id="aipStop" type="button" disabled>■ <span></span></button>
        </div>
        <div class="aip-message" id="aipSlideContent" hidden aria-live="polite"></div>
        <div class="aip-status" id="aipStatus" role="status"></div>
      </div>
      <footer class="aip-footer" id="aipFooter"></footer>`;

    document.body.append(launcher, panel);

    const $ = (selector) => panel.querySelector(selector);
    let currentLanguage = "en";
    let currentText = "";
    let currentTitle = "";

    const language = () => document.documentElement.lang.toLowerCase().startsWith("ar") ? "ar" : "en";

    const getActiveSlide = () =>
      document.querySelector(".slide.active") ||
      document.querySelector(".slide:not([aria-hidden='true'])");

    const getSlideTitle = (slide, index, lang) => {
      if (!slide) return "";
      const attr = lang === "ar" ? "data-title-ar" : "data-title";
      return slide.getAttribute(attr) || `${labels[lang].slide} ${index + 1}`;
    };

    /*
      Voice selection:
      - Arabic: Microsoft Naayf (ar-SA) preferred.
      - If unavailable: another Arabic voice.
      - English: prefer en-US, then any English voice.
    */
    function getPreferredVoice(lang) {
      const voices = window.speechSynthesis.getVoices();

      if (!voices.length) return null;

      if (lang === "ar") {
        return (
          voices.find(voice =>
            voice.name.includes("Microsoft Naayf") &&
            voice.lang.toLowerCase() === "ar-sa"
          ) ||
          voices.find(voice =>
            voice.lang.toLowerCase() === "ar-sa"
          ) ||
          voices.find(voice =>
            voice.lang.toLowerCase().startsWith("ar")
          ) ||
          null
        );
      }

      return (
        voices.find(voice =>
          voice.lang.toLowerCase() === "en-us"
        ) ||
        voices.find(voice =>
          voice.lang.toLowerCase().startsWith("en")
        ) ||
        null
      );
    }

    function readSlide(slide, lang) {
      if (!slide) return "";

      if (
        slide.hasAttribute("data-title") &&
        slide.getAttribute("data-title") === "Quiz"
      ) {
        return labels[lang].quiz;
      }

      const clone = slide.cloneNode(true);

      clone.querySelectorAll(
        "button, script, style, svg, canvas, video, audio, [aria-hidden='true'], .controls, .dots, .navigation, .kicker"
      ).forEach(node => node.remove());

      clone.querySelectorAll(lang === "ar" ? ".en" : ".ar")
        .forEach(node => node.remove());

      clone.querySelectorAll("[hidden]")
        .forEach(node => node.remove());

      return (clone.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 2600);
    }

    function updateContext() {
      currentLanguage = language();

      const langLabels = labels[currentLanguage];
      const slides = [...document.querySelectorAll(".slide")];
      const active = getActiveSlide();
      const index = Math.max(0, slides.indexOf(active));

      currentTitle = getSlideTitle(active, index, currentLanguage);
      currentText = readSlide(active, currentLanguage);

      launcher.innerHTML =
        `<span class="aip-orb" aria-hidden="true"></span><span>${langLabels.launch}</span>`;

      panel.dir = currentLanguage === "ar" ? "rtl" : "ltr";

      $("#aipTitle").textContent = langLabels.title;
      $("#aipSubtitle").textContent = langLabels.subtitle;
      $("#aipContextLabel").textContent = langLabels.context;

      $("#aipSlideName").textContent =
        `${langLabels.slide} ${index + 1} ${langLabels.of} ${slides.length} · ${currentTitle}`;

      $("#aipWelcome").textContent = langLabels.welcome;
      $("#aipExplain span").textContent = langLabels.explain;
      $("#aipSpeak span").textContent = langLabels.speak;
      $("#aipPause span").textContent = langLabels.pause;
      $("#aipResume span").textContent = langLabels.resume;
      $("#aipStop span").textContent = langLabels.stop;

      $("#aipStatus").innerHTML = langLabels.status;
      $("#aipFooter").textContent = langLabels.footer;

      $("#aipClose").setAttribute(
        "aria-label",
        currentLanguage === "ar" ? "إغلاق المساعد" : "Close assistant"
      );

      if (!$("#aipSlideContent").hidden) showSlideContent();
    }

    function showSlideContent() {
      const output = $("#aipSlideContent");
      const langLabels = labels[currentLanguage];

      output.hidden = false;
      output.dir = currentLanguage === "ar" ? "rtl" : "ltr";
      output.innerHTML =
        `<span class="aip-message-label">${langLabels.content}</span>`;

      const body = document.createElement("div");
      body.textContent = currentText || langLabels.noContent;
      output.append(body);
    }

    function speakCurrentSlide() {
      const langLabels = labels[currentLanguage];

      if (
        !("speechSynthesis" in window) ||
        !("SpeechSynthesisUtterance" in window)
      ) {
        $("#aipStatus").textContent =
          currentLanguage === "ar"
            ? "المتصفح الحالي لا يدعم القراءة الصوتية."
            : "Speech synthesis is not supported in this browser.";
        return;
      }

      const text = [currentTitle, currentText]
        .filter(Boolean)
        .join(". ");

      if (!text.trim()) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = getPreferredVoice(currentLanguage);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = currentLanguage === "ar" ? "ar-SA" : "en-US";
      }

      utterance.rate = 0.96;

      utterance.onstart = () => {
        $("#aipStatus").textContent = langLabels.speaking;
        $("#aipStop").disabled = false;
        $("#aipPause").disabled = false;
        $("#aipResume").disabled = true;
      };

      utterance.onpause = () => {
        $("#aipPause").disabled = true;
        $("#aipResume").disabled = false;
      };

      utterance.onresume = () => {
        $("#aipPause").disabled = false;
        $("#aipResume").disabled = true;
      };

      utterance.onend = resetSpeechControls;
      utterance.onerror = resetSpeechControls;

      window.speechSynthesis.speak(utterance);
    }

    function resetSpeechControls() {
      $("#aipStop").disabled = true;
      $("#aipPause").disabled = true;
      $("#aipResume").disabled = true;
    }

    function pauseSpeech() {
      if (
        "speechSynthesis" in window &&
        window.speechSynthesis.speaking &&
        !window.speechSynthesis.paused
      ) {
        window.speechSynthesis.pause();
        $("#aipPause").disabled = true;
        $("#aipResume").disabled = false;
      }
    }

    function resumeSpeech() {
      if (
        "speechSynthesis" in window &&
        window.speechSynthesis.paused
      ) {
        window.speechSynthesis.resume();
        $("#aipPause").disabled = false;
        $("#aipResume").disabled = true;
      }
    }

    function stopSpeech() {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      resetSpeechControls();
      $("#aipStatus").textContent = labels[currentLanguage].stopped;
    }

    function openPanel() {
      updateContext();
      panel.hidden = false;
      launcher.setAttribute("aria-expanded", "true");
      $("#aipClose").focus();
    }

    function closePanel() {
      panel.hidden = true;
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus();
    }

    launcher.addEventListener("click", () =>
      panel.hidden ? openPanel() : closePanel()
    );

    $("#aipClose").addEventListener("click", closePanel);
    $("#aipExplain").addEventListener("click", showSlideContent);
    $("#aipSpeak").addEventListener("click", speakCurrentSlide);
    $("#aipPause").addEventListener("click", pauseSpeech);
    $("#aipResume").addEventListener("click", resumeSpeech);
    $("#aipStop").addEventListener("click", stopSpeech);

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !panel.hidden) {
        closePanel();
      }
    });

    const observer = new MutationObserver(() => updateContext());

    observer.observe(
      document.getElementById("presentation") || document.body,
      {
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "aria-hidden"]
      }
    );

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "dir"]
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    });

    // Refresh context when browser voices finish loading.
    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener(
        "voiceschanged",
        () => {
          // Voices are selected when the user presses Read aloud.
        }
      );
    }

    updateContext();

    window.EcoFilamentPresenter = Object.freeze({
      version: "1A",
      getContext: () => ({
        language: currentLanguage,
        title: currentTitle,
        text: currentText
      }),
      speak: speakCurrentSlide,
      stop: stopSpeech
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
