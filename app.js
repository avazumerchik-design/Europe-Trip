const SECTIONS = [
  ["see", "What to see"],
  ["eat", "Food"],
  ["drink", "Bars and nightlife"],
  ["history", "History"],
  ["tips", "Culture and tips"],
  ["watch", "Films"],
  ["read", "Books and reading"],
  ["now", "Right now"]
];

const nav = document.getElementById("nav");
const main = document.getElementById("main");
const stopCount = document.getElementById("stop-count");
const slug = name => name.toLowerCase().replace(/\s+/g, "-");

main.addEventListener("click", event => {
  const sectionLink = event.target.closest(".section-nav a");
  if (!sectionLink) return;
  event.preventDefault();
  document.querySelector(sectionLink.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
});
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

function imageUrl(city, width) {
  return "https://images.unsplash.com/" + cityImages[city.name] + "?auto=format&fit=crop&w=" + width + "&q=85";
}

function item(text) {
  const divider = text.indexOf(" | ");
  return divider < 0 ? text : "<strong>" + text.slice(0, divider) + "</strong> " + text.slice(divider + 3);
}

function renderNav(activeSlug) {
  nav.innerHTML = CITIES.map((city, index) => {
    const citySlug = slug(city.name);
    return '<a href="#' + citySlug + '"' + (citySlug === activeSlug ? ' class="on" aria-current="page"' : "") + '><span class="nav-number">' + String(index + 1).padStart(2, "0") + '</span><span>' + city.name + "</span></a>";
  }).join("");
}

function renderHome() {
  document.documentElement.dataset.view = "home";
  document.documentElement.removeAttribute("data-city");
  renderNav("");

  const stops = CITIES.map((city, index) => '<a class="stop-card" href="#' + slug(city.name) + '"><span class="stop-photo"><img src="' + imageUrl(city, 560) + '" alt="" loading="lazy"><span class="stop-index">' + String(index + 1).padStart(2, "0") + '</span></span><span class="stop-copy"><strong>' + city.name + '</strong><span>' + city.country + '</span><span class="stop-arrow" aria-hidden="true">&#8599;</span></span></a>').join("");

  main.innerHTML = '<section class="welcome"><img class="welcome-photo" src="' + imageUrl(CITIES[0], 2200) + '" alt="A view across London" fetchpriority="high"><div class="welcome-shade"></div><div class="welcome-copy"><p class="eyebrow"><span></span> 11 stops · one long way around</p><h1>Europe, <em>one city</em><br>at a time.</h1><p class="welcome-intro">A growing field guide for taking the long way through Europe. Quick notes on each city’s food, bars, sights, history, and culture, updated weekly through 2026 as I learn more. It’s a rough draft for now, but I’m excited to keep adding depth, stories, and context because knowing the meaning behind a place makes every corner feel more alive.</p><div class="welcome-actions"><a class="button button-primary" href="#london">Start exploring <span aria-hidden="true">&#8594;</span></a><a class="button button-glass" href="#route">See all 11 stops <span aria-hidden="true">&#8595;</span></a></div><p class="welcome-note">London to Madrid <span aria-hidden="true">·</span> 11 city guides</p></div><span class="welcome-coordinate" aria-hidden="true">51°30\'26.4\"N&nbsp; 0°07\'39.6\"W</span></section><section class="route-overview" id="route"><div class="section-heading"><div><p class="eyebrow">THE ROUTE</p><h2>Pick your next stop.</h2></div><p>Eleven cities, all in one place.<br>Choose a destination to get moving.</p></div><div class="stop-grid">' + stops + '</div></section>';
}

function renderCity(city) {
  const index = CITIES.indexOf(city);
  const citySlug = slug(city.name);
  document.documentElement.dataset.view = "city";
  document.documentElement.dataset.city = citySlug;
  renderNav(citySlug);

  const sections = SECTIONS.filter(([key]) => Array.isArray(city[key]) && city[key].length);
  const sectionLinks = sections.map(([key, title]) => '<a href="#section-' + key + '">' + title + '</a>').join("");
  const sectionContent = sections.map(([key, title]) => {
    const content = key === "history"
      ? city[key].map(paragraph => "<p>" + paragraph + "</p>").join("")
      : "<ul>" + city[key].map(entry => "<li>" + item(entry) + "</li>").join("") + "</ul>";
    return '<section class="guide-section" id="section-' + key + '"><h3>' + title + "</h3><div class=\"guide-content\">" + content + "</div></section>";
  }).join("");
  const previous = CITIES[(index + CITIES.length - 1) % CITIES.length];
  const next = CITIES[(index + 1) % CITIES.length];

  main.innerHTML = '<div class="city-page"><div class="city-hero"><img src="' + imageUrl(city, 2000) + '" alt="A view of ' + city.name + '" fetchpriority="high"><div class="city-hero-shade"></div><a class="back-link" href="#"><span aria-hidden="true">&#8592;</span> All stops</a><div class="hero-copy"><p class="city-count">STOP ' + String(index + 1).padStart(2, "0") + ' <span aria-hidden="true">/</span> ' + String(CITIES.length).padStart(2, "0") + '</p><h1>' + city.name + '</h1><p class="city-country">' + city.country + '</p></div><span class="welcome-coordinate" aria-hidden="true">' + String(index + 1).padStart(2, "0") + " / " + String(CITIES.length).padStart(2, "0") + '</span></div><nav class="section-nav" aria-label="On this page">' + sectionLinks + '</nav><div class="guide-sections">' + sectionContent + '</div><nav class="city-pager" aria-label="Browse cities"><a href="#' + slug(previous.name) + '"><span>PREVIOUS STOP</span><strong>&larr; ' + previous.name + '</strong></a><a href="#"><span>ROUTE OVERVIEW</span><strong>All 11 cities &uarr;</strong></a><a href="#' + slug(next.name) + '"><span>NEXT STOP</span><strong>' + next.name + ' &rarr;</strong></a></nav></div>';
}

function show() {
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

window.addEventListener("hashchange", show);
show();
