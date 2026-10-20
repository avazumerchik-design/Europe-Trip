const SECTIONS = [
  ["see", "Places to see"],
  ["eat", "What to eat"],
  ["drink", "Where to go out"],
  ["stay", "Places to stay"],
  ["history", "A little history"],
  ["tips", "Local notes"],
  ["watch", "Films"],
  ["read", "Books"],
  ["now", "Right now"]
];

const nav = document.getElementById("nav");
const main = document.getElementById("main");
const stopCount = document.getElementById("stop-count");
const slug = name => name.toLowerCase().replace(/\s+/g, "-");
const GUIDE_KEY = "europe-notebook-guides-v1";
const JOURNAL_KEY = "europe-notebook-journal-v1";
const DB_NAME = "europe-notebook-memories";
const DB_STORE = "media";
const EARTH_TEXTURE = "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";
const GLOBE_ZOOM_MIN = 1;
const GLOBE_ZOOM_MAX = 2.7;
const objectUrls = new Set();
const cityImages = {
  London: "photo-1513635269975-59663e0ac1ad",
  Paris: "photo-1502602898657-3e91760cbb34",
  Amsterdam: "photo-1512470876302-972faa2aa9a4",
  Berlin: "photo-1560969184-10fe8719e047",
  Prague: "photo-1519677100203-a0e668c92439",
  Venice: "photo-1514890547357-a9ee288728e0",
  Florence: "photo-1516483638261-f4dbaf036963",
  Milan: "photo-1513584684374-8bab748fbf90",
  Marseille: "photo-1509023464722-18d996393ca8",
  Barcelona: "photo-1583422409516-2895a77efded",
  Madrid: "photo-1539037116277-4db20889f2d4"
};
const globeCities = {
  London: [-0.1, 51.5], Paris: [2.35, 48.86], Amsterdam: [4.9, 52.37],
  Berlin: [13.4, 52.52], Prague: [14.42, 50.08], Venice: [12.32, 45.44],
  Florence: [11.25, 43.77], Milan: [9.19, 45.46], Marseille: [5.37, 43.3],
  Barcelona: [2.17, 41.39], Madrid: [-3.7, 40.42]
};
const globeOrigin = { name: "Chicago", coordinates: [-87.63, 41.88] };
const cityMoods = {
  London: { title: "A London daydream", note: "Red buses, old maps, garden roses, and something warm from the tea tin.", stamp: "TEA TIME", palette: ["#b6202a", "#748ea1", "#eadbbb", "#dbbc97", "#2f2926"], cues: ["Carnival crimson", "Circus blue", "Aged parchment"] },
  Paris: { title: "A little love note to Paris", note: "Powder-pink mornings, café crème, and a tiny bouquet from the corner market.", stamp: "BONJOUR", palette: ["#f2d8dc", "#bd7485", "#f4e9d4", "#804456", "#493a3c"], cues: ["Rosewater pink", "Café au lait", "Velvet burgundy"] },
  Amsterdam: { title: "Postcards from the canals", note: "Tulips on the table, canal-house windows, and bicycles against the brick.", stamp: "LIEVE GROETJES", palette: ["#c95e48", "#88a79b", "#f1e7cf", "#54776f", "#443c35"], cues: ["Tulip red", "Canal green", "Old brick"] },
  Berlin: { title: "Notes from Berlin", note: "A little gallery grit, Bauhaus color, and late nights in the city.", stamp: "GUTEN TAG", palette: ["#d8a946", "#bd5147", "#e8e2c9", "#67765b", "#292c2a"], cues: ["Poster yellow", "Brick red", "Gallery green"] },
  Prague: { title: "A Prague storybook", note: "Terracotta rooftops, blue hour, old bookshops, and one more bridge.", stamp: "DOBRÝ DEN", palette: ["#c37a58", "#7286a1", "#eee4cf", "#7b5348", "#41404a"], cues: ["Roof tile", "Bohemian blue", "Old paper"] },
  Venice: { title: "A slow day in Venice", note: "Lagoon light, painted shutters, and little flowers on a windowsill.", stamp: "CIAO, VENEZIA", palette: ["#78a99e", "#d5a45a", "#eee6d1", "#a95743", "#34463f"], cues: ["Lagoon glass", "Marigold", "Rosewood"] },
  Florence: { title: "Florence in the afternoon", note: "Sun-warmed terracotta, garden greens, and a sketchbook in the piazza.", stamp: "PIACERE", palette: ["#b95e43", "#76845d", "#f2e5cb", "#cfaa70", "#473628"], cues: ["Terracotta", "Olive leaf", "Tuscan sun"] },
  Milan: { title: "A Milan moodboard", note: "An old fashion plate, espresso after lunch, and a perfectly kept notebook.", stamp: "CON AMORE", palette: ["#8b3940", "#b89a68", "#f1e9d6", "#6c745a", "#39332e"], cues: ["Burgundy", "Champagne", "Fashion-plate olive"] },
  Marseille: { title: "Salt air from Marseille", note: "Cobalt water, sun-faded shutters, and citrus in the afternoon light.", stamp: "BONJOUR MIDI", palette: ["#42809a", "#e2b95c", "#f1ead8", "#c76c4e", "#364744"], cues: ["Harbor blue", "Citrus peel", "Sun-washed white"] },
  Barcelona: { title: "A Barcelona summer", note: "Sea-glass blues, mosaic color, orange blossom, and a long beach walk.", stamp: "HOLA, BARCELONA", palette: ["#448596", "#df9655", "#efe3c9", "#b75543", "#3b463c"], cues: ["Sea glass", "Orange blossom", "Mosaic tile"] },
  Madrid: { title: "A Madrid golden hour", note: "Vermilion shutters, warm gold, a little café table, and a very late supper.", stamp: "BUENOS DÍAS", palette: ["#b74f3e", "#d0a04e", "#f2e6cb", "#73805d", "#41382d"], cues: ["Vermilion", "Golden hour", "Olive branch"] }
};
const globeState = { longitude: -38, latitude: 44, zoom: 1.2, dragging: false, frame: 0, routeStartedAt: 0 };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function imageUrl(city, width) {
  const image = cityImages[city.name];
  return image ? "https://images.unsplash.com/" + image + "?auto=format&fit=crop&w=" + width + "&q=85" : "";
}

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Could not read saved travel notes.", error);
    showNotice("Saved travel notes could not be read. The original guide is still available.", true);
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Could not save travel notes.", error);
    showNotice("Your browser could not save this change. Check its available storage and try again.", true);
    return false;
  }
}

