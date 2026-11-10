<!-- ======================================================== -->
<!-- 🚀 ProCV Lite - Header Banner & Dynamic Motion Elements  -->
<!-- ======================================================== -->

<div align="center">
  <img src="docs/assets/header.svg" width="100%" alt="ProCV Lite Header Banner"/>
</div>

<p align="center">
  <a href="https://github.com/prageethgihan/pro-cv-lite">
    <img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=600&size=20&duration=3000&pause=1200&color=818CF8&center=true&vCenter=true&width=650&lines=%E2%9A%A1+AI-Powered+Next-Gen+Resume+Builder;%F0%9F%9B%A1%EF%B8%8F+Enterprise-Grade+QA+%26+Playwright+E2E+Automation;%F0%9F%9A%80+100%25+Automated+GitHub+Actions+CI%2FCD+Pipeline;%E2%9C%A8+React+19+%E2%80%A2+Vite+%E2%80%A2+Firebase+%E2%80%A2+Tailwind+CSS;%F0%9F%8E%A8+Dynamic+Theming+%26+Pixel-Perfect+PDF+Export" alt="Animated Typing Subtitle" />
  </a>
</p>

<!-- ======================================================== -->
<!-- 🏷️ Badges & Live Status Indicators                       -->
<!-- ======================================================== -->

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-00d8ff?style=for-the-badge&logo=react&logoColor=white" alt="React 19" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7" /></a>
  <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Google Gemini" /></a>
  <a href="https://www.tensorflow.org/js"><img src="https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow.js" /></a>
  <a href="https://playwright.dev/"><img src="https://img.shields.io/badge/Playwright-E2E_QA-45BA4B?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright QA" /></a>
  <a href="https://github.com/features/actions"><img src="https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions" /></a>
</p>

<p align="center">
  <a href="https://github.com/prageethgihan/pro-cv-lite/actions/workflows/playwright.yml">
    <img src="https://github.com/prageethgihan/pro-cv-lite/actions/workflows/playwright.yml/badge.svg" alt="Playwright E2E Tests CI Status" />
  </a>
  <img src="https://img.shields.io/badge/Tests-17%20Passed-success?style=flat-square&logo=checkmarx&logoColor=white" alt="17 Tests Passed" />
  <img src="https://img.shields.io/badge/Coverage-E2E%20%26%20Security-indigo?style=flat-square" alt="E2E Coverage" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
</p>

<br/>

<!-- ======================================================== -->
<!-- 🌟 About Section                                         -->
<!-- ======================================================== -->

## 🌟 About ProCV Lite

**ProCV Lite** is an advanced, intelligent resume-building platform engineered for ambitious students and modern professionals. Built as a comprehensive academic software engineering project, it transcends traditional document editors by combining an AI-assisted dynamic engine with state-of-the-art UI design, rigorous Automated Testing, and Continuous Integration.

Whether targeting corporate roles, creative positions, or academic placements, ProCV Lite provides the computational intelligence, aesthetic polish, and software reliability to make every application stand out.

---

## 🚀 Key Features

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3>🤖 AI & Machine Learning</h3>
      <ul>
        <li><b>AI Text Enhancement:</b> Instant grammar fixes and tone optimization powered by <i>Google Gemini AI</i>.</li>
        <li><b>Smart Background Removal:</b> On-device ML using <i>U2-Net</i> for flawless profile picture extraction without servers.</li>
        <li><b>Auto Face Cropping:</b> Uses <i>face-api.js</i> to perfectly align and center your face in the avatar.</li>
        <li><b>AI Cover Letters:</b> Generate tailored, ATS-friendly cover letters instantly matching real job descriptions.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🎨 Premium UI/UX</h3>
      <ul>
        <li><b>Glassmorphism Design:</b> State-of-the-art dark/light SaaS aesthetic with frosted glass effects.</li>
        <li><b>Dynamic Theming:</b> Curated color palettes with automatic theme extraction from your profile photo!</li>
        <li><b>Real-time Preview:</b> See your CV update instantly in a beautifully rendered A4 mock-up modal.</li>
        <li><b>Responsive Flow:</b> Seamless experience across desktops, tablets, and smartphones.</li>
      </ul>
    </td>
  </tr>
</table>

### ⚙️ Powerful Core Functionality
- **High-Fidelity PDF Export:** Pixel-perfect CV rendering utilizing `html2canvas` and `jsPDF`.
- **Cloud Synchronization:** Secure, real-time autosave and authentication via Firebase Firestore.
- **Analytics & Insights:** Track application statuses and view generated AI insights dynamically.
- **Instant Sharing:** Generate public URLs and QR codes to share your profile effortlessly.

---

<!-- ======================================================== -->
<!-- 🧪 Quality Assurance & Automated Testing (QA)            -->
<!-- ======================================================== -->

## 🧪 Quality Assurance & Automated Testing (QA)

