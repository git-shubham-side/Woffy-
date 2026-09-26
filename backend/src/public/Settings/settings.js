/**
 * Woffy - Settings Page & Account Deletion Client Script
 */
document.addEventListener("DOMContentLoaded", function () {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const openBtn = document.getElementById("openDeleteModalBtn");
  const closeBtn = document.getElementById("closeDeleteModalBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");
  const modal = document.getElementById("deleteModal");
  const form = document.getElementById("deleteAccountForm");
  const submitBtn = document.getElementById("confirmDeleteSubmitBtn");

  function openModal() {
    if (!modal) return;
    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Re-render Lucide icons inside modal
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Auto-focus the input field
    const input = modal.querySelector("input[name='password'], input[name='confirmDelete']");
    if (input) {
      setTimeout(() => input.focus(), 150);
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (openBtn) {
    openBtn.addEventListener("click", openModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  // Close on click outside modal card
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("is-active")) {
      closeModal();
    }
  });

  // Submit button loader / confirmation
  if (form && submitBtn) {
    form.addEventListener("submit", function () {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span style="display:inline-flex; align-items:center; gap:8px;">
          <svg style="animation: spin 1s linear infinite; width:16px; height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.25"></circle>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Deleting Account...
        </span>
      `;
    });
  }
});
