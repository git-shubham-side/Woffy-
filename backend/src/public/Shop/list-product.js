/**
 * Woofy — List Product Live Sync & Dropzone Controller
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 2. Elements Mapping
  const productNameInput = document.getElementById("productName");
  const productCategoryInput = document.getElementById("productCategory");
  const brandNameInput = document.getElementById("brandName");
  const productPriceInput = document.getElementById("productPrice");
  const originalPriceInput = document.getElementById("originalPrice");
  const productDescInput = document.getElementById("productDesc");
  const photoUrlInput = document.getElementById("photoUrl");
  const productImageFileInput = document.getElementById("productImageFile");
  const dropzone = document.getElementById("dropzone");
  const dropzonePrompt = document.getElementById("dropzonePrompt");
  const dropzonePreview = document.getElementById("dropzonePreview");
  const previewImg = document.getElementById("previewImg");
  const removeImgBtn = document.getElementById("removeImgBtn");
  const discountBanner = document.getElementById("discountBanner");
  const discountPercentText = document.getElementById("discountPercentText");

  // Card Preview Elements
  const cardTitle = document.getElementById("cardTitle");
  const cardCategoryBadge = document.getElementById("cardCategoryBadge");
  const cardBrandName = document.getElementById("cardBrandName");
  const cardPrice = document.getElementById("cardPrice");
  const cardOriginalPrice = document.getElementById("cardOriginalPrice");
  const cardDiscountBadge = document.getElementById("cardDiscountBadge");
  const cardDesc = document.getElementById("cardDesc");
  const cardPreviewImg = document.getElementById("cardPreviewImg");

  const defaultImg =
    "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80";

  // 3. Live Sync: Title
  if (productNameInput && cardTitle) {
    productNameInput.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      cardTitle.textContent = val || "Your Product Title Will Appear Here";
    });
  }

  // 4. Live Sync: Category
  if (productCategoryInput && cardCategoryBadge) {
    productCategoryInput.addEventListener("change", (e) => {
      cardCategoryBadge.textContent = e.target.value || "Food";
    });
  }

  // 5. Live Sync: Brand Name
  if (brandNameInput && cardBrandName) {
    brandNameInput.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      cardBrandName.textContent = val || "Brand Name";
    });
  }

  // 6. Live Sync: Price, MRP & Discount Calculation
  const updatePricing = () => {
    const priceVal = parseFloat(productPriceInput.value) || 0;
    const originalVal = parseFloat(originalPriceInput.value) || 0;

    cardPrice.textContent = priceVal > 0 ? `₹${priceVal.toLocaleString("en-IN")}` : "₹0";

    if (originalVal > priceVal && priceVal > 0) {
      const discount = Math.round(((originalVal - priceVal) / originalVal) * 100);

      cardOriginalPrice.textContent = `₹${originalVal.toLocaleString("en-IN")}`;
      cardOriginalPrice.style.display = "inline";

      cardDiscountBadge.textContent = `${discount}% OFF`;
      cardDiscountBadge.style.display = "inline-block";

      if (discountBanner && discountPercentText) {
        discountPercentText.textContent = `${discount}% OFF`;
        discountBanner.style.display = "flex";
      }
    } else {
      cardOriginalPrice.style.display = "none";
      cardDiscountBadge.style.display = "none";
      if (discountBanner) {
        discountBanner.style.display = "none";
      }
    }
  };

  if (productPriceInput) productPriceInput.addEventListener("input", updatePricing);
  if (originalPriceInput) originalPriceInput.addEventListener("input", updatePricing);

  // 7. Live Sync: Description
  if (productDescInput && cardDesc) {
    productDescInput.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      cardDesc.textContent =
        val ||
        "A comprehensive nutritional description and key benefits will be visible here.";
    });
  }

  // 8. Image Handling: URL Input
  if (photoUrlInput && cardPreviewImg) {
    photoUrlInput.addEventListener("input", (e) => {
      const url = e.target.value.trim();
      if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        cardPreviewImg.src = url;
      } else if (!productImageFileInput.files || productImageFileInput.files.length === 0) {
        cardPreviewImg.src = defaultImg;
      }
    });
  }

  // 9. Image Handling: Dropzone & File Reader
  if (productImageFileInput) {
    productImageFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileSelection(file);
      }
    });
  }

  const handleFileSelection = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      if (previewImg) previewImg.src = dataUrl;
      if (cardPreviewImg) cardPreviewImg.src = dataUrl;
      if (dropzonePrompt) dropzonePrompt.style.display = "none";
      if (dropzonePreview) dropzonePreview.style.display = "inline-block";
    };
    reader.readAsDataURL(file);
  };

  // Remove Selected Image
  if (removeImgBtn) {
    removeImgBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (productImageFileInput) productImageFileInput.value = "";
      if (previewImg) previewImg.src = "";
      if (dropzonePrompt) dropzonePrompt.style.display = "block";
      if (dropzonePreview) dropzonePreview.style.display = "none";

      const photoUrl = photoUrlInput ? photoUrlInput.value.trim() : "";
      if (cardPreviewImg) {
        cardPreviewImg.src = photoUrl || defaultImg;
      }
    });
  }

  // Drag and drop event listeners
  if (dropzone) {
    ["dragenter", "dragover"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("dragover");
      });
    });

    dropzone.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        productImageFileInput.files = files;
        handleFileSelection(files[0]);
      }
    });
  }

  // 10. Form Submission & Loading State
  const form = document.getElementById("productListingForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const btnIcon = document.getElementById("btnIcon");

  if (form && submitBtn) {
    form.addEventListener("submit", (e) => {
      const title = productNameInput.value.trim();
      const price = productPriceInput.value;
      const desc = productDescInput.value.trim();
      const phone = document.getElementById("submitterPhone").value.trim();

      if (!title || !price || !desc || !phone) {
        return; // Allow native validation to highlight missing fields
      }

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = "Submitting Listing Request...";
      if (btnIcon) {
        btnIcon.setAttribute("data-lucide", "loader-2");
        if (window.lucide) lucide.createIcons();
      }
    });
  }
});
