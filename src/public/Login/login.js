/**
 * Woofy Login Page Interactive JavaScript
 * Features: Password Toggle, Lucide Icon Rendering, Submit Loading State
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
  const loginForm = document.getElementById("loginForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const btnIcon = document.getElementById("btnIcon");

  if (loginForm && submitBtn) {
    loginForm.addEventListener("submit", (e) => {
      const emailInput = document.getElementById("email");
      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      if (!email || !password) {
        return; // Native HTML5 required validation handles this
      }

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = "Signing In...";
      if (btnIcon) btnIcon.style.display = "none";
    });
  }
});

