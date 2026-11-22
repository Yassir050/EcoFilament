# ♻️ EcoFilament
### From Plastic Waste to 3D Printing Filament

<p align="center">
  <strong>Turning an environmental challenge into a technological opportunity.</strong>
</p>

<p align="center">
  🌍 Sustainability · ♻️ Recycling · 🖨️ 3D Printing · 💡 Innovation
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Project-EcoFilament-00bcd4?style=for-the-badge" alt="EcoFilament">
  <img src="https://img.shields.io/badge/HTML5-Structure-orange?style=for-the-badge&logo=html5" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-Design-blue?style=for-the-badge&logo=css3" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-Logic-yellow?style=for-the-badge&logo=javascript" alt="JavaScript">
  <img src="https://img.shields.io/badge/Three.js-3D%20Visualization-black?style=for-the-badge&logo=threedotjs" alt="Three.js">
  <img src="https://img.shields.io/badge/AI-Powered-8A2BE2?style=for-the-badge" alt="AI Powered">
</p>

<p align="center">
  <a href="https://yassir050.github.io/EcoFilament/"><strong>🚀 Live Presentation</strong></a>
  &nbsp; • &nbsp;
  <a href="https://github.com/Yassir050/EcoFilament"><strong>📂 Source Code</strong></a>
</p>

---

## 🌱 About EcoFilament

**EcoFilament** is an interactive educational project that explores the idea of transforming suitable plastic waste into material for 3D printing.

It combines environmental awareness, interactive storytelling, 3D visualization, and AI-powered assistance to explain the relationship between plastic recycling and additive manufacturing.

Rather than being a practical manufacturing system, EcoFilament presents the concept through an accessible digital learning experience.

### 🎯 Project Mission

To demonstrate how responsible material reuse and technological innovation can contribute to a more sustainable future.

## ✨ Features

| Feature | Description |
|---|---|
| 🌐 Bilingual Experience | English and Arabic interface |
| 🎨 Deep Forest Design | Modern eco-tech visual identity |
| 🧊 Interactive 3D Scene | Three-dimensional visualization powered by Three.js |
| 🎞️ Animated Presentation | Smooth transitions and interactive slide experience |
| 🎮 Slide Navigation | Navigate using buttons and keyboard controls |
| 🖥️ Fullscreen Mode | Presentation-friendly fullscreen experience |
| 🧠 Interactive Quiz | Five-question educational quiz |
| 🤖 AI Chat | AI-powered assistance through the backend |
| 🎙️ AI Presenter | Browser-based voice capabilities |
| 📱 Responsive Design | Adapted for desktop, tablet, and mobile |
| 📦 Offline Support | Static assets cached through a Service Worker |
| ♿ Accessibility | Keyboard navigation and reduced-motion support |

## ♻️ The Concept

The presentation introduces six conceptual stages:

1. **Collection** — Gathering suitable plastic waste.
2. **Sorting** — Identifying and separating plastic types.
3. **Cleaning** — Preparing selected materials for further processing.
4. **Filament Production** — Introducing the concept of converting suitable material into filament.
5. **Quality Control** — Understanding material consistency and suitability.
6. **3D Printing** — Exploring possible applications of the resulting material.

> ⚠️ **Educational Disclaimer:** EcoFilament is an educational presentation and visualization, not a practical plastic-processing guide. Real material processing requires appropriate equipment, correct material identification, trained supervision, and controlled conditions.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Presentation structure |
| CSS3 | Styling, responsive layouts, and animations |
| JavaScript | Presentation logic and interactions |
| Three.js | Interactive 3D visualization |
| Service Worker | Static asset caching and offline support |
| Python Backend | AI-related server functionality |
| OpenAI / NVIDIA Integration | AI capabilities, depending on backend configuration |
| Playwright | Automated browser testing |

## 🧠 AI Integration

EcoFilament includes an AI-powered experience connected to a separate backend service.

### AI Chat

The AI Chat communicates with the backend through an API endpoint:

```text
POST /api/chat
```

The backend handles AI requests and connects the presentation to the configured AI provider.

### Backend Service

Production backend:

```text
https://ecofilament-ai.enzonic.dev
```

The backend also exposes a health-check endpoint for checking service status.

> **Note:** AI functionality requires an internet connection and a reachable backend. The static presentation can operate offline, but online AI services are not available without connectivity.

## 🧊 3D Visualization

The project uses **Three.js** to create an interactive three-dimensional experience.

