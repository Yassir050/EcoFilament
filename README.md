# ♻️ EcoFilament

### From Plastic Waste to 3D Printing Filament

<p align="center">
  <img src="./favicon.svg" width="88" height="88" alt="EcoFilament leaf favicon">
</p>

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

**EcoFilament** is an interactive educational project that explores the concept of transforming suitable plastic waste into material for 3D printing.

It brings together environmental awareness, interactive storytelling, 3D visualization, and AI-assisted learning to explain the relationship between plastic recycling and additive manufacturing.

EcoFilament is an educational digital experience. It is **not** a validated plastic-processing system or a set of manufacturing instructions.

### 🎯 Project Mission

To show how responsible material reuse and technological innovation can contribute to a more sustainable future.

## ✨ Features

| Feature | Description |
|---|---|
| 🌐 Bilingual Experience | English and Arabic interface |
| 🎨 Deep Forest Design | Eco-tech visual identity |
| 🧊 Interactive 3D Scene | Three-dimensional visualization powered by Three.js |
| 🎞️ Animated Presentation | Slide transitions and interactive presentation experience |
| 🎮 Slide Navigation | Navigate using on-screen controls and keyboard input |
| 🖥️ Fullscreen Mode | Presentation-friendly fullscreen experience |
| 🧠 Interactive Quiz | Five-question educational quiz |
| 🤖 AI Chat | AI assistance through the separately deployed backend |
| 🎙️ AI Presenter | Browser-based speech capabilities |
| 📱 Responsive Design | Layouts adapted for desktop, tablet, and mobile |
| 📦 Offline Support | Static resources can be cached by the Service Worker |
| ♿ Accessibility Considerations | Keyboard navigation and reduced-motion support |
| 🍃 SVG Favicon | Lightweight EcoFilament leaf icon stored in the project root |

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
| Python Backend | Server-side AI functionality |
| OpenAI / NVIDIA Integration | AI provider options, depending on backend configuration |
| Playwright | Automated browser testing |

## 🧠 AI Integration

EcoFilament includes AI-related functionality connected to a separately deployed backend service.

### AI Chat

The frontend communicates with the backend using the chat API:

```http
POST /api/chat
```

The backend processes chat requests and connects to the AI provider configured on the server.

### Backend Service

Production backend:

```text
https://ecofilament-ai.enzonic.dev
```

The backend also provides a health-check endpoint for checking service availability.

> **Important:** AI features require an internet connection and a reachable, correctly configured backend. Never place API keys or private credentials in frontend files or commit them to the repository.

## 🧊 3D Visualization

The project uses **Three.js** to provide an interactive three-dimensional experience.

The Three.js library is stored locally in the repository:

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

Keeping these files locally avoids relying on an external CDN for the core 3D library.

## 🍃 Favicon

The project includes an SVG favicon:

```text
favicon.svg
```

It is a scalable vector icon designed around the EcoFilament leaf identity. The file is stored in the repository root, alongside `index.html`.

To display it in the browser tab, `index.html` must include the following line inside its `<head>` element:

```html
<link rel="icon" type="image/svg+xml" href="./favicon.svg">
```

The README image at the top previews the SVG directly from the repository.

## 📂 Project Structure

```text
EcoFilament/
│
├── index.html
├── README.md
├── favicon.svg
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

*The tree above describes the documented project layout; optional files and folders may vary between versions.*

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

Open the project folder in Visual Studio Code or your preferred editor.

### 3. Run the Presentation

Launch `index.html` using Live Server or another local HTTP server.

**Important:** Use a local server instead of opening the HTML file directly. Browser modules and Service Worker features require an appropriate HTTP(S) context.

### 4. Configure the AI Backend

AI Chat depends on the backend being online and correctly configured.

Manage provider settings and environment variables on the server. Do not expose API keys or private credentials in frontend code.

## 📦 Offline Support

EcoFilament includes a Service Worker that can cache presentation resources for subsequent visits.

### What may work offline?

- The main presentation interface, if it has been cached.
- Locally stored CSS and JavaScript files, if cached.
- Local Three.js libraries, if cached.
- Other static assets included in the cache.

### What requires an internet connection?

- AI Chat requests.
- Remote AI services.
- External resources that are not stored in the local cache.

The first visit needs an internet connection to retrieve the resources that will be cached. Offline behavior depends on successful installation and operation of the Service Worker and on which assets have already been cached.

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

The repository includes Playwright browser tests for presentation functionality. The documented test areas include:

- Slide navigation.
- Language switching.
- Quiz interactions.
- Mobile layout behavior.

### Run Tests Locally

Install project dependencies:

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

Test coverage and results can change as the project evolves. Run the suite locally to confirm the current state; the presence of tests in the repository does not by itself mean that the latest version has passed them.

## 🌍 Deployment

The static frontend is hosted with GitHub Pages:

**Live presentation:**  
https://yassir050.github.io/EcoFilament/

The AI backend is deployed separately.

### GitHub Pages Setup

1. Open the repository on GitHub.
2. Navigate to **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Choose the `main` branch.
5. Select the `/ (root)` directory.
6. Click **Save**.

After pushing changes, allow GitHub Pages to finish publishing before checking the live site.

## 📝 Latest Updates

**November 23, 2026**

- Added `favicon.svg` to the project root as the EcoFilament browser icon asset.
- Updated this README to document the favicon, its location, and the HTML `<link>` element needed to activate it.
- Kept the existing `index.html`, `sw.js`, JavaScript, CSS, and backend implementation unchanged in this update.
- No performance optimization or Service Worker code change is claimed as part of this README update.

## 🎯 Project Goals

- Raise awareness about plastic waste.
- Introduce responsible material reuse.
- Explain the connection between recycling and technology.
- Explore potential applications of recycled materials in 3D printing.
- Encourage environmental responsibility and creative thinking.
- Make educational content more interactive and accessible.

## 🔮 Future Development

Potential areas for future improvement:

- More detailed 3D environments and animations.
- Additional interactive educational activities.
- Expanded AI Presenter capabilities.
- Further improvements to the AI Chat experience.
- Additional language support.
- Mobile performance optimization.
- More detailed educational visualizations.
- Expanded automated testing and accessibility checks.

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
