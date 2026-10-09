(function () {
  "use strict";

  const demoScenarios = {
    clean: {
      name: "Deed_sample_01.pdf",
      score: 12,
      level: "LOW",
      title: "Records align",
      summary: "All key fields match in this sample.",
      fields: {
        owner: { uploaded: "Abdul Karim", reference: "Abdul Karim", status: "good", label: "✓ Match" },
        khatian: { uploaded: "1284", reference: "1284", status: "good", label: "✓ Match" },
        dag: { uploaded: "509", reference: "509", status: "good", label: "✓ Match" },
        area: { uploaded: "12.5 decimals", reference: "12.5 decimals", status: "good", label: "✓ Match" }
      },
      reasons: ["No mismatches detected in key sample fields."]
    },
    medium: {
      name: "Deed_sample_02.pdf",
      score: 44,
      level: "MEDIUM",
      title: "Review recommended",
      summary: "One detail differs and needs a closer look.",
      fields: {
        owner: { uploaded: "Abdul Karim", reference: "Abdul Karim", status: "good", label: "✓ Match" },
        khatian: { uploaded: "1284", reference: "1284", status: "good", label: "✓ Match" },
        dag: { uploaded: "509", reference: "509", status: "good", label: "✓ Match" },
        area: { uploaded: "10.5 decimals", reference: "12.5 decimals", status: "warn", label: "! Review" }
      },
      reasons: ["Area differs by 2.0 decimals in the sample comparison.", "Review the source records and measurement context."]
    },
    high: {
      name: "Rahim_deed_sample.pdf",
      score: 78,
      level: "HIGH",
      title: "Multiple mismatches",
      summary: "Several fields differ in this synthetic example.",
      fields: {
        owner: { uploaded: "Rahim Uddin", reference: "Abdul Karim", status: "bad", label: "✕ Mismatch" },
        khatian: { uploaded: "1284", reference: "1284", status: "good", label: "✓ Match" },
        dag: { uploaded: "590", reference: "509", status: "bad", label: "✕ Mismatch" },
        area: { uploaded: "9 decimals", reference: "12.5 decimals", status: "bad", label: "✕ Mismatch" }
      },
      reasons: ["Owner name differs from the sample reference.", "Dag number differs (590 vs 509).", "Area differs by 3.5 decimals."]
    }
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  function closeMenu() {
    if (!menuButton || !navLinks) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    navLinks.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", function () {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      navLinks.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", function (event) {
      if (!navLinks.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (window.location.hash !== link.getAttribute("href")) {
        window.history.replaceState(null, "", link.getAttribute("href"));
      }
    });
  });

  const navAnchors = Array.from(document.querySelectorAll('.nav-links > a[href^="#"]'));
  const navTargets = navAnchors.map(function (link) {
    return { link: link, section: document.querySelector(link.getAttribute("href")) };
  }).filter(function (item) { return item.section; });
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (element) {
      revealObserver.observe(element);
    });

    const activeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navTargets.forEach(function (item) {
          item.link.classList.toggle("is-current", item.section === entry.target);
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
    navTargets.forEach(function (item) { activeObserver.observe(item.section); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  const gaugeValue = document.querySelector("[data-gauge-value]");
  const gaugeLevel = document.querySelector("[data-gauge-level]");
  const mainGauge = document.querySelector(".gauge-progress");
  if (gaugeValue && mainGauge && "IntersectionObserver" in window && !reduceMotion) {
    const initialScore = Number(mainGauge.style.getPropertyValue("--score")) || 65;
    gaugeValue.textContent = "0";
    const counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        let startTime = null;
        function tick(time) {
          if (startTime === null) startTime = time;
          const progress = Math.min((time - startTime) / 950, 1);
          gaugeValue.textContent = String(Math.round(initialScore * progress));
          if (progress < 1) window.requestAnimationFrame(tick);
          else if (gaugeLevel) gaugeLevel.textContent = "HIGH RISK";
        }
        window.requestAnimationFrame(tick);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    counterObserver.observe(mainGauge);
  }

  function applyScenario(key) {
    const scenario = demoScenarios[key];
    if (!scenario) return;
    const levelClass = scenario.level.toLowerCase();
    const demoValue = document.querySelector("[data-demo-value]");
    const demoGauge = document.querySelector("[data-demo-gauge]");
    const demoBadge = document.querySelector("[data-demo-badge]");
    const reasonList = document.querySelector("[data-demo-reasons]");
    const scoreColor = { low: "low-stroke", medium: "medium-stroke", high: "high-stroke" }[levelClass];

    document.querySelector("[data-document-name]").textContent = scenario.name;
    Object.keys(scenario.fields).forEach(function (field) {
      const values = scenario.fields[field];
      const extracted = document.querySelector('[data-field="' + field + '"]');
      const uploaded = document.querySelector('[data-upload="' + field + '"]');
      const reference = document.querySelector('[data-reference="' + field + '"]');
      const statusCell = document.querySelector('[data-status="' + field + '"]');
      if (extracted) extracted.textContent = values.uploaded;
      if (uploaded) uploaded.textContent = values.uploaded;
      if (reference) reference.textContent = values.reference;
      if (statusCell) {
        const status = document.createElement("span");
        status.className = "table-status " + values.status;
        status.textContent = values.label;
        statusCell.replaceChildren(status);
      }
    });
    if (demoGauge) {
      demoGauge.classList.remove("low-stroke", "medium-stroke", "high-stroke");
      demoGauge.classList.add(scoreColor);
      demoGauge.style.setProperty("--score", String(scenario.score));
    }
    if (demoValue) demoValue.textContent = String(scenario.score);
    if (demoBadge) {
      demoBadge.className = "risk-badge " + levelClass;
      demoBadge.textContent = scenario.level + " RISK";
    }
    document.querySelector("[data-demo-title]").textContent = scenario.title;
    document.querySelector("[data-demo-summary]").textContent = scenario.summary;
    if (reasonList) {
      const reasons = scenario.reasons.map(function (reason) {
        const item = document.createElement("li");
        item.textContent = reason;
        return item;
      });
      reasonList.replaceChildren.apply(reasonList, reasons);
    }
    document.querySelectorAll(".demo-choice").forEach(function (button) {
      const active = button.dataset.demo === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  document.querySelectorAll(".demo-choice").forEach(function (button) {
    button.addEventListener("click", function () {
      applyScenario(button.dataset.demo);
    });
  });

  document.querySelectorAll(".faq-item button").forEach(function (button) {
    button.addEventListener("click", function () {
      const expanded = button.getAttribute("aria-expanded") === "true";
      const answer = document.getElementById(button.getAttribute("aria-controls"));
      button.setAttribute("aria-expanded", String(!expanded));
      if (answer) answer.hidden = expanded;
    });
    button.addEventListener("keydown", function (event) {
      const buttons = Array.from(document.querySelectorAll(".faq-item button"));
      const index = buttons.indexOf(button);
      let nextIndex = index;
      if (event.key === "ArrowDown") nextIndex = (index + 1) % buttons.length;
      if (event.key === "ArrowUp") nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = buttons.length - 1;
      if (nextIndex !== index) {
        event.preventDefault();
        buttons[nextIndex].focus();
      }
    });
  });

  function handleImageFailure(event) {
    const image = event.currentTarget;
    const wrapper = image.parentElement;
    image.hidden = true;
    if (wrapper) wrapper.classList.add("image-fallback");
  }
  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", handleImageFailure, { once: true });
    if (image.complete && image.naturalWidth === 0) handleImageFailure({ currentTarget: image });
  });
}());
