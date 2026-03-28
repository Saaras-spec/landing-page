// ─────────────────────────────────────────────
// swish.js — Waitlist functionality
// ─────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── 1. FIREBASE CONFIG ───────────────────────
// Replace the values below with your actual Firebase project config.
// Find it at: Firebase Console → Project Settings → Your Apps → SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyDWDqBkzf4UVnwYLQnKbHckemJNLzKWUkA",
  authDomain: "privyflow-page.firebaseapp.com",
  projectId: "privyflow-page",
  storageBucket: "privyflow-page.firebasestorage.app",
  messagingSenderId: "304088559158",
  appId: "1:304088559158:web:f04bdeb15d2c73fca27297",
  measurementId: "G-TYQDSCC2X4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── 2. DEVICE SELECTION ──────────────────────
function detectDevice() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  console.log("User Agent:", ua);

  // Android
  if (/android/i.test(ua)) {
    return "android";
  }

  // iOS
  if (/iPhone|iPad|iPod/.test(ua) && !window.MSStream) {
    return "ios";
  }

  // iPadOS (desktop mode)
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return "ios";
  }

  // Windows
  if (/windows/i.test(ua)) {
    return "windows";
  }

  // macOS
  if (/macintosh|mac os x/i.test(ua)) {
    return "macos";
  }

  // Linux
  if (/linux/i.test(ua)) {
    return "linux";
  }

  return "other";
}

// ─── 3. EMAIL VALIDATION ──────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── 4. USER FEEDBACK ─────────────────────────
function showMessage(msgEl, text, type) {
  msgEl.textContent = text;
  
  // Base Tailwind classes
  msgEl.className = "text-sm font-medium text-center mt-4";
  
  // Add color based on type
  if (type === "success") msgEl.classList.add("text-tertiary");
  else if (type === "duplicate") msgEl.classList.add("text-primary");
  else msgEl.classList.add("text-error");
  
  msgEl.style.display = "block";
}

// ─── 5. FIRESTORE WRITE ───────────────────────
async function submitToWaitlist(email) {
  const emailId = email.trim().toLowerCase();

  try {
    await setDoc(doc(db, "waitlist", emailId), {
      email: emailId,
      device: detectDevice(),
      createdAt: new Date()
    });
    return { status: "success" };
  } catch (err) {
    throw err;
  }
}

// ─── 6. FORM SUBMIT HANDLER ───────────────────
function handleFormSubmit(form) {
  const input = form.querySelector("#waitlist-email");
  const msgEl = form.querySelector("#waitlist-msg");
  const btn = form.querySelector("#waitlist-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = input.value;

    if (!email || !isValidEmail(email)) {
      showMessage(msgEl, "Please enter a valid email address.", "error");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Submitting…";
    msgEl.style.display = "none";

    try {
      const result = await submitToWaitlist(email);

      if (result.status === "success") {
        showMessage(msgEl, "You're on the list 🎉", "success");
        input.value = "";
      }
    } catch (err) {
      console.error("Waitlist error:", err);
      showMessage(msgEl, "Something went wrong. Try again.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Join Early Access"; // Match your original button label
    }
  });
}

// ─── 7. SMOOTH SCROLL ─────────────────────────
function setupSmoothScroll() {
  const target = document.querySelector("#waitlist");
  if (!target) return;

  // Add any CTA button selectors here
  const ctaSelectors = [
    '[data-cta="scroll"]',         // preferred: add this attribute to your buttons
    'a[href="#waitlist"]',          // or use anchor hrefs
  ];

  ctaSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Button clicked");
        console.log("Scrolling to waitlist");
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });
}

// ─── INIT ─────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupSmoothScroll();

  const form = document.querySelector("#waitlist-form");
  if (form) handleFormSubmit(form);
});
