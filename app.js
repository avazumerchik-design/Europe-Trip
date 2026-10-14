// Sections shown on each city page, in order. Format: [key in the data file, heading].
// Reorder, rename or remove lines to change the layout. A section is skipped if a city has no data for it.
const SECTIONS = [
  ["see",     "What to see"],
  ["eat",     "Food"],
  ["drink",   "Bars and nightlife"],
  ["history", "History"],
  ["tips",    "Culture and tips"],
  ["watch",   "Films"],
  ["read",    "Books and reading"],
  ["now",     "Right now"]
];

const nav = document.getElementById("nav");
const main = document.getElementById("main");
const slug = n => n.toLowerCase().replace(/\s+/g, "-");
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
// "Title | description" shows the title in bold. Plain text works too.
function item(s) {
  const i = s.indexOf(" | ");
  return i < 0 ? s : "<strong>" + s.slice(0, i) + "</strong> " + s.slice(i + 3);
}

CITIES.forEach((c, index) => {
  const a = document.createElement("a");
  a.href = "#" + slug(c.name);
  a.innerHTML = '<span class="nav-number">' + String(index + 1).padStart(2, "0") + '</span><span>' + c.name + '</span>';
  nav.appendChild(a);
});

function show() {
  const id = location.hash.slice(1) || slug(CITIES[0].name);
  const c = CITIES.find(x => slug(x.name) === id) || CITIES[0];
  document.documentElement.dataset.city = slug(c.name);
  [...nav.children].forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + slug(c.name)));
  const have = SECTIONS.filter(([k]) => c[k] && c[k].length);

  const index = CITIES.indexOf(c);
  const image = cityImages[c.name];
  let html = '<div class="city-hero"><img src="https://images.unsplash.com/' + image + '?auto=format&fit=crop&w=2000&q=85" alt="A view of ' + c.name + '" fetchpriority="high"><div class="hero-copy"><p class="city-count">Stop ' + String(index + 1).padStart(2, "0") + ' <span aria-hidden="true">/</span> ' + String(CITIES.length).padStart(2, "0") + '</p><h2>' + c.name + '<span>' + c.country + '</span></h2></div></div>';
  html += '<div class="jump">' + have.map(([k, t]) => '<button data-s="' + k + '">' + t + "</button>").join("") + "</div>";
  have.forEach(([k, t]) => {
    html += '<section id="s-' + k + '"><h3>' + t + "</h3>";
    html += k === "history"
      ? c[k].map(p => "<p>" + p + "</p>").join("")
      : "<ul>" + c[k].map(x => "<li>" + item(x) + "</li>").join("") + "</ul>";
    html += "</section>";
  });
  main.innerHTML = html;
  window.scrollTo(0, 0);
  main.querySelectorAll(".jump button").forEach(b =>
    b.onclick = () => document.getElementById("s-" + b.dataset.s).scrollIntoView({ behavior: "smooth" }));
}

window.addEventListener("hashchange", show);
show();