To guarantee enterprise-grade reliability, UI stability, and prevent regressions, **ProCV Lite incorporates an automated End-to-End (E2E) testing framework powered by Playwright and an automated CI/CD pipeline via GitHub Actions.**

### 🎯 Test Scope & Coverage
The automated test suite runs **17 comprehensive test cases** spanning multiple critical operational vectors:

| Test Suite | Scope & Functional Verifications | Execution Status |
| :--- | :--- | :---: |
| **Authentication & Smoke**<br/>`smoke.spec.js` | • Landing page and brand identity rendering<br/>• Google OAuth trigger and Email/Password fields<br/>• Smooth switching between Login & Register modes | ✅ **Passed (100%)** |
| **Cross-Device & Responsive**<br/>`responsive.spec.js` | • Mobile viewports (iPhone 13 - 390x844): forms & buttons tap accessibility<br/>• Tablet viewports (iPad - 768x1024): responsive grid alignment | ✅ **Passed (100%)** |
| **Security Guards & Routing**<br/>`routing-and-public.spec.js` | • Unauthorized access guards for `/builder`, `/dashboard`, `/templates`, `/ai-writer`, etc.<br/>• Graceful fallback handling for non-existent public CV links | ✅ **Passed (100%)** |
| **Theme & State Persistence**<br/>`theme.spec.js` | • `localStorage` theme preference synchronization<br/>• Dynamic DOM `data-theme` attribute and Tailwind dark/light class binding | ✅ **Passed (100%)** |

### 📸 Test Evidence & Pipeline Execution

<table width="100%">
  <tr>
    <td width="50%" align="center">
      <b>Playwright Comprehensive HTML Test Report</b><br/>
      <sub>17/17 Passed (0 Failed, 0 Flaky) with Full Traces & Execution Timing</sub><br/><br/>
      <img src="docs/qa/playwright-html-report.jpg" alt="Playwright HTML Test Report" width="100%"/>
    </td>
    <td width="50%" align="center">
      <b>GitHub Actions CI/CD Pipeline</b><br/>
      <sub>Automated Cloud Runner executing E2E tests & caching artifacts in 1m 28s</sub><br/><br/>
      <img src="docs/qa/github-actions-pipeline.jpg" alt="GitHub Actions Pipeline" width="100%"/>
    </td>
  </tr>
</table>

<details>
  <summary><b>🔍 Click to view Playwright Interactive UI Mode & Time-Travel Debugger</b></summary>
  <br/>
  <p align="center">
    <img src="docs/qa/playwright-dashboard.png" alt="Playwright Interactive UI Dashboard" width="85%"/>
  </p>
</details>

### 🔄 CI/CD Workflow Architecture
- **Continuous Integration (CI):** Every push or pull request to `main` automatically spins up a clean Ubuntu cloud instance via GitHub Actions.
- **Automated Verification:** Installs project dependencies, provisions the Chromium browser engine, runs the full test suite in parallel across workers, and captures visual traces.
- **Artifact Caching:** Generates and securely stores full HTML reports, network logs, and screenshots under GitHub Artifacts with 30-day retention.

---

## 🏗️ Architecture & Tech Stack

ProCV Lite is built using modern, robust technologies to ensure high performance, security, and scalability.

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, Recharts.
- **Backend & Database:** Firebase Authentication, Firestore (NoSQL Document Store), Firebase Storage.
- **AI / ML Pipeline:** Google Generative AI (Gemini), TensorFlow.js, Face-API.js, `@imgly/background-removal`.
- **State Management & Routing:** React Context API, React Router DOM.
- **Quality Assurance & Testing:** Playwright (Chromium E2E Automation), Playwright UI, Trace Viewer.
- **CI / CD Infrastructure:** GitHub Actions Cloud Automation Workflow.
- **Export Engine:** html2canvas, jsPDF.

---

## 💻 Local Setup & Installation

Get ProCV Lite running on your local machine in minutes!

```bash
# 1. Clone the repository
git clone https://github.com/prageethgihan/pro-cv-lite.git

# 2. Navigate into the directory
cd pro-cv-lite

# 3. Install dependencies
npm install

# 4. Set up environment variables
# Create a .env file and add your Firebase & Gemini API credentials
# (See .env.example if available)

# 5. Start the development server
npm run dev
```

### 🧪 Running QA & E2E Tests Locally

```bash
# Run all 17 E2E tests headlessly
npm run test:e2e

# Run tests in a live Google Chrome browser (Headed Mode)
npm run test:e2e:headed

# Open the interactive Playwright UI Dashboard with step-by-step visual debugging
npm run test:e2e:ui

# View the full graphical HTML test report with trace snapshots
npm run test:e2e:report
```

---

<!-- ======================================================== -->
<!-- 🌊 Footer Wave & Signature                               -->
<!-- ======================================================== -->

<div align="center">
  <img src="docs/assets/footer.svg" width="100%" alt="Footer Wave Divider"/>
  <p><b>Crafted with engineering rigor and ❤️ by <a href="https://github.com/prageethgihan">Prageeth Gihan</a></b></p>
</div>
