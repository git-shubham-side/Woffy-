// Lucide icons render
if (window.lucide) {
  lucide.createIcons();
}

// Form submit placeholder - apna save/API logic yahan add karo
const petForm = document.getElementById("petForm");
if (petForm) {
  petForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // TODO: handle form data + save logic
  });
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
