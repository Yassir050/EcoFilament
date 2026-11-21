
(() => {
  "use strict";

  // =========================================
  // ECOFILAMENT — AI CHAT
  // Independent frontend controller
  // Arabic / English
  // Backend: Enzonic FastAPI
  // =========================================

  const CONFIG = {
    API_URL: "https://ecofilament-ai.enzonic.dev/api/chat",
    STORAGE_KEY: "ecofilament_ai_chat_v1",
    MAX_MESSAGES: 12,
    MAX_MESSAGE_LENGTH: 4000
  };

  const SELECTORS = {
    toggle: "#aiChatToggle",
    window: "#aiChatWindow",
    close: "#aiChatClose",
    messages: "#aiChatMessages",
    form: "#aiChatForm",
    input: "#aiChatInput",
    send: "#aiChatSend",
    clear: "#aiChatClear",
    status: "#aiChatStatus"
  };

  const translations = {
    en: {
      greeting: "Hello! I'm the EcoFilament AI assistant. How can I help you?",
      placeholder: "Ask me about EcoFilament...",
      send: "Send",
      loading: "Thinking...",
      error: "Something went wrong. Please try again.",
      networkError: "Unable to connect to the server. Check your connection.",
      empty: "Please enter a message first.",
      cleared: "Conversation cleared.",
      open: "Open AI Chat",
      close: "Close AI Chat"
    },
    ar: {
      greeting: "مرحباً! أنا مساعد EcoFilament الذكي. كيف يمكنني مساعدتك؟",
      placeholder: "اسألني عن EcoFilament...",
      send: "إرسال",
      loading: "جاري التفكير...",
      error: "حدث خطأ. حاول مرة أخرى.",
      networkError: "تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.",
      empty: "يرجى كتابة رسالة أولاً.",
      cleared: "تم مسح المحادثة.",
      open: "فتح المحادثة الذكية",
      close: "إغلاق المحادثة الذكية"
    }
  };

  let conversation = [];
  let isLoading = false;
  let currentLanguage = "en";

  let elements = {};

  // -----------------------------------------
  // DOM
  // -----------------------------------------

  function getElements() {
    Object.entries(SELECTORS).forEach(([key, selector]) => {
      elements[key] = document.querySelector(selector);
    });

    const missing = Object.entries(elements)
      .filter(([, element]) => !element)
      .map(([key]) => key);

    if (missing.length) {
      console.warn(
        "[EcoFilament AI Chat] Missing HTML elements:",
        missing.join(", ")
      );
      return false;
    }

    return true;
  }

  // -----------------------------------------
  // LANGUAGE
  // -----------------------------------------

  function detectLanguage() {
    const htmlLanguage =
      document.documentElement.lang?.toLowerCase();

    currentLanguage = htmlLanguage?.startsWith("ar")
      ? "ar"
      : "en";

    updateLanguage();
  }

  function updateLanguage() {
    const language = translations[currentLanguage];
    const isArabic = currentLanguage === "ar";

    elements.window.lang = currentLanguage;
    elements.window.dir = isArabic ? "rtl" : "ltr";

    elements.messages.dir = isArabic ? "rtl" : "ltr";
    elements.input.dir = isArabic ? "rtl" : "ltr";

    elements.input.placeholder = language.placeholder;
    elements.send.textContent = language.send;

    elements.toggle.setAttribute(
      "aria-label",
      elements.window.hidden ? language.open : language.close
    );

    renderMessages();
  }

  function watchLanguageChanges() {
    const observer = new MutationObserver(() => {
      const newLanguage =
        document.documentElement.lang?.toLowerCase()
          ?.startsWith("ar")
          ? "ar"
          : "en";

      if (newLanguage !== currentLanguage) {
        currentLanguage = newLanguage;
        updateLanguage();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "dir"]
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    });
  }

  // -----------------------------------------
  // SESSION STORAGE
  // -----------------------------------------

  function saveConversation() {
    try {
      sessionStorage.setItem(
        CONFIG.STORAGE_KEY,
        JSON.stringify(conversation)
      );
    } catch (error) {
      console.warn(
        "[EcoFilament AI Chat] Could not save conversation:",
        error
      );
    }
  }

  function loadConversation() {
    try {
      const saved = sessionStorage.getItem(CONFIG.STORAGE_KEY);

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) return;

      conversation = parsed
        .filter(message =>
          message &&
          ["user", "assistant"].includes(message.role) &&
          typeof message.content === "string"
        )
        .slice(-CONFIG.MAX_MESSAGES);

    } catch (error) {
      console.warn(
        "[EcoFilament AI Chat] Could not load conversation:",
        error
      );

      conversation = [];
    }
  }

  // -----------------------------------------
  // MESSAGE RENDERING
  // -----------------------------------------

  function createMessageElement(role, content) {
    const wrapper = document.createElement("div");
    wrapper.className = `ai-chat-message ai-chat-message--${role}`;
    wrapper.setAttribute("data-role", role);

    const bubble = document.createElement("div");
    bubble.className = "ai-chat-bubble";

    // textContent prevents HTML injection.
    bubble.textContent = content;

    wrapper.appendChild(bubble);

    return wrapper;
  }

  function renderMessages() {
    if (!elements.messages) return;

    elements.messages.replaceChildren();

    if (conversation.length === 0) {
      const greeting = createMessageElement(
        "assistant",
        translations[currentLanguage].greeting
      );

      elements.messages.appendChild(greeting);
    } else {
      conversation.forEach(message => {
        elements.messages.appendChild(
          createMessageElement(message.role, message.content)
        );
      });
    }

    scrollToLatest();
  }

  function scrollToLatest() {
    elements.messages.scrollTop =
      elements.messages.scrollHeight;
  }

  function addMessage(role, content) {
    conversation.push({ role, content });

    conversation = conversation.slice(-CONFIG.MAX_MESSAGES);

    saveConversation();

    renderMessages();
  }

  // -----------------------------------------
  // LOADING STATE
  // -----------------------------------------

  function setLoading(loading) {
    isLoading = loading;

    elements.input.disabled = loading;
    elements.send.disabled = loading;
    elements.clear.disabled = loading;

    elements.send.textContent = loading
      ? "..."
      : translations[currentLanguage].send;

    // Preserve error and status messages when loading ends.
    if (loading) {
      elements.status.textContent =
        translations[currentLanguage].loading;
    }

    elements.form.setAttribute(
      "aria-busy",
      loading ? "true" : "false"
    );
  }

  // -----------------------------------------
  // CHAT WINDOW
  // -----------------------------------------

  function openChat() {
    elements.window.hidden = false;

    elements.window.setAttribute("aria-hidden", "false");

    elements.toggle.setAttribute("aria-expanded", "true");

    elements.toggle.setAttribute(
      "aria-label",
      translations[currentLanguage].close
    );

    elements.input.focus();
    scrollToLatest();
  }

  function closeChat() {
    elements.window.hidden = true;

    elements.window.setAttribute("aria-hidden", "true");

    elements.toggle.setAttribute("aria-expanded", "false");

    elements.toggle.setAttribute(
      "aria-label",
      translations[currentLanguage].open
    );
  }

  function toggleChat() {
    if (elements.window.hidden) {
      openChat();
    } else {
      closeChat();
    }
  }

  // -----------------------------------------
  // BACKEND REQUEST
  // -----------------------------------------

  async function requestAI() {
    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: conversation.slice(-CONFIG.MAX_MESSAGES)
      })
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("INVALID_RESPONSE");
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.detail ||
        data.error ||
        "SERVER_ERROR"
      );
    }

    if (typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("EMPTY_REPLY");
    }

    return data.reply.trim();
  }

  // -----------------------------------------
  // SEND MESSAGE
  // -----------------------------------------

  async function sendMessage(event) {
    event?.preventDefault();

    if (isLoading) return;

    const message = elements.input.value.trim();

    if (!message) {
      elements.status.textContent =
        translations[currentLanguage].empty;
      return;
    }

    if (message.length > CONFIG.MAX_MESSAGE_LENGTH) {
      elements.status.textContent =
        `Maximum ${CONFIG.MAX_MESSAGE_LENGTH} characters.`;
      return;
    }

    elements.status.textContent = "";

    addMessage("user", message);

    elements.input.value = "";

    setLoading(true);

    try {
      const reply = await requestAI();

      addMessage("assistant", reply);

      elements.status.textContent = "";

    } catch (error) {
      console.error("[EcoFilament AI Chat]", error);

      // Remove only the message whose request failed.
      const lastMessage = conversation[conversation.length - 1];

      if (
        lastMessage &&
        lastMessage.role === "user" &&
        lastMessage.content === message
      ) {
        conversation.pop();
        saveConversation();
        renderMessages();
      }

      const isNetworkError =
        error instanceof TypeError;

      elements.status.textContent = isNetworkError
        ? translations[currentLanguage].networkError
        : translations[currentLanguage].error;

    } finally {
      setLoading(false);
      elements.input.focus();
    }
  }

  // -----------------------------------------
  // CLEAR CONVERSATION
  // -----------------------------------------

  function clearConversation() {
    if (isLoading) return;

    conversation = [];

    try {
      sessionStorage.removeItem(CONFIG.STORAGE_KEY);
    } catch (error) {
      console.warn(
        "[EcoFilament AI Chat] Could not clear storage:",
        error
      );
    }

    elements.status.textContent =
      translations[currentLanguage].cleared;

    renderMessages();
  }

  // -----------------------------------------
  // EVENTS
  // -----------------------------------------

  function bindEvents() {
    elements.toggle.addEventListener("click", toggleChat);

    elements.close.addEventListener("click", closeChat);

    elements.form.addEventListener("submit", sendMessage);

    elements.clear.addEventListener(
      "click",
      clearConversation
    );

    document.addEventListener("keydown", event => {
      if (
        event.key === "Escape" &&
        !elements.window.hidden
      ) {
        closeChat();
      }
    });
  }

  // -----------------------------------------
  // INITIALIZATION
  // -----------------------------------------

  function init() {
    if (!getElements()) {
      console.error(
        "[EcoFilament AI Chat] Initialization stopped. Check the HTML IDs."
      );
      return;
    }

    loadConversation();
    detectLanguage();
    bindEvents();
    watchLanguageChanges();

    elements.window.hidden = true;
    elements.window.setAttribute("aria-hidden", "true");

    elements.toggle.setAttribute("aria-expanded", "false");

    renderMessages();

    console.log(
      "[EcoFilament AI Chat] Initialized successfully."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }

})();