function showNotice(message, isError) {
  let notice = document.getElementById("app-notice");
  if (!notice) {
    notice = document.createElement("p");
    notice.id = "app-notice";
    notice.className = "app-notice";
    notice.setAttribute("role", "status");
    document.body.append(notice);
  }
  notice.textContent = message;
  notice.classList.toggle("is-error", Boolean(isError));
  notice.hidden = false;
  window.clearTimeout(notice.hideTimer);
  notice.hideTimer = window.setTimeout(() => { notice.hidden = true; }, 5000);
}

function getGuide(city) {
  const all = readStored(GUIDE_KEY, {});
  return { ...city, ...(all[slug(city.name)] || {}) };
}

function getJournal() {
  return readStored(JOURNAL_KEY, {});
}

function openMediaDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("This browser does not support local media storage."));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DB_STORE)) {
        const store = database.createObjectStore(DB_STORE, { keyPath: "id" });
        store.createIndex("city", "city");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local media storage."));
  });
}

async function storeMedia(record) {
  const database = await openMediaDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DB_STORE, "readwrite");
    transaction.objectStore(DB_STORE).put(record);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error || new Error("Could not save this file.")); };
    transaction.onabort = () => { database.close(); reject(transaction.error || new Error("The file save was cancelled.")); };
  });
}

async function getCityMedia(citySlug) {
  const database = await openMediaDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DB_STORE, "readonly");
    const request = transaction.objectStore(DB_STORE).index("city").getAll(citySlug);
    request.onsuccess = () => {
      database.close();
      resolve(request.result.sort((first, second) => second.created - first.created));
    };
    request.onerror = () => { database.close(); reject(request.error || new Error("Could not load saved photos and videos.")); };
  });
}

async function deleteMedia(id) {
  const database = await openMediaDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DB_STORE, "readwrite");
    transaction.objectStore(DB_STORE).delete(id);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error || new Error("Could not delete this file.")); };
  });
}

function releaseObjectUrls() {
  objectUrls.forEach(url => URL.revokeObjectURL(url));
  objectUrls.clear();
}

function renderNav(activeSlug) {
  nav.innerHTML = CITIES.map((city, index) => {
    const citySlug = slug(city.name);
    return '<a href="#' + citySlug + '"' + (citySlug === activeSlug ? ' class="on" aria-current="page"' : "") + '><span class="nav-number">' + String(index + 1).padStart(2, "0") + '</span><span>' + escapeHTML(city.name) + "</span></a>";
  }).join("");
}

