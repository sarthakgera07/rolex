/* ==========================================================================
   Luxury Watch Website - JS App Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const preloader = document.getElementById('preloader');
  const progressCircle = document.getElementById('loading-progress');
  const loadingText = document.getElementById('loading-text');
  const canvas = document.getElementById('watch-canvas');
  const ctx = canvas.getContext('2d');
  const scrollContainer = document.getElementById('hero-scroll');
  const slides = document.querySelectorAll('.narrative-slide');
  
  // Customizer Elements
  const dialTint = document.getElementById('dial-tint');
  const dialBtns = document.querySelectorAll('.dial-btn');
  const dialNameDisplay = document.getElementById('selected-dial-name');

  // Animation Config
  const totalFrames = 240;
  const images = [];
  let loadedCount = 0;
  
  // Frame Interpolation
  let currentFrame = 0;
  let targetFrame = 0;
  const lerpEase = 0.07; // Smooth factor (lower is smoother/lagged, higher is faster response)

  // Loading Ring Calculations
  const radius = progressCircle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  progressCircle.style.strokeDashoffset = circumference;

  // Set Progress Indicator helper
  function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
    loadingText.textContent = `${Math.round(percent)}%`;
  }

  // Preload Images
  function preloadImages() {
    const framePath = 'watch_frames_24fps/frame_';
    
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(5, '0');
      img.src = `${framePath}${frameNum}.jpg`;
      
      img.onload = () => {
        loadedCount++;
        const percent = (loadedCount / totalFrames) * 100;
        setProgress(percent);
        
        if (loadedCount === totalFrames) {
          onPreloadComplete();
        }
      };
      
      img.onerror = () => {
        console.error(`Error loading frame: ${frameNum}`);
        loadedCount++;
        if (loadedCount === totalFrames) {
          onPreloadComplete();
        }
      };
      
      images.push(img);
    }
  }

  // Finish preloading
  function onPreloadComplete() {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      // Trigger canvas resize and initial draw
      resizeCanvas();
      
      // Start the smooth requestAnimationFrame loop
      requestAnimationFrame(renderLoop);
    }, 500);
  }

  // Canvas Drawing with 'contain' aspect ratio fitting
  function drawFrame(img) {
    if (!img || !img.complete) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const imgWidth = 1920;
    const imgHeight = 1080;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (canvasRatio > imgRatio) {
      // Canvas is wider than image aspect ratio
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgRatio;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    } else {
      // Canvas is taller than image aspect ratio
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    }
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  // Linear Interpolation (lerp) Rendering Loop
  function renderLoop() {
    // Smoothly transition current frame toward target frame
    currentFrame += (targetFrame - currentFrame) * lerpEase;
    
    // Safety check and index rounding
    let frameIndex = Math.round(currentFrame);
    frameIndex = Math.max(0, Math.min(totalFrames - 1, frameIndex));
    
    // Draw the active image
    drawFrame(images[frameIndex]);
    
    // Sync text slides
    updateNarrativeSlides(currentFrame);
    
    // Loop
    requestAnimationFrame(renderLoop);
  }

  // Scroll Tracking Logic
  function handleScroll() {
    const rect = scrollContainer.getBoundingClientRect();
    const scrollDistance = -rect.top; // Pixels container has scrolled past viewport top
    const scrollMax = rect.height - window.innerHeight;
    
    let scrollPercent = scrollDistance / scrollMax;
    scrollPercent = Math.max(0, Math.min(1, scrollPercent));
    
    // Update target frame index (0 to 239)
    targetFrame = scrollPercent * (totalFrames - 1);
  }

  // Narrative Slides Activation
  function updateNarrativeSlides(frameValue) {
    slides.forEach(slide => {
      const start = parseInt(slide.dataset.frameStart, 10);
      const end = parseInt(slide.dataset.frameEnd, 10);
      
      if (frameValue >= start && frameValue <= end) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }

  // Handle Resize
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Re-draw current frame immediately on resize
    const frameIndex = Math.round(currentFrame);
    if (images[frameIndex]) {
      drawFrame(images[frameIndex]);
    }
  }

  // Dial Customizer Interaction
  const dialConfigs = {
    emerald: {
      name: 'Olive Green',
      color: 'transparent',
      blend: 'normal',
      opacity: 0
    },
    blue: {
      name: 'Royal Blue',
      color: 'rgba(15, 60, 150, 0.65)',
      blend: 'hue',
      opacity: 1
    },
    slate: {
      name: 'Slate Grey',
      color: 'rgba(255, 255, 255, 1)',
      blend: 'saturation',
      opacity: 1
    },
    gold: {
      name: 'Champagne Gold',
      color: 'rgba(220, 175, 50, 0.55)',
      blend: 'color',
      opacity: 1
    }
  };

  dialBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle Active Button
      dialBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Apply Tint Config
      const colorKey = btn.dataset.color;
      const config = dialConfigs[colorKey];
      
      dialNameDisplay.textContent = config.name;
      
      // Transition Tint Overlay
      dialTint.style.mixBlendMode = config.blend;
      dialTint.style.backgroundColor = config.color;
      dialTint.style.opacity = config.opacity;
    });
  });

  // Event Listeners
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', resizeCanvas, { passive: true });
  
  // Kick off Image Preloading
  preloadImages();
});
