/**
 * Woofy - Hospitals Directory Client Script
 * Geolocation & Reverse Geocoding for Exact City Detection
 */

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const detectLocationBtn = document.getElementById("detectLocationBtn");
  const citySelect = document.getElementById("citySelect");
  const searchForm = document.getElementById("hospitalSearchForm");

  // Detect User Location (GPS + Reverse Geocoding)
  if (detectLocationBtn) {
    detectLocationBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      detectLocationBtn.classList.add("locating");
      detectLocationBtn.innerHTML = `
        <i data-lucide="loader-2" class="spin"></i>
        <span>Detecting your city & location...</span>
      `;
      if (window.lucide) window.lucide.createIcons();

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          let detectedCity = "";

          try {
            // Attempt reverse geocoding via OpenStreetMap
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
              { headers: { "Accept-Language": "en" } },
            );
            if (response.ok) {
              const data = await response.json();
              if (data && data.address) {
                detectedCity =
                  data.address.city ||
                  data.address.state_district ||
                  data.address.town ||
                  data.address.county ||
                  "";
              }
            }
          } catch (e) {
            console.warn("Reverse geocoding error, falling back to coordinate match:", e);
          }

          // Build redirect URL
          const url = new URL(window.location.origin + "/services/hospitals");
          url.searchParams.set("lat", lat.toFixed(4));
          url.searchParams.set("lng", lng.toFixed(4));

          if (detectedCity && detectedCity.trim() !== "") {
            url.searchParams.set("city", detectedCity.trim());
            url.searchParams.set("detectedCity", detectedCity.trim());
          } else {
            url.searchParams.set("city", "auto");
          }

          window.location.href = url.toString();
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          detectLocationBtn.classList.remove("locating");
          detectLocationBtn.innerHTML = `
            <i data-lucide="crosshair"></i>
            <span>Detect My Location</span>
          `;
          if (window.lucide) window.lucide.createIcons();

          let msg = "Could not detect location. Please select your city from the dropdown.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "Location permission denied. Please select your city manually from the dropdown.";
          }
          alert(msg);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    });
  }

  // Auto-submit search on city dropdown change
  if (citySelect && searchForm) {
    citySelect.addEventListener("change", () => {
      // Remove GPS coordinates when user manually switches city
      const latInput = searchForm.querySelector('input[name="lat"]');
      const lngInput = searchForm.querySelector('input[name="lng"]');
      if (latInput) latInput.remove();
      if (lngInput) lngInput.remove();

      searchForm.submit();
    });
  }
});