function updateGlobe(globe, pins) {
  if (!globe.isConnected) return;
  const centerLongitude = globeState.longitude * Math.PI / 180;
  const centerLatitude = globeState.latitude * Math.PI / 180;
  const backgroundOffset = ((globeState.longitude / 180 + 0.5) % 1 + 1) % 1;
  globe.style.setProperty("--earth-offset", (backgroundOffset * 100) + "%");
  const textureLatitude = (90 - globeState.latitude) / 180;
  const backgroundLatitude = ((textureLatitude * 2.15 - 0.5) / 1.15) * 100;
  globe.style.setProperty("--earth-latitude-offset", backgroundLatitude + "%");
  globe.style.setProperty("--globe-scale", String(globeState.zoom));
  const routePath = globe.querySelector(".flight-path");
  const plane = globe.querySelector(".flight-plane");
  const projected = [];
  const labels = [];
  const project = coordinates => {
    const [longitude, latitude] = coordinates;
    const phi = latitude * Math.PI / 180;
    const delta = (longitude * Math.PI / 180) - centerLongitude;
    const x = Math.cos(phi) * Math.sin(delta);
    const y = Math.sin(phi) * Math.cos(centerLatitude) - Math.cos(phi) * Math.cos(delta) * Math.sin(centerLatitude);
    const depth = Math.sin(phi) * Math.sin(centerLatitude) + Math.cos(phi) * Math.cos(delta) * Math.cos(centerLatitude);
    return { x: 50 + x * 46 * globeState.zoom, y: 50 - y * 46 * globeState.zoom, depth };
  };

  const origin = globe.querySelector(".globe-origin");
  if (origin) {
    const point = project(globeOrigin.coordinates);
    const visible = point.depth > 0.04;
    origin.style.left = point.x + "%";
    origin.style.top = point.y + "%";
    origin.style.opacity = visible ? String(0.55 + point.depth * 0.45) : "0";
    origin.style.pointerEvents = visible ? "auto" : "none";
    origin.tabIndex = visible ? 0 : -1;
    origin.setAttribute("aria-hidden", visible ? "false" : "true");
    if (visible) projected.push(point);
  }

  pins.forEach(pin => {
    const city = CITIES.find(item => slug(item.name) === pin.dataset.city);
    const point = project(globeCities[city ? city.name : ""] || [0, 48]);
    const visible = point.depth > 0.04;
    pin.style.left = point.x + "%";
    pin.style.top = point.y + "%";
    pin.style.opacity = visible ? String(0.55 + point.depth * 0.45) : "0";
    pin.style.pointerEvents = visible && !globeState.dragging ? "auto" : "none";
    pin.style.transform = "translate(-50%, -50%) scale(" + (0.72 + Math.max(0, point.depth) * 0.38) + ")";
    pin.tabIndex = visible ? 0 : -1;
    pin.setAttribute("aria-hidden", visible ? "false" : "true");
    const label = pin.querySelector(".pin-label");
    if (visible) {
      projected.push(point);
      labels.push({ pin, label, point, name: city ? city.name : "" });
    }
  });

  const occupied = [];
  const scale = globe.clientWidth / 418 * globeState.zoom;
  const candidates = [[44,-22],[-44,-22],[44,22],[-44,22],[0,-40],[0,40],[58,0],[-58,0],[62,-34],[-62,-34],[62,34],[-62,34]];
  labels.forEach((item, index) => {
    const width = (item.name.length * 6.4 + 18) * globeState.zoom;
    const height = 27 * globeState.zoom;
    const x = item.point.x * globe.clientWidth / 100;
    const y = item.point.y * globe.clientHeight / 100;
    const choices = candidates.map((candidate, candidateIndex) => {
      const angle = ((candidateIndex + index * 5) % candidates.length) / candidates.length * Math.PI * 2;
      const radius = (candidateIndex < 8 ? 46 : 64) * scale;
      return { x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius };
    });
    let best = choices[0];
    let bestScore = Infinity;
    choices.forEach(choice => {
      const rect = { left: choice.x - width / 2, right: choice.x + width / 2, top: choice.y - height / 2, bottom: choice.y + height / 2 };
      const boundsPenalty = Math.max(0, 8 - rect.left) + Math.max(0, rect.right - globe.clientWidth + 8) + Math.max(0, 8 - rect.top) + Math.max(0, rect.bottom - globe.clientHeight + 8);
      const overlap = occupied.reduce((total, other) => {
        const overlapWidth = Math.max(0, Math.min(rect.right, other.right) - Math.max(rect.left, other.left));
        const overlapHeight = Math.max(0, Math.min(rect.bottom, other.bottom) - Math.max(rect.top, other.top));
        return total + overlapWidth * overlapHeight;
      }, 0);
      const score = overlap * 20 + boundsPenalty * 100 + Math.hypot(choice.x - x, choice.y - y) * 0.1;
      if (score < bestScore) { best = choice; bestScore = score; }
    });
    occupied.push({ left: best.x - width / 2, right: best.x + width / 2, top: best.y - height / 2, bottom: best.y + height / 2 });
    item.label.style.setProperty("--label-x", ((best.x - x) / globeState.zoom) + "px");
    item.label.style.setProperty("--label-y", ((best.y - y) / globeState.zoom) + "px");
    item.label.style.setProperty("--leader-length", (Math.hypot(x - best.x, y - best.y) / scale) + "px");
    item.label.style.setProperty("--leader-angle", (Math.atan2(y - best.y, x - best.x) * 180 / Math.PI) + "deg");
  });

  if (routePath && plane) {
    let route = "";
    if (projected.length > 1) {
      route = "M " + projected[0].x.toFixed(2) + " " + projected[0].y.toFixed(2);
      for (let index = 1; index < projected.length; index += 1) {
        const previous = projected[index - 1];
        const current = projected[index];
        const controlX = (previous.x + current.x) / 2 + (current.y - previous.y) * 0.18;
        const controlY = (previous.y + current.y) / 2 - (current.x - previous.x) * 0.18;
        route += " Q " + controlX.toFixed(2) + " " + controlY.toFixed(2) + " " + current.x.toFixed(2) + " " + current.y.toFixed(2);
      }
    }
    routePath.setAttribute("d", route);
    positionGlobePlane(globe, performance.now());
  }
}

