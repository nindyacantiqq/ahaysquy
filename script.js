// ===============================
// PENGATURAN DISPLAY MASJID
// ===============================
const CONFIG = {
  mosqueName: "MASJID AL-IKHLAS",

  // Ganti jam di bawah sesuai jadwal masjid.
  prayerTimes: {
    Subuh: "04:45",
    Dzuhur: "12:00",
    Ashar: "15:20",
    Maghrib: "18:00",
    Isya: "19:10"
  },

  announcement:
    "Selamat datang di masjid. Mohon menjaga kebersihan, ketenangan, dan ketertiban selama berada di area masjid. Mari makmurkan masjid dengan ibadah dan kebaikan.",

  quotes: [
    {
      text: "“Sebaik-baik kalian adalah yang belajar Al-Qur’an dan mengajarkannya.”",
      source: "— HR. Bukhari"
    },
    {
      text: "“Shalatlah kalian sebagaimana kalian melihat aku shalat.”",
      source: "— HR. Bukhari"
    },
    {
      text: "“Kebersihan adalah bagian dari iman.”",
      source: "— Makna yang masyhur dalam ajaran Islam"
    }
  ],

  // Jika true, countdown akan berhenti pada waktu salat berikutnya.
  // Atur durasi iqamah bila ingin menampilkan countdown iqamah.
  iqamahMinutes: 10
};

const prayerNames = Object.keys(CONFIG.prayerTimes);

document.getElementById("mosqueName").textContent = CONFIG.mosqueName;
document.getElementById("ticker").textContent = CONFIG.announcement;

function parseTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatCountdown(totalSeconds) {
  totalSeconds = Math.max(0, totalSeconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

function getNextPrayer(now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();

  for (const name of prayerNames) {
    const prayerMinute = parseTime(CONFIG.prayerTimes[name]);
    if (prayerMinute > currentMinutes ||
        (prayerMinute === currentMinutes && currentSeconds === 0)) {
      return { name, minute: prayerMinute };
    }
  }

  // Kalau semua jadwal hari ini sudah lewat, arahkan ke Subuh besok.
  return {
    name: prayerNames[0],
    minute: parseTime(CONFIG.prayerTimes[prayerNames[0]]) + 24 * 60
  };
}

function updateNextPrayer(now) {
  const next = getNextPrayer(now);
  const nowSeconds =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds();

  let targetSeconds = next.minute * 60;
  if (targetSeconds <= nowSeconds) targetSeconds += 24 * 3600;

  const remaining = targetSeconds - nowSeconds;

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
    `Menuju waktu ${next.name}`;

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

  // Kalender Hijriah dari Intl browser.
  try {
    const hijri = new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(now);

    document.getElementById("hijriDate").textContent = `${hijri} H`;
  } catch {
    document.getElementById("hijriDate").textContent =
      "Kalender Hijriah";
  }

  updateNextPrayer(now);
}

let quoteIndex = 0;

function rotateQuote() {
  const quote = CONFIG.quotes[quoteIndex];
  document.getElementById("quoteText").textContent = quote.text;
  document.getElementById("quoteSource").textContent = quote.source;
  quoteIndex = (quoteIndex + 1) % CONFIG.quotes.length;
}

renderPrayerCards();
updateClock();
rotateQuote();

setInterval(updateClock, 1000);
setInterval(rotateQuote, 10000);

// Tekan F untuk mencoba fullscreen.
document.addEventListener("keydown", event => {
  if (event.key.toLowerCase() === "f") {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
});
