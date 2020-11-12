// Import Alpine.js
import 'alpinejs';

// Import Cruip utilities
import { focusHandling } from 'cruip-js-toolkit';

// Import aos
import AOS from 'aos';

AOS.init({
  once: true,
  disable: 'phone',
  duration: 600,
  easing: 'ease-out-sine',
});

// import component from './components/component';

document.addEventListener('DOMContentLoaded', () => {
  focusHandling();
});