function positionGlobePlane(globe, now) {
  const path = globe.querySelector(".flight-path");
  const plane = globe.querySelector(".flight-plane");
  if (!path || !plane || !path.getAttribute("d")) {
    if (plane) plane.setAttribute("visibility", "hidden");
    return;
  }
  const length = path.getTotalLength();
  if (!length) {
    plane.setAttribute("visibility", "hidden");
    return;
  }
  const elapsed = reduceMotion.matches ? 0 : now - globeState.routeStartedAt;
  const distance = (elapsed / 14000 % 1) * length;
  const current = path.getPointAtLength(distance);
  const ahead = path.getPointAtLength(Math.min(length, distance + 0.4));
  const angle = Math.atan2(ahead.y - current.y, ahead.x - current.x) * 180 / Math.PI;
  plane.setAttribute("transform", "translate(" + current.x.toFixed(2) + " " + current.y.toFixed(2) + ") rotate(" + angle.toFixed(1) + ")");
  plane.setAttribute("visibility", "visible");
}

function setupGlobe() {
  const globe = document.querySelector(".globe");
  const pins = Array.from(document.querySelectorAll(".globe-pin"));
  const hint = document.querySelector(".globe-hint");
  const result = document.querySelector(".globe-result");
  const spinButton = document.querySelector(".globe-spin");
  const zoomControl = document.querySelector(".globe-zoom");
  if (!globe || !pins.length || !spinButton || !hint || !result || !zoomControl) return;

  globe.style.setProperty("--earth-texture", 'url("' + EARTH_TEXTURE + '")');
  globeState.routeStartedAt = performance.now();
  const paint = () => updateGlobe(globe, pins);
  const clampLatitude = value => Math.max(-65, Math.min(75, value));
  if (!reduceMotion.matches) {
    const flightTimer = window.setInterval(() => {
      if (!globe.isConnected) {
        window.clearInterval(flightTimer);
        return;
      }
      positionGlobePlane(globe, performance.now());
    }, 40);
  }
  const stopSpin = () => {
    if (globeState.frame) cancelAnimationFrame(globeState.frame);
    globeState.frame = 0;
    globe.classList.remove("is-spinning");
  };

  globe.addEventListener("pointerdown", event => {
    if (event.target.closest(".globe-pin") || event.button !== 0) return;
    stopSpin();
    globeState.dragging = true;
    globeState.pointerX = event.clientX;
    globeState.pointerY = event.clientY;
    globeState.moved = false;
    globe.setPointerCapture(event.pointerId);
    globe.classList.add("is-dragging");
    result.innerHTML = "";
    hint.textContent = "Keep dragging to spin the Earth.";
  });

  globe.addEventListener("pointermove", event => {
    if (!globeState.dragging) return;
    const deltaX = event.clientX - globeState.pointerX;
    const deltaY = event.clientY - globeState.pointerY;
    globeState.pointerX = event.clientX;
    globeState.pointerY = event.clientY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 1) globeState.moved = true;
    globeState.longitude = ((globeState.longitude - deltaX * 0.42 / globeState.zoom + 180) % 360 + 360) % 360 - 180;
    globeState.latitude = clampLatitude(globeState.latitude + deltaY * 0.35 / globeState.zoom);
    paint();
  });

  function finishDrag() {
    if (!globeState.dragging) return;
    globeState.dragging = false;
    globe.classList.remove("is-dragging");
    paint();
    hint.textContent = globeState.moved ? "Tap a glowing pin to open its city." : "Drag to explore · Tap a destination";
  }
  globe.addEventListener("pointerup", finishDrag);
  globe.addEventListener("pointercancel", finishDrag);
  globe.addEventListener("lostpointercapture", finishDrag);

  zoomControl.value = String(globeState.zoom);
  zoomControl.addEventListener("input", () => {
    globeState.zoom = Number(zoomControl.value);
    const focus = Math.max(0, Math.min(1, (globeState.zoom - 1.2) / (GLOBE_ZOOM_MAX - 1.2)));
    globeState.longitude = -38 + 43 * focus;
    globeState.latitude = 44 + 4 * focus;
    paint();
  });

  spinButton.addEventListener("click", () => {
    stopSpin();
    const choices = CITIES.filter(city => globeCities[city.name]);
    const selected = choices[Math.floor(Math.random() * choices.length)];
    const [targetLongitude, targetLatitude] = globeCities[selected.name];
    const startLongitude = globeState.longitude;
    const startLatitude = globeState.latitude;
    let longitudeDelta = targetLongitude - startLongitude;
    longitudeDelta = ((longitudeDelta + 180) % 360 + 360) % 360 - 180;
    longitudeDelta += (Math.random() < 0.5 ? -1 : 1) * (720 + Math.random() * 360);
    const startTime = performance.now();
    const duration = reduceMotion.matches ? 1 : 2600;
    globeState.dragging = false;
    globe.classList.add("is-spinning");
    result.innerHTML = "";
    pins.forEach(pin => pin.classList.remove("is-selected"));
    spinButton.disabled = true;
    hint.textContent = "Spinning toward somewhere in Europe…";

    function animate(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      globeState.longitude = startLongitude + longitudeDelta * eased;
      globeState.latitude = startLatitude + (targetLatitude - startLatitude) * eased;
      paint();
      if (progress < 1) {
        globeState.frame = requestAnimationFrame(animate);
        return;
      }
      globeState.longitude = targetLongitude;
      globeState.latitude = targetLatitude;
      globeState.frame = 0;
      globe.classList.remove("is-spinning");
      paint();
      spinButton.disabled = false;
      hint.textContent = "The globe stopped on " + selected.name + ".";
      result.innerHTML = '<a class="globe-result-link" href="#' + slug(selected.name) + '">Visit ' + escapeHTML(selected.name) + ' <span aria-hidden="true">↗</span></a>';
      const pin = pins.find(item => item.dataset.city === slug(selected.name));
      if (pin) pin.classList.add("is-selected");
    }
    globeState.frame = requestAnimationFrame(animate);
  });

  paint();
}

