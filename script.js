// Show the next Saturday's webinar date (India time). Rolls over to the
// following Saturday once the 11:00 AM session has started.
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
    var label =
      "Saturday, " +
      ordinal(d.getUTCDate()) +
      " " +
      MONTHS[d.getUTCMonth()];
    document.querySelectorAll(".webinar-date").forEach(function (el) {
      el.textContent = label;
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
        "A 2-hour live workshop on selling established brands via Amazon FBA and launching a private label, followed by an open Q&A.",
      startDate: day + "T11:00:00+05:30",
      endDate: day + "T13:00:00+05:30",
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
