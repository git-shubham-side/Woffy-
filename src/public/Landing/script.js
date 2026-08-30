// Add a subtle border to the navbar when scrolling down
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
});
// Lucide icons render
lucide.createIcons();

// Navbar shadow on scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
});

// Scroll-reveal animation
const revealEls = document.querySelectorAll(".reveal");
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

// Contact Form AJAX Submission
const contactForm = document.getElementById("contactForm");
const contactAlert = document.getElementById("contactAlert");
const contactSubmitBtn = document.getElementById("contactSubmitBtn");
const contactBtnText = document.getElementById("contactBtnText");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("senderName").value.trim();
    const email = document.getElementById("senderEmail").value.trim();
    const message = document.getElementById("messageContent").value.trim();

    if (!name || !email || !message) {
      if (contactAlert) {
        contactAlert.style.display = "block";
        contactAlert.style.backgroundColor = "#fee2e2";
        contactAlert.style.color = "#991b1b";
        contactAlert.style.border = "1px solid #f87171";
        contactAlert.textContent = "Please fill in all fields.";
      }
      return;
    }

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

      if (contactAlert) {
        contactAlert.style.display = "block";
        if (response.ok && result.success) {
          contactAlert.style.backgroundColor = "#dcfce7";
          contactAlert.style.color = "#166534";
          contactAlert.style.border = "1px solid #86efac";
          contactAlert.textContent =
            "Thank you, " +
            name +
            "! Your message has been sent to Shubham (rathodshubham7711@gmail.com).";
          contactForm.reset();
        } else {
          contactAlert.style.backgroundColor = "#fee2e2";
          contactAlert.style.color = "#991b1b";
          contactAlert.style.border = "1px solid #f87171";
          contactAlert.textContent =
            result.error || "Failed to send message. Please try again.";
        }
      }
    } catch (err) {
      if (contactAlert) {
        contactAlert.style.display = "block";
        contactAlert.style.backgroundColor = "#fee2e2";
        contactAlert.style.color = "#991b1b";
        contactAlert.style.border = "1px solid #f87171";
        contactAlert.textContent =
          "Network error. Please check your connection.";
      }
    } finally {
      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = false;
        if (contactBtnText) contactBtnText.textContent = "Send Message";
      }
    }
  });
}
