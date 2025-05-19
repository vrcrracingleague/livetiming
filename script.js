const url = 'https://script.google.com/macros/s/AKfycbxzdHM6IA1YJHIo6mz5efp6tQrgOfPdeJsKm3g2QDtjVsXlnPA7ZVUSOh11W0EwUHjR/exec';
let previousData = [];
let sessionCounter = null;
let timerInterval = null;
let lastJsonTime = null;

// 🔧 LOGHI PER CARMODEL
const carLogos = {
  20: "https://i.postimg.cc/nhtMC4GX/Logo-della-Aston-Martin-svg.png",            // Aston Martin
  26: "https://i.postimg.cc/nrRfKt6R/BMW-svg.png",                                // BMW M4
  31: "https://i.postimg.cc/x8MrB7Wx/Audi-logo-detail-svg.png",                   // Audi R8 LMS Evo II
  32: "https://i.postimg.cc/Yqk7F2ch/ferrari.png",                               // Ferrari 296
  33: "https://i.postimg.cc/0NxXNB4b/lambo.png",                                 // Lamborghini Huracan
  34: "https://i.postimg.cc/FHXDP6ND/Logo-della-Porsche-svg.png",                // Porsche 992
  35: "https://i.postimg.cc/3JWKYg6Y/365px-Mc-Laren-Automotive-2021-allmode.png", // McLaren
   6: "https://i.postimg.cc/yN3t52qM/nissan.png",                                // Nissan
   8: "https://i.postimg.cc/W1RzFcN3/Bentley-Logo-wine.png",                     // Bentley
  36: "https://i.postimg.cc/ncjPS77c/Ford-Motor-Company-Logo.png"                // Ford Mustang
};

function getColorForCar(carModel) {
  const colorMap = {
    20: "#006F62", // Aston Martin
    26: "#0072CE", // BMW
    31: "#A5A5A5", // Audi
    32: "#DC0000", // Ferrari
    33: "#FEC601", // Lamborghini
    34: "#30b528", // Porsche
    35: "#FF8700", // McLaren
     6: "#ffffff", // Nissan
     8: "#5D3A00", // Bentley
    36: "#00274D"  // Ford
  };
  return colorMap[carModel] || "#888888";
}

function loadData() {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log('Dati ricevuti:', data[0]);
      renderSessionData(data[0]);
      renderTable(data);
    })
    .catch(error => console.error("Error fetching data:", error));
}

function renderSessionData(data) {
  const session = data["Stato Sessione"] || "N/A";
  const tempo = data["Tempo Rimanente"] || "00:00";
  const circuito = data["Circuito"] || "N/A";

  console.log('Tempo rimanente:', tempo);

  const newSessionCounter = convertTimeToSeconds(tempo);

  if (sessionCounter === null) {
    sessionCounter = newSessionCounter;
    lastJsonTime = newSessionCounter;
    startVisualTimer(session, sessionCounter);
  } else if (newSessionCounter !== lastJsonTime) {
    sessionCounter = newSessionCounter;
    lastJsonTime = newSessionCounter;
    startVisualTimer(session, sessionCounter);
  }

  document.getElementById("circuito").textContent = circuito;
  document.getElementById("bestLapSession").textContent = data["Best Lap Session"] || "N/A";
  document.getElementById("pilotaBestLap").textContent = data["Pilota Best Lap"] || "N/A";
}

function startVisualTimer(sessionName, durationSeconds) {
  clearInterval(timerInterval);
  updateTimerDisplay(sessionName, durationSeconds);

  timerInterval = setInterval(() => {
    sessionCounter--;
    updateTimerDisplay(sessionName, sessionCounter);

    const flag = document.getElementById("flagStatus");
    if (sessionCounter <= 0) {
      clearInterval(timerInterval);
      flag.className = "status-flag status-checkered";
      flag.textContent = "🏁 CHEQUERED FLAG";
    } else {
      flag.className = "status-flag status-green";
      flag.textContent = "🟩 GREEN FLAG";
    }
  }, 1000);
}

function updateTimerDisplay(sessionName, seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  document.getElementById("statoSessione").innerHTML = `<strong>${sessionName}</strong> - ${formattedTime} min rimanenti`;
}

function convertTimeToSeconds(timeString) {
  const [minutes] = timeString.split(" ").map(Number);
  return (minutes || 0) * 60;
}

