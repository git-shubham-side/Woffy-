// Initialize Lucide icons on page load
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // Mobile Navigation Toggle
  const mobileNavToggle = document.getElementById("mobileNavToggle");
  const mobileNavDrawer = document.getElementById("mobileNavDrawer");

  if (mobileNavToggle && mobileNavDrawer) {
    const toggleMenu = (open) => {
      const shouldOpen =
        typeof open === "boolean"
          ? open
          : !mobileNavDrawer.classList.contains("open");

      mobileNavDrawer.classList.toggle("open", shouldOpen);
      mobileNavToggle.classList.toggle("is-active", shouldOpen);
      mobileNavToggle.setAttribute(
        "aria-expanded",
        shouldOpen ? "true" : "false"
      );
    };

    mobileNavToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close drawer when clicking any link inside drawer
    mobileNavDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggleMenu(false);
      });
    });

    // Close drawer when clicking outside
    document.addEventListener("click", (e) => {
      if (
        mobileNavDrawer.classList.contains("open") &&
        !mobileNavDrawer.contains(e.target) &&
        !mobileNavToggle.contains(e.target)
      ) {
        toggleMenu(false);
      }
    });

    // Close drawer on window resize above 820px
    window.addEventListener("resize", () => {
      if (
        window.innerWidth > 820 &&
        mobileNavDrawer.classList.contains("open")
      ) {
        toggleMenu(false);
      }
    });
  }

  // Navbar scroll shadow
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 20);
    });
  }

  // Product Listing Request Modal Handling
  const openProductModalBtn = document.getElementById("openProductModalBtn");
  const closeProductModalBtn = document.getElementById("closeProductModalBtn");
  const cancelProductModalBtn = document.getElementById("cancelProductModalBtn");
  const productRequestModal = document.getElementById("productRequestModal");
  const productRequestForm = document.getElementById("productRequestForm");
  const submitProductReqBtn = document.getElementById("submitProductReqBtn");
  const submitProductReqText = document.getElementById("submitProductReqText");

  const openModal = () => {
    if (productRequestModal) {
      productRequestModal.classList.add("active");
      productRequestModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (window.lucide) {
        lucide.createIcons();
      }
    }
  };

  const closeModal = () => {
    if (productRequestModal) {
      productRequestModal.classList.remove("active");
      productRequestModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  };

  if (openProductModalBtn) {
    openProductModalBtn.addEventListener("click", openModal);
  }

  if (closeProductModalBtn) {
    closeProductModalBtn.addEventListener("click", closeModal);
  }

  if (cancelProductModalBtn) {
    cancelProductModalBtn.addEventListener("click", closeModal);
  }

  // Close modal when clicking outside modal dialog
  if (productRequestModal) {
    productRequestModal.addEventListener("click", (e) => {
      if (e.target === productRequestModal) {
        closeModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && productRequestModal && productRequestModal.classList.contains("active")) {
      closeModal();
    }
  });

  // Submit button loading state
  if (productRequestForm && submitProductReqBtn) {
    productRequestForm.addEventListener("submit", () => {
      const nameInput = document.getElementById("reqProductName");
      const priceInput = document.getElementById("reqPrice");
      const descInput = document.getElementById("reqDescription");

      if (!nameInput.value.trim() || !priceInput.value || !descInput.value.trim()) {
        return; // Handled by HTML5 validation
      }

      submitProductReqBtn.disabled = true;
      if (submitProductReqText) {
        submitProductReqText.textContent = "Submitting Listing Request...";
      }
    });
  }
});


