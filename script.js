// ==========================================
// PERFECT NAVIGATION ACTIVE STATE
// Fixes: Home button stuck, proper section tracking
// ==========================================

(function() {
  'use strict';

  // ==========================================
  // 1. GET ELEMENTS
  // ==========================================
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('#home, #portfolio, #services, #contact');
  
  // Section ID to nav link mapping
  const linkMap = {};
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      linkMap[href.substring(1)] = link;
    }
  });

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
    // If we're within 50px of the bottom
    return (scrollY + windowHeight >= documentHeight - 50);
  }

  // ==========================================
  // 4. UPDATE ACTIVE SECTION (with bottom detection)
  // ==========================================
  function updateActiveSection() {
    // ★★★ BUG FIX 1: If at bottom, force CONTACTS active ★★★
    if (isAtBottom()) {
      setActiveLink('contact');
      return;
    }

    // Otherwise, find the most visible section
    let bestSection = null;
    let bestScore = 0;

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the section is visible in the viewport
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(viewportHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const ratio = visibleHeight / rect.height;
      
      // Also consider sections that are in the center of viewport
      const centerY = viewportHeight / 2;
      const sectionCenter = (rect.top + rect.bottom) / 2;
      const distanceFromCenter = Math.abs(sectionCenter - centerY);
      const centerWeight = Math.max(0, 1 - (distanceFromCenter / viewportHeight));
      
      // Combined score: visibility ratio + center proximity bonus
      const score = ratio + (centerWeight * 0.3);
      
      if (score > bestScore) {
        bestScore = score;
        bestSection = sec;
      }
    });

    // If we found a section with visibility, update nav
    if (bestSection) {
      const sectionId = bestSection.getAttribute('id');
      setActiveLink(sectionId);
    } else {
      // Fallback: if no section is visible, check which one is closest
      let closestSection = null;
      let closestDistance = Infinity;
      const viewportCenter = window.innerHeight / 2;
      
      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        const sectionCenter = (rect.top + rect.bottom) / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = sec;
        }
      });
      
      if (closestSection) {
        const sectionId = closestSection.getAttribute('id');
        setActiveLink(sectionId);
      }
    }
  }

  // ==========================================
  // 5. INTERSECTION OBSERVER (Primary detection)
  // ==========================================
  const observer = new IntersectionObserver((entries) => {
    // Only update if we're not at bottom (handled by scroll listener)
    if (!isAtBottom()) {
      updateActiveSection();
    }
  }, {
    threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    rootMargin: '0px 0px -80px 0px'
  });

  sections.forEach(sec => observer.observe(sec));

  // ==========================================
  // 6. SCROLL LISTENER (with bottom detection)
  // ==========================================
  let scrollTimeout;

  function handleScroll() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      updateActiveSection();
    }, 50);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ==========================================
  // 7. CLICK HANDLER (manual override for clicks)
  // ==========================================
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        // Immediately update active state
        removeAllActive();
        this.classList.add('active');
      }
    });
  });

  // ==========================================
  // 8. INITIAL SETUP ON PAGE LOAD
  // ==========================================
  function initialize() {
    // Check initial hash
    const hash = window.location.hash || '#home';
    const targetElement = document.querySelector(hash);
    
    if (targetElement) {
      setActiveLink(hash.replace('#', ''));
    } else {
      // Default to home
      setActiveLink('home');
    }

    // Update after layout settles
    setTimeout(updateActiveSection, 150);
  }

  window.addEventListener('load', function() {
    setTimeout(initialize, 100);
  });

  // Also run if DOM is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initialize, 100);
  }

  // ==========================================
  // 9. RESIZE HANDLER (recalculate on resize)
  // ==========================================
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateActiveSection, 200);
  });

  console.log('✅ Navigation Active State System Active');
  console.log('   - Bottom detection: Contacts highlighted at page end');
  console.log('   - Real-time section tracking with IntersectionObserver');
  console.log('   - Center proximity scoring for accurate detection');

})();
