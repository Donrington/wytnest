/*!
 * wytnest embed v1.0
 * Drop one <script> tag on any page to render a Wytnest testimonial widget.
 *
 * Usage:
 *   <script src="https://wytnest.com/embed.js" data-widget="YOUR_PUBLIC_ID" async></script>
 *
 * Optional attributes:
 *   data-target="#my-div"   — mount into a specific element (defaults to appending to <body>)
 *   data-theme="dark|light" — override the widget's saved theme
 */

;(function () {
  'use strict'

  // Capture script src while document.currentScript is still valid (sync execution)
  var scriptTag = document.currentScript
  var ORIGIN = scriptTag ? new URL(scriptTag.src).origin : window.location.origin

  var widgetId    = scriptTag && scriptTag.dataset.widget
  var targetSel   = (scriptTag && scriptTag.dataset.target) || null
  var themeOver   = scriptTag && scriptTag.dataset.theme

  if (!widgetId) {
    console.warn('[Wytnest] Missing data-widget attribute on embed script.')
    return
  }

  // ── Mount point ────────────────────────────────────────────

  function getMount() {
    if (targetSel) {
      var el = document.querySelector(targetSel)
      if (el) return el
    }
    var el = document.createElement('div')
    document.body.appendChild(el)
    return el
  }

  // ── Init ───────────────────────────────────────────────────

  function init() {
    var mount = getMount()
    var shadow = mount.attachShadow({ mode: 'open' })

    fetch(ORIGIN + '/api/widget/' + widgetId)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status)
        return res.json()
      })
      .then(function (data) {
        var widget = data.widget
        var testimonials = data.testimonials
        var workspace = data.workspace

        if (!testimonials || !testimonials.length) return

        var theme  = themeOver || widget.theme
        var accent = widget.accent_color || (workspace && workspace.brand_color) || '#6366f1'

        shadow.innerHTML = buildHTML(widget, testimonials, theme, accent)

        loadGSAP().then(function () {
          animateWidget(shadow, widget.layout)
        })

        fireEvent('impression', widget.id, widget.workspace_id)

        shadow.querySelectorAll('[data-tid]').forEach(function (el) {
          el.addEventListener('click', function () {
            fireEvent('click', widget.id, widget.workspace_id, el.dataset.tid)
          })
        })

        shadow.querySelectorAll('video').forEach(function (video) {
          video.addEventListener('play', function () {
            var card = video.closest('[data-tid]')
            fireEvent('video_play', widget.id, widget.workspace_id, card && card.dataset.tid)
          })
          var completed = false
          video.addEventListener('timeupdate', function () {
            if (!completed && video.duration > 0 && video.currentTime / video.duration > 0.8) {
              completed = true
              var card = video.closest('[data-tid]')
              fireEvent('video_complete', widget.id, widget.workspace_id, card && card.dataset.tid)
            }
          })
        })
      })
      .catch(function (err) {
        console.warn('[Wytnest] Failed to load widget:', err)
      })
  }

  // ── HTML builders ──────────────────────────────────────────

  function buildHTML(widget, testimonials, theme, accent) {
    var css   = buildCSS(theme, accent, widget)
    var cards = testimonials.map(buildCard).join('')
    var bdg   = widget.show_wytnest_badge ? badge() : ''

    if (widget.layout === 'bento_wall') {
      return '<style>' + css + '</style>' +
        '<div class="wyt-root wyt-bento">' +
          '<div class="wyt-grid">' + cards + '</div>' +
          bdg +
        '</div>'
    }

    if (widget.layout === 'cinematic_slider') {
      return '<style>' + css + '</style>' +
        '<div class="wyt-root wyt-slider">' +
          '<div class="wyt-track">' + cards + '</div>' +
          '<button class="wyt-prev" aria-label="Previous">&#8249;</button>' +
          '<button class="wyt-next" aria-label="Next">&#8250;</button>' +
          bdg +
        '</div>'
    }

    if (widget.layout === 'ticker') {
      var doubled = cards + cards
      return '<style>' + css + '</style>' +
        '<div class="wyt-root wyt-ticker">' +
          '<div class="wyt-ticker-track">' + doubled + '</div>' +
          bdg +
        '</div>'
    }

    return '<style>' + css + '</style><div class="wyt-root">' + cards + '</div>'
  }

  function buildCard(t) {
    var rating = t.submitter_rating
      ? '★'.repeat(t.submitter_rating) + '☆'.repeat(5 - t.submitter_rating)
      : ''

    var avatar = t.submitter_avatar_url
      ? '<img class="wyt-avatar" src="' + esc(t.submitter_avatar_url) + '" alt="' + esc(t.submitter_name) + '" loading="lazy" />'
      : '<div class="wyt-avatar wyt-initials">' + initials(t.submitter_name) + '</div>'

    var media = (t.type === 'video' && t.video_playback_url)
      ? '<div class="wyt-video-wrap">' +
          '<video src="' + esc(t.video_playback_url) + '"' +
                 (t.video_thumbnail_url ? ' poster="' + esc(t.video_thumbnail_url) + '"' : '') +
                 ' controls preload="none" playsinline></video>' +
        '</div>'
      : ''

    var text = t.text_content
      ? '<div class="wyt-quote-mark">“</div>' +
        '<p class="wyt-text">' + escHtml(t.text_content) + '</p>'
      : ''

    var roleStr = [t.submitter_role, t.submitter_company].filter(Boolean).join(' \xB7 ')

    return '<div class="wyt-card" data-tid="' + esc(t.id) + '">' +
      media +
      (rating ? '<div class="wyt-stars">' + rating + '</div>' : '') +
      text +
      '<div class="wyt-author">' +
        avatar +
        '<div class="wyt-author-info">' +
          '<span class="wyt-name">' + escHtml(t.submitter_name) + '</span>' +
          (roleStr ? '<span class="wyt-role">' + escHtml(roleStr) + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>'
  }

  function buildCSS(theme, accent, widget) {
    var isDark = theme === 'dark' ||
      (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    var text    = isDark ? '#e8e6f4'                    : '#0f0f11'
    var muted   = isDark ? '#9390b8'                    : '#6b7280'
    var border  = isDark ? 'rgba(255,255,255,0.09)'     : 'rgba(0,0,0,0.07)'
    var cardBg  = isDark ? 'rgba(255,255,255,0.045)'    : 'rgba(255,255,255,0.82)'
    var inset   = isDark ? 'inset 0 1px 0 rgba(255,255,255,0.07)' : 'inset 0 1px 0 rgba(255,255,255,0.95)'
    var shadow  = isDark
      ? '0 4px 28px rgba(0,0,0,0.28), ' + inset
      : '0 2px 14px rgba(0,0,0,0.07), ' + inset
    var hoverBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)'
    var hoverShadow = isDark
      ? '0 8px 40px rgba(0,0,0,0.35), ' + inset
      : '0 6px 28px rgba(0,0,0,0.10), ' + inset
    var radius  = (widget.border_radius != null ? widget.border_radius : 16) + 'px'
    var speed   = (widget.layout_config && widget.layout_config.speed) || 40

    return [
      ':host { all: initial; font-family: ' + (widget.font_family || 'Inter') + ', system-ui, sans-serif; display: block; }',

      /* Root is fully transparent — host page shows through */
      '.wyt-root { --accent: ' + accent + '; box-sizing: border-box; background: transparent; }',
      '*, *::before, *::after { box-sizing: inherit; margin: 0; padding: 0; }',

      /* Bento grid */
      '.wyt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 14px; }',

      /* Slider */
      '.wyt-slider { position: relative; overflow: hidden; padding: 2px; }',
      '.wyt-track { display: flex; gap: 14px; }',
      '.wyt-track .wyt-card { min-width: 300px; max-width: 420px; flex-shrink: 0; }',
      '.wyt-prev, .wyt-next { position: absolute; top: 50%; transform: translateY(-50%); background: ' + cardBg + '; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid ' + border + '; border-radius: 50%; width: 36px; height: 36px; font-size: 20px; line-height: 36px; text-align: center; color: ' + text + '; cursor: pointer; z-index: 2; }',
      '.wyt-prev { left: 8px; } .wyt-next { right: 8px; }',

      /* Ticker */
      '.wyt-ticker { overflow: hidden; }',
      '.wyt-ticker-track { display: flex; gap: 14px; width: max-content; animation: wyt-scroll ' + speed + 's linear infinite; }',
      '.wyt-ticker:hover .wyt-ticker-track { animation-play-state: paused; }',
      '@keyframes wyt-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }',
      '.wyt-ticker .wyt-card { min-width: 280px; flex-shrink: 0; }',

      /* Card — glassmorphism */
      '.wyt-card { background: ' + cardBg + '; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid ' + border + '; border-radius: ' + radius + '; padding: 24px; display: flex; flex-direction: column; gap: 0; box-shadow: ' + shadow + '; opacity: 0; transform: translateY(12px); transition: border-color 0.22s ease, box-shadow 0.22s ease; }',
      '.wyt-card:hover { border-color: ' + hoverBorder + '; box-shadow: ' + hoverShadow + '; }',

      /* Video */
      '.wyt-video-wrap { border-radius: calc(' + radius + ' - 6px); overflow: hidden; margin-bottom: 16px; }',
      '.wyt-video-wrap video { width: 100%; display: block; max-height: 220px; object-fit: cover; }',

      /* Stars */
      '.wyt-stars { color: var(--accent); font-size: 13px; letter-spacing: 3px; margin-bottom: 10px; }',

      /* Decorative opening quote */
      '.wyt-quote-mark { font-family: Georgia, "Times New Roman", serif; font-size: 36px; line-height: 1; color: var(--accent); opacity: 0.45; margin-bottom: 6px; }',

      /* Text */
      '.wyt-text { font-size: 14px; line-height: 1.72; color: ' + text + '; opacity: 0.88; flex: 1; }',

      /* Author — separated by a hairline */
      '.wyt-author { display: flex; align-items: center; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid ' + border + '; }',
      '.wyt-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }',
      '.wyt-initials { display: flex; align-items: center; justify-content: center; background: rgba(99,102,241,0.14); color: var(--accent); font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }',
      '.wyt-author-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }',
      '.wyt-name { font-size: 13px; font-weight: 600; color: ' + text + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.wyt-role { font-size: 11.5px; color: ' + muted + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',

      /* Badge */
      '.wyt-badge { display: flex; justify-content: center; margin-top: 18px; font-size: 10px; color: ' + muted + '; opacity: 0.45; letter-spacing: 0.04em; }',
      '.wyt-badge a { color: inherit; text-decoration: none; }',
      '.wyt-badge a:hover { opacity: 0.7; }',

      '@media (prefers-reduced-motion: reduce) { .wyt-card { opacity: 1; transform: none; transition: none; } .wyt-ticker-track { animation: none; } }',
    ].join('\n')
  }

  function badge() {
    return '<div class="wyt-badge"><a href="https://wytnest.com" target="_blank" rel="noopener">Powered by Wytnest</a></div>'
  }

  // ── GSAP ───────────────────────────────────────────────────

  function loadGSAP() {
    return new Promise(function (resolve) {
      if (window.gsap) { resolve(); return }
      var s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js'
      s.onload = function () { resolve() }
      s.onerror = function () { resolve() } // non-fatal
      document.head.appendChild(s)
    })
  }

  function animateWidget(root, layout) {
    var gsap = window.gsap
    var cards = root.querySelectorAll('.wyt-card')

    if (layout === 'bento_wall' && gsap) {
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' })
    } else if (layout === 'cinematic_slider') {
      if (gsap) gsap.to(cards, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })

      var current = 0
      var track = root.querySelector('.wyt-track')

      root.querySelector('.wyt-next') && root.querySelector('.wyt-next').addEventListener('click', function () {
        current = Math.min(current + 1, cards.length - 1)
        var cardW = (cards[0] && cards[0].offsetWidth + 16) || 336
        if (gsap) {
          gsap.to(track, { x: -current * cardW, duration: 0.5, ease: 'power2.inOut' })
        } else {
          track.style.transform = 'translateX(' + (-current * cardW) + 'px)'
        }
      })

      root.querySelector('.wyt-prev') && root.querySelector('.wyt-prev').addEventListener('click', function () {
        current = Math.max(current - 1, 0)
        var cardW = (cards[0] && cards[0].offsetWidth + 16) || 336
        if (gsap) {
          gsap.to(track, { x: -current * cardW, duration: 0.5, ease: 'power2.inOut' })
        } else {
          track.style.transform = 'translateX(' + (-current * cardW) + 'px)'
        }
      })
    } else if (layout === 'ticker') {
      if (gsap) gsap.to(cards, { opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: 'power1.out' })
    } else {
      // No GSAP — just reveal
      cards.forEach(function (c) { c.style.opacity = '1'; c.style.transform = 'none' })
    }
  }

  // ── Analytics ──────────────────────────────────────────────

  function fireEvent(type, widgetUuid, workspaceId, testimonialId) {
    if (!widgetUuid) return
    try {
      var payload = JSON.stringify({
        widget_id:     widgetUuid,
        workspace_id:  workspaceId,
        event_type:    type,
        testimonial_id: testimonialId || null,
        session_id:    getSessionId(),
        page_url:      location.href,
        referrer:      document.referrer || null,
      })
      navigator.sendBeacon(
        ORIGIN + '/api/analytics',
        new Blob([payload], { type: 'application/json' }),
      )
    } catch (_) {}
  }

  function getSessionId() {
    try {
      var key = 'wyt_sid'
      var id = sessionStorage.getItem(key)
      if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(key, id) }
      return id
    } catch (_) {
      return 'unknown'
    }
  }

  // ── Helpers ───────────────────────────────────────────────

  function initials(name) {
    return (name || '?').split(' ').map(function (n) { return n[0] || '' }).join('').slice(0, 2).toUpperCase()
  }

  function esc(str) {
    return String(str || '').replace(/"/g, '&quot;')
  }

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  // ── Boot ───────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

})()
