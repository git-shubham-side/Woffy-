// Lucide icons render
if (window.lucide) {
  lucide.createIcons();
}

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

// Navbar scroll shadow
const navbar = document.getElementById("navbar");
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  });
}

/**
 * Pet Date of Birth (DOB) -> Automatic Age Calculation
 */
document.addEventListener("DOMContentLoaded", () => {
  const dobInput = document.getElementById("dob");
  const ageInput = document.getElementById("age");
  const ageFeedback = document.getElementById("ageCalculatedFeedback");

  if (!dobInput || !ageInput) return;

  // Restrict DOB to not allow future dates
  const todayStr = new Date().toISOString().split("T")[0];
  dobInput.setAttribute("max", todayStr);

  function calculateAndApplyAge() {
    const dobValue = dobInput.value;
    if (!dobValue) {
      if (ageFeedback) {
        ageFeedback.style.display = "none";
        ageFeedback.textContent = "";
      }
      return;
    }

    const birthDate = new Date(dobValue + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(birthDate.getTime())) {
      return;
    }

    if (birthDate > today) {
      if (ageFeedback) {
        ageFeedback.className = "age-calculated-pill error";
        ageFeedback.style.display = "inline-flex";
        ageFeedback.innerHTML = "⚠️ Date of birth cannot be in the future";
      }
      return;
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonthLastDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Precise decimal value in years (e.g., 2.5 yrs, 0.4 yrs)
    let decimalAge = 0;
    if (years > 0 || months > 0) {
      decimalAge = Number((years + months / 12).toFixed(1));
    } else if (days > 0) {
      decimalAge = Number((days / 365.25).toFixed(2));
    }

    // Set value in the age input
    ageInput.value = decimalAge;

    // Build human-friendly breakdown string
    const parts = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? "mo" : "mos"}`);
    }
    if (years === 0 && months === 0) {
      parts.push(`${days} ${days === 1 ? "day" : "days"}`);
    }

    const friendlyText = parts.join(" ");

    if (ageFeedback) {
      ageFeedback.className = "age-calculated-pill";
      ageFeedback.style.display = "inline-flex";
      ageFeedback.innerHTML = `✨ Auto Calculated: <strong>${friendlyText}</strong> (${decimalAge} yrs)`;
    }
  }

  // Listen for DOB input changes
  dobInput.addEventListener("change", calculateAndApplyAge);
  dobInput.addEventListener("input", calculateAndApplyAge);

  // Auto-calculate on initial load if DOB is already filled (e.g., in Edit page)
  if (dobInput.value) {
    calculateAndApplyAge();
  }
});
