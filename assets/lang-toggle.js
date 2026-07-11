/*
 * Site-wide language toggle button.
 *
 * The navbar keeps a single "ES" link (pointing to /es/index.html as a
 * no-JS fallback). When JS is available, this script hijacks that link
 * and turns it into an EN <-> ES toggle that runs Google Translate's
 * widget on WHATEVER page you're currently on, instead of only ever
 * sending you to the one hand-translated Spanish homepage.
 *
 * The chosen language is remembered in localStorage, so navigating to a
 * different page (or reloading) keeps you in the language you picked.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "site-lang";
  var LABELS = {
    en: { buttonText: "ES", ariaLabel: "Traducir al español" },
    es: { buttonText: "EN", ariaLabel: "Volver al inglés / Back to English" }
  };

  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "en";
    } catch (e) {
      return "en";
    }
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* ignore (e.g. private browsing) */
    }
  }

  function findLangLink() {
    var links = document.querySelectorAll(".navbar-nav .nav-link");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href") || "";
      if (/(^|\/)es\/index\.html$/.test(href) || /(^|\/)es\/?$/.test(href)) {
        return links[i];
      }
    }
    return null;
  }

  function updateButtonLabel(link, lang) {
    if (!link) return;
    var meta = LABELS[lang];
    var span = link.querySelector(".menu-text");
    if (span) {
      span.textContent = meta.buttonText;
    } else {
      link.textContent = meta.buttonText;
    }
    link.setAttribute("aria-label", meta.ariaLabel);
    link.setAttribute("title", meta.ariaLabel);
  }

  function getCombo() {
    return document.querySelector("select.goog-te-combo");
  }

  function applyTranslation(lang, attemptsLeft) {
    attemptsLeft = attemptsLeft === undefined ? 20 : attemptsLeft;
    var combo = getCombo();
    if (!combo) {
      if (attemptsLeft > 0) {
        setTimeout(function () {
          applyTranslation(lang, attemptsLeft - 1);
        }, 250);
      }
      return;
    }
    if (combo.value === lang) return;
    combo.value = lang;
    combo.dispatchEvent(new Event("change"));
  }

  function toggleLang(link) {
    var current = getStoredLang();
    var next = current === "en" ? "es" : "en";
    setStoredLang(next);
    updateButtonLabel(link, next);
    applyTranslation(next);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var link = findLangLink();
    if (!link) return;

    var storedLang = getStoredLang();
    updateButtonLabel(link, storedLang);

    link.addEventListener("click", function (e) {
      e.preventDefault();
      toggleLang(link);
    });

    // Re-apply the stored language once Google Translate has finished
    // loading on this (new) page.
    if (storedLang === "es") {
      applyTranslation("es");
    }
  });
})();
