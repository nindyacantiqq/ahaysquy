let CONFIG = null;
let prayerNames = [];

async function loadData() {
  try {
    const response = await fetch("data.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    CONFIG = await response.json();
    prayerNames = Object.keys(CONFIG.prayerTimes || {});
    applyConfig();
    renderPrayerCards();
    updateAll();
    rotateQuote();
    setInterval(updateAll, 1000);
    setInterval(rotateQuote, (CONFIG.settings?.quoteIntervalSeconds || 10) * 1000);
  } catch (error) {
    console.error(error);
    document.getElementById("status").textContent = "Gagal memuat data.json";
    document.getElementById("countdown").textContent =
      "Pastikan project dijalankan melalui GitHub Pages atau local server.";
  }
}

function applyConfig() {
  document.getElementById("mosqueName").textContent = CONFIG.mosqueName;
  document.querySelector(".subtitle").textContent =
    CONFIG.subtitle || "PUSAT INFORMASI MASJID";
  document.getElementById("ticker").textContent =
    CONFIG.announcement || "";
  document.getElementById("footerText").textContent =
    CONFIG.footerText || "";

  const speed = CONFIG.settings?.tickerSpeedSeconds || 22;
  document.querySelector(".ticker").style.animationDuration = `${speed}s`;
}

function parseTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatCountdown(totalSeconds) {
  totalSeconds = Math.max(0, totalSeconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function renderPrayerCards() {
  const grid = document.getElementById("prayerGrid");
  grid.innerHTML = "";

  prayerNames.forEach(name => {
    const card = document.createElement("div");
    card.className = "prayer";
    card.dataset.name = name;
    card.innerHTML = `
      <div class="name">${name}</div>
      <div class="time">${CONFIG.prayerTimes[name]}</div>
    `;
    grid.appendChild(card);
  });
}

function getNextPrayer(now) {
  const currentSeconds =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds();

  for (const name of prayerNames) {
    const target = parseTime(CONFIG.prayerTimes[name]) * 60;
    if (target > currentSeconds) {
      return { name, target };
    }
  }

  return {
    name: prayerNames[0],
    target: parseTime(CONFIG.prayerTimes[prayerNames[0]]) * 60 + 86400
  };
}

function updateNextPrayer(now) {
  if (!prayerNames.length) return;

  const next = getNextPrayer(now);
  const currentSeconds =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds();

  let remaining = next.target - currentSeconds;
  if (remaining < 0) remaining += 86400;

  document.querySelectorAll(".prayer").forEach(card => {
    const isNext = card.dataset.name === next.name;
    card.classList.toggle("next", isNext);

    const oldLabel = card.querySelector(".next-label");
    if (oldLabel) oldLabel.remove();

    if (isNext) {
      const label = document.createElement("div");
      label.className = "next-label";
      label.textContent = "BERIKUTNYA";
      card.appendChild(label);
    }
  });

  document.getElementById("status").textContent =
    `MENUJU WAKTU ${next.name.toUpperCase()}`;
  document.getElementById("countdown").textContent =
    `${formatCountdown(remaining)} lagi`;
}

function updateClock() {
  const now = new Date();

  document.getElementById("clock").textContent =
    now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

  document.getElementById("dayDate").textContent =
    now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  try {
    const hijri = new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(now);
    document.getElementById("hijriDate").textContent = `${hijri} H`;
  } catch {
    document.getElementById("hijriDate").textContent = "Kalender Hijriah";
  }

  updateNextPrayer(now);
}

function updateAll() {
  updateClock();
}

let quoteIndex = 0;

function rotateQuote() {
  if (!CONFIG?.quotes?.length) return;
  const quote = CONFIG.quotes[quoteIndex];
  document.getElementById("quoteText").textContent = quote.text;
  document.getElementById("quoteSource").textContent = quote.source;
  quoteIndex = (quoteIndex + 1) % CONFIG.quotes.length;
}

document.addEventListener("keydown", event => {
  if (event.key.toLowerCase() === "f") {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
});

loadData();
