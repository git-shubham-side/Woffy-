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

  // Scroll-reveal animation if present
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  // Navbar scroll shadow
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 20);
    });
  }
});

