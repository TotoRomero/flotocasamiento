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

      if (dist <= 0) {
        // ¡Es el gran día!
        const box = document.querySelector('.countdown-box');
        if (box) {
          box.innerHTML = '<p style="font-size:1.4em; font-weight:600; letter-spacing:1px; margin:0;">¡Hoy es el gran día! ❤️</p>';
        }
        return;
      }

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
     6. MODAL DE RSVP — Formulario nativo
        con persistencia en Supabase
  ─────────────────────────────────────────── */
  try {

    // ── Configuración Supabase ────────────────
    const SUPABASE_URL = "https://mizhkpzzldrluyldrpzl.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_Z3QrZ6BcHzjOy_c8xaIoJA_1B_Rl_0g";

    // ── Referencias DOM ───────────────────────
    const rsvpTrigger     = document.getElementById('rsvpTrigger');
    const modalOverlay    = document.getElementById('rsvpModal');
    const modalClose      = document.getElementById('rsvpModalClose');
    const navBadge        = document.querySelector('.nav-badge');

    const rsvpForm        = document.getElementById('rsvpForm');
    const rsvpError       = document.getElementById('rsvpError');
    const rsvpSubmit      = document.getElementById('rsvpSubmit');
    const closeSuccess    = document.getElementById('rsvpCloseSuccess');

    const stateForm       = document.getElementById('rsvpFormState');
    const stateLoading    = document.getElementById('rsvpLoadingState');
    const stateSuccess    = document.getElementById('rsvpSuccessState');

    // ── Helpers de estado ─────────────────────
    function showState(state) {
      stateForm.style.display    = state === 'form'    ? 'block' : 'none';
      stateLoading.style.display = state === 'loading' ? 'block' : 'none';
      stateSuccess.style.display = state === 'success' ? 'block' : 'none';
      if (state === 'success') {
        try { lucide.createIcons(); } catch(e) {}
      }
    }

    function showError(msg) {
      rsvpError.textContent = msg;
      rsvpError.style.display = 'block';
    }

    function hideError() {
      rsvpError.style.display = 'none';
    }

    // ── Abrir / cerrar modal ──────────────────
    function openModal() {
      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      showState('form');
      hideError();

      if (navBadge) {
        navBadge.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        navBadge.style.opacity = '0';
        navBadge.style.transform = 'scale(0)';
        setTimeout(() => navBadge.remove(), 300);
      }
    }

    function closeModal() {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (rsvpTrigger)  rsvpTrigger.addEventListener('click', openModal);
    if (modalClose)   modalClose.addEventListener('click', closeModal);
    if (closeSuccess) closeSuccess.addEventListener('click', closeModal);

    if (modalOverlay) {
      modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modalOverlay?.classList.contains('open')) closeModal();
    });

    // ── Submit del formulario → Supabase ──────
    if (rsvpForm) {
      rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideError();

        const nombre     = document.getElementById('rsvpNombre').value.trim();
        const apellido   = document.getElementById('rsvpApellido').value.trim();
        const correo     = document.getElementById('rsvpCorreo').value.trim();
        const menu       = rsvpForm.querySelector('input[name="menu"]:checked')?.value;
        const transporte = rsvpForm.querySelector('input[name="transporte"]:checked')?.value;
        const mensaje    = document.getElementById('rsvpMensaje').value.trim();

        // Validación básica
        if (!nombre)     return showError('Por favor ingresá tu nombre.');
        if (!apellido)   return showError('Por favor ingresá tu apellido.');
        if (!correo)     return showError('Por favor ingresá tu correo electrónico.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return showError('El correo no parece válido. Revisalo.');
        if (!menu)       return showError('Por favor elegí una opción de menú.');
        if (!transporte) return showError('Por favor elegí una opción de transporte.');

        showState('loading');
        rsvpSubmit.disabled = true;

        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/rsvp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ nombre, apellido, correo, menu, transporte, mensaje: mensaje || null })
          });

          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Error ${res.status}: ${errBody}`);
          }

          showState('success');
          rsvpForm.reset();

        } catch (err) {
          console.error('Error al guardar RSVP:', err);
          showState('form');
          showError('Hubo un problema al enviar. Por favor intentá de nuevo en unos segundos.');
        } finally {
          rsvpSubmit.disabled = false;
        }
      });
    }

  } catch (err) {
    console.error("Error configurando el modal de RSVP:", err);
  }

});
