
"use strict";

/* ======================================
   MAIN ELEMENTS
====================================== */

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
const ctx = canvas.getContext("2d");

let currentPage = 1;
let doorOpened = false;
let envelopeRunning = false;
let invitationRevealed = false;
let finalReady = false;
let exitTimer = null;

/* ======================================
   PAGE NAVIGATION
====================================== */

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

    document
      .getElementById("page" + pageNumber)
      ?.classList.add("active");

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

/* ======================================
   BACKGROUND MUSIC
====================================== */

function updateMusicButton() {

  const playing = !music.paused && !music.muted;

  musicButton.textContent = playing ? "♫" : "♪";

  musicButton.setAttribute(
    "aria-label",
    playing ? "Mute music" : "Play music"
  );
}

musicButton.addEventListener("click", event => {

  event.stopPropagation();

  if (music.paused) {

    music.muted = false;

    music
      .play()
      .then(updateMusicButton)
      .catch(updateMusicButton);

  } else {

    music.muted = !music.muted;
    updateMusicButton();

  }
});

/* ======================================
   TEMPLE DOOR OPENING
====================================== */

function openDoor(event) {

  event?.stopPropagation();

  if (
    doorOpened ||
    door.classList.contains("opening")
  ) {
    return;
  }

  door.classList.add("opening");

  musicButton.hidden = false;
  music.volume = 0.65;

  music
    .play()
    .then(updateMusicButton)
    .catch(updateMusicButton);

  setTimeout(() => {

    door.classList.add("opened");
    firstPage.classList.add("door-finished");

    doorOpened = true;

  }, 2450);
}

door.addEventListener("click", openDoor);

door.addEventListener("keydown", event => {

  if (
    event.key === "Enter" ||
    event.key === " "
  ) {

    event.preventDefault();
    openDoor(event);

  }
});

/* ======================================
   MAROON ENVELOPE OPENING
====================================== */

