let audioCtx = null;
let fallbackSource = null;
let fallbackGain = null;

onload = () => {
  // Attach click handler to visible button
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      document.body.classList.remove("container");
      hideInitialText();
      startTextAnimation();
      tryPlayAudio();
      startBtn.style.display = 'none'; // hide button after click
    });
  }

  // no visible music toggle — audio controlled by start button
};

// Play background music (called after user gesture)
function playMusic() {
  const bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) return;
  bgMusic.volume = 0.6;
  bgMusic.play().then(() => {
    // played
  }).catch(err => {
    console.log('Audio play blocked:', err);
  });
}

// Try playing audio — simplified version for visible button click
async function tryPlayAudio() {
  const bg = document.getElementById('bgMusic');
  if (!bg) {
    console.log('Audio element not found');
    return;
  }

  try {
    // Unmute and play audio (user clicked button, so policy allows it)
    bg.muted = false;
    bg.volume = 0.6;
    await bg.play();
    console.log('Audio playing via HTMLAudio element');
  } catch (err) {
    // Fallback if play() still fails (rare on button click)
    console.warn('HTMLAudio play failed:', err.name, err.message);
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') await audioCtx.resume();

      if (fallbackSource) return;

      const audioSrc = bg.getAttribute('src');
      const resp = await fetch(audioSrc, { mode: 'no-cors' });
      const arr = await resp.arrayBuffer();
      const buf = await audioCtx.decodeAudioData(arr);

      fallbackSource = audioCtx.createBufferSource();
      fallbackSource.buffer = buf;
      fallbackSource.loop = true;
      fallbackGain = audioCtx.createGain();
      fallbackGain.gain.value = 0.6;
      fallbackSource.connect(fallbackGain).connect(audioCtx.destination);
      fallbackSource.start(0);
      console.log('Audio playing via WebAudio fallback');
    } catch (e) {
      console.error('WebAudio fallback failed:', e.name, e.message);
    }
  }
}

// Small toast message to request another tap if audio is blocked
function showAudioToast(message) {
  hideAudioToast();
  const d = document.createElement('div');
  d.className = 'audio-toast';
  d.textContent = message;
  document.body.appendChild(d);
}

function hideAudioToast() {
  const existing = document.querySelector('.audio-toast');
  if (existing) existing.remove();
}

// Hide initial text before animation
function hideInitialText() {
  const textElement = document.querySelector('.animated-text h1');
  if (!textElement) return;
  textElement.style.opacity = '0';
  
  setTimeout(() => {
    textElement.textContent = 'TARAAAA ur fav song n flowers';
    textElement.style.opacity = '1';
  }, 300);
}

// Alternating Text Animation
function startTextAnimation() {
  const textElement = document.querySelector('.animated-text h1');
  if (!textElement) return;
  const textArray = [ 
    'TARAAAA ur fav song n flowers',
    'maafin aku ya… aku beneran nyesel', 
    'aku sadar salah dan itu semua karna aku', 
    'aku janji bakal lebih baik ke depannya', 
    'aku mau buktiin bukan cuma ngomong doang', 
    'makasi udah mau baca', 
    'aku sayang kamu🤍' 
  ];
  let currentIndex = 0;

  function alternateText() {
    currentIndex = (currentIndex + 1) % textArray.length;
    textElement.style.opacity = '0';
    
    setTimeout(() => {
      textElement.textContent = textArray[currentIndex];
      textElement.style.opacity = '1';
    }, 300);
  }

  setInterval(alternateText, 3000);
}
