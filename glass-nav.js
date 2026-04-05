// Glass Navbar with Liquid Glass Effect
class GlassNav {
  constructor() {
    this.container = null;
    this.svgSupported = false;
    this.uniqueId = 'glass-nav-' + Date.now();
    this.mobileMenu = null;
    this.mobileMenuBtn = null;
    
    this.init();
  }

  init() {
    this.checkSVGSupport();
    this.setupMobileMenu();
    window.addEventListener('resize', () => this.onResize());
  }

  checkSVGSupport() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);

    if (isWebkit || isFirefox) {
      this.svgSupported = false;
      return;
    }

    const div = document.createElement('div');
    div.style.backdropFilter = `url(#${this.uniqueId})`;
    this.svgSupported = div.style.backdropFilter !== '';

    if (this.svgSupported) {
      const glassSurfaces = document.querySelectorAll('.glass-surface');
      glassSurfaces.forEach((surface, index) => {
        surface.classList.add('svg-supported');
        this.setupSVGFilterForSurface(surface, index);
      });
    }
  }

  setupSVGFilterForSurface(container, index = 0) {
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const actualWidth = rect.width || 800;
    const actualHeight = rect.height || 60;
    const borderRadius = 50;
    const borderWidth = 0.07;
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);
    const brightness = 50;
    const opacity = 0.93;
    const blur = 11;

    const filterId = `glass-filter-${this.uniqueId}-${index}`;
    const redGradId = `red-grad-${this.uniqueId}-${index}`;
    const blueGradId = `blue-grad-${this.uniqueId}-${index}`;

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: difference" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

    let svg = container.querySelector('svg');

    // Create an invisible SVG if the target does not already include one (e.g., cursor lens)
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.style.position = 'absolute';
      svg.style.inset = '0';
      svg.style.opacity = '0';
      svg.style.pointerEvents = 'none';
      svg.classList.add('glass-filter-layer');
      container.appendChild(svg);
    }

    svg.innerHTML = `
      <defs>
        <filter id="${filterId}" colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
          <feImage href="data:image/svg+xml,${encodeURIComponent(svgContent)}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
          
          <feDisplacementMap in="SourceGraphic" in2="map" scale="-180" xChannelSelector="R" yChannelSelector="G" result="dispRed" />
          <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 1 0" result="red" />
          
          <feDisplacementMap in="SourceGraphic" in2="map" scale="-170" xChannelSelector="R" yChannelSelector="G" result="dispGreen" />
          <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0, 0 1 0 0 0, 0 0 0 0 0, 0 0 0 1 0" result="green" />
          
          <feDisplacementMap in="SourceGraphic" in2="map" scale="-160" xChannelSelector="R" yChannelSelector="G" result="dispBlue" />
          <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 1 0 0, 0 0 0 1 0" result="blue" />
          
          <feBlend in="red" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blue" mode="screen" result="output" />
          <feGaussianBlur in="output" stdDeviation="0.7" />
        </filter>
      </defs>
    `;

    container.style.backdropFilter = `url(#${filterId}) saturate(1)`;
  }

  setupMobileMenu() {
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mobileMenuBtn = document.getElementById('mobile-menu-btn');

    if (this.mobileMenuBtn && this.mobileMenu) {
      // Handle both click and touch events for toggle button
      const toggleHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileMenu();
      };
      
      this.mobileMenuBtn.addEventListener('click', toggleHandler);
      this.mobileMenuBtn.addEventListener('touchstart', toggleHandler);
      
      // Close menu when clicking nav links - ONLY stop propagation, allow default navigation
      const mobileLinks = this.mobileMenu.querySelectorAll('.mobile-nav-links a');
      mobileLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.stopPropagation();
          // Close menu but allow the link to navigate naturally
          setTimeout(() => this.closeMobileMenu(), 0);
        });
      });

      // Close menu when clicking on the backdrop/menu itself
      this.mobileMenu.addEventListener('click', (e) => {
        if (e.target === this.mobileMenu) {
          e.stopPropagation();
          this.closeMobileMenu();
        }
      });
      
      this.mobileMenu.addEventListener('touchstart', (e) => {
        if (e.target === this.mobileMenu) {
          e.stopPropagation();
          this.closeMobileMenu();
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (this.mobileMenu.classList.contains('active') && 
            !this.mobileMenu.contains(e.target) && 
            !this.mobileMenuBtn.contains(e.target) &&
            !this.mobileMenuBtn.parentElement.contains(e.target)) {
          this.closeMobileMenu();
        }
      });
    }
  }

  toggleMobileMenu() {
    if (this.mobileMenu && this.mobileMenuBtn) {
      this.mobileMenu.classList.toggle('active');
      this.mobileMenuBtn.classList.toggle('active');
      
      // Prevent body scroll when menu is open
      if (this.mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  closeMobileMenu() {
    if (this.mobileMenu && this.mobileMenuBtn) {
      this.mobileMenu.classList.remove('active');
      this.mobileMenuBtn.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  onResize() {
    if (window.innerWidth > 1024) {
      this.closeMobileMenu();
    }
    
    if (this.svgSupported) {
      const glassSurfaces = document.querySelectorAll('.glass-surface');
      glassSurfaces.forEach((surface, index) => {
        setTimeout(() => this.setupSVGFilterForSurface(surface, index), 100);
      });
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GlassNav();
  });
} else {
  new GlassNav();
}