firstPage.addEventListener("click", event => {

  if (
    event.target.closest("#templeDoor") ||
    !doorOpened ||
    envelopeRunning
  ) {
    return;
  }

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

/* ======================================
   CONTINUOUS VERTICAL SCROLL
====================================== */

scrollStage.addEventListener("scroll", () => {

  if (!invitationRevealed) return;

  const height =
    countdownPage.offsetHeight || innerHeight;

  const position = scrollStage.scrollTop;

  currentPage =
    position >= height * 3.7 ? 6 :
    position >= height * 2.7 ? 5 :
    position >= height * 1.7 ? 4 :
    position >= height * 0.7 ? 3 : 2;

  if (currentPage >= 4) {
    weddingPage.classList.add("curtains-open");
  }

}, { passive: true });

/* ======================================
   LIVE WEDDING COUNTDOWN
====================================== */

const weddingDate = new Date(
  "2026-11-16T06:00:00+05:30"
).getTime();

function updateCountdown() {

  const remaining = Math.max(
    0,
    weddingDate - Date.now()
  );

  const countdown = document.getElementById("countdown");

  if (remaining === 0) {

    if (!countdown.classList.contains("finished")) {

      countdown.classList.add("finished");

      countdown.textContent =
        "Our Forever Begins Today!";

    }

    return;
  }

  const values = {

    days: Math.floor(
      remaining / 86400000
    ),

    hours: Math.floor(
      remaining / 3600000
    ) % 24,

    minutes: Math.floor(
      remaining / 60000
    ) % 60,

    seconds: Math.floor(
      remaining / 1000
    ) % 60

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

/* ======================================
   SCRATCH TO REVEAL DATE
====================================== */

let scratching = false;
let dateRevealed = false;
let scratchPrepared = false;
let scratchedPoints = 0;

let lastScratchPosition = null;
let lastPetalTime = 0;
let activePetals = 0;

const MAX_ACTIVE_PETALS = 65;

function prepareScratch() {

  if (dateRevealed || scratchPrepared) {
    return;
  }

  const rect = canvas.getBoundingClientRect();

  if (!rect.width || !rect.height) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.globalCompositeOperation = "source-over";

  const gradient = ctx.createLinearGradient(
    0,
    0,
    rect.width,
    rect.height
  );

  const stops = [
    [0, "#b18445"],
    [0.25, "#e7c58a"],
    [0.5, "#f8e6b9"],
    [0.75, "#d4a760"],
    [1, "#a87536"]
  ];

  stops.forEach(([position, color]) => {
    gradient.addColorStop(position, color);
  });

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    rect.width,
    rect.height
  );

  ctx.fillStyle = "#663b20";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font =
    `bold ${Math.max(
      9,
      Math.min(17, rect.width * 0.07)
    )}px Georgia`;

  ctx.fillText(
    "SCRATCH TO REVEAL",
    rect.width / 2,
    rect.height / 2,
    rect.width * 0.94
  );

  scratchPrepared = true;
}

/* ======================================
   RED ROSE PETALS
====================================== */

function createRosePetals(count = 8) {

  for (
    let i = 0;
    i < count && activePetals < MAX_ACTIVE_PETALS;
    i++
  ) {

    const petal = document.createElement("span");

    petal.className = "scratch-rose-petal";

    petal.style.left =
      Math.random() * 100 + "vw";

    petal.style.width =
      10 + Math.random() * 12 + "px";

    petal.style.height =
      14 + Math.random() * 16 + "px";

    petal.style.setProperty(
      "--drift",
      (Math.random() * 180 - 90) + "px"
    );

    petal.style.setProperty(
      "--rotation",
      (360 + Math.random() * 540) + "deg"
    );

    petal.style.animationDuration =
      3.5 + Math.random() * 2.5 + "s";

    petal.style.animationDelay =
      Math.random() * 0.25 + "s";

    document.body.appendChild(petal);

    activePetals++;

    petal.addEventListener(
      "animationend",
      () => {

        petal.remove();

        activePetals = Math.max(
          0,
          activePetals - 1
        );

      },
      { once: true }
    );

  }
}

/* ======================================
   SCRATCH INTERACTION
====================================== */

function finishScratch() {

  if (dateRevealed) return;

  dateRevealed = true;
  scratching = false;

  scratchArea.classList.add("revealed");

  createRosePetals(18);
}

function scratchAt(event) {

  if (
    !scratching ||
    dateRevealed ||
    !scratchPrepared
  ) {
    return;
  }

  event.preventDefault();

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

    ctx.arc(
      x,
      y,
      22,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }

  lastScratchPosition = { x, y };

  scratchedPoints++;

  const now = performance.now();

  if (now - lastPetalTime > 130) {

    lastPetalTime = now;
    createRosePetals(3);

  }

  if (scratchedPoints >= 25) {
    finishScratch();
  }
}

canvas.addEventListener("pointerdown", event => {

  if (dateRevealed) return;

  if (!scratchPrepared) {
    prepareScratch();
  }

  if (!scratchPrepared) return;

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

canvas.addEventListener(
  "pointermove",
  scratchAt
);

["pointerup", "pointercancel"].forEach(type => {

  canvas.addEventListener(type, () => {

    scratching = false;
    lastScratchPosition = null;

  });

});

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

/* ======================================
   GALLERY - OPTIMIZED IMAGE LOADING
====================================== */

const galleryPhotos = Array.from(
  { length: 8 },
  (_, index) =>
    `images/prewedding${index + 1}.jpg`
);

const galleryImage =
  document.getElementById("galleryImage");

const galleryCounter =
  document.getElementById("galleryCounter");

const galleryDots =
  document.getElementById("galleryDots");

const galleryTouchArea =
  document.getElementById("galleryTouchArea");

const galleryLoading =
  document.getElementById("galleryLoading");

const galleryImageCache = new Map();

let galleryIndex = 0;
let galleryLoadRequest = 0;

let galleryTouchStartX = 0;
let galleryTouchStartY = 0;

/* CACHE AN IMAGE */

function cachedImage(src) {

  if (!galleryImageCache.has(src)) {

    const image = new Image();

    image.decoding = "async";
    image.src = src;

    galleryImageCache.set(src, image);

  }

  return galleryImageCache.get(src);
}

/* PRELOAD GALLERY WHEN NEARBY */

function preloadGallery() {

  galleryPhotos.forEach(cachedImage);

}

const galleryObserver = new IntersectionObserver(

  (entries, observer) => {

    if (!entries[0].isIntersecting) {
      return;
    }

    preloadGallery();

    observer.disconnect();

  },

  {
    root: scrollStage,
    rootMargin: "400px 0px"
  }

);

galleryObserver.observe(
  document.getElementById("page6")
);

/* CREATE GALLERY DOTS */

galleryPhotos.forEach((photo, index) => {

  const dot = document.createElement("button");

  dot.type = "button";
  dot.className = "gallery-dot";

  dot.setAttribute(
    "aria-label",
    "Show photo " + (index + 1)
  );

  dot.addEventListener("click", () => {
    showGalleryPhoto(index);
  });

  galleryDots.appendChild(dot);

});

/* UPDATE COUNTER AND DOTS */

function updateGalleryControls(index) {

  galleryCounter.textContent =
    String(index + 1).padStart(2, "0") + " / 08";

  galleryDots
    .querySelectorAll(".gallery-dot")
    .forEach((dot, i) => {

      dot.classList.toggle(
        "active",
        i === index
      );

    });

}

/* SHOW SELECTED PHOTO ONLY AFTER LOADING */

async function showGalleryPhoto(index) {

  const nextIndex =
    (index + galleryPhotos.length) %
    galleryPhotos.length;

  const nextSrc = galleryPhotos[nextIndex];

  const requestId = ++galleryLoadRequest;

  galleryIndex = nextIndex;

  updateGalleryControls(nextIndex);

  // Hide previous photo while next photo loads.
  galleryImage.style.opacity = "0";

  galleryLoading.textContent = "Loading photo…";
  galleryLoading.hidden = false;

  const nextImage = cachedImage(nextSrc);

  try {

    if (
      !nextImage.complete ||
      !nextImage.naturalWidth
    ) {

      await new Promise((resolve, reject) => {

        nextImage.addEventListener(
          "load",
          resolve,
          { once: true }
        );

        nextImage.addEventListener(
          "error",
          reject,
          { once: true }
        );

      });

    }

    if (nextImage.decode) {

      await nextImage.decode().catch(() => {});

    }

    // Ignore an outdated arrow click.
    if (requestId !== galleryLoadRequest) {
      return;
    }

    galleryImage.src = nextSrc;

    galleryImage.alt =
      "Pre-wedding photo " + (nextIndex + 1);

    galleryLoading.hidden = true;

    requestAnimationFrame(() => {

      if (requestId === galleryLoadRequest) {

        galleryImage.style.opacity = "1";

      }

    });

  } catch (error) {

    if (requestId !== galleryLoadRequest) {
      return;
    }

    galleryLoading.textContent =
      "Photo could not load. Please try again.";

    console.error(
      "Gallery photo failed:",
      nextSrc,
      error
    );

  }

}

/* GALLERY ARROWS */

document
  .getElementById("prevPhoto")
  .addEventListener("click", () => {

    showGalleryPhoto(galleryIndex - 1);

  });

document
  .getElementById("nextPhoto")
  .addEventListener("click", () => {

    showGalleryPhoto(galleryIndex + 1);

  });

/* GALLERY MOBILE SWIPE */

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

    const dx =
      event.changedTouches[0].screenX -
      galleryTouchStartX;

    const dy =
      event.changedTouches[0].screenY -
      galleryTouchStartY;

    if (
      Math.abs(dx) > 45 &&
      Math.abs(dx) > Math.abs(dy)
    ) {

      showGalleryPhoto(
        galleryIndex + (dx < 0 ? 1 : -1)
      );

    }

  },
  { passive: true }
);

/* DESKTOP ARROW KEYS */

document.addEventListener("keydown", event => {

  if (currentPage !== 6) {
    return;
  }

  if (event.key === "ArrowLeft") {

    showGalleryPhoto(galleryIndex - 1);

  }

  if (event.key === "ArrowRight") {

    showGalleryPhoto(galleryIndex + 1);

  }

});

/* ======================================
   FINAL THANK YOU SCROLL
====================================== */

document
  .getElementById("galleryContinue")
  .addEventListener("click", () => {

    showPage(7);

  });

document
  .getElementById("page7")
  .addEventListener("click", event => {

    const exitMessage =
      document.getElementById("exitMessage");

    if (
      event.target.closest("a,button") ||
      !finalReady ||
      !exitMessage.hidden
    ) {
      return;
    }

    finalReady = false;

    music.pause();
    updateMusicButton();

    exitMessage.hidden = false;

  });

/* ======================================
   INITIAL SETUP
====================================== */

updateGalleryControls(0);

showPage(1);
