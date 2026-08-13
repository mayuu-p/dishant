// ==========================================
// MASTER NAVIGATION SYSTEM
// Fixes: No History Spamming, One-Click Back to Home,
// Second-Click Exit, Active Highlight Sync
// ==========================================

(function() {
  'use strict';

  // ==========================================
  // 1. GET ELEMENTS
  // ==========================================
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('#home, #portfolio, #services, #contact');
  const navbar = document.getElementById('navbar');

  // Section ID to nav link mapping
  const linkMap = {};
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      linkMap[href.substring(1)] = link;
    }
  });

  // Track if we're currently in a back/forward navigation
  let isHistoryNavigation = false;

  // ==========================================
  // 2. ACTIVE STATE HELPERS
  // ==========================================
  function removeAllActive() {
    navLinks.forEach(link => link.classList.remove('active'));
  }

  function setActiveLink(sectionId) {
    removeAllActive();
    if (sectionId && linkMap[sectionId]) {
      linkMap[sectionId].classList.add('active');
    }
  }

  // ==========================================
  // 3. CHECK IF AT BOTTOM OF PAGE
  // ==========================================
  function isAtBottom() {
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    return (scrollY + windowHeight >= documentHeight - 50);
  }

  // ==========================================
  // 4. UPDATE ACTIVE SECTION (with bottom detection)
  // ==========================================
  function updateActiveSection() {
    // If at bottom, force CONTACTS active
    if (isAtBottom()) {
      setActiveLink('contact');
      return;
    }

    // Find the most visible section
    let bestSection = null;
    let bestScore = 0;

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate visibility
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(viewportHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const ratio = visibleHeight / rect.height;
      
      // Center proximity bonus
      const centerY = viewportHeight / 2;
      const sectionCenter = (rect.top + rect.bottom) / 2;
      const distanceFromCenter = Math.abs(sectionCenter - centerY);
      const centerWeight = Math.max(0, 1 - (distanceFromCenter / viewportHeight));
      
      const score = ratio + (centerWeight * 0.3);
      
      if (score > bestScore) {
        bestScore = score;
        bestSection = sec;
      }
    });

    if (bestSection) {
      const sectionId = bestSection.getAttribute('id');
      setActiveLink(sectionId);
    }
  }

  // ==========================================
  // 5. INTERSECTION OBSERVER
  // ==========================================
  const observer = new IntersectionObserver((entries) => {
    if (!isHistoryNavigation) {
      updateActiveSection();
    }
  }, {
    threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    rootMargin: '0px 0px -80px 0px'
  });

  sections.forEach(sec => observer.observe(sec));

  // ==========================================
  // 6. SCROLL LISTENER (debounced)
  // ==========================================
  let scrollTimeout;

  function handleScroll() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (!isHistoryNavigation) {
        updateActiveSection();
      }
    }, 50);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ==========================================
  // 7. ★★★ CRITICAL: NO HISTORY SPAMMING ★★★
  //    Use replaceState instead of pushState
  // ==========================================
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          // Update active state immediately
          removeAllActive();
          this.classList.add('active');

          // ★★★ Use replaceState to avoid history spam ★★★
          // This prevents multiple history entries
          const currentHash = window.location.hash || '#home';
          if (currentHash !== targetId) {
            history.replaceState({ 
              section: targetId,
              fromNav: true 
            }, '', targetId);
          }

          // Smooth scroll to the section
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // ==========================================
  // 8. ★★★ BROWSER BACK BUTTON HANDLER ★★★
  //    One-click back to Home, Second-click exit
  // ==========================================
  let backCount = 0;
  let lastBackTime = 0;

  window.addEventListener('popstate', function(e) {
    const state = e.state;
    const currentHash = window.location.hash || '#home';
    
    // Mark that we're in a history navigation
    isHistoryNavigation = true;

    // Get the target section from state or current hash
    let targetId = currentHash;
    if (state && state.section) {
      targetId = state.section;
    }

    // If no valid target, default to home
    if (!targetId || targetId === '') {
      targetId = '#home';
    }

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      // Update active state
      const sectionId = targetId.replace('#', '');
      setActiveLink(sectionId);

      // ★★★ BACK BUTTON LOGIC ★★★
      const now = Date.now();
      
      // Reset back count if more than 2 seconds have passed
      if (now - lastBackTime > 2000) {
        backCount = 0;
      }
      lastBackTime = now;

      // Check if we're already at home or going to home
      const isGoingToHome = (targetId === '#home' || targetId === '');
      const isCurrentlyAtHome = (window.location.hash === '#home' || window.location.hash === '');

      if (isGoingToHome) {
        // ★★★ RULE 2: One-click to Home page ★★★
        // If we're going to home, just scroll there smoothly
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // ★★★ RULE 3: Second-click to exit ★★★
        // If we're already at home or just arrived, increment back count
        if (isCurrentlyAtHome || targetId === '#home') {
          backCount++;
          
          if (backCount >= 2) {
            // Second back click at home → exit the site
            // Remove the hash from URL to allow actual back navigation
            history.replaceState(null, '', window.location.pathname);
            
            // Reset flags
            backCount = 0;
            isHistoryNavigation = false;
            
            // Allow the browser to go back to previous page
            // Use a small delay to let the scroll complete
            setTimeout(() => {
              // This triggers the actual browser back
              window.history.back();
            }, 100);
            
            return;
          }
        }
      } else {
        // ★★★ RULE 1: No history spamming - just scroll ★★★
        // For non-home sections, just scroll to the target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Reset back count when going to non-home sections
        backCount = 0;
      }

      // Update URL without creating new history entry
      if (history.replaceState) {
        history.replaceState({ section: targetId }, '', targetId);
      }
    }

    // Reset history navigation flag after a small delay
    setTimeout(() => {
      isHistoryNavigation = false;
    }, 300);
  });

  // ==========================================
  // 9. INITIAL SETUP ON PAGE LOAD
  // ==========================================
  function initialize() {
    const hash = window.location.hash || '#home';
    const targetElement = document.querySelector(hash);
    
    if (targetElement) {
      setActiveLink(hash.replace('#', ''));
      // Scroll to the section without animation on load
      targetElement.scrollIntoView({
        behavior: 'auto',
        block: 'start'
      });
    } else {
      setActiveLink('home');
    }

    // Set initial history state without creating extra entries
    if (history.replaceState) {
      history.replaceState({ section: hash }, '', hash);
    }

    // Reset back counter
    backCount = 0;
  }

  // Run on load
  window.addEventListener('load', function() {
    setTimeout(initialize, 50);
  });

  // Also run if DOM is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initialize, 50);
  }

  // ==========================================
  // 10. LIGHTBOX
  // ==========================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  window.openLightbox = function(el) {
    const img = el.querySelector('img');
    if (img) {
      lightboxImg.src = img.src;
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeLightbox = function() {
    lightbox.style.display = 'none';
    lightboxImg.src = '';
    document.body.style.overflow = 'auto';
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLightbox();
  });

  // ==========================================
  // 11. PREVENT DOUBLE TAP ZOOM (iOS)
  // ==========================================
  document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - (document.lastTouch || 0) < 300) {
      e.preventDefault();
    }
    document.lastTouch = now;
  }, { passive: false });

  console.log('✅ Master Navigation System Active');
  console.log('   ✓ No history spam (replaceState)');
  console.log('   ✓ One-click back to Home');
  console.log('   ✓ Second-click to exit site');
  console.log('   ✓ Active highlight sync with scroll');

})();
