// Show the next Saturday's webinar date (India time). Rolls over to the
// following Saturday at 2:00 PM IST (when the session ends).
(function () {
  var IST_OFFSET = 5.5 * 60 * 60 * 1000;
  var START_HOUR = 14;
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
      image: ["image/amar-bedi-2.jpg"],
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
  form.addEventListener("submit", function () {
    if (box.checked && target) window.open(target, "_blank", "noopener");
  });
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) dialog.close(); // click on backdrop
  });
})();