function renderCityMoodboard(city, index) {
  const mood = cityMoods[city.name];
  if (!mood) return "";
  const swatches = mood.palette.map(color => '<span style="--swatch-color:' + color + '" title="' + color + '"></span>').join("");
  const cues = mood.cues.map(cue => "<span>" + escapeHTML(cue) + "</span>").join("");
  const colors = mood.palette;
  const style = "--mood-primary:" + colors[0] + ";--mood-secondary:" + colors[1] + ";--mood-paper:" + colors[2] + ";--mood-pop:" + colors[3] + ";--mood-ink:" + colors[4];
  return '<aside class="city-moodboard" style="' + style + '" aria-label="' + escapeHTML(city.name) + ' visual moodboard"><div class="moodboard-copy"><p class="moodboard-kicker">COLLECTED IN EUROPE <span>·</span> ' + String(index + 1).padStart(2, "0") + ' / ' + String(CITIES.length).padStart(2, "0") + '</p><h2>' + escapeHTML(mood.title) + '</h2><p>' + escapeHTML(mood.note) + '</p><div class="moodboard-cues">' + cues + '</div><div class="moodboard-palette" aria-label="City color palette">' + swatches + '</div></div><div class="moodboard-art"><div class="map-scrap" aria-hidden="true"><span>' + escapeHTML(city.name.toUpperCase()) + '</span><i></i><b></b></div><figure class="photo-cutout"><img src="' + imageUrl(city, 780) + '" alt="A second little glimpse of ' + escapeHTML(city.name) + '" loading="lazy"><figcaption>' + escapeHTML(city.name) + ' · ' + escapeHTML(city.country) + '</figcaption></figure><svg class="flower-cutout" viewBox="0 0 120 150" role="img" aria-label="A little flower for ' + escapeHTML(city.name) + '"><path class="flower-stem" d="M58 144 C63 120 53 97 63 74 C69 60 75 52 78 43"/><path class="flower-leaf" d="M61 112 C39 104 32 91 35 80 C51 82 63 94 61 112Z"/><path class="flower-leaf" d="M60 125 C79 116 91 103 87 91 C71 94 61 108 60 125Z"/><g class="flower-head"><ellipse cx="78" cy="29" rx="10" ry="20"/><ellipse cx="78" cy="29" rx="10" ry="20" transform="rotate(72 78 42)"/><ellipse cx="78" cy="29" rx="10" ry="20" transform="rotate(144 78 42)"/><ellipse cx="78" cy="29" rx="10" ry="20" transform="rotate(216 78 42)"/><ellipse cx="78" cy="29" rx="10" ry="20" transform="rotate(288 78 42)"/><circle cx="78" cy="42" r="7"/></g></svg><div class="mood-stamp">' + escapeHTML(mood.stamp) + '<span>' + String(index + 1).padStart(2, "0") + '</span></div><p class="moodboard-handwriting">wish you were here</p></div></aside>';
}

function renderHome() {
  document.documentElement.dataset.view = "home";
  document.documentElement.removeAttribute("data-city");
  renderNav("");
  const pins = CITIES.map((city, index) => {
    return '<a class="globe-pin" data-city="' + slug(city.name) + '" href="#' + slug(city.name) + '" aria-label="Explore ' + escapeHTML(city.name) + '"><span class="pin-dot" aria-hidden="true"></span><span class="pin-label">' + escapeHTML(city.name) + '</span></a>';
  }).join("");
  main.innerHTML = '<section class="welcome" id="route"><div class="welcome-copy"><p class="eyebrow"><span></span> CHICAGO TO LONDON · ELEVEN STOPS</p><h1>See you <em>out there.</em></h1><p class="welcome-intro">The trip starts in Chicago and crosses the Atlantic to London. Zoom in on Europe, then follow the route.</p></div><div class="globe-stage"><div class="globe" role="group" aria-label="Interactive Earth. Drag to rotate, use the zoom slider, or choose a destination marker."><svg class="globe-routes" viewBox="0 0 100 100" aria-hidden="true"><path class="flight-path"></path><g class="flight-plane" visibility="hidden"><path d="M-3.5-1.9 3.8 0-3.5 1.9-1.3 0Z"></path><path d="M-.3-.4 1.2-3 2-2.7 1.3-.2"></path></g></svg><a class="globe-origin" href="#london" aria-label="Chicago departure, flying to London"><span class="origin-dot" aria-hidden="true"></span><span class="origin-label">Chicago · departure</span></a>' + pins + '</div><div class="globe-controls"><p class="globe-hint" aria-live="polite">Chicago → London · Drag to explore</p><label class="globe-zoom-label" for="globe-zoom">ZOOM</label><input class="globe-zoom" id="globe-zoom" type="range" min="' + GLOBE_ZOOM_MIN + '" max="' + GLOBE_ZOOM_MAX + '" step="0.05" value="1.2" aria-label="Zoom the globe toward Europe"><button class="globe-spin" type="button">Spin the globe <span aria-hidden="true">↻</span></button></div><div class="globe-result" aria-live="polite"></div></div><p class="welcome-coordinate" aria-hidden="true">CHICAGO → LONDON · 11 CITIES</p></section>';
  setupGlobe();
}

