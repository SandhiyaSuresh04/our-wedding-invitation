
"use strict";

/* =====================================
   ELEMENTS
===================================== */

const firstPage = document.getElementById("page1");
const door = document.getElementById("templeDoor");
const openingEnvelope = document.getElementById("openingEnvelope");
const scrollStage = document.getElementById("scrollStage");
const countdownPage = document.getElementById("page3");
const weddingPage = document.getElementById("page4");
const music = document.getElementById("weddingMusic");
const musicButton = document.getElementById("musicToggle");
const scratchArea = document.getElementById("dateScratch");
const canvas = document.getElementById("scratchCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

/* =====================================
   STATE
===================================== */

let currentPage = 1;
let doorOpened = false;
let envelopeRunning = false;
let invitationRevealed = false;
let finalReady = false;
let exitTimer = null;
let scratching = false;
let dateRevealed = false;
let scratchPrepared = false;
let scratchedPoints = 0;
let lastScratchPosition = null;
let lastPetalTime = 0;
let activePetals = 0;

const MAX_ACTIVE_PETALS = 65;

/* =====================================
   PAGE NAVIGATION
===================================== */

function showPage(pageNumber) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  if ([2, 3, 4, 5, 6].includes(pageNumber)) {
    scrollStage.classList.add("active");

    if (pageNumber === 2) {
      scrollStage.scrollTop = 0;
    }
  } else {
    scrollStage.classList.remove("active");

    const page = document.getElementById("page" + pageNumber);
    if (page) page.classList.add("active");
  }

  currentPage = pageNumber;

  if (pageNumber === 7) {
    finalReady = false;
    clearTimeout(exitTimer);

    exitTimer = setTimeout(() => {
      finalReady = true;
    }, 5600);
  }
}

/* =====================================
   TEMPLE DOOR OPENING
===================================== */

function openDoor(event) {
  if (event) event.stopPropagation();

  if (doorOpened || door.classList.contains("opening")) {
    return;
  }

  door.classList.add("opening");

  if (music && musicButton) {
    musicButton.hidden = false;
    music.volume = 0.65;

    music.play()
      .then(updateMusicButton)
      .catch(updateMusicButton);
  }

  setTimeout(() => {
    door.classList.add("opened");
    firstPage.classList.add("door-finished");
    doorOpened = true;
  }, 2450);
}

door.addEventListener("click", openDoor);

door.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openDoor(event);
  }
});

/* =====================================
   PAGE 1 -> ENVELOPE -> PAGE 2
===================================== */

firstPage.addEventListener("click", event => {
  if (event.target.closest("#templeDoor")) return;
  if (!doorOpened || envelopeRunning) return;

  envelopeRunning = true;
  openingEnvelope.classList.remove("play");
  void openingEnvelope.offsetWidth;
  openingEnvelope.classList.add("play");

  setTimeout(() => {
    showPage(2);
    requestAnimationFrame(prepareScratch);
  }, 3600);

  setTimeout(() => {
    invitationRevealed = true;
    envelopeRunning = false;
    openingEnvelope.classList.remove("play");
  }, 5100);
});

/* =====================================
   NATURAL VERTICAL SCROLL
===================================== */

scrollStage.addEventListener("scroll", () => {
  if (!invitationRevealed) return;

  const pageHeight =
    countdownPage.offsetHeight || window.innerHeight;

  const position = scrollStage.scrollTop;

  if (position >= pageHeight * 3.7) {
    currentPage = 6;
    weddingPage.classList.add("curtains-open");
  } else if (position >= pageHeight * 2.7) {
    currentPage = 5;
    weddingPage.classList.add("curtains-open");
  } else if (position >= pageHeight * 1.7) {
    currentPage = 4;
    weddingPage.classList.add("curtains-open");
  } else if (position >= pageHeight * 0.7) {
    currentPage = 3;
  } else {
    currentPage = 2;
  }
}, { passive: true });

/* =====================================
   GALLERY - FAST LOADING FIX
===================================== */

