// Funnel analytics + audience selector.
// Events go to window.dataLayer (Google Tag Manager or gtag). No personal data
// is sent: only event names and page-section labels.
//
// Funnel: cta_click -> consent_open -> consent_accept -> registration_redirect
// Set the Google Ads conversion on your Instamojo thank-you page (actual
// payment) where possible; use registration_redirect only as a secondary goal.

window.dataLayer = window.dataLayer || [];
window.trackEvent = function (name, params) {
  var o = { event: name };
  for (var k in params || {}) o[k] = params[k];
  window.dataLayer.push(o);
};

// ── Audience selector (accessible tabs) ──
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".aud-tab"));
  if (!tabs.length) return;
  var data = [
    ["New to Amazon selling?", "“I want to begin, but I have no experience or seller account.”", "The Amazon FBA model, basic selling steps, and what to consider before getting started."],
    ["Already selling on Amazon?", "“I sell online, but I want to improve how I research new opportunities.”", "Revisit product research and costing basics while comparing reselling with private label. This is a foundational session, not an advanced ads clinic."],
    ["Considering a business alongside your job?", "“Can Amazon FBA reduce my day-to-day fulfilment workload?”", "Understand which fulfilment activities Amazon manages and what responsibilities remain with the seller."],
    ["Experienced in retail or wholesale?", "“I know products, but I want to explore selling established brands online.”", "See an introductory demonstration of researching, sourcing and listing established-brand products on Amazon FBA."],
    ["Thinking of launching your own brand?", "“How does a product idea become a private-label listing?”", "Understand the stages of product research, branding, listing creation and FBA integration."],
    ["Learning practical e-commerce skills?", "“Can I understand Amazon selling without business experience?”", "Get a structured introduction to the selling models and common beginner mistakes, with time for questions."]
  ];
  function activate(i, track) {
    tabs.forEach(function (b, j) {
      b.setAttribute("aria-selected", String(i === j));
      b.tabIndex = i === j ? 0 : -1;
    });
    document.getElementById("aud-title").textContent = data[i][0];
    document.getElementById("aud-question").textContent = data[i][1];
    document.getElementById("aud-answer").textContent = data[i][2];
    document.getElementById("aud-panel").setAttribute("aria-labelledby", "tab-" + i);
    if (track) window.trackEvent("audience_select", { audience: data[i][0] });
  }
  tabs.forEach(function (b, i) {
    b.addEventListener("click", function () { activate(i, true); });
    b.addEventListener("keydown", function (e) {
      var k = e.key;
      if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].indexOf(k) < 0) return;
      e.preventDefault();
      var step = k === "ArrowDown" || k === "ArrowRight" ? 1 : -1;
      var n = (i + step + tabs.length) % tabs.length;
      activate(n, true);
      tabs[n].focus();
    });
  });
})();

// ── CTA / funnel / engagement events ──
(function () {
  function where(el) {
    if (el.dataset && el.dataset.cta) return el.dataset.cta;
    if (el.closest(".reg-card")) return "hero-card";
    if (el.closest(".hero-outer")) return "hero";
    if (el.closest("header")) return "nav";
    if (el.closest("footer")) return "footer";
    if (el.closest(".bottom-cta")) return "bottom-cta";
    if (el.closest(".wk-card")) return "workshop-preview";
    var s = el.closest("section");
    return (s && (s.id || s.className.split(" ")[0])) || "page";
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="instamojo.com"]');
    if (a) window.trackEvent("cta_click", { cta_location: where(a) });
    if (e.target.closest && e.target.closest("#faq-more-btn")) window.trackEvent("faq_load_more");
  });

  var box = document.getElementById("consent-checkbox");
  var form = document.getElementById("consent-form");
  var dlg = document.getElementById("consent-dialog");
  if (dlg && window.MutationObserver) {
    new MutationObserver(function () {
      if (dlg.open) window.trackEvent("consent_open");
    }).observe(dlg, { attributes: true, attributeFilter: ["open"] });
  }
  if (box) box.addEventListener("change", function () {
    if (box.checked) window.trackEvent("consent_accept");
  });
  if (form) form.addEventListener("submit", function () {
    if (box && box.checked) window.trackEvent("registration_redirect");
  });

  var seen = {};
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    var pct = Math.round(((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100);
    [25, 50, 75, 100].forEach(function (m) {
      if (pct >= m - 1 && !seen[m]) { seen[m] = 1; window.trackEvent("scroll_depth", { percent: m }); }
    });
  }, { passive: true });

  document.querySelectorAll(".faq-item").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) window.trackEvent("faq_open", { question: d.querySelector("summary").textContent.trim().slice(0, 80) });
    });
  });
})();