function renderEditor(city) {
  const fields = SECTIONS.map(([key, title]) => {
    const value = Array.isArray(city[key]) ? city[key].join("\n") : "";
    return '<label class="editor-field"><span>' + escapeHTML(title) + '</span><textarea name="' + key + '" rows="' + (key === "history" ? 5 : 3) + '" placeholder="Add a note on each new line">' + escapeHTML(value) + "</textarea></label>";
  }).join("");
  return '<details class="editor-panel"><summary><span>Edit this city guide</span><small>Changes are saved in this browser</small></summary><form class="guide-editor">' + fields + '<div class="form-actions"><button class="button button-primary" type="submit">Save guide</button><button class="button button-quiet" type="button" data-reset-guide>Restore original guide</button></div></form></details>';
}

function renderJournal(citySlug) {
  const entries = getJournal()[citySlug] || [];
  const list = entries.length
    ? entries.map(entry => '<article class="journal-entry"><div><p class="entry-date">' + escapeHTML(entry.date) + '</p><h4>' + escapeHTML(entry.title) + '</h4></div><p>' + escapeHTML(entry.text).replace(/\n/g, "<br>") + '</p><button class="icon-button" type="button" data-delete-journal="' + escapeHTML(entry.id) + '" aria-label="Delete journal entry">×</button></article>').join("")
    : '<p class="empty-note">The best stories haven’t happened yet.</p>';
  return '<section class="memory-section" id="journal"><div class="memory-heading"><div><p class="eyebrow">YOUR NOTES</p><h3>Little things to remember</h3><p class="memory-description">A place for the meals, mishaps, and moments you want to keep.</p></div></div><form class="journal-form"><label>Your entry<input name="title" maxlength="100" placeholder="A title for this moment" required></label><label>The story<textarea name="text" rows="4" maxlength="3000" placeholder="Write it down while it’s still fresh…" required></textarea></label><button class="button button-primary" type="submit">Save journal entry <span aria-hidden="true">↗</span></button></form><div class="journal-list">' + list + "</div></section>";
}

function renderMemories(assets) {
  return assets.map(asset => {
    const url = URL.createObjectURL(asset.blob);
    objectUrls.add(url);
    const media = asset.type.startsWith("video/")
      ? '<video src="' + url + '" controls preload="metadata" aria-label="' + escapeHTML(asset.caption || asset.fileName) + '"></video>'
      : '<img src="' + url + '" alt="' + escapeHTML(asset.caption || asset.fileName) + '">';
    const download = asset.type.startsWith("image/")
      ? '<button class="postcard-download" type="button" data-postcard="' + escapeHTML(asset.id) + '">Download postcard <span aria-hidden="true">↗</span></button>'
      : '<a class="postcard-download" href="' + url + '" download="' + escapeHTML(asset.fileName) + '">Download video <span aria-hidden="true">↗</span></a>';
    return '<figure class="memory-card"><div class="memory-visual">' + media + '<span class="postmark" aria-hidden="true">SENT<br>WITH LOVE</span></div><figcaption><p class="postcard-place">A postcard from ' + escapeHTML(asset.cityName) + '</p><p class="postcard-caption">' + escapeHTML(asset.caption || asset.fileName) + '</p><div class="postcard-actions">' + download + '<button class="text-button" type="button" data-delete-media="' + escapeHTML(asset.id) + '">Remove</button></div></figcaption></figure>';
  }).join("");
}

async function loadMemories(city, citySlug) {
  const grid = document.getElementById("memory-grid");
  if (!grid) return;
  try {
    const assets = await getCityMedia(citySlug);
    if (!grid.isConnected || grid.dataset.city !== citySlug) return;
    releaseObjectUrls();
    grid.innerHTML = assets.length ? renderMemories(assets) : '<p class="empty-note">Your future postcards will land here.</p>';
  } catch (error) {
    console.error("Could not load this city's saved media.", error);
    grid.innerHTML = '<p class="empty-note is-error">Photos and videos could not be loaded: ' + escapeHTML(error.message) + "</p>";
  }
}

