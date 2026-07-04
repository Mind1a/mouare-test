const body = document.body;
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navPanel = document.querySelector(".nav-panel");
const navLinks = document.querySelectorAll(".nav-link");
const videoOpenButtons = document.querySelectorAll("[data-open-video]");
const videoModal = document.querySelector("[data-video-modal]");
const videoCloseButtons = document.querySelectorAll("[data-close-video]");
const revealElements = document.querySelectorAll(".reveal");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const contactFormTarget = document.querySelector("[data-contact-form-target]");
let contactSubmissionPending = false;

function setHeaderScrollState() {
  body.classList.toggle("scrolled", window.scrollY > 20);
}

function openMenu() {
  menuToggle.classList.add("is-open");
  navPanel.classList.add("is-open");
  body.classList.add("menu-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close navigation menu");
}

function closeMenu() {
  menuToggle.classList.remove("is-open");
  navPanel.classList.remove("is-open");
  body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

function toggleMenu() {
  const isOpen = navPanel.classList.contains("is-open");

  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function openVideoModal() {
  videoModal.classList.add("is-open");
  videoModal.setAttribute("aria-hidden", "false");
  body.classList.add("menu-open");

  const focusableElements = getFocusableElements(videoModal);

  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }

  trackEvent("watch_video_clicked");
}

function closeVideoModal() {
  videoModal.classList.remove("is-open");
  videoModal.setAttribute("aria-hidden", "true");
  body.classList.remove("menu-open");
}

function trapModalFocus(event) {
  if (!videoModal.classList.contains("is-open")) return;
  if (event.key !== "Tab") return;

  const focusableElements = getFocusableElements(videoModal);

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function handleEscapeKey(event) {
  if (event.key !== "Escape") return;

  if (videoModal.classList.contains("is-open")) {
    closeVideoModal();
  }

  if (navPanel.classList.contains("is-open")) {
    closeMenu();
  }
}

function trackEvent(eventName, payload = {}) {
  console.log("Analytics event:", eventName, payload);
}

function setupRevealAnimations() {
  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });
}

function setupAnalyticsTracking() {
  const heroPrimaryCTA = document.querySelector(".hero .btn-primary");
  const finalPrimaryCTA = document.querySelector(
    ".final-cta-card .btn-primary",
  );
  const featureLinks = document.querySelectorAll(".feature-card a");
  const marketplaceCTA = document.querySelector("#marketplace .btn");
  const footerLinks = document.querySelectorAll(".site-footer a");

  if (heroPrimaryCTA) {
    heroPrimaryCTA.addEventListener("click", () => {
      trackEvent("hero_cta_clicked");
      trackEvent("device_registration_started");
    });
  }

  if (finalPrimaryCTA) {
    finalPrimaryCTA.addEventListener("click", () => {
      trackEvent("device_registration_started", {
        source: "final_cta",
      });
    });
  }

  featureLinks.forEach((link) => {
    link.addEventListener("click", () => {
      trackEvent("feature_card_clicked", {
        label: link.textContent.trim(),
      });
    });
  });

  if (marketplaceCTA) {
    marketplaceCTA.addEventListener("click", () => {
      trackEvent("marketplace_cta_clicked");
    });
  }

  footerLinks.forEach((link) => {
    link.addEventListener("click", () => {
      trackEvent("footer_link_clicked", {
        label: link.textContent.trim(),
      });
    });
  });
}

function handleContactSubmit(event) {
  event.preventDefault();
  contactForm.classList.add("was-validated");
  formStatus.textContent = "";

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  const submitButton = contactForm.querySelector('[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "იგზავნება...";
  formStatus.textContent = "თქვენი შეტყობინება იგზავნება...";
  contactSubmissionPending = true;

  HTMLFormElement.prototype.submit.call(contactForm);
}

function handleContactResponse() {
  if (!contactSubmissionPending) return;

  contactSubmissionPending = false;

  const submitButton = contactForm.querySelector('[type="submit"]');
  contactForm.reset();
  contactForm.classList.remove("was-validated");
  submitButton.disabled = false;
  submitButton.innerHTML =
    'შეტყობინების გაგზავნა <span aria-hidden="true">→</span>';
  formStatus.textContent =
    "მადლობა! თქვენი შეტყობინება წარმატებით გაიგზავნა.";
  trackEvent("contact_form_submitted");
}

window.addEventListener("scroll", setHeaderScrollState);
window.addEventListener("keydown", handleEscapeKey);
window.addEventListener("keydown", trapModalFocus);

if (menuToggle) {
  menuToggle.addEventListener("click", toggleMenu);
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

videoOpenButtons.forEach((button) => {
  button.addEventListener("click", openVideoModal);
});

videoCloseButtons.forEach((button) => {
  button.addEventListener("click", closeVideoModal);
});

if (contactForm) {
  contactForm.addEventListener("submit", handleContactSubmit);
}

if (contactFormTarget) {
  contactFormTarget.addEventListener("load", handleContactResponse);
}

setHeaderScrollState();
setupRevealAnimations();
setupAnalyticsTracking();