/*
  Check GitHub images folder.

  If filenames are prewedding1.JPG,
  change ".jpg" below to ".JPG".

  The extension must match exactly.
*/

const galleryPhotos = Array.from(
  { length: 8 },
  (_, i) => `images/prewedding${i + 1}.JPG`
);

const galleryImage = document.getElementById("galleryImage");
const galleryCounter = document.getElementById("galleryCounter");
const galleryDots = document.getElementById("galleryDots");
const galleryTouchArea = document.getElementById("galleryTouchArea");
const prevPhoto = document.getElementById("prevPhoto");
const nextPhoto = document.getElementById("nextPhoto");
const galleryContinue = document.getElementById("galleryContinue");

let galleryIndex = 0;
let galleryTouchStartX = 0;
let galleryTouchStartY = 0;
let galleryLoadRequest = 0;

const galleryImageCache = new Map();

/* LOAD AND CACHE ONE IMAGE */

function preloadGalleryPhoto(index) {
  const photoIndex =
    (index + galleryPhotos.length) % galleryPhotos.length;

  const src = galleryPhotos[photoIndex];

  if (galleryImageCache.has(src)) {
    return galleryImageCache.get(src);
  }

  const image = new Image();
  image.decoding = "async";

  const loaded = new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Cannot load: " + src));
  });

  // Prevent a background preload failure from
  // producing an unhandled promise rejection.
  loaded.catch(() => {});

  const cached = { image, loaded };
  galleryImageCache.set(src, cached);

  image.src = src;

  return cached;
}

/* FIRST PHOTO - START LOADING IMMEDIATELY */

preloadGalleryPhoto(0);

/* LOAD REMAINING PHOTOS AFTER PAGE OPENS */

async function preloadRemainingGalleryPhotos() {
  for (let i = 1; i < galleryPhotos.length; i++) {
    const cached = preloadGalleryPhoto(i);

    try {
      await cached.loaded;
    } catch (error) {
      console.warn("Gallery preload failed:", galleryPhotos[i]);
    }
  }
}

window.addEventListener("load", () => {
  setTimeout(preloadRemainingGalleryPhotos, 300);
});

/* GALLERY DOTS */

galleryPhotos.forEach((photo, index) => {
  const dot = document.createElement("button");
  dot.className = "gallery-dot";
  dot.type = "button";

  dot.setAttribute(
    "aria-label",
    "Show photo " + (index + 1)
  );

  dot.addEventListener("click", () => {
    showGalleryPhoto(index);
  });

  galleryDots.appendChild(dot);
});

function updateGalleryControls(index) {
  galleryCounter.textContent =
    String(index + 1).padStart(2, "0") + " / 08";

  galleryDots.querySelectorAll(".gallery-dot")
    .forEach((dot, j) => {
      dot.classList.toggle("active", j === index);
    });
}

/* DISPLAY IMAGE ONLY WHEN READY */

async function showGalleryPhoto(i) {
  const nextIndex =
    (i + galleryPhotos.length) % galleryPhotos.length;

  const nextSrc = galleryPhotos[nextIndex];
  const requestId = ++galleryLoadRequest;

  galleryIndex = nextIndex;
  updateGalleryControls(nextIndex);

  const cached = preloadGalleryPhoto(nextIndex);

  // Hide previous image to prevent photo flashing.
  galleryImage.style.opacity = "0";

  try {
    await cached.loaded;

    if (cached.image.decode) {
      await cached.image.decode();
    }

    if (requestId !== galleryLoadRequest) return;

    galleryImage.src = nextSrc;
    galleryImage.alt =
      "Pre-wedding photo " + (nextIndex + 1);

    galleryImage.classList.remove("photo-changing");
    void galleryImage.offsetWidth;
    galleryImage.classList.add("photo-changing");

    requestAnimationFrame(() => {
      if (requestId === galleryLoadRequest) {
        galleryImage.style.opacity = "1";
      }
    });

  } catch (error) {
    if (requestId !== galleryLoadRequest) return;

    console.error(
      "Gallery photo failed to load:",
      nextSrc,
      error
    );

    galleryImage.style.opacity = "0";
  }
}