function renderMediaSection(city) {
  return '<section class="memory-section" id="postcards"><div class="memory-heading"><div><p class="eyebrow">YOUR CAMERA ROLL</p><h3>Postcards from ' + escapeHTML(city.name) + '</h3><p class="memory-description">Add photos or little clips. Images can be saved as postcard keepsakes.</p></div></div><form class="upload-form"><label class="file-picker">Choose photos or videos<input name="files" type="file" accept="image/*,video/*" multiple required><span aria-hidden="true">＋</span></label><label>Caption (optional)<input name="caption" maxlength="180" placeholder="A note to go with these memories"></label><button class="button button-primary" type="submit">Add to this city <span aria-hidden="true">↗</span></button><p class="storage-note">Saved only in this browser. Each file must be under 15 MB.</p></form><div class="memory-grid" id="memory-grid" data-city="' + slug(city.name) + '"><p class="empty-note">Loading your postcards…</p></div></section>';
}

function renderCity(originalCity) {
  const city = getGuide(originalCity);
  const index = CITIES.indexOf(originalCity);
  const citySlug = slug(city.name);
  document.documentElement.dataset.view = "city";
  document.documentElement.dataset.city = citySlug;
  renderNav(citySlug);

  const sectionLinks = SECTIONS.filter(([key]) => Array.isArray(city[key]) && city[key].length)
    .map(([key, title]) => '<a href="#section-' + key + '">' + escapeHTML(title) + '</a>').join("");
  const sectionContent = SECTIONS.filter(([key]) => Array.isArray(city[key]) && city[key].length).map(([key, title]) => {
    const content = key === "history"
      ? city[key].map(paragraph => "<p>" + escapeHTML(paragraph) + "</p>").join("")
      : "<ul>" + city[key].map(entry => {
        const divider = entry.indexOf(" | ");
        const text = divider < 0 ? escapeHTML(entry) : "<strong>" + escapeHTML(entry.slice(0, divider)) + "</strong> " + escapeHTML(entry.slice(divider + 3));
        return "<li>" + text + "</li>";
      }).join("") + "</ul>";
    return '<section class="guide-section" id="section-' + key + '"><h3>' + escapeHTML(title) + '</h3><div class="guide-content">' + content + "</div></section>";
  }).join("");
  const previous = CITIES[(index + CITIES.length - 1) % CITIES.length];
  const next = CITIES[(index + 1) % CITIES.length];

  main.innerHTML = '<div class="city-page"><div class="city-hero"><img src="' + imageUrl(city, 2000) + '" alt="A view of ' + escapeHTML(city.name) + '" fetchpriority="high"><div class="city-hero-shade"></div><a class="back-link" href="#"><span aria-hidden="true">&#8592;</span> The whole trip</a><div class="hero-copy"><p class="city-count">STOP ' + String(index + 1).padStart(2, "0") + ' <span aria-hidden="true">/</span> ' + String(CITIES.length).padStart(2, "0") + '</p><h1>' + escapeHTML(city.name) + '</h1><p class="city-country">' + escapeHTML(city.country) + '</p></div><span class="welcome-coordinate" aria-hidden="true">' + String(index + 1).padStart(2, "0") + " / " + String(CITIES.length).padStart(2, "0") + '</span></div>' + renderCityMoodboard(city, index) + '<nav class="section-nav" aria-label="On this page">' + sectionLinks + '<a href="#journal">Your journal</a><a href="#postcards">Postcards</a><button class="edit-guide-link" type="button" data-open-editor>Edit guide</button></nav><div class="guide-sections">' + sectionContent + renderJournal(citySlug) + renderMediaSection(city) + renderEditor(city) + '</div><nav class="city-pager" aria-label="Browse cities"><a href="#' + slug(previous.name) + '"><span>PREVIOUS STOP</span><strong>&larr; ' + escapeHTML(previous.name) + '</strong></a><a href="#"><span>ROUTE OVERVIEW</span><strong>All ' + CITIES.length + ' cities &uarr;</strong></a><a href="#' + slug(next.name) + '"><span>NEXT STOP</span><strong>' + escapeHTML(next.name) + ' &rarr;</strong></a></nav><p class="local-storage-note">Your journal, uploads, and guide edits are saved in this browser only.</p></div>';
  loadMemories(city, citySlug);
}

function show() {
  releaseObjectUrls();
  if (stopCount) stopCount.textContent = String(CITIES.length);
  if (!CITIES.length) {
    nav.replaceChildren();
    main.innerHTML = '<p class="load-error">No city guides were loaded. Check that the city script files are listed before app.js.</p>';
    return;
  }
  const id = location.hash.slice(1).toLowerCase();
  if (!id || id === "home" || id === "route") {
    renderHome();
    if (id === "route") requestAnimationFrame(() => document.getElementById("route").scrollIntoView());
    else window.scrollTo(0, 0);
    return;
  }
  const city = CITIES.find(entry => slug(entry.name) === id);
  if (!city) {
    location.hash = "";
    return;
  }
  renderCity(city);
  window.scrollTo(0, 0);
}

