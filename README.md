
# ♻️ EcoFilament
### From Plastic Waste to 3D Printing Filament

<p align="center">
  <strong>Turning an environmental challenge into a technological opportunity.</strong>
</p>

<p align="center">
  🌍 Sustainability • 🧪 Recycling • 🖨️ 3D Printing • 💡 Innovation
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Project-EcoFilament-00bcd4?style=for-the-badge" alt="EcoFilament">
  <img src="https://img.shields.io/badge/HTML5-Structure-orange?style=for-the-badge&logo=html5" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-Design-blue?style=for-the-badge&logo=css3" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-Logic-yellow?style=for-the-badge&logo=javascript" alt="JavaScript">
  <img src="https://img.shields.io/badge/Three.js-3D%20Visualization-black?style=for-the-badge&logo=threedotjs" alt="Three.js">
</p>

<p align="center">
  <a href="https://yassir050.github.io/EcoFilament/">
    <strong>🚀 View Live Presentation</strong>
  </a>
  &nbsp; • &nbsp;
  <a href="https://github.com/Yassir050/EcoFilament">
    <strong>📂 GitHub Repository</strong>
  </a>
</p>

---

## 🌱 About the Project

**EcoFilament** is an interactive educational presentation exploring how suitable plastic waste could be reused as material for **3D printing filament**.

The project combines environmental awareness with modern technology, introducing plastic recycling, material reuse, and additive manufacturing through an interactive digital experience.

### 🎯 Main Objective

Demonstrate how innovation and responsible material reuse can help give selected plastic waste a second life.

## ✨ Key Features

| Feature | Description |
|---|---|
| 🌐 Bilingual Interface | Switch between English and Arabic |
| 🎨 Eco-Tech Design | Modern technology-inspired visual experience |
| 🧊 Interactive 3D Scene | Explore the recycling concept using Three.js |
| 🎮 Slide Navigation | Navigate using buttons and keyboard arrows |
| 🖥️ Fullscreen Mode | Suitable for classroom presentations |
| 🧠 Interactive Quiz | Test knowledge through five questions |
| 📱 Responsive Layout | Designed for desktop, tablet, and mobile |
| ♿ Accessibility | Keyboard navigation and reduced-motion support |

## 🧪 The Concept

The presentation introduces six conceptual stages:

1. ♻️ **Collection** — Gathering suitable plastic waste.
2. 🔍 **Sorting** — Identifying and separating plastic types.
3. 🧼 **Cleaning** — Preparing selected materials for further processing.
4. 🧵 **Filament Production** — Introducing the transformation into 3D printing filament.
5. ✅ **Quality Control** — Checking consistency and material suitability.
6. 🖨️ **3D Printing** — Exploring potential applications.

> ⚠️ **Educational Disclaimer:** EcoFilament is an educational concept and visualization, not a practical plastic-processing guide. Real material processing requires appropriate equipment, material identification, trained supervision, and controlled conditions.

## 🛠️ Technologies

| Technology | Role |
|---|---|
| HTML5 | Presentation structure |
| CSS3 | Visual design, animations, and responsive layout |
| JavaScript | Navigation, language switching, and quiz functionality |
| Three.js | Interactive 3D visualization |

## 📂 Project Structure

```text
EcoFilament/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── script.js
│   └── scene3d.js
│
└── README.md
```

## 🚀 Getting Started

### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Yassir050/EcoFilament.git
   ```

2. Open the project folder:

   ```bash
   cd EcoFilament
   ```

3. Open the folder in Visual Studio Code.

4. Launch the project using a local development server, such as Live Server.

5. Open the local URL provided by the development server.

**Note:** An internet connection is required to load Three.js from the CDN.

### Deploy with GitHub Pages

1. Open the repository on GitHub.
2. Navigate to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose the `main` branch and `/ (root)` folder.
5. Click **Save**.
6. Wait for GitHub Pages to publish the website.

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

## 🎯 Project Goals

- 🌍 Raise awareness about plastic waste.
- ♻️ Introduce the concept of material reuse.
- 🧪 Explore the connection between recycling and technology.
- 🖨️ Present potential applications of recycled materials in 3D printing.
- 💡 Encourage creativity and environmental responsibility.

## 🔮 Future Improvements

- ✨ More detailed 3D animations.
- 🎞️ Advanced transitions and visual effects.
- 🌍 Additional language support.
- 📊 More interactive educational activities.
- 📱 Further mobile performance improvements.
- 🧊 Expanded 3D visualization and interaction.

## 👨‍💻 Author

**Yassir**  
Student • Technology Enthusiast • 1337

Interested in programming, emerging technologies, 3D visualization, and environmental innovation.

---

<p align="center">
  ♻️ <strong>Think Green. Create Smart. Build a Better Future.</strong> 🌍
</p>

<p align="center">
  Made with 💙 for technology and the environment.
</p>

## 🧪 Automated Tests

The project includes Playwright browser tests for slide navigation, language switching, the quiz flow, and the mobile layout.

Run the tests locally with Node.js 20 or newer:

```bash
npm install
npx playwright install chromium
npm test
```

GitHub Actions runs the browser tests automatically on pushes and pull requests targeting `main`.
