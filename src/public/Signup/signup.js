/**
 * Woofy Signup Page Interactive JavaScript
 * Features: Password Visibility Toggle, Lucide Icon Rendering, Submit Loading State
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 2. Toggle Password Visibility
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("togglePasswordBtn");

  if (passwordInput && toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";

      toggleBtn.innerHTML = isPassword
        ? '<i data-lucide="eye-off" style="width: 17px; height: 17px;"></i>'
        : '<i data-lucide="eye" style="width: 17px; height: 17px;"></i>';

      if (window.lucide) {
        lucide.createIcons();
      }
    });
  }

  // 3. Form Submit Loading State
  const signupForm = document.getElementById("signupForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const btnIcon = document.getElementById("btnIcon");

  if (signupForm && submitBtn) {
    signupForm.addEventListener("submit", () => {
      const nameInput = document.getElementById("fullName");
      const emailInput = document.getElementById("email");
      const termsCheck = document.getElementById("termsCheck");

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const agreed = termsCheck ? termsCheck.checked : true;

      if (!name || !email || !password || password.length < 6 || !agreed) {
        return; // Handled by native HTML5 validation
      }

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = "Creating Account...";
      if (btnIcon) btnIcon.style.display = "none";
    });
  }
});