function renderTable(data) {
  const tbody = document.querySelector("#table tbody");
  const bestLapSession = data[0]["Best Lap Session"];

  // Svuota la tabella
  tbody.querySelectorAll("tr").forEach(tr => tr.remove());

  data.forEach((row, index) => {
    if (!row["Nome"] || row["Nome"].trim() === "") return;

    const tr = document.createElement("tr");
    const isBest = row["LastLap"] === bestLapSession;

    const [nome, ...cognomeParts] = (row["Nome"] || " ").split(" ");
    const nomeStr = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
    const cognome = cognomeParts.join(" ").toUpperCase();

    // Logo auto
    const carModel = Number(row["CarModel"]);
    const logoUrl = carLogos[carModel] || "";
    const logoImg = logoUrl ? `<img src="${logoUrl}" alt="logo" class="logo-auto" />` : "";

    const cells = [
      row["Race Number"] || "",
      `<span class="nome">${nomeStr}</span> <span class="cognome">${cognome}</span>`,
      `<span class="car-logo">${logoImg}</span>`,
      row["Stato Pilota"] || "",
      row["Progresso Giro"] || "",
      row["LastLap"] || "",
      row["Split S1"] || "",
      row["Split S2"] || "",
      row["Split S3"] || "",
      row["Lap Count"] || "",
      row["BestLap"] || "",
      row["Team"] || ""
    ];

    cells.forEach((cell, i) => {
      const td = document.createElement("td");

      if (i === 0) {
        const barColor = getColorForCar(carModel);
        td.innerHTML = `<div class="race-number-bar" style="--bar-color: ${barColor}">${cell}</div>`;
      } else {
        td.innerHTML = cell;
      }

      // Logica evidenziazione LastLap
      if (i === 5) {
        const bestLap = row["BestLap"];
        const lastLap = row["LastLap"];

        const isValidTime = time => typeof time === "string" && time.trim() !== "" && time.includes(":");

        if (isValidTime(lastLap)) {
          if (lastLap === bestLapSession) {
            td.classList.add("best-lap-highlight"); // rosso
          } else if (lastLap === bestLap && isValidTime(bestLap)) {
            td.classList.add("personal-best-highlight"); // verde
          }
        }
      }

      tr.appendChild(td);
    });

    // Evidenzia il cambiamento di LastLap con flash giallo
    const prevLastLap = previousData[index]?.[5] || "";
    const currentLastLap = row["LastLap"] || "";

    if (prevLastLap !== currentLastLap) {
      tr.querySelectorAll("td").forEach(td => {
        const originalBg = getComputedStyle(td).backgroundColor;

        td.style.transition = 'background-color 1.5s ease-in-out';
        td.style.backgroundColor = '#ffff00'; // flash giallo

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            td.style.backgroundColor = originalBg;
          });
        });
      });
    }

    // MOVIMENTO RIGHE (come prima)
    if (previousData.length > 0) {
      const prevIndex = previousData.findIndex(d => d[0] === row["Race Number"]);
      if (prevIndex !== -1 && prevIndex !== index) {
        tr.classList.add(prevIndex > index ? 'row-moving-up' : 'row-moving-down');
      }
    }

    tbody.appendChild(tr);
  });

  // Aggiorna previousData con la nuova snapshot
  previousData = data.map(row => {
    const [nome, ...cognomeParts] = (row["Nome"] || " ").split(" ");
    const nomeStr = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
    const cognome = cognomeParts.join(" ").toUpperCase();

    const carModel = row["CarModel"];
    const logoUrl = carLogos[carModel] || "";
    const logoImg = logoUrl ? `<img src="${logoUrl}" alt="logo" class="logo-auto" />` : "";

    return [
      row["Race Number"] || "",
      `<span class="nome">${nomeStr}</span> <span class="cognome">${cognome}</span>`,
      `<span class="car-logo">${logoImg}</span>`,
      row["Stato Pilota"] || "",
      row["Progresso Giro"] || "",
      row["LastLap"] || "",
      row["Split S1"] || "",
      row["Split S2"] || "",
      row["Split S3"] || "",
      row["Lap Count"] || "",
      row["BestLap"] || "",
      row["Team"] || ""
    ];
  });
}

loadData();
setInterval(loadData, 10000);

window.addEventListener('DOMContentLoaded', () => {
  const scrollContainer = document.getElementById('scrollContainer');
  const shadowLeft = document.getElementById('shadowLeft');
  const shadowRight = document.getElementById('shadowRight');

  function updateShadows() {
    const scrollLeft = scrollContainer.scrollLeft;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;

    shadowLeft.style.display = scrollLeft > 0 ? 'block' : 'none';
    shadowRight.style.display = scrollLeft + clientWidth < scrollWidth - 1 ? 'block' : 'none';
  }

  scrollContainer.addEventListener('scroll', updateShadows);
  window.addEventListener('resize', updateShadows);
  updateShadows();
});