main.addEventListener("click", async event => {
  const sectionLink = event.target.closest(".section-nav a");
  if (sectionLink) {
    event.preventDefault();
    document.querySelector(sectionLink.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (event.target.closest("[data-open-editor]")) {
    const editor = document.querySelector(".editor-panel");
    editor.open = true;
    editor.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (event.target.closest("[data-reset-guide]")) {
    const city = CITIES.find(entry => slug(entry.name) === location.hash.slice(1).toLowerCase());
    if (!city || !window.confirm("Restore this city's original guide and remove your edits?")) return;
    const saved = readStored(GUIDE_KEY, {});
    delete saved[slug(city.name)];
    if (writeStored(GUIDE_KEY, saved)) {
      renderCity(city);
      showNotice("The original city guide has been restored.");
    }
    return;
  }
  const journalDelete = event.target.closest("[data-delete-journal]");
  if (journalDelete) {
    const citySlug = location.hash.slice(1).toLowerCase();
    const journal = getJournal();
    journal[citySlug] = (journal[citySlug] || []).filter(entry => entry.id !== journalDelete.dataset.deleteJournal);
    if (writeStored(JOURNAL_KEY, journal)) renderCity(CITIES.find(city => slug(city.name) === citySlug));
    return;
  }
  const mediaDelete = event.target.closest("[data-delete-media]");
  if (mediaDelete) {
    try {
      await deleteMedia(mediaDelete.dataset.deleteMedia);
      const citySlug = location.hash.slice(1).toLowerCase();
      await loadMemories(CITIES.find(city => slug(city.name) === citySlug), citySlug);
      showNotice("Postcard removed.");
    } catch (error) {
      console.error("Could not remove saved media.", error);
      showNotice(error.message, true);
    }
    return;
  }
  const postcardButton = event.target.closest("[data-postcard]");
  if (postcardButton) await downloadPostcard(postcardButton.dataset.postcard, postcardButton);
});

main.addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.target;
  const city = CITIES.find(entry => slug(entry.name) === location.hash.slice(1).toLowerCase());
  if (!city) return;

  if (form.matches(".guide-editor")) {
    const all = readStored(GUIDE_KEY, {});
    const updates = {};
    SECTIONS.forEach(([key]) => {
      updates[key] = form.elements[key].value.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
    });
    if (writeStored(GUIDE_KEY, { ...all, [slug(city.name)]: updates })) {
      renderCity(city);
      showNotice("Your " + city.name + " guide has been saved in this browser.");
    }
    return;
  }

  if (form.matches(".journal-form")) {
    const journal = getJournal();
    const citySlug = slug(city.name);
    journal[citySlug] = journal[citySlug] || [];
    journal[citySlug].unshift({
      id: window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title: form.elements.title.value.trim(),
      text: form.elements.text.value.trim(),
      date: new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    });
    if (writeStored(JOURNAL_KEY, journal)) {
      renderCity(city);
      showNotice("Your journal entry has been saved.");
    }
    return;
  }

  if (form.matches(".upload-form")) {
    const files = Array.from(form.elements.files.files);
    const caption = form.elements.caption.value.trim();
    const invalid = files.find(file => (!file.type.startsWith("image/") && !file.type.startsWith("video/")) || file.size > 15 * 1024 * 1024);
    if (invalid) {
      showNotice("Choose an image or video smaller than 15 MB: " + invalid.name, true);
      return;
    }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      for (const file of files) {
        await storeMedia({
          id: window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
          city: slug(city.name),
          cityName: city.name,
          fileName: file.name,
          caption,
          type: file.type,
          blob: file,
          created: Date.now()
        });
      }
      await loadMemories(city, slug(city.name));
      form.reset();
      showNotice(files.length === 1 ? "Your memory is saved as a postcard." : files.length + " memories saved as postcards.");
    } catch (error) {
      console.error("Could not save uploaded media.", error);
      showNotice(error.message, true);
    } finally {
      submit.disabled = false;
    }
  }
});

async function downloadPostcard(id, button) {
  button.disabled = true;
  try {
    const assets = await getCityMedia(location.hash.slice(1).toLowerCase());
    const asset = assets.find(item => item.id === id);
    if (!asset || !asset.type.startsWith("image/")) throw new Error("This postcard image is no longer available.");
    const source = URL.createObjectURL(asset.blob);
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not create the postcard.");
    context.fillStyle = "#f5edda";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const scale = Math.max(1120 / image.width, 610 / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    context.save();
    context.beginPath();
    context.rect(40, 40, 1120, 610);
    context.clip();
    context.drawImage(image, 40 + (1120 - width) / 2, 40 + (610 - height) / 2, width, height);
    context.restore();
    context.fillStyle = "#f5edda";
    context.textBaseline = "middle";
    context.fillStyle = "#253e31";
    context.font = "600 34px Georgia, serif";
    context.fillText(asset.cityName.toUpperCase(), 48, 710);
    context.font = "18px Arial, sans-serif";
    context.fillStyle = "#6a7465";
    const caption = asset.caption || "Greetings from " + asset.cityName;
    context.fillText(caption.slice(0, 82), 50, 754);
    context.font = "15px Arial, sans-serif";
    context.fillText("POSTCARD · " + new Date(asset.created).toLocaleDateString(), 810, 710);
    canvas.toBlob(blob => {
      URL.revokeObjectURL(source);
      if (!blob) {
        showNotice("Your browser could not download the postcard.", true);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = slug(asset.cityName) + "-postcard.png";
      link.click();
      URL.revokeObjectURL(url);
      showNotice("Your postcard is ready to keep.");
    }, "image/png");
  } catch (error) {
    console.error("Could not make this postcard.", error);
    showNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

window.addEventListener("hashchange", show);
show();
