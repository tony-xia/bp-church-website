// Sydney B-P Church — shared site behaviour (no dependencies).
(function () {
  document.documentElement.classList.add('js');

  // ---------- Mobile nav + dropdowns ----------
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  document.querySelectorAll('.site-nav__link[aria-expanded]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.site-nav__item');
      var open = !item.classList.contains('is-open');
      document.querySelectorAll('.site-nav__item.is-open').forEach(function (i) {
        if (i !== item) {
          i.classList.remove('is-open');
          i.querySelector('[aria-expanded]').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.site-nav__item')) {
      document.querySelectorAll('.site-nav__item.is-open').forEach(function (i) {
        i.classList.remove('is-open');
        i.querySelector('[aria-expanded]').setAttribute('aria-expanded', 'false');
      });
    }
  });

  // ---------- Entrance animations ----------
  // <el data-anim="fade|float|reveal" data-anim-delay="1200" data-anim-duration="1000">
  var animated = document.querySelectorAll('[data-anim]');
  animated.forEach(function (el) {
    if (el.dataset.animDelay) el.style.setProperty('--anim-delay', el.dataset.animDelay + 'ms');
    if (el.dataset.animDuration) el.style.setProperty('--anim-dur', el.dataset.animDuration + 'ms');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    animated.forEach(function (el) { io.observe(el); });
  } else {
    animated.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---------- Slideshow ----------
  // <div class="slideshow" data-autoplay="4000"> .slideshow__slide ... .slideshow__prev/.slideshow__next/.slideshow__dots
  document.querySelectorAll('.slideshow').forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.slideshow__slide'));
    var dots = root.querySelector('.slideshow__dots');
    var index = 0;
    var timer = null;
    if (!slides.length) return;
    if (dots) {
      slides.forEach(function (slide, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', slide.getAttribute('aria-label') || 'Slide ' + (i + 1));
        b.addEventListener('click', function () { go(i); restart(); });
        dots.appendChild(b);
      });
    }
    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        var active = n === index;
        s.classList.toggle('is-active', active);
        s.setAttribute('aria-hidden', String(!active));
      });
      if (dots) {
        Array.prototype.forEach.call(dots.children, function (d, n) {
          d.classList.toggle('is-active', n === index);
          if (n === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
        });
      }
    }
    function restart() {
      var delay = parseInt(root.dataset.autoplay, 10);
      if (!delay) return;
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, delay);
    }
    var prev = root.querySelector('.slideshow__prev');
    var next = root.querySelector('.slideshow__next');
    if (prev) prev.addEventListener('click', function () { go(index - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(index + 1); restart(); });
    // touch swipe
    var startX = null;
    root.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    });
    go(0);
    restart();
  });

  // ---------- Audio players ----------
  // <div class="audio-player" data-src="..."> built into play button + progress + time
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l16 9-16 9z" fill="currentColor"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h5v18H5zM14 3h5v18h-5z" fill="currentColor"/></svg>';
  function fmt(t) {
    if (!isFinite(t)) return '00:00';
    t = Math.floor(t);
    var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    var mm = (m < 10 ? '0' : '') + m, ss = (s < 10 ? '0' : '') + s;
    return h ? h + ':' + mm + ':' + ss : mm + ':' + ss;
  }
  var players = [];
  var narrow = window.matchMedia('(max-width: 750px)');
  document.querySelectorAll('.audio-player[data-src]').forEach(function (el) {
    var audio = new Audio();
    audio.preload = 'none';
    audio.src = el.dataset.src;
    var label = el.dataset.title || 'audio';
    el.innerHTML =
      '<button type="button" class="audio-player__btn" aria-label="Play ' + label.replace(/"/g, '&quot;') + '">' + PLAY + '</button>' +
      '<div class="audio-player__bar" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>' +
      '<span class="audio-player__time">' + (narrow.matches ? '-' : '00:00 / ') + (el.dataset.duration || '--:--') + '</span>';
    var btn = el.querySelector('.audio-player__btn');
    var bar = el.querySelector('.audio-player__bar');
    var fill = bar.querySelector('span');
    var time = el.querySelector('.audio-player__time');
    players.push(audio);
    btn.addEventListener('click', function () {
      if (audio.paused) {
        players.forEach(function (p) { if (p !== audio) p.pause(); });
        audio.play();
      } else {
        audio.pause();
      }
    });
    audio.addEventListener('play', function () { btn.innerHTML = PAUSE; btn.setAttribute('aria-label', 'Pause ' + label); });
    audio.addEventListener('pause', function () { btn.innerHTML = PLAY; btn.setAttribute('aria-label', 'Play ' + label); });
    audio.addEventListener('timeupdate', function () {
      var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      fill.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', String(Math.round(pct)));
      // Wix shows elapsed / total on desktop and time remaining on mobile.
      if (narrow.matches && audio.duration) {
        time.textContent = '-' + fmt(audio.duration - audio.currentTime);
      } else {
        time.textContent = fmt(audio.currentTime) + ' / ' + (audio.duration ? fmt(audio.duration) : el.dataset.duration || '--:--');
      }
    });
    function seek(clientX) {
      var r = bar.getBoundingClientRect();
      var pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      if (audio.duration) audio.currentTime = pct * audio.duration;
    }
    bar.addEventListener('click', function (e) { seek(e.clientX); });
    bar.addEventListener('keydown', function (e) {
      if (!audio.duration) return;
      if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
      if (e.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
  });
})();
