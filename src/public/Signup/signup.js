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
});
