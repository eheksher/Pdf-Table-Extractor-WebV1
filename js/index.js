// Modal Functions
function openModal(type) {
  const modal = document.getElementById(type + 'Modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Focus on first input
  setTimeout(() => {
    const firstInput = modal.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
  }, 300);
}

function closeModal() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = 'auto';
}

// Form handling functions
function handleLogin(event) {
  event.preventDefault();
  
  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  
  btn.innerHTML = 'נכנס...';
  btn.style.opacity = '0.7';
  
  // כאן תוכל להוסיף לוגיקה של כניסה
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.style.opacity = '1';
    closeModal();
    // מעבר לעמוד הראשי של המערכת
    window.location.href = 'pdf-extractor.html';
  }, 2000);
}

function handleRegister(event) {
  event.preventDefault();
  
  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  
  btn.innerHTML = 'נרשם...';
  btn.style.opacity = '0.7';
  
  // כאן תוכל להוסיף לוגיקה של הרשמה
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.style.opacity = '1';
    closeModal();
    // מעבר לעמוד הראשי של המערכת
    window.location.href = 'pdf-extractor.html';
  }, 2000);
}

function startTrial() {
  // מעבר לעמוד הניסיון החינמי
  window.location.href = 'pdf-extractor_free.html';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Form submissions
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      // Loading state
      submitBtn.innerHTML = 'מעבד...';
      submitBtn.style.opacity = '0.7';
      
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.opacity = '1';
        closeModal();
        alert('פעולה בוצעה בהצלחה!');
      }, 2000);
    });
  });

  // Add entrance animation
  const elements = document.querySelectorAll('.content > *');
  elements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.2}s`;
  });

  // Smooth scroll behavior
  document.documentElement.style.scrollBehavior = 'smooth';
});

// Add parallax effect to floating shapes
window.addEventListener('scroll', function() {
  const shapes = document.querySelectorAll('.floating-shape');
  const scrolled = window.pageYOffset;
  
  shapes.forEach((shape, index) => {
    const rate = scrolled * (0.5 + index * 0.1);
    shape.style.transform = `translateY(${rate}px)`;
  });
});

// Add mouse move parallax effect
document.addEventListener('mousemove', function(e) {
  const shapes = document.querySelectorAll('.floating-shape');
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;
  
  shapes.forEach((shape, index) => {
    const moveX = (mouseX - 0.5) * (20 + index * 10);
    const moveY = (mouseY - 0.5) * (20 + index * 10);
    
    shape.style.transform += ` translate(${moveX}px, ${moveY}px)`;
  });
});

// Performance optimization - reduce animations on low-end devices
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
  document.documentElement.style.setProperty('--animation-duration', '0.1s');
}