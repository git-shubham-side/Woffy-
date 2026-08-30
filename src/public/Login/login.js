document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Toggle Password Visibility
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("togglePasswordBtn");

  if (passwordInput && toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";

      toggleBtn.innerHTML = isPassword
        ? '<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>'
        : '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';

      if (window.lucide) {
        lucide.createIcons();
      }
    });
  }

  // Quick Fill Admin / Demo Credentials
  const quickFillBtn = document.getElementById("quickFillBtn");
  const emailInput = document.getElementById("email");

  if (quickFillBtn && emailInput && passwordInput) {
    quickFillBtn.addEventListener("click", (e) => {
      e.preventDefault();
      emailInput.value = "rathodshubham7711@gmail.com";
      passwordInput.value = "admin123";

      // Subtle flash animation on button
      quickFillBtn.textContent = "Filled!";
      setTimeout(() => {
        quickFillBtn.textContent = "Fill Admin";
      }, 1500);
    });
  }
});
