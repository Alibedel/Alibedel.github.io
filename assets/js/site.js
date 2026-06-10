/**
 * Ali Hassan — portfolio interaction engine
 * Vanilla JS, no dependencies (Typed.js loaded separately for the hero).
 */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Typed hero text ---------- */
  if (window.Typed && document.querySelector(".typing")) {
    new Typed(".typing", {
      strings: ["a Web Developer", "a Website Builder", "a Software Engineer", "an AI Enthusiast"],
      loop: true,
      typeSpeed: 65,
      backSpeed: 35,
      backDelay: 1500
    });
  }

  /* ---------- Scroll progress + navbar state ---------- */
  var progress = document.getElementById("scroll-progress");
  var navbar = document.getElementById("navbar");

  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.querySelector("#navbar .nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
      var icon = navToggle.querySelector("i");
      icon.className = navLinks.classList.contains("open") ? "bx bx-x" : "bx bx-menu";
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navToggle.querySelector("i").className = "bx bx-menu";
      }
    });
  }

  /* ---------- Active nav link via IntersectionObserver ---------- */
  var sections = document.querySelectorAll("section[id], header[id]");
  var linkFor = {};
  document.querySelectorAll("#navbar .nav-links a[href^='#']").forEach(function (a) {
    linkFor[a.getAttribute("href").slice(1)] = a;
  });

  var navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && linkFor[entry.target.id]) {
        Object.keys(linkFor).forEach(function (k) { linkFor[k].classList.remove("active"); });
        linkFor[entry.target.id].classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sections.forEach(function (s) { navObserver.observe(s); });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reducedMotion) {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Portfolio filter ---------- */
  var filterBtns = document.querySelectorAll(".portfolio .filters li");
  var items = document.querySelectorAll(".portfolio .portfolio-item");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("filter-active"); });
      btn.classList.add("filter-active");
      var f = btn.getAttribute("data-filter");
      items.forEach(function (item) {
        item.classList.toggle("hidden", f !== "all" && item.getAttribute("data-category") !== f);
      });
    });
  });

  /* ---------- Project modal ---------- */
  var modal = document.getElementById("project-modal");
  var modalFrame = modal ? modal.querySelector("iframe") : null;

  function closeModal() {
    modal.classList.remove("open");
    modalFrame.src = "about:blank";
    document.body.style.overflow = "";
  }

  if (modal) {
    document.querySelectorAll(".open-project").forEach(function (btn) {
      btn.addEventListener("click", function () {
        modalFrame.src = btn.getAttribute("data-src");
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
    modal.querySelector(".modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ---------- 3D tilt on project cards ---------- */
  if (!reducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(700px) rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg) translateY(-2px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Particle network hero ---------- */
  var canvas = document.getElementById("particle-canvas");
  if (canvas && !reducedMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var mouse = { x: null, y: null };
    var running = true;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * DPR;
      canvas.height = rect.height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      initParticles(rect.width, rect.height);
    }

    function initParticles(w, h) {
      var count = Math.min(90, Math.floor((w * h) / 16000));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          r: Math.random() * 1.8 + 0.6
        });
      }
    }

    canvas.parentElement.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener("mouseleave", function () {
      mouse.x = mouse.y = null;
    });

    // Pause when hero is offscreen
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
      if (running) requestAnimationFrame(tick);
    }).observe(canvas);

    var LINK_DIST = 130;
    var MOUSE_DIST = 170;

    function tick() {
      if (!running) return;
      var w = canvas.width / DPR, h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // gentle pull toward cursor
        if (mouse.x !== null) {
          var dxm = mouse.x - p.x, dym = mouse.y - p.y;
          var dm = Math.sqrt(dxm * dxm + dym * dym);
          if (dm < MOUSE_DIST && dm > 0.001) {
            p.vx += (dxm / dm) * 0.012;
            p.vy += (dym / dm) * 0.012;
          }
        }

        // speed cap
        var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (sp > 0.9) { p.vx = (p.vx / sp) * 0.9; p.vy = (p.vy / sp) * 0.9; }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(52, 211, 153, 0.55)";
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(34, 211, 238," + (0.16 * (1 - d / LINK_DIST)) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // line to cursor
        if (mouse.x !== null) {
          var dxc = p.x - mouse.x, dyc = p.y - mouse.y;
          var dc = Math.sqrt(dxc * dxc + dyc * dyc);
          if (dc < MOUSE_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = "rgba(52, 211, 153," + (0.25 * (1 - dc / MOUSE_DIST)) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(tick);
    }

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(tick);
  }
})();
