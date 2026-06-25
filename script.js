/* =========================================================
   Mil 守谷店 — site script (vanilla JS, no dependencies)
   CSS と合意済みのクラス契約:
     - #hamburger クリックで #gnav.is-open / #hamburger.is-active / body.nav-open をトグル
     - #gnav 内リンククリックでメニューを閉じる
     - window.scrollY > 20 で .site-header.is-scrolled を付与/除去
     - Escape キーでメニューを閉じる
   要素が無くてもエラーにならない防御的実装。
   ========================================================= */
(function () {
  'use strict';

  function init() {
    var SCROLL_THRESHOLD = 20;

    var hamburger = document.getElementById('hamburger');
    var gnav = document.getElementById('gnav');
    var header = document.querySelector('.site-header');
    var body = document.body;

    /* ---- メニュー開閉ヘルパー ---- */

    function isMenuOpen() {
      return !!gnav && gnav.classList.contains('is-open');
    }

    function openMenu() {
      if (gnav) gnav.classList.add('is-open');
      if (hamburger) {
        hamburger.classList.add('is-active');
        hamburger.setAttribute('aria-expanded', 'true');
      }
      if (body) body.classList.add('nav-open');
    }

    function closeMenu() {
      if (gnav) gnav.classList.remove('is-open');
      if (hamburger) {
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
      if (body) body.classList.remove('nav-open');
    }

    function toggleMenu() {
      if (isMenuOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    /* ---- ハンバーガー ---- */

    if (hamburger) {
      // 初期 aria 状態（aria-controls はメニュー本体を指す）
      hamburger.setAttribute('aria-expanded', 'false');
      if (gnav && gnav.id) {
        hamburger.setAttribute('aria-controls', gnav.id);
      }

      hamburger.addEventListener('click', function (e) {
        e.preventDefault();
        toggleMenu();
      });
    }

    /* ---- グローバルナビ内リンクで閉じる ---- */

    if (gnav) {
      gnav.addEventListener('click', function (e) {
        var target = e.target;
        // クリック対象（またはその祖先）が gnav 内の <a> なら閉じる
        while (target && target !== gnav) {
          if (target.tagName === 'A') {
            closeMenu();
            break;
          }
          target = target.parentNode;
        }
      });
    }

    /* ---- Escape キーで閉じる ---- */

    document.addEventListener('keydown', function (e) {
      var key = e.key || e.keyCode;
      if ((key === 'Escape' || key === 'Esc' || key === 27) && isMenuOpen()) {
        closeMenu();
        // フォーカスをトリガーへ戻す（アクセシビリティ）
        if (hamburger && typeof hamburger.focus === 'function') {
          hamburger.focus();
        }
      }
    });

    /* ---- スクロールでヘッダーの状態クラスを切り替え ---- */

    if (header) {
      var ticking = false;

      function applyScrollState() {
        var y = window.scrollY || window.pageYOffset || 0;
        if (y > SCROLL_THRESHOLD) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
        ticking = false;
      }

      function onScroll() {
        // rAF で間引き（パフォーマンス配慮）
        if (!ticking) {
          ticking = true;
          if (typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(applyScrollState);
          } else {
            applyScrollState();
          }
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });

      // 初期状態（リロード時に途中までスクロールされている場合に対応）
      applyScrollState();
    }

    /* ---- スクロールフェードイン ---- */

    if (typeof window.IntersectionObserver === 'function') {
      var fadeTargets = document.querySelectorAll(
        '.concept__card, .menu-block, .gallery__item, .faq__item, .access__info, .access__map'
      );

      var fadeObserver = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      fadeTargets.forEach(function (el, i) {
        el.classList.add('js-fade');
        el.style.transitionDelay = ((i % 4) * 70) + 'ms';
        fadeObserver.observe(el);
      });
    }
  }

  // DOMContentLoaded 後に初期化（すでに読み込み済みなら即時実行）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
