/**
 * Woofy Landing Page Interactive JavaScript
 * Features: Mobile Drawer Toggle, Navbar Scroll Effects, Smooth Scroll,
 * Scroll Reveal Animations, Lucide Icon Rendering, AJAX Contact Form
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 2. Sticky Navbar Blur & Scrolled State
  const navbar = document.getElementById("navbar");
  const handleNavbarScroll = () => {
    if (window.scrollY > 20) {
      navbar?.classList.add("scrolled");
    } else {
      navbar?.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // 3. Mobile Hamburger Menu Drawer Handlers
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const mobileDrawerOverlay = document.getElementById("mobileDrawerOverlay");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");
  const drawerLinks = document.querySelectorAll(".drawer-link");
  const menuOpenIcon = document.getElementById("menuOpenIcon");
  const menuCloseIcon = document.getElementById("menuCloseIcon");

  const openDrawer = () => {
    mobileDrawer?.classList.add("active");
    mobileDrawerOverlay?.classList.add("active");
    document.body.style.overflow = "hidden";
    mobileMenuToggle?.setAttribute("aria-expanded", "true");
    if (menuOpenIcon) menuOpenIcon.style.display = "none";
    if (menuCloseIcon) menuCloseIcon.style.display = "inline-block";
  };

  const closeDrawer = () => {
    mobileDrawer?.classList.remove("active");
    mobileDrawerOverlay?.classList.remove("active");
    document.body.style.overflow = "";
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
    if (menuOpenIcon) menuOpenIcon.style.display = "inline-block";
    if (menuCloseIcon) menuCloseIcon.style.display = "none";
  };

  mobileMenuToggle?.addEventListener("click", () => {
    const isOpen = mobileDrawer?.classList.contains("active");
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  drawerCloseBtn?.addEventListener("click", closeDrawer);
  mobileDrawerOverlay?.addEventListener("click", closeDrawer);

  // Close drawer on link click
  drawerLinks.forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  // Close drawer on Escape key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileDrawer?.classList.contains("active")) {
      closeDrawer();
    }
  });

  // 4. Scroll Reveal Animations with Intersection Observer
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach((el) => el.classList.add("active"));
  }

  // 5. Active Nav Link Highlighter on Scroll
  const navSections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-links .nav-link");

  const highlightNav = () => {
    const scrollY = window.pageYOffset;

    navSections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          } else if (link.getAttribute("href")?.startsWith("#")) {
            link.classList.remove("active");
          }
        });
      }
    });
  };

  window.addEventListener("scroll", highlightNav, { passive: true });

  // 6. Contact Form AJAX Submission
  const contactForm = document.getElementById("contactForm");
  const contactAlert = document.getElementById("contactAlert");
  const contactSubmitBtn = document.getElementById("contactSubmitBtn");
  const contactBtnText = document.getElementById("contactBtnText");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("senderName");
      const emailInput = document.getElementById("senderEmail");
      const messageInput = document.getElementById("messageContent");

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const message = messageInput ? messageInput.value.trim() : "";

      if (!name || !email || !message) {
        showAlert("Please fill in all required fields.", "error");
        return;
      }

      // Email basic format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert("Please enter a valid email address.", "error");
        return;
      }

      // Set loading button state
      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        if (contactBtnText) contactBtnText.textContent = "Sending...";
      }

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ name, email, message }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showAlert(
            `Thank you, ${name}! Your message has been sent successfully. We will get back to you shortly.`,
            "success"
          );
          contactForm.reset();
        } else {
          showAlert(result.error || "Failed to send message. Please try again.", "error");
        }
      } catch (err) {
        showAlert("Network error occurred. Please check your internet connection.", "error");
      } finally {
        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          if (contactBtnText) contactBtnText.textContent = "Send Message";
        }
      }
    });
  }

  function showAlert(msg, type) {
    if (!contactAlert) return;
    contactAlert.style.display = "block";
    contactAlert.className = `contact-alert ${type}`;
    contactAlert.textContent = msg;

    // Smooth scroll to alert if needed
    contactAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