/* ARROWS */

prevPhoto.addEventListener("click", () => {
  showGalleryPhoto(galleryIndex - 1);
});

nextPhoto.addEventListener("click", () => {
  showGalleryPhoto(galleryIndex + 1);
});

/* MOBILE SWIPE */

galleryTouchArea.addEventListener(
  "touchstart",
  event => {
    galleryTouchStartX =
      event.changedTouches[0].screenX;

    galleryTouchStartY =
      event.changedTouches[0].screenY;
  },
  { passive: true }
);

galleryTouchArea.addEventListener(
  "touchend",
  event => {
    const differenceX =
      event.changedTouches[0].screenX -
      galleryTouchStartX;

    const differenceY =
      event.changedTouches[0].screenY -
      galleryTouchStartY;

    if (
      Math.abs(differenceX) > 45 &&
      Math.abs(differenceX) > Math.abs(differenceY)
    ) {
      showGalleryPhoto(
        galleryIndex + (differenceX < 0 ? 1 : -1)
      );
    }
  },
  { passive: true }
);

/* KEYBOARD ARROWS */

document.addEventListener("keydown", event => {
  if (currentPage !== 6) return;

  if (event.key === "ArrowLeft") {
    showGalleryPhoto(galleryIndex - 1);
  }

  if (event.key === "ArrowRight") {
    showGalleryPhoto(galleryIndex + 1);
  }
});

/* GALLERY -> THANK YOU */

galleryContinue.addEventListener("click", () => {
  showPage(7);
});

/* =====================================
   THANK YOU ENDING
===================================== */

const finalPage = document.getElementById("page7");
const exitMessage = document.getElementById("exitMessage");

finalPage.addEventListener("click", event => {
  if (event.target.closest("a, button")) return;
  if (!finalReady || !exitMessage.hidden) return;

  finalReady = false;

  if (music) music.pause();

  updateMusicButton();
  exitMessage.hidden = false;
});

/* =====================================
   BACKGROUND MUSIC
===================================== */

function updateMusicButton() {
  if (!music || !musicButton) return;

  const playing = !music.paused && !music.muted;

  musicButton.textContent = playing ? "♫" : "♪";

  musicButton.setAttribute(
    "aria-label",
    playing ? "Mute music" : "Play music"
  );
}

if (music && musicButton) {
  musicButton.addEventListener("click", event => {
    event.stopPropagation();

    if (music.paused) {
      music.muted = false;

      music.play()
        .then(updateMusicButton)
        .catch(updateMusicButton);
    } else {
      music.muted = !music.muted;
      updateMusicButton();
    }
  });
}

/* =====================================
   WEDDING COUNTDOWN
===================================== */

const weddingDate =
  new Date("2026-11-16T06:00:00+05:30").getTime();

function updateCountdown() {
  const remaining =
    Math.max(0, weddingDate - Date.now());

  const count = document.getElementById("countdown");

  if (remaining === 0) {
    if (!count.classList.contains("finished")) {
      count.classList.add("finished");
      count.textContent = "Our Forever Begins Today!";
    }
    return;
  }

  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor(remaining / 3600000) % 24,
    minutes: Math.floor(remaining / 60000) % 60,
    seconds: Math.floor(remaining / 1000) % 60
  };

  Object.entries(values).forEach(([key, value]) => {
    const element = document.getElementById(key);

    if (element) {
      element.textContent =
        String(value).padStart(2, "0");
    }
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* =====================================
   GOLD SCRATCH SETUP
===================================== */

function prepareScratch() {
  if (
    !canvas ||
    !ctx ||
    dateRevealed ||
    scratchPrepared
  ) return;

  const rect = canvas.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) return;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "source-over";

  const gradient = ctx.createLinearGradient(
    0, 0, rect.width, rect.height
  );

  gradient.addColorStop(0, "#b18445");
  gradient.addColorStop(.25, "#e7c58a");
  gradient.addColorStop(.5, "#f8e6b9");
  gradient.addColorStop(.75, "#d4a760");
  gradient.addColorStop(1, "#a87536");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, rect.width, rect.height);

  ctx.fillStyle = "#663b20";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const fontSize = Math.max(
    9,
    Math.min(17, rect.width * .07)
  );

  ctx.font = `bold ${fontSize}px Georgia`;

  ctx.fillText(
    "SCRATCH TO REVEAL",
    rect.width / 2,
    rect.height / 2,
    rect.width * .94
  );

  scratchPrepared = true;
}

