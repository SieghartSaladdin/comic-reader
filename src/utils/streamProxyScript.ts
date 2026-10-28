/**
 * Injected script for the anime stream proxy iframe.
 * Adds support for:
 * 1. Hold-to-2x speed playback (like YouTube's hold-to-2x feature).
 * 2. Floating minimalist black-matte speed badge.
 * 3. postMessage listener to control playbackRate from the parent frame.
 * 4. Click & pause event suppression on hold release to prevent pausing video.
 */
export const INJECTED_PLAYER_SCRIPT = `
(function() {
  if (window.__HOLD_TO_2X_INJECTED__) return;
  window.__HOLD_TO_2X_INJECTED__ = true;

  var basePlaybackRate = 1.0;
  var isHolding = false;
  var justReleasedHold = false;
  var lastHoldEndTime = 0;
  var holdTimer = null;
  var hideBadgeTimer = null;
  var releaseResetTimer = null;

  var badge = document.createElement('div');
  badge.id = 'stream-player-speed-badge';
  badge.innerHTML = '<span>2x aktif</span>';
  badge.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483647;display:none;align-items:center;gap:8px;background:#121214;color:#ffffff;padding:6px 14px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,0.2);pointer-events:none;user-select:none;transition:opacity 0.15s ease;';

  function attachBadge() {
    if (document.body && !document.body.contains(badge)) document.body.appendChild(badge);
  }

  function showBadge(text, autoHideDuration) {
    attachBadge();
    if (text) badge.innerHTML = '<span>' + text + '</span>';
    badge.style.display = 'flex';
    badge.style.opacity = '1';
    if (hideBadgeTimer) { clearTimeout(hideBadgeTimer); hideBadgeTimer = null; }
    if (autoHideDuration) {
      hideBadgeTimer = setTimeout(function() {
        badge.style.opacity = '0';
        setTimeout(function() { if (!isHolding) badge.style.display = 'none'; }, 150);
      }, autoHideDuration);
    }
  }

  function hideBadge() {
    if (hideBadgeTimer) clearTimeout(hideBadgeTimer);
    badge.style.opacity = '0';
    setTimeout(function() { if (!isHolding) badge.style.display = 'none'; }, 150);
  }

  function hookVideo(v) {
    if (!v || v.__holdPauseHooked) return;
    v.__holdPauseHooked = true;
    v.addEventListener('pause', function() {
      if (justReleasedHold || (Date.now() - lastHoldEndTime < 350)) {
        v.play().catch(function() {});
      }
    });
  }

  function findVideo() {
    var v = document.querySelector('video');
    if (v) { hookVideo(v); return v; }
    try {
      var iframes = document.querySelectorAll('iframe');
      for (var i = 0; i < iframes.length; i++) {
        var innerV = iframes[i].contentDocument && iframes[i].contentDocument.querySelector('video');
        if (innerV) { hookVideo(innerV); return innerV; }
      }
    } catch (e) {}
    return null;
  }

  function setVideoSpeed(rate, notify) {
    var video = findVideo();
    if (video) video.playbackRate = rate;
    if (notify) showBadge(rate + 'x Speed', 1200);
  }

  function activateHold() {
    var video = findVideo();
    if (!video) return;
    isHolding = true;
    if (video.paused) video.play().catch(function() {});
    video.playbackRate = 2.0;
    showBadge('2x Speed');
  }

  function releaseHold() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    if (!isHolding) return;
    isHolding = false;
    justReleasedHold = true;
    lastHoldEndTime = Date.now();
    var video = findVideo();
    if (video) {
      video.playbackRate = basePlaybackRate;
      if (video.paused) video.play().catch(function() {});
      setTimeout(function() { if (video.paused) video.play().catch(function() {}); }, 50);
    }
    hideBadge();
    if (releaseResetTimer) clearTimeout(releaseResetTimer);
    releaseResetTimer = setTimeout(function() { justReleasedHold = false; }, 350);
  }

  function suppressClickIfHolding(e) {
    if (justReleasedHold || (Date.now() - lastHoldEndTime < 350)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      var video = findVideo();
      if (video && video.paused) video.play().catch(function() {});
      return false;
    }
  }
  window.addEventListener('click', suppressClickIfHolding, true);
  document.addEventListener('click', suppressClickIfHolding, true);

  function suppressPauseIfHolding(e) {
    if (justReleasedHold || (Date.now() - lastHoldEndTime < 350)) {
      var video = (e && e.target && e.target.tagName === 'VIDEO') ? e.target : findVideo();
      if (video && video.paused) video.play().catch(function() {});
    }
  }
  window.addEventListener('pause', suppressPauseIfHolding, true);
  document.addEventListener('pause', suppressPauseIfHolding, true);

  function suppressContextMenu(e) {
    if (isHolding || justReleasedHold || (Date.now() - lastHoldEndTime < 350)) {
      e.preventDefault();
      return false;
    }
  }
  window.addEventListener('contextmenu', suppressContextMenu, true);
  document.addEventListener('contextmenu', suppressContextMenu, true);

  function isExcludedTarget(target) {
    if (!target) return false;
    var el = target;
    if (el.tagName && el.tagName.toLowerCase() === 'video') return false;
    while (el && el !== document.body && el !== document.documentElement) {
      var tag = (el.tagName || '').toLowerCase();
      if (tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea') return true;
      var cls = typeof el.className === 'string' ? el.className : '';
      if (/control|progress|time|volume|button|settings/i.test(cls)) return true;
      el = el.parentElement;
    }
    return false;
  }

  // Pointer hold event listeners
  document.addEventListener('pointerdown', function(e) {
    if (e.button !== 0 || isExcludedTarget(e.target) || !findVideo()) return;
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = setTimeout(activateHold, 180);
  }, true);

  var cancelEvents = ['pointerup', 'pointercancel', 'mouseup', 'mouseleave', 'touchend', 'touchcancel'];
  for (var i = 0; i < cancelEvents.length; i++) {
    window.addEventListener(cancelEvents[i], releaseHold, true);
    document.addEventListener(cancelEvents[i], releaseHold, true);
  }

  // PostMessage listener from parent frame
  window.addEventListener('message', function(e) {
    var data = e.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'SET_SPEED' || data.type === 'setPlaybackRate' || data.action === 'setPlaybackRate') {
      var r = Number(data.rate || data.playbackRate || 1.0);
      if (!isNaN(r) && r > 0) {
        basePlaybackRate = r;
        setVideoSpeed(r, true);
      }
    } else if (data.type === 'HOLD_SPEED_START') {
      activateHold();
    } else if (data.type === 'HOLD_SPEED_END') {
      releaseHold();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachBadge);
  } else {
    attachBadge();
  }

  try {
    var observer = new MutationObserver(function() {
      if (findVideo()) attachBadge();
    });
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {}
})();
`;

/**
 * Injects the interaction script into the HTML stream.
 */
export function injectPlayerScript(html: string): string {
  const scriptTag = `<script id="otakudesu-player-speed-inject">${INJECTED_PLAYER_SCRIPT}</script>`;
  if (html.includes('</body>')) return html.replace('</body>', `${scriptTag}</body>`);
  if (html.includes('</BODY>')) return html.replace('</BODY>', `${scriptTag}</BODY>`);
  return html + scriptTag;
}
