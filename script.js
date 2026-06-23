/* ═══════════════════════════════════════════════════════════
   FLORA & TOTO — Casamiento
   Lógica del sitio
   ───────────────────────────────────────────────────────────
   Índice rápido:
   0. CONFIG — lo único que probablemente necesites editar
   1. Countdown
   2. Scroll fade-in
   3. Copiar alias
   4. Carrusel de fotos
   5. Nav activo al hacer scroll
   6. RSVP — ocultar badge del menú al confirmar
   ───────────────────────────────────────────────────────────
   NOTA DE LA CORRECCIÓN (ver chat):
   Cada sección ahora corre dentro de su propio try/catch.
   Antes, si algo fallaba en una sección (por ej. los íconos
   de Lucide si esa librería no llegaba a cargar por una red
   lenta o el navegador interno de WhatsApp), el script se
   detenía ahí y TODO lo que venía después —incluido el botón
   de RSVP— dejaba de funcionar. Aislando cada sección, un
   problema puntual ya no puede tirar abajo el resto del sitio.
═══════════════════════════════════════════════════════════ */

/* ───────────────────────────────────────────
   0. CONFIG
   Cambiá estos valores y el resto del sitio
   se actualiza solo.
─────────────────────────────────────────── */
const CONFIG = {
  // Fecha y hora exacta del casamiento (usada por el countdown)
  weddingDate: "Nov 21, 2026 18:00:00",

  // El link al Google Form del RSVP ahora está puesto directo en el
  // href del botón "Confirmar que venís" en index.html (no acá), porque
  // se abre en pestaña nueva en vez de embebido — ver nota en el chat.
};


document.addEventListener("DOMContentLoaded", function () {

  /* ───────────────────────────────────────────
     0. ÍCONOS (Lucide)
     Aislado primero: si la librería no cargó,
     no debe frenar nada de lo que sigue.
  ─────────────────────────────────────────── */
  try {
    lucide.createIcons();
  } catch (err) {
    console.error("No se pudieron inicializar los íconos (Lucide):", err);
  }


  /* ───────────────────────────────────────────
     1. COUNTDOWN
  ─────────────────────────────────────────── */
  try {
    const weddingDate = new Date(CONFIG.weddingDate).getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const dist = weddingDate - now;
      if (dist < 0) return;
      document.getElementById("days").innerText = Math.floor(dist / 86400000);
      document.getElementById("hours").innerText = Math.floor((dist / 3600000) % 24);
      document.getElementById("minutes").innerText = Math.floor((dist / 60000) % 60);
      document.getElementById("seconds").innerText = Math.floor((dist / 1000) % 60);
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  } catch (err) {
    console.error("Error en el countdown:", err);
  }


  /* ───────────────────────────────────────────
     2. SCROLL FADE-IN
  ─────────────────────────────────────────── */
  try {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in, .card').forEach(el => observer.observe(el));
  } catch (err) {
    console.error("Error en el fade-in:", err);
  }


  /* ───────────────────────────────────────────
     3. COPIAR ALIAS
  ─────────────────────────────────────────── */
  try {
    window.copyAlias = function (btn, text) {
      navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '<i data-lucide="check" width="14" height="14"></i> ¡Copiado!';
        try { lucide.createIcons(); } catch (e) { /* no crítico */ }
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '<i data-lucide="copy" width="14" height="14"></i> Copiar';
          try { lucide.createIcons(); } catch (e) { /* no crítico */ }
        }, 2000);
      }).catch(err => {
        console.error("No se pudo copiar el alias:", err);
        alert("No se pudo copiar automáticamente. Alias: " + text);
      });
    };
  } catch (err) {
    console.error("Error configurando copiar alias:", err);
  }


  /* ───────────────────────────────────────────
     4. CARRUSEL DE FOTOS
  ─────────────────────────────────────────── */
  try {
    const track = document.querySelector('.carousel-track');
    const slideEls = document.querySelectorAll('.slide');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const carousel = document.querySelector('.carousel');
    const dotsContainer = document.getElementById('carouselDots');

    if (track && carousel && slideEls.length > 0) {

      let index = 0;
      let autoScroll;

      // Crear dots
      slideEls.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Foto ${i + 1}`);
        dot.addEventListener('click', () => { index = i; updateCarousel(); });
        dotsContainer && dotsContainer.appendChild(dot);
      });

      function updateDots() {
        document.querySelectorAll('.carousel-dot').forEach((d, i) => {
          d.classList.toggle('active', i === index);
        });
      }

      function updateCarousel() {
        track.style.transform = `translateX(-${index * 100}%)`;
        slideEls.forEach((s, i) => s.classList.toggle('active', i === index));
        updateDots();
      }

      function nextSlide() {
        index = (index + 1) % slideEls.length;
        updateCarousel();
      }

      function prevSlide() {
        index = (index - 1 + slideEls.length) % slideEls.length;
        updateCarousel();
      }

      updateCarousel();

      if (nextBtn) nextBtn.addEventListener('click', nextSlide);
      if (prevBtn) prevBtn.addEventListener('click', prevSlide);

      autoScroll = setInterval(nextSlide, 4000);

      carousel.addEventListener("mouseenter", () => clearInterval(autoScroll));
      carousel.addEventListener("mouseleave", () => { autoScroll = setInterval(nextSlide, 4000); });

      let touchStartX = 0;
      carousel.addEventListener("touchstart", e => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(autoScroll);
      }, { passive: true });

      carousel.addEventListener("touchend", e => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 40) { diff > 0 ? nextSlide() : prevSlide(); }
        autoScroll = setInterval(nextSlide, 4000);
      }, { passive: true });
    }
  } catch (err) {
    console.error("Error en el carrusel:", err);
  }


  /* ───────────────────────────────────────────
     5. NAV ACTIVO AL HACER SCROLL
  ─────────────────────────────────────────── */
  try {
    const sections = document.querySelectorAll("section, .section");
    const navLinks = document.querySelectorAll(".floating-menu a");

    window.addEventListener("scroll", () => {
      let current = "";
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute("id");
      });
      navLinks.forEach(a => {
        a.classList.remove("active");
        if (a.getAttribute("href") === "#" + current) a.classList.add("active");
      });
    });
  } catch (err) {
    console.error("Error en el nav activo:", err);
  }


  /* ───────────────────────────────────────────
     6. RSVP — ocultar el badge "1" del menú
     una vez que el invitado toca "Confirmar que
     venís" (ahora es un link directo al Google
     Form en pestaña nueva, sin modal ni iframe,
     para evitar que navegadores bloqueen el form
     embebido — ver explicación en el chat).
  ─────────────────────────────────────────── */
  try {
    const rsvpTrigger = document.getElementById('rsvpTrigger');
    const navBadge = document.querySelector('.nav-badge');

    if (rsvpTrigger && navBadge) {
      rsvpTrigger.addEventListener('click', () => {
        navBadge.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        navBadge.style.opacity = '0';
        navBadge.style.transform = 'scale(0)';
        setTimeout(() => navBadge.remove(), 300);
      });
    }
  } catch (err) {
    console.error("Error ocultando el badge de RSVP:", err);
  }

});