/* =====================================
   RED ROSE PETALS
===================================== */

function createRosePetals(count = 8) {
  for (let i = 0; i < count; i++) {
    if (activePetals >= MAX_ACTIVE_PETALS) break;

    const petal = document.createElement("span");
    petal.className = "scratch-rose-petal";

    petal.style.left =
      Math.random() * 100 + "vw";

    petal.style.width =
      (10 + Math.random() * 12) + "px";

    petal.style.height =
      (14 + Math.random() * 16) + "px";

    petal.style.setProperty(
      "--drift",
      (Math.random() * 180 - 90) + "px"
    );

    petal.style.setProperty(
      "--rotation",
      (360 + Math.random() * 540) + "deg"
    );

    petal.style.animationDuration =
      (3.5 + Math.random() * 2.5) + "s";

    petal.style.animationDelay =
      (Math.random() * .25) + "s";

    document.body.appendChild(petal);
    activePetals++;

    petal.addEventListener(
      "animationend",
      () => {
        petal.remove();
        activePetals = Math.max(0, activePetals - 1);
      },
      { once: true }
    );
  }
}

function releasePetalsDuringScratch() {
  const now = performance.now();

  if (now - lastPetalTime < 130) return;

  lastPetalTime = now;
  createRosePetals(3);
}

/* =====================================
   COMPLETE SCRATCH
===================================== */

function finishScratch() {
  if (dateRevealed) return;

  dateRevealed = true;
  scratching = false;

  scratchArea.classList.add("revealed");
  createRosePetals(18);
}

/* =====================================
   FINGER / MOUSE SCRATCH
===================================== */

function scratchAt(event) {
  if (
    !scratching ||
    dateRevealed ||
    !ctx ||
    !canvas
  ) return;

  event.preventDefault();

  if (!scratchPrepared) prepareScratch();
  if (!scratchPrepared) return;

  const rect = canvas.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = 42;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  if (lastScratchPosition) {
    ctx.moveTo(
      lastScratchPosition.x,
      lastScratchPosition.y
    );
    ctx.lineTo(x, y);
    ctx.stroke();
  } else {
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  lastScratchPosition = { x, y };
  scratchedPoints++;

  releasePetalsDuringScratch();

  if (scratchedPoints >= 25) {
    finishScratch();
  }
}

if (canvas) {
  canvas.addEventListener("pointerdown", event => {
    if (dateRevealed) return;

    if (!scratchPrepared) prepareScratch();

    scratching = true;
    lastScratchPosition = null;

    createRosePetals(10);
    lastPetalTime = performance.now();

    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      // Pointer capture is optional.
    }

    scratchAt(event);
  });

  canvas.addEventListener("pointermove", scratchAt);

  canvas.addEventListener("pointerup", () => {
    scratching = false;
    lastScratchPosition = null;
  });

  canvas.addEventListener("pointercancel", () => {
    scratching = false;
    lastScratchPosition = null;
  });
}

scratchArea.addEventListener("click", event => {
  event.stopPropagation();
});

/* =====================================
   SCREEN RESIZE
===================================== */

window.addEventListener("resize", () => {
  if (
    !dateRevealed &&
    scratchPrepared &&
    !scratching
  ) {
    scratchPrepared = false;
    prepareScratch();
  }
});

/* =====================================
   INITIALIZE
===================================== */

updateGalleryControls(0);
showGalleryPhoto(0);
showPage(1);