Three.js is stored locally inside the project:

```text
vendor/
└── three/
    ├── build/
    │   ├── three.module.js
    │   └── three.core.js
    └── examples/
        └── jsm/
            └── controls/
                └── OrbitControls.js
```

This avoids relying on an external CDN to load the core 3D library.

## 📂 Project Structure

```text
EcoFilament/
│
├── index.html
├── README.md
├── sw.js
├── package.json
├── playwright.config.js
├── .gitignore
│
├── .github/
│
├── backend/
│
├── css/
│   ├── style.css
│   ├── ai-presenter.css
│   └── ai-chat.css
│
├── js/
│   ├── script.js
│   ├── ai-presenter.js
│   ├── ai-chat.js
│   └── scene3d.js
│
├── tests/
│
└── vendor/
    └── three/
        ├── build/
        └── examples/
```

## 🚀 Getting Started

### Requirements

- A modern web browser.
- Visual Studio Code or another code editor.
- A local development server, such as Live Server.
- Node.js 20 or newer for automated tests.

### 1. Clone the Repository

```bash
git clone https://github.com/Yassir050/EcoFilament.git
```

### 2. Open the Project

```bash
cd EcoFilament
```

Open the project folder in Visual Studio Code.

### 3. Start the Presentation

Launch `index.html` using Live Server or another local HTTP server.

**Important:** Use a local server rather than opening the HTML file directly. This is necessary for browser modules and Service Worker functionality.

### 4. AI Backend

The AI Chat requires the backend service to be available and correctly configured.

Backend configuration and environment variables should be managed on the server. Do not expose API keys or private credentials in frontend files.

## 📦 Offline Support

EcoFilament includes a Service Worker that caches the presentation's static resources.

### What works offline?

- Main presentation interface.
- Locally stored CSS and JavaScript.
- Local Three.js libraries.
- Previously cached static assets.

### What requires internet?

- AI Chat requests.
- Remote AI services.
- Any external online resources not included in the local cache.

The first successful visit requires a connection to download and cache the required resources.

## 🎮 Presentation Controls

| Control | Action |
|---|---|
| ⬅️ Previous / ➡️ Next | Navigate between slides |
| ⌨️ Arrow Keys | Move through the presentation |
| 🌐 Language Button | Switch between English and Arabic |
| 🖱️ Mouse Drag | Rotate the 3D scene |
| 🔎 Mouse Wheel | Zoom in and out |
| ⛶ Fullscreen | Enter or exit fullscreen |
| 🧠 Interactive Quiz | Test your knowledge |
| 🤖 AI Chat | Interact with the AI assistant |

## 🧪 Automated Testing

The project includes Playwright browser tests covering important presentation functionality, including:

- Slide navigation.
- Language switching.
- Quiz interactions.
- Mobile layout behavior.

### Run Tests Locally

Install dependencies:

```bash
npm install
```

Install the Chromium browser:

```bash
npx playwright install chromium
```

Run the test suite:

```bash
npm test
```

## 🌍 Deployment

EcoFilament is hosted using GitHub Pages.

Live presentation:

https://yassir050.github.io/EcoFilament/

### GitHub Pages Setup

1. Open the repository on GitHub.
2. Navigate to **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Choose the `main` branch.
5. Select the `/ (root)` directory.
6. Click **Save**.

GitHub Pages publishes the static frontend. The AI backend is deployed separately.

## 🎯 Project Goals

- Raise awareness about plastic waste.
- Introduce responsible material reuse.
- Explain the connection between recycling and technology.
- Explore potential applications of recycled materials in 3D printing.
- Encourage environmental responsibility and creative thinking.
- Make educational content more interactive and accessible.

## 🔮 Future Development

Potential improvements include:

- More detailed 3D environments and animations.
- Additional interactive educational activities.
- Expanded AI Presenter capabilities.
- Improved AI Chat experience.
- Additional language support.
- Further mobile performance optimization.
- More detailed educational visualizations.

## 👨‍💻 Author

**Yassir Boughaba**

Student · Technology Enthusiast · 1337

Interested in programming, artificial intelligence, emerging technologies, 3D visualization, and environmental innovation.

GitHub: [@Yassir050](https://github.com/Yassir050)

---

<p align="center">
  <strong>♻️ Think Green. Create Smart. Build a Better Future.</strong>
</p>

<p align="center">
  Made with 💙 for technology and the environment.
</p>
