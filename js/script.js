// Show the next Saturday's webinar date (India time). Rolls over to the
// following Saturday at 11:00 AM IST (when the session begins).
(function () {
  var IST_OFFSET = 5.5 * 60 * 60 * 1000;
  var START_HOUR = 11;
  var MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function ordinal(n) {
    if (n % 100 >= 11 && n % 100 <= 13) return n + "th";
    return n + (["th", "st", "nd", "rd"][n % 10] || "th");
  }

  function nextWebinar() {
    // Shift to IST so getUTC* methods read India-local values
    var now = new Date(Date.now() + IST_OFFSET);
    var d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    var daysUntilSat = (6 - d.getUTCDay() + 7) % 7;
    if (daysUntilSat === 0 && now.getUTCHours() >= START_HOUR)
      daysUntilSat = 7;
    d.setUTCDate(d.getUTCDate() + daysUntilSat);
    return d;
  }

  function render() {
    var d = nextWebinar();

    // Date variables (computed in JS, reused anywhere in the HTML)
    var webinarWeekday = "Saturday";
    var webinarDay = ordinal(d.getUTCDate()); // e.g. "14th"
    var webinarMonth = MONTHS[d.getUTCMonth()]; // e.g. "November"
    var webinarYear = d.getUTCFullYear(); // e.g. 2026
    var webinarDate = webinarWeekday + ", " + webinarDay + " " + webinarMonth;

    window.WEBINAR_DATE = {
      weekday: webinarWeekday,
      day: webinarDay,
      month: webinarMonth,
      year: webinarYear,
      full: webinarDate,
    };

    // Plug the variables into the HTML.
    // <span class="webinar-date"></span>          -> "Saturday, 14th November"
    // <span data-webinar="day|month|year|weekday|full"></span> -> single part
    document.querySelectorAll(".webinar-date").forEach(function (el) {
      el.textContent = webinarDate;
    });
    document.querySelectorAll("[data-webinar]").forEach(function (el) {
      var v = window.WEBINAR_DATE[el.getAttribute("data-webinar")];
      if (v !== undefined) el.textContent = v;
    });
    renderEventSchema(d);
  }

  // Event structured data so Google can show the next session's date
  function renderEventSchema(d) {
    var day = d.toISOString().slice(0, 10);
    var registerUrl =
      "https://www.instamojo.com/@ProSync/le7be2aeb01034f25a040112269ba4710/";
    var data = {
      "@context": "https://schema.org",
      "@type": "EducationEvent",
      name: "Amazon FBA Live Webinar with Amar Bedi",
      description:
        "A 3-hour live workshop on selling established brands via Amazon FBA and launching a private label, followed by an open Q&A.",
      startDate: day + "T11:00:00+05:30",
      endDate: day + "T14:00:00+05:30",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode:
        "https://schema.org/OnlineEventAttendanceMode",
      location: { "@type": "VirtualLocation", url: registerUrl },
      image: ["https://asm.prosyncedu.com/image/amar-bedi-2.webp"],
      offers: {
        "@type": "Offer",
        price: "195",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: registerUrl,
      },
      organizer: {
        "@type": "Organization",
        name: "ProSync Infotech Pvt. Ltd.",
      },
      performer: { "@type": "Person", name: "Amar Bedi" },
    };
    var el = document.getElementById("event-schema");
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = "event-schema";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  render();
  setInterval(render, 60 * 1000);
})();

// FAQ "Load More"
(function () {
  var btn = document.getElementById("faq-more-btn");
  var more = document.getElementById("faq-more");
  if (!btn || !more) return;
  btn.addEventListener("click", function () {
    more.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    btn.parentNode.classList.add("hide");
  });
})();

// FAQ accordion: opening one question closes the others
(function () {
  var items = document.querySelectorAll(".faq-item");
  items.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      items.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });
})();

// DPDP: show notice and take affirmative consent before sending visitors to
// the Instamojo registration form. Without JS / <dialog>, links work as normal.
(function () {
  var dialog = document.getElementById("consent-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;
  var box = document.getElementById("consent-checkbox");
  var go = document.getElementById("consent-continue");
  var cancel = document.getElementById("consent-cancel");
  var form = document.getElementById("consent-form");
  var target = null;

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="instamojo.com"]');
    if (!a) return;
    e.preventDefault();
    target = a.href;
    box.checked = false;
    go.disabled = true;
    dialog.showModal();
    box.focus();
  });

  box.addEventListener("change", function () {
    go.disabled = !box.checked;
  });
  cancel.addEventListener("click", function () {
    dialog.close();
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!box.checked || !target) return;
    // Same-tab navigation avoids popup blocking on mobile browsers.
    dialog.close();
    window.location.assign(target);
  });
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) dialog.close(); // click on backdrop
  });
})();

// Sticky countdown to the next Saturday 11:00 AM IST session
(function () {
  var bar = document.getElementById("countdown-bar");
  if (!bar) return;
  var IST = 5.5 * 3600000;
  var els = {
    d: document.getElementById("cb-d"),
    h: document.getElementById("cb-h"),
    m: document.getElementById("cb-m"),
    s: document.getElementById("cb-s"),
  };
  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  function tick() {
    var now = Date.now();
    var ist = new Date(now + IST);
    var midnight = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
    var daysToSat = (6 - ist.getUTCDay() + 7) % 7;
    var start = midnight + daysToSat * 86400000 + 11 * 3600000 - IST;
    // At 11:00 AM IST on Saturday the countdown resets to the next Saturday
    // (same rollover as the webinar date shown on the page).
    if (now >= start) start += 7 * 86400000;
    var diff = Math.max(0, start - now);
    var s = Math.floor(diff / 1000);
    els.d.textContent = pad(Math.floor(s / 86400));
    els.h.textContent = pad(Math.floor((s % 86400) / 3600));
    els.m.textContent = pad(Math.floor((s % 3600) / 60));
    els.s.textContent = pad(s % 60);
    // Progress rings: remaining share of each unit
    els.d.style.setProperty("--p", (Math.floor(s / 86400) / 7) * 100);
    els.h.style.setProperty("--p", (Math.floor((s % 86400) / 3600) / 24) * 100);
    els.m.style.setProperty("--p", (Math.floor((s % 3600) / 60) / 60) * 100);
    els.s.style.setProperty("--p", ((s % 60) / 60) * 100);
  }
  tick();
  setInterval(tick, 1000);

  // Show the bar only after the hero section has fully scrolled out of view
  var hero = document.querySelector(".hero-outer");
  function toggle() {
    var past = hero ? hero.getBoundingClientRect().bottom <= 0 : true;
    bar.classList.toggle("is-visible", past);
  }
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
  window.addEventListener("resize", toggle);
})();
