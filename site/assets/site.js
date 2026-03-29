/**
 * Linglong marketplace static site — filter, copy-to-clipboard, install tabs.
 * Vanilla JS only; safe on GitHub Pages without a build step.
 */
(function () {
  "use strict";

  const COPY_FEEDBACK_MS = 2000;

  function notify(el, msg) {
    var live = document.getElementById("aria-live-polite");
    if (live) live.textContent = msg;
    if (el && el.dataset) {
      var prev = el.getAttribute("aria-label") || "";
      el.setAttribute("aria-label", msg);
      window.setTimeout(function () {
        el.setAttribute("aria-label", prev);
      }, COPY_FEEDBACK_MS);
    }
  }

  function initCopyButtons() {
    document.body.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-copy]");
      if (!btn || !btn.getAttribute("data-copy")) return;
      var text = btn.getAttribute("data-copy");
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        notify(btn, "Clipboard API unavailable");
        return;
      }
      navigator.clipboard.writeText(text).then(
        function () {
          notify(btn, "Copied");
        },
        function () {
          notify(btn, "Copy failed");
        }
      );
    });
  }

  function initSkillFilter() {
    var input = document.getElementById("skill-filter");
    if (!input) return;
    var cards = document.querySelectorAll("[data-skill-card]");
    function apply() {
      var q = (input.value || "").trim().toLowerCase();
      cards.forEach(function (card) {
        var hay = (card.getAttribute("data-search") || "").toLowerCase();
        var show = !q || hay.indexOf(q) !== -1;
        card.hidden = !show;
        card.setAttribute("aria-hidden", show ? "false" : "true");
      });
    }
    input.addEventListener("input", apply);
    apply();
  }

  function initInstallTabs() {
    var root = document.querySelector("[data-install-tabs]");
    if (!root) return;
    var tabs = root.querySelectorAll('[role="tab"]');
    var panels = root.querySelectorAll('[role="tabpanel"]');
    function select(id) {
      tabs.forEach(function (t) {
        var on = t.getAttribute("aria-controls") === id;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p) {
        var on = p.id === id;
        p.hidden = !on;
        p.classList.toggle("is-active", on);
      });
    }
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var id = tab.getAttribute("aria-controls");
        if (id) select(id);
      });
      tab.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        var i = Array.prototype.indexOf.call(tabs, tab);
        var next =
          e.key === "ArrowRight"
            ? tabs[Math.min(tabs.length - 1, i + 1)]
            : tabs[Math.max(0, i - 1)];
        if (next) {
          next.focus();
          select(next.getAttribute("aria-controls"));
        }
      });
    });
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var rail = document.getElementById("rail");
    if (!toggle || !rail) return;
    toggle.addEventListener("click", function () {
      var open = rail.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCopyButtons();
    initSkillFilter();
    initInstallTabs();
    initMobileNav();
  });
})();
