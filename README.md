<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=40&pause=1000&color=4F46E5&center=true&vCenter=true&width=600&lines=ProCV+Lite;AI-Powered+Resume+Builder;Create+Your+CV+in+Minutes" alt="Typing SVG" />
  
  <p align="center">
    <br />
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" /></a>
    <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Google_Gemini_AI-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" /></a>
    <a href="https://www.tensorflow.org/js"><img src="https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" /></a>
  </p>
</div>

---

## 🌟 Overview

**ProCV Lite** is a cutting-edge, AI-powered Resume Builder designed to help professionals and students create stunning, modern resumes with zero hassle. Built as a comprehensive academic software engineering project, it leverages state-of-the-art web technologies and in-browser machine learning to deliver a seamless CV creation experience.

Instead of fighting with Word document formatting, ProCV Lite handles the design while providing intelligent AI assistance to perfect your content.

---

## ✨ Key Features

### 🤖 Artificial Intelligence & Machine Learning
- **AI Text Enhancement:** Integrated with Google Gemini AI to instantly fix grammar, improve professional tone, and generate impactful summaries.
- **Smart Photo Processing:** Runs advanced ML models directly in your browser!
  - **Auto Background Removal:** Utilizes U2-Net (`@imgly/background-removal`) to seamlessly remove backgrounds from profile photos.
  - **Smart Face Cropping:** Uses `face-api.js` to automatically detect faces and center your profile picture perfectly.
  - **Theme Extraction:** Automatically extracts a matching color palette from your profile photo using `color-thief-browser`.

### 🎨 Design & Customization
- **Modern Templates:** Includes 6 professionally designed templates (ranging from standard Corporate and Creative to specific Sri Lankan Academic formats).
- **Glassmorphism UI:** A beautiful, responsive builder interface built with modern CSS aesthetics and Tailwind CSS.
- **Dynamic Theming:** Choose from curated themes (Blue, Purple, Emerald, Rose, Slate) or use the AI-extracted custom photo theme.

### ⚙️ Core Functionality
- **High-Quality PDF Export:** Pixel-perfect rendering using `html2canvas` and `jsPDF`.
- **Cloud Synchronization:** Real-time data saving and authentication powered by Firebase Cloud Firestore.
- **Public Sharing:** Generate unique, public URLs and QR Codes for easy sharing with recruiters.

---

## 🛠️ Tech Stack

| Category | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite, React Router |
| **Styling** | Tailwind CSS, PostCSS, Custom CSS Animations |
| **Backend & Auth** | Firebase Auth, Firestore Database |
| **AI / Machine Learning** | Google Generative AI (Gemini), TensorFlow.js, Face-API.js, MediaPipe |
| **Utilities** | html2canvas, jsPDF, tinycolor2, react-easy-crop, qrcode.react |

---

## 🚀 Quick Start

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- A Firebase Project (for Auth and Firestore)
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prageethgihan/pro-cv-lite.git
   cd pro-cv-lite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   *The application will be available at `http://localhost:5173`.*

---

## 📸 Screenshots

*(To make this README even better, add your own screenshots below by replacing the placeholder links!)*

<div align="center">
  <img src="https://raw.githubusercontent.com/prageethgihan/pro-cv-lite/main/public/placeholder-1.png" alt="Dashboard View" width="48%" onerror="this.src='https://via.placeholder.com/800x450/0f172a/4f46e5?text=Add+Dashboard+Screenshot+Here'"/>
  <img src="https://raw.githubusercontent.com/prageethgihan/pro-cv-lite/main/public/placeholder-2.png" alt="CV Builder View" width="48%" onerror="this.src='https://via.placeholder.com/800x450/0f172a/4f46e5?text=Add+Builder+Screenshot+Here'"/>
</div>

---

<div align="center">
  <p>Built with ❤️ by Prageeth Gihan</p>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=4F46E5&height=100&section=footer" width="100%"/>
</div>
