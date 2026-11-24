Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZThlOGJlNC01OWFkLTQzNmUtYmE5Ni1lYmZkYWUyNDM3MWMiLCJpZCI6NDUxMTU5LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODI4OTYzMzN9.Kxl6RxXxFEUJ0WSMdKSdDg6tms-6D_lWOPU1wOlrjT8";

// Mode démo (version publique, générée par preparer-demo.sh) : lecture seule.
// Aucune écriture dans le Sheet, pas d'import ni de gestion d'objets — les
// éléments correspondants portent la classe demoHidden.
const DEMO_MODE = window.SHEPHERD_DEMO === true;
if (DEMO_MODE) document.body.classList.add("demoMode");

// Démo : libellés plus explicites et invites (flèche + texte) pour guider le
// visiteur. Le vrai Shepherd garde son interface telle quelle.
function demoCtaHint(id, html, hidden = false) {
  const el = document.createElement("div");
  el.className = "ctaHint";
  el.id = id;
  el.hidden = hidden;
  el.innerHTML = `<span class="ctaArrow" aria-hidden="true">➜</span><span>${html}</span>`;
  return el;
}

if (DEMO_MODE) {
  const sideTitle = "Upcoming collisions";
  document.querySelectorAll('.dockBtn[data-panel="sidePanel"]').forEach(btn => {
    btn.title = sideTitle;
    btn.setAttribute("aria-label", sideTitle);
  });
  document.querySelector("#sidePanel .distancePanelTitle").textContent = sideTitle;
  document.querySelector("#sidePanel .distancePanelHeader .infoTip").dataset.info =
    "Finds objects that will pass too close to each other in the coming hours.";
  document.getElementById("conjRunBtn").textContent = "Detect collisions";
  document.querySelector(".conjControls").before(demoCtaHint("conjRunCta",
    "Select the constellation to protect, then <strong>start the detection</strong>"));
  document.getElementById("conjResults").before(demoCtaHint("conjClickCta",
    "<strong>Click a situation</strong> to view the collision in 3D", true));

  document.querySelector("#distanceMeasureDetails .summaryLabel").insertAdjacentHTML("afterbegin",
    '<svg class="btnIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>');
  document.querySelector("#distancePanel .customSiteRow").before(demoCtaHint("customSiteCta",
    "Measure the distance from satellites to <strong>any point you choose</strong>: enter a city or coordinates"));
}

// En démo, seuls ces panneaux s'ouvrent. Les autres boutons du dock restent
// visibles mais grisés, avec leur rôle affiché au survol (voir demoLockTip).
const DEMO_OPEN_PANELS = ["distancePanel", "sidePanel", "orbitalParamsPanel"];
function isDemoLockedPanel(panelId) {
  return DEMO_MODE && !DEMO_OPEN_PANELS.includes(panelId)
    && !!document.querySelector(`.dockBtn[data-panel="${panelId}"]`);
}

// Grise un contrôle de la démo et affiche au survol son nom et son rôle.
let demoLockTipEl = null;
function lockDemoControl(el, title, info, note = "Available in the full version, not in this demo.") {
  if (!demoLockTipEl) {
    demoLockTipEl = document.createElement("div");
    demoLockTipEl.id = "demoLockTip";
    document.body.appendChild(demoLockTipEl);
  }
  el.classList.add("demoLocked");
  el.setAttribute("aria-disabled", "true");
  el.setAttribute("aria-label", `${title} (unavailable in the demo)`);
  el.removeAttribute("title");
  el.addEventListener("mouseenter", () => {
    const tipEl = demoLockTipEl;
    tipEl.replaceChildren();
    const titleEl = document.createElement("div");
    titleEl.className = "demoLockTipTitle";
    titleEl.textContent = title;
    const infoEl = document.createElement("div");
    infoEl.textContent = info;
    const noteEl = document.createElement("div");
    noteEl.className = "demoLockTipNote";
    noteEl.textContent = note;
    tipEl.append(titleEl, infoEl, noteEl);
    tipEl.style.display = "block";
    const r = el.getBoundingClientRect();
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let left = r.left + r.width / 2 - w / 2;
    let top = r.bottom + 8;
    if (top + h > innerHeight - 8) top = r.top - h - 8;
    if (el.closest(".dockVertical")) {
      left = r.right + 8 + w > innerWidth - 8 ? r.left - w - 8 : r.right + 8;
      top = r.top + r.height / 2 - h / 2;
    }
    tipEl.style.left = `${Math.max(8, Math.min(left, innerWidth - w - 8))}px`;
    tipEl.style.top = `${Math.max(8, Math.min(top, innerHeight - h - 8))}px`;
  });
  el.addEventListener("mouseleave", () => { demoLockTipEl.style.display = "none"; });
}

// Icônes SVG inline (même style que le dock : trait, sans remplissage),
// réutilisées dans les boutons générés dynamiquement.
const ICON_TRASH = `<svg class="btnIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`;
const ICON_CAMERA = `<svg class="btnIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="12" height="12" rx="2"/><path d="M15 9.5l6-3v11l-6-3Z"/></svg>`;
const ICON_GROUND_TRACK = `<svg class="btnIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="M2.5 14c3-5 6-5 9.5 0s6.5 5 9.5 0"/></svg>`;

// Widgets Cesium superflus pour un suivi orbital (géocodeur, sélecteur 2D/3D,
// sélecteur de fond de carte, aide, plein écran, infoBox) désactivés ; seules
// l'horloge et la frise temporelle sont gardées, recolorées en CSS.
//
// useBrowserRecommendedResolution: false — par défaut Cesium rend la scène à
// la résolution CSS (1x) et laisse le navigateur l'agrandir sur les écrans à
// forte densité de pixels (Retina/OLED), ce qui floute tout, texte des labels
// compris, aussi net que soit le contenu baké dessus. Ça rend à la résolution
// physique de l'écran (devicePixelRatio) à la place — plus net, plus coûteux
// en pixels à remplir (à surveiller avec plusieurs centaines d'objets).
const viewer = new Cesium.Viewer("cesiumContainer", {
  shouldAnimate: true,
  terrainProvider: new Cesium.EllipsoidTerrainProvider(),
  useBrowserRecommendedResolution: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  baseLayerPicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  infoBox: false,
  selectionIndicator: false,
});

// Temps réel par défaut ; l'accélération reste réglable depuis l'horloge.
viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER;
viewer.clock.currentTime = Cesium.JulianDate.now();
viewer.clock.multiplier = 1;

// Horloge et frise : Cesium affiche l'UTC par défaut. Affichage en heure
// locale du navigateur, qui suit seule l'heure d'été / d'hiver ; le fuseau
// est indiqué à côté de l'heure (ex. UTC+1). Les calculs restent en UTC.
const CLOCK_DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const CLOCK_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" });
const TIMELINE_LABEL_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

if (viewer.animation) {
  viewer.animation.viewModel.dateFormatter = date => CLOCK_DATE_FORMAT.format(Cesium.JulianDate.toDate(date));
  viewer.animation.viewModel.timeFormatter = date => CLOCK_TIME_FORMAT.format(Cesium.JulianDate.toDate(date));
}
if (viewer.timeline) {
  viewer.timeline.makeLabel = date => TIMELINE_LABEL_FORMAT.format(Cesium.JulianDate.toDate(date));
  viewer.timeline.resize(); // redessine les graduations avec le nouveau format
}

// Cesium bake le texte des labels sur un canvas au moment où l'entité est
// créée : si la police web n'est pas encore chargée à cet instant, il retombe
// sur une police système et le garde (pas de re-rendu automatique quand la
// police finit de charger). On la précharge donc dès le départ, en parallèle
// du reste de l'initialisation, pour qu'elle soit prête avant les premiers labels.
// Étiquettes 3D : les Label Cesium posent chaque lettre séparément, ce qui
// décale les lettres entre elles. Le texte est donc dessiné d'un bloc dans
// un canvas (rendu texte natif du navigateur), à LABEL_RASTER_SCALE fois la
// taille voulue, et affiché en billboard réduit d'autant. Le texte est blanc
// avec un contour sombre : la couleur vient de la teinte du billboard.
const LABEL_FONT_FAMILY = '"IBM Plex Mono", Menlo, Consolas, monospace';
const LABEL_RASTER_SCALE = 3;
const LABEL_IMAGE_SCALE = 1 / LABEL_RASTER_SCALE;

function labelImage(text, sizePx, weight = 500) {
  const font = `${weight} ${sizePx * LABEL_RASTER_SCALE}px ${LABEL_FONT_FAMILY}`;
  const outline = 1.5 * LABEL_RASTER_SCALE;
  const pad = Math.ceil(outline) + 2;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + pad * 2;
  canvas.height = Math.ceil(sizePx * LABEL_RASTER_SCALE * 1.3) + pad * 2;
  ctx.font = font; // réinitialisé par le redimensionnement du canvas
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = outline * 2;
  ctx.strokeStyle = "rgba(5, 7, 10, 0.9)";
  ctx.strokeText(text, pad, canvas.height / 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(text, pad, canvas.height / 2);
  return canvas;
}

const labelFontsReady = Promise.all(
  [500, 600].map(weight => document.fonts.load(`${weight} 33px ${LABEL_FONT_FAMILY}`))
).catch(() => {});

viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 50000000;

const DEFAULT_VIEW_ALTITUDE_M = 25000000;

viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(0, 20, DEFAULT_VIEW_ALTITUDE_M),
});

// Le double-clic natif de Cesium suit l'entité cliquée elle-même (ex. le
// modèle 3D du marqueur) et court-circuite le mode suivi : le suivi passe
// uniquement par le clic simple (voir objectHoverHandler).
viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

// Recentre la vue sur la Terre (caméra à la verticale du point survolé,
// regard vers le centre), à l'altitude de la vue de départ.
function flyToEarthOverview() {
  const carto = viewer.camera.positionCartographic;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude * 0.5, DEFAULT_VIEW_ALTITUDE_M),
    orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
    duration: 1.5,
  });
}

// Stations laser (sol). La première est le site de référence par défaut
// du panneau Distances.
const LASER_SITES = [
  { name: "ESTACA", lat: 48.7875, lon: 2.0411, alt: 0 },
  { name: "Barcroft Station (California)", lat: 37.584, lon: -118.237, alt: 3100 },
  { name: "ALMA (Atacama, Chile)", lat: -23.023, lon: -67.755, alt: 3158 },
  { name: "Haleakala (Hawaii)", lat: 20.710, lon: -156.253, alt: 3052 },
  { name: "South Pole (Antarctica)", lat: -90.000, lon: 0.000, alt: 2800 },
];

function siteLabelBillboard(site) {
  return {
    image: labelImage(site.name, 13),
    scale: LABEL_IMAGE_SCALE,
    color: Cesium.Color.LIME,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -12),
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    show: new Cesium.CallbackProperty(() => !!selectedReferenceSite && selectedReferenceSite.name === site.name, false),
  };
}

function createLaserSiteEntity(site) {
  site.position = Cesium.Cartesian3.fromDegrees(site.lon, site.lat, site.alt);
  site.entity = viewer.entities.add({
    name: site.name,
    position: site.position,
    point: {
      pixelSize: 14,
      color: Cesium.Color.LIME,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      show: new Cesium.CallbackProperty(() => !!selectedReferenceSite && selectedReferenceSite.name === site.name, false),
    },
    billboard: siteLabelBillboard(site),
  });
}

LASER_SITES.forEach(createLaserSiteEntity);

// Noms redessinés une fois la police chargée (les sites sont créés dès le démarrage).
labelFontsReady.then(() => {
  LASER_SITES.forEach(site => { site.entity.billboard.image = labelImage(site.name, 13); });
});

// ---------- Couches de l'atmosphère (coquilles translucides, cochables) ----------
// Altitudes hautes (km) de chaque couche, purement illustratives : l'exosphère
// réelle s'étend bien plus loin, mais on la borne ici pour rester lisible face
// aux orbites affichées.
const ATMOSPHERE_LAYERS = [
  { id: "troposphere", name: "Troposphere", topKm: 12, colorHex: "#4FC3F7", alpha: 0.16 },
  { id: "stratosphere", name: "Stratosphere", topKm: 50, colorHex: "#29B6F6", alpha: 0.13 },
  { id: "mesosphere", name: "Mesosphere", topKm: 85, colorHex: "#7E57C2", alpha: 0.11 },
  { id: "thermosphere", name: "Thermosphere", topKm: 600, colorHex: "#AB47BC", alpha: 0.09 },
  { id: "exosphere", name: "Exosphere", topKm: 2000, colorHex: "#EC407A", alpha: 0.06 },
];

const earthEquatorialRadius = Cesium.Ellipsoid.WGS84.maximumRadius;

ATMOSPHERE_LAYERS.forEach(layer => {
  const radius = earthEquatorialRadius + layer.topKm * 1000;
  const color = Cesium.Color.fromCssColorString(layer.colorHex).withAlpha(layer.alpha);

  layer.entity = viewer.entities.add({
    name: layer.name,
    position: Cesium.Cartesian3.ZERO,
    ellipsoid: {
      radii: new Cesium.Cartesian3(radius, radius, radius),
      material: color,
      outline: true,
      outlineColor: color.withAlpha(Math.min(layer.alpha * 2, 0.4)),
      fill: true,
      show: false,
    },
  });
});

// Sites depuis lesquels on peut mesurer les distances (les stations laser),
// sélectionnables dans le panneau "Distances et altitude".
const REFERENCE_SITES = LASER_SITES.map(site => ({ name: site.name, position: site.position }));

let selectedReferenceSite = REFERENCE_SITES[0];

const mu = 3.986e14;

function getTLEPosition(satrec, jsDate) {
  const posVel = satellite.propagate(satrec, jsDate);
  if (!posVel || !posVel.position) return null;
  const gmst = satellite.gstime(jsDate);
  const geo = satellite.eciToGeodetic(posVel.position, gmst);
  const heightMeters = Math.max(geo.height, 0) * 1000;
  const position = Cesium.Cartesian3.fromRadians(geo.longitude, geo.latitude, heightMeters);
  return isFiniteCartesian(position) ? position : null;
}

// ---------- Objets synthétiques : propagation numérique ----------
// Les éléments saisis (altitude, i, Ω) définissent une orbite circulaire
// osculatrice à l'époque de l'objet ; ensuite tout passe par
// OrbitPropagator (orbit-propagator.js) : J2-J6, traînée, Lune, Soleil,
// pression de radiation. L'altitude saisie est comptée depuis le rayon
// équatorial WGS-84, comme les altitudes affichées.
const SYNTHETIC_FORCE_MODEL = OrbitPropagator.DEFAULT_FORCE_MODEL;
const SYNTHETIC_PHYSICS = { cd: 2.2, cr: 1.3, areaToMass: 0.01 }; // satellite type, m²/kg
// Travail maximal par appel (≈ une journée simulée) : un grand saut dans
// le temps est rattrapé sur plusieurs images au lieu de figer la page.
const SYNTHETIC_MAX_STEPS_PER_CALL = 4000;
const LEGACY_EARTH_RADIUS_M = 6_371_000; // rayon utilisé par les fiches existantes (a = 6371 km + altitude)

function initSyntheticOrbitState(record, epochMs) {
  const altitudeKm = (record.a - LEGACY_EARTH_RADIUS_M) / 1000;
  const aKm = OrbitPropagator.RE + altitudeKm;
  // Même position sur l'orbite que l'ancien modèle képlérien à cette date.
  const n = Math.sqrt(mu / Math.pow(record.a, 3));
  const u0 = (record.M0 || 0) + n * (epochMs / 1000 - (record.epochT || 0));
  const s = OrbitPropagator.circularState(aKm, record.inc, record.raan, u0);
  record.orbitEpochState = OrbitPropagator.createState({ epochMs, r: s.r, v: s.v, physics: record.physics || SYNTHETIC_PHYSICS });
  record.orbitState = OrbitPropagator.cloneState(record.orbitEpochState);
}

// Repart de l'état le plus proche de la date visée (état courant ou état
// d'époque) : revenir à "maintenant" après un grand saut ne coûte rien.
function advanceOrbitState(record, targetMs, maxSteps) {
  const cur = record.orbitState;
  const epoch = record.orbitEpochState;
  if (Math.abs(targetMs - epoch.tMs) < Math.abs(targetMs - cur.tMs) && !(cur.decayed && targetMs >= cur.decayMs)) {
    record.orbitState = OrbitPropagator.cloneState(epoch);
  } else if (cur.decayed && targetMs < cur.decayMs) {
    record.orbitState = OrbitPropagator.cloneState(epoch);
  }
  return OrbitPropagator.propagateTo(record.orbitState, targetMs, SYNTHETIC_FORCE_MODEL, maxSteps);
}

function inertialKmToCartesian(y, ms) {
  const f = OrbitPropagator.inertialToFixed(y, ms);
  return new Cesium.Cartesian3(f[0] * 1000, f[1] * 1000, f[2] * 1000);
}

function getSyntheticRecordPosition(record, jsDate) {
  if (!record.orbitState) initSyntheticOrbitState(record, jsDate.getTime());
  const targetMs = jsDate.getTime();
  const reached = advanceOrbitState(record, targetMs, SYNTHETIC_MAX_STEPS_PER_CALL);
  record.decayed = record.orbitState.decayed && targetMs >= record.orbitState.decayMs;
  if (!reached || record.decayed) return null;
  const position = inertialKmToCartesian(record.orbitState.y, targetMs);
  return isFiniteCartesian(position) ? position : null;
}

function getPositionAtTime(record, jsDate, tSeconds) {
  if (record.type === "synthetic") {
    return getSyntheticRecordPosition(record, jsDate);
  } else if (record.type === "tle") {
    return getTLEPosition(record.satrec, jsDate);
  }
  return null;
}

// Vitesse orbitale (norme du vecteur vitesse, km/s) — en repère inertiel
// (ECI), pas la vitesse au sol relative à la Terre en rotation, pour
// retrouver l'ordre de grandeur attendu (~7.5 km/s en LEO).
function getObjectSpeedKmS(record, jsDate) {
  if (record.type === "synthetic") {
    return record.orbitState ? OrbitPropagator.speedKmS(record.orbitState) : Math.sqrt(mu / record.a) / 1000;
  }
  if (record.type === "tle" && record.satrec) {
    const posVel = satellite.propagate(record.satrec, jsDate);
    if (!posVel || !posVel.velocity) return null;
    const v = posVel.velocity;
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  }
  return null;
}

function parseTLEBlock(text, limit = Infinity, color) {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
  const out = [];
  for (let i = 0; i + 2 < lines.length && out.length < limit; i += 3) {
    const name = lines[i];
    const line1 = lines[i + 1];
    const line2 = lines[i + 2];
    if (!name || !line1 || !line2) break;
    const catnr = parseInt(line1.substring(2, 7), 10);
    out.push({ name, type: "tle", line1, line2, catnr, ...(color ? { color } : {}) });
  }
  return out;
}

// ---------- Catalogue CelesTrak (chargement "à la carte", par groupes) ----------
// Chaque groupe CelesTrak (GROUP=...) est rattaché à une catégorie, qui sert
// à la fois de filtre et de couleur par défaut dans le panneau Catalogue.
const CATALOG_CATEGORIES = {
  telecom:     { label: "Télécom",             colorHex: "#B266FF" },
  navigation:  { label: "Navigation / GNSS",   colorHex: "#22D3EE" },
  observation: { label: "Observation / Météo", colorHex: "#7CDB6A" },
  science:     { label: "Science / Éducation", colorHex: "#FFE156" },
  defense:     { label: "Défense / Militaire", colorHex: "#FF4C4C" },
  habite:      { label: "Habité / Stations",   colorHex: "#FFA542" },
  amateur:     { label: "Amateur / CubeSat",   colorHex: "#4FC3F7" },
  debris:      { label: "Débris spatiaux", colorHex: "#C9A27E" },
  autre:       { label: "Autre",               colorHex: "#9AA5B1" },
};

// Groupes CelesTrak chargeables depuis le catalogue, classés par catégorie
// (même ordre que CATALOG_CATEGORIES), les plus grosses constellations en
// tête de chaque catégorie. Champs optionnels :
// - nameQuery : pas de GROUP= dédié chez CelesTrak, requête NAME=<sous-chaîne>
//   (namePrefixOnly : ne garder que les noms qui commencent par nameQuery) ;
// - umbrella : groupe "fourre-tout" qui recoupe des groupes plus précis ; un
//   objet présent dans les deux reste rattaché au groupe précis (voir
//   dedupeCatalogRecords) ;
// - volatile : composition qui change d'une synchro à l'autre ; l'onglet du
//   Sheet est remplacé au lieu d'être complété (voir syncGroupToSheet).
const SEARCH_GROUP_ID = "recherches";

const CATALOG_GROUPS = [
  // Télécom
  { id: "starlink",     label: "Starlink",                     category: "telecom" },
  { id: "oneweb",       label: "OneWeb",                       category: "telecom" },
  { id: "kuiper",       label: "Amazon Leo (Kuiper)",          category: "telecom" },
  { id: "qianfan",      label: "Qianfan (Thousand Sails)",     category: "telecom" },
  { id: "hulianwang",   label: "Guowang (Hulianwang Digui)",   category: "telecom" },
  { id: "ast-bluebird", label: "AST SpaceMobile (BlueBird)",   category: "telecom", nameQuery: "BLUEBIRD", namePrefixOnly: true },
  { id: "iridium-NEXT", label: "Iridium NEXT",                 category: "telecom" },
  { id: "globalstar",   label: "Globalstar",                   category: "telecom" },
  { id: "orbcomm",      label: "Orbcomm",                      category: "telecom" },
  { id: "telesat",      label: "Telesat",                      category: "telecom" },
  { id: "eutelsat",     label: "Eutelsat",                     category: "telecom" },
  { id: "intelsat",     label: "Intelsat",                     category: "telecom" },
  { id: "ses",          label: "SES",                          category: "telecom" },
  { id: "x-comm",       label: "Télécom expérimentales",       category: "telecom" },
  { id: "other-comm",   label: "Autres télécom",               category: "telecom" },

  // Navigation
  { id: "gps-ops",      label: "GPS",                          category: "navigation" },
  { id: "glo-ops",      label: "GLONASS",                      category: "navigation" },
  { id: "galileo",      label: "Galileo",                      category: "navigation" },
  { id: "beidou",       label: "BeiDou",                       category: "navigation" },
  { id: "sbas",         label: "SBAS",                         category: "navigation" },
  { id: "gnss",         label: "GNSS (tous)",                  category: "navigation", umbrella: true },

  // Observation / météo
  { id: "weather",      label: "Météo",                        category: "observation" },
  { id: "noaa",         label: "NOAA",                         category: "observation" },
  { id: "goes",         label: "GOES",                         category: "observation" },
  { id: "resource",     label: "Observation terrestre",        category: "observation" },
  { id: "planet",       label: "Planet",                       category: "observation" },
  { id: "spire",        label: "Spire",                        category: "observation" },
  { id: "iceye",        label: "ICEYE (radar SAR)",            category: "observation", nameQuery: "ICEYE" },
  { id: "capella",      label: "Capella Space (radar SAR)",    category: "observation", nameQuery: "CAPELLA" },
  { id: "umbra",        label: "Umbra (radar SAR)",            category: "observation", nameQuery: "UMBRA" },
  { id: "blacksky",     label: "BlackSky (optique)",           category: "observation", nameQuery: "BLACKSKY" },
  { id: "satellogic",   label: "Satellogic (optique)",         category: "observation", nameQuery: "NUSAT" },
  { id: "hawkeye360",   label: "HawkEye 360 (RF)",             category: "observation", nameQuery: "HAWKEYE" },
  { id: "sar",          label: "Radar SAR (tous)",             category: "observation", umbrella: true },
  { id: "sarsat",       label: "SARSAT (recherche & sauvetage)", category: "observation" },
  { id: "dmc",          label: "Disaster Monitoring (DMC)",    category: "observation" },
  { id: "argos",        label: "ARGOS (collecte de données)",  category: "observation" },

  // Science / éducation
  { id: "science",      label: "Science",                      category: "science" },
  { id: "geodetic",     label: "Géodésie",                     category: "science" },
  { id: "engineering",  label: "Ingénierie",                   category: "science" },
  { id: "education",    label: "Éducation",                    category: "science" },

  // Défense
  { id: "military",     label: "Militaire",                    category: "defense" },
  { id: "radar",        label: "Radar (surveillance)",         category: "defense" },

  // Habité
  { id: "stations",     label: "Stations spatiales",           category: "habite" },

  // Amateur / CubeSat
  { id: "cubesat",      label: "CubeSats",                     category: "amateur" },
  { id: "amateur",      label: "Radioamateur",                 category: "amateur" },
  { id: "satnogs",      label: "SatNOGS",                      category: "amateur" },

  // Débris
  // Grands débris en orbite basse, sélectionnés dans le SATCAT (voir
  // selectFromSatcat) puis récupérés un par un par numéro NORAD : CelesTrak
  // n'a pas de GROUP= pour eux.
  {
    id: "debris-etages-fusee",
    label: "Étages de fusée (100 plus gros, LEO)",
    category: "debris",
    satcatSelect: { types: ["R/B", "ROCKET BODY"], limit: 100 },
  },
  {
    id: "debris-satellites-morts",
    label: "Satellites hors service (100 plus gros, LEO)",
    category: "debris",
    satcatSelect: { types: ["PAY", "PAYLOAD"], opsStatus: ["-"], limit: 100 },
  },
  // Débris moyens (RCS_SIZE MEDIUM, ~10 cm à 1 m) importés depuis
  // Space-Track par l'Apps Script (SpaceTrack.gs), un onglet par tranche
  // de périgée — jamais via CelesTrak.
  { id: "st-deb-moyens-0-600",     label: "Débris moyens · périgée 0–600 km",     category: "debris", spacetrack: true },
  { id: "st-deb-moyens-600-900",   label: "Débris moyens · périgée 600–900 km",   category: "debris", spacetrack: true },
  { id: "st-deb-moyens-900-2000",  label: "Débris moyens · périgée 900–2000 km",  category: "debris", spacetrack: true },
  { id: "st-deb-moyens-2000-plus", label: "Débris moyens · périgée > 2000 km",    category: "debris", spacetrack: true },
  // Éclats des grandes fragmentations, limités aux gros objets : RCS SATCAT
  // ≥ minRcsM2, taille inconnue exclue — voir filterByMinRcs.
  {
    id: "debris-grands",
    label: "Éclats de fragmentation (RCS ≥ 1 m²)",
    category: "debris",
    minRcsM2: 1,
    sources: ["fengyun-1c-debris", "cosmos-2251-debris", "iridium-33-debris", "cosmos-1408-debris"],
  },

  // Autre
  { id: "geo",          label: "Orbite géostationnaire",       category: "autre", umbrella: true },
  { id: "tdrss",        label: "TDRSS (relais NASA)",          category: "autre" },
  { id: "last-30-days", label: "Lancés ces 30 derniers jours", category: "autre", umbrella: true, volatile: true },
  { id: "visual",       label: "100 plus brillants",           category: "autre", umbrella: true },
  { id: "analyst",      label: "Objets « analyst » (non identifiés)", category: "autre", volatile: true },
  // Objets ajoutés un par un depuis la barre de recherche : la liste des n°
  // NORAD vit dans l'onglet du Sheet, chaque mise à jour les refetch un à un.
  { id: SEARCH_GROUP_ID, label: "Ajoutés par recherche",       category: "autre", catnrList: true },
];

function getCategoryColor(categoryId) {
  return (CATALOG_CATEGORIES[categoryId] || CATALOG_CATEGORIES.autre).colorHex;
}

// CelesTrak demande de ne pas requêter la même ressource plus d'une fois
// toutes les ~2h : chaque groupe est mis en cache localStorage et horodaté,
// et on ne refetch jamais avant expiration de ce cooldown.
const CATALOG_CACHE_PREFIX = "price_catalog_group_v1_";
const CATALOG_MIN_REFETCH_MS = 2 * 60 * 60 * 1000;
const CATALOG_FETCH_DELAY_MS = 400; // délai entre requêtes séquentielles (jamais en rafale)

// Ancien groupe "active" retiré du catalogue : son cache (~10 000 TLE)
// occupait inutilement le quota localStorage.
try { localStorage.removeItem(CATALOG_CACHE_PREFIX + "active"); } catch (err) { /* stockage indisponible */ }

function loadGroupCache(groupId) {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_PREFIX + groupId);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Cache catalogue corrompu, ignoré:", groupId, err);
    return null;
  }
}

function saveGroupCache(groupId, records) {
  try {
    localStorage.setItem(CATALOG_CACHE_PREFIX + groupId, JSON.stringify({
      fetchedAt: new Date().toISOString(),
      records,
    }));
  } catch (err) {
    console.warn("Impossible de mettre en cache le groupe catalogue:", groupId, err);
  }
}

function getGroupCooldownRemainingMs(groupId) {
  const cache = loadGroupCache(groupId);
  if (!cache) return 0;
  const age = Date.now() - new Date(cache.fetchedAt).getTime();
  return Math.max(0, CATALOG_MIN_REFETCH_MS - age);
}

// CelesTrak peut être lent ou ne jamais répondre (indispo, réseau...) : sans
// timeout explicite, un fetch qui ne répond pas laisse le bouton bloqué sur
// "Chargement..." indéfiniment, sans aucun message d'erreur pour comprendre.
const CATALOG_FETCH_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url, timeoutMs = CATALOG_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`pas de réponse après ${Math.round(timeoutMs / 1000)}s`);
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// CelesTrak est injoignable depuis certains réseaux (bloqué chez l'ESTACA,
// entre autres) : on relaie les requêtes via l'Apps Script déjà utilisé pour
// le Sheet (mêmes serveurs Google, qui eux joignent CelesTrak sans souci),
// plutôt que d'appeler celestrak.org directement depuis le navigateur.
function celestrakProxyUrl(targetUrl) {
  if (!SHEET_API_URL) return targetUrl;
  return `${SHEET_API_URL}?action=celestrak&url=${encodeURIComponent(targetUrl)}`;
}

// La plupart des groupes utilisent GROUP=<id> (catégories officielles
// CelesTrak) ; certains opérateurs de nanosatellites d'observation n'ont pas
// de GROUP= dédié et sont interrogés par nom (NAME=<sous-chaîne>) via le champ
// nameQuery défini dans CATALOG_GROUPS — voir le commentaire à côté d'ICEYE etc.
function celestrakGroupQueryUrl(groupId) {
  const groupDef = CATALOG_GROUPS.find(g => g.id === groupId);
  const param = groupDef && groupDef.nameQuery
    ? `NAME=${encodeURIComponent(groupDef.nameQuery)}`
    : `GROUP=${encodeURIComponent(groupId)}`;
  return `https://celestrak.org/NORAD/elements/gp.php?${param}&FORMAT=tle`;
}

async function fetchCelesTrakGroup(groupId) {
  const groupDef = CATALOG_GROUPS.find(g => g.id === groupId);
  if (groupDef && groupDef.catnrList) {
    // Pas de cooldown ici : la liste grossit à chaque ajout, et chaque objet
    // est une requête CATNR= distincte côté CelesTrak.
    const records = await fetchCatnrListGroup(groupId);
    saveGroupCache(groupId, records);
    return records;
  }
  const cached = loadGroupCache(groupId);
  if (cached && getGroupCooldownRemainingMs(groupId) > 0) {
    return cached.records;
  }
  if (groupDef && groupDef.satcatSelect) {
    const records = await fetchSatcatSelectedGroup(groupId, groupDef.satcatSelect);
    saveGroupCache(groupId, records);
    return records;
  }
  // Groupe composite : plusieurs GROUP= CelesTrak fusionnés, sans doublon.
  const sourceIds = groupDef && groupDef.sources ? groupDef.sources : [groupId];
  const byCatnr = new Map();
  for (const [i, sourceId] of sourceIds.entries()) {
    if (i > 0) await new Promise(resolve => setTimeout(resolve, CATALOG_FETCH_DELAY_MS));
    const url = sourceId === groupId ? celestrakGroupQueryUrl(groupId) : `https://celestrak.org/NORAD/elements/gp.php?GROUP=${encodeURIComponent(sourceId)}&FORMAT=tle`;
    const res = await fetchWithTimeout(celestrakProxyUrl(url));
    if (!res.ok) throw new Error(`HTTP ${res.status} (${sourceId})`);
    parseTLEBlock(await res.text()).forEach(r => byCatnr.set(r.catnr, { ...r, group: groupId }));
  }
  let records = Array.from(byCatnr.values());
  if (groupDef && groupDef.namePrefixOnly) {
    // NAME= est une recherche par sous-chaîne : on écarte les objets dont le
    // nom contient la requête sans commencer par elle.
    records = records.filter(r => r.name.toUpperCase().startsWith(groupDef.nameQuery.toUpperCase()));
  }
  if (groupDef && groupDef.minRcsM2 !== undefined) {
    records = await filterByMinRcs(records, groupDef.minRcsM2);
  }
  saveGroupCache(groupId, records);
  return records;
}

// Objets encore en orbite basse (périgée < SATCAT_LEO_MAX_PERIGEE_KM) du
// type demandé, les plus gros d'abord (RCS décroissante, inconnue en dernier).
const SATCAT_LEO_MAX_PERIGEE_KM = 2000;
const CATNR_FETCH_CONCURRENCY = 4;

async function selectFromSatcat({ types, opsStatus, limit }) {
  const index = await fetchSatcatIndex();
  const candidates = [];
  index.forEach((meta, catnr) => {
    if (!types.includes(meta.objectType)) return;
    if (opsStatus && !opsStatus.includes(meta.opsStatus)) return;
    if (meta.decayed) return;
    if (!Number.isFinite(meta.perigee) || meta.perigee >= SATCAT_LEO_MAX_PERIGEE_KM) return;
    candidates.push({ catnr, rcs: meta.rcs });
  });
  candidates.sort((a, b) => (Number.isFinite(b.rcs) ? b.rcs : -1) - (Number.isFinite(a.rcs) ? a.rcs : -1));
  return candidates.slice(0, limit).map(c => c.catnr);
}

// Le relais peut renvoyer une page d'erreur ou "No GP data found" à la place
// d'un TLE : on ne garde que les triplets qui ont vraiment la forme d'un TLE.
function parseValidTleBlock(text) {
  return parseTLEBlock(text).filter(r =>
    r.line1.startsWith("1 ") && r.line2.startsWith("2 ") && Number.isFinite(r.catnr));
}

async function fetchTleByCatnrs(catnrs) {
  const records = [];
  for (let i = 0; i < catnrs.length; i += CATNR_FETCH_CONCURRENCY) {
    const batch = catnrs.slice(i, i + CATNR_FETCH_CONCURRENCY);
    const results = await Promise.all(batch.map(async catnr => {
      try {
        const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${catnr}&FORMAT=tle`;
        const res = await fetchWithTimeout(celestrakProxyUrl(url));
        return res.ok ? parseValidTleBlock(await res.text()) : [];
      } catch (err) {
        console.warn("TLE introuvable pour", catnr, err);
        return [];
      }
    }));
    records.push(...results.flat());
    await new Promise(resolve => setTimeout(resolve, CATALOG_FETCH_DELAY_MS));
  }
  return records;
}

async function fetchSatcatSelectedGroup(groupId, selection) {
  const catnrs = await selectFromSatcat(selection);
  return (await fetchTleByCatnrs(catnrs)).map(r => ({ ...r, group: groupId }));
}

// Space-Track via l'Apps Script (identifiants côté script uniquement) :
// secours quand CelesTrak n'a pas l'objet cherché.
async function fetchFromSpaceTrack({ name, catnrs }) {
  if (!SHEET_API_URL) return [];
  const param = catnrs ? `catnrs=${catnrs.join(",")}` : `name=${encodeURIComponent(name)}`;
  const res = await fetchWithTimeout(`${SHEET_API_URL}?action=spacetrackSearch&${param}`, 45000);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  // Un Apps Script pas encore redéployé ignore l'action et renvoie les
  // lignes de "Feuille 1" (un tableau).
  if (Array.isArray(data)) throw new Error("recherche Space-Track absente de l'Apps Script déployé");
  if (!data.ok) throw new Error(data.error || "échec Space-Track");
  return (data.records || [])
    .map(r => ({ name: String(r.name), type: "tle", line1: r.line1, line2: r.line2, catnr: Number(r.catnr) }))
    .filter(r => Number.isFinite(r.catnr));
}

// Groupe "recherches" : n° NORAD connus (Sheet, scène, cache local), TLE
// rafraîchis sur CelesTrak puis Space-Track pour ceux qui y manquent. Un
// objet introuvable partout garde son dernier TLE plutôt que de disparaître.
async function fetchCatnrListGroup(groupId) {
  const known = new Map();
  const remember = r => {
    const catnr = Number(r.catnr);
    if (Number.isFinite(catnr)) known.set(catnr, { ...r, type: "tle", catnr, group: groupId });
  };
  ((loadGroupCache(groupId) || {}).records || []).forEach(remember);
  catalogRawRecords.filter(r => r.group === groupId).forEach(remember);
  try {
    const data = await loadGroupFromSheet(groupId);
    if (data && data.exists) data.records.forEach(r => remember(sheetGroupRowToRecord(r, groupId)));
  } catch (err) {
    console.warn("Onglet Sheet illisible pour", groupId, err);
  }
  const catnrs = Array.from(known.keys());
  if (catnrs.length === 0) return [];

  const fresh = new Map();
  (await fetchTleByCatnrs(catnrs)).forEach(r => fresh.set(r.catnr, r));
  const missing = catnrs.filter(c => !fresh.has(c));
  if (missing.length > 0) {
    try {
      (await fetchFromSpaceTrack({ catnrs: missing })).forEach(r => fresh.set(r.catnr, r));
    } catch (err) {
      console.warn("Space-Track indisponible pour", missing, err);
    }
  }
  return catnrs.map(c => (fresh.has(c) ? { ...fresh.get(c), group: groupId } : known.get(c)));
}

// Garde les objets dont la RCS SATCAT est connue et ≥ minRcsM2 (indicateur
// de taille : > 1 m² ≈ objets de plus d'un mètre).
async function filterByMinRcs(records, minRcsM2) {
  const index = await fetchSatcatIndex();
  return records.filter(r => {
    const meta = index.get(r.catnr);
    return meta && Number.isFinite(meta.rcs) && meta.rcs >= minRcsM2;
  });
}

// Fetch séquentiel (jamais en parallèle) avec un petit délai entre chaque
// groupe, pour rester raisonnable vis-à-vis de CelesTrak même quand
// l'utilisateur coche plusieurs groupes d'un coup. Les échecs sont collectés
// (pas juste logués en console) pour être affichés dans le panneau.
async function fetchSelectedCelesTrakGroups(groupIds, onProgress) {
  const all = [];
  const errors = [];
  for (const groupId of groupIds) {
    try {
      const records = await fetchCelesTrakGroup(groupId);
      all.push(...records);
      if (onProgress) onProgress(groupId, null);
    } catch (err) {
      console.error("Erreur de chargement du groupe CelesTrak:", groupId, err);
      errors.push({ groupId, message: err.message || String(err) });
      if (onProgress) onProgress(groupId, err);
    }
    await new Promise(resolve => setTimeout(resolve, CATALOG_FETCH_DELAY_MS));
  }
  return { records: all, errors };
}

// ---------- SATCAT (pays / type d'objet) — chargé à la demande seulement ----------
const SATCAT_CACHE_KEY = "price_satcat_v3"; // v3 : RCS, périgée, apogée, rentrée
const SATCAT_MIN_REFETCH_MS = 24 * 60 * 60 * 1000;

let satcatIndex = null; // Map(noradId:number -> { country, objectType, opsStatus, rcs, perigee, apogee, decayed })

// Découpe CSV tolérant les champs entre guillemets (noms contenant une virgule).
function splitCsvLine(line) {
  const cols = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i++; }
      else quoted = !quoted;
    } else if (c === "," && !quoted) {
      cols.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  cols.push(current);
  return cols;
}

function parseSatcatCsv(text) {
  const lines = text.trim().split("\n");
  const header = splitCsvLine(lines[0]).map(h => h.trim());
  const idxNorad = header.indexOf("NORAD_CAT_ID");
  const idxOwner = header.indexOf("OWNER");
  const idxType = header.indexOf("OBJECT_TYPE");
  const idxStatus = header.indexOf("OPS_STATUS_CODE");
  const idxRcs = header.indexOf("RCS");
  const idxPerigee = header.indexOf("PERIGEE");
  const idxApogee = header.indexOf("APOGEE");
  const idxDecay = header.indexOf("DECAY_DATE");
  const numberAt = (cols, idx) => (idx >= 0 && cols[idx] && cols[idx].trim() !== "" ? Number(cols[idx]) : null);
  const index = new Map();
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const noradId = cols[idxNorad] ? parseInt(cols[idxNorad].trim(), 10) : NaN;
    if (!Number.isFinite(noradId)) continue;
    index.set(noradId, {
      country: cols[idxOwner] ? cols[idxOwner].trim() : "",
      objectType: cols[idxType] ? cols[idxType].trim() : "",
      opsStatus: cols[idxStatus] ? cols[idxStatus].trim() : "",
      rcs: numberAt(cols, idxRcs),
      perigee: numberAt(cols, idxPerigee),
      apogee: numberAt(cols, idxApogee),
      decayed: idxDecay >= 0 && !!(cols[idxDecay] && cols[idxDecay].trim()),
    });
  }
  return index;
}

async function fetchSatcatIndex() {
  if (satcatIndex) return satcatIndex;
  try {
    const raw = localStorage.getItem(SATCAT_CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      const age = Date.now() - new Date(cached.fetchedAt).getTime();
      if (age < SATCAT_MIN_REFETCH_MS) {
        satcatIndex = new Map(cached.entries.map(([id, country, objectType, opsStatus, rcs, perigee, apogee, decayed]) =>
          [id, { country, objectType, opsStatus, rcs, perigee, apogee, decayed: !!decayed }]));
        return satcatIndex;
      }
    }
  } catch (err) {
    console.warn("Cache SATCAT corrompu, ignoré:", err);
  }

  const res = await fetchWithTimeout(celestrakProxyUrl("https://celestrak.org/pub/satcat.csv"), 30000);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const text = await res.text();
  satcatIndex = parseSatcatCsv(text);
  try {
    localStorage.setItem(SATCAT_CACHE_KEY, JSON.stringify({
      fetchedAt: new Date().toISOString(),
      // Tableaux plutôt qu'objets : ~60 000 entrées, le quota localStorage est vite atteint.
      entries: Array.from(satcatIndex.entries(), ([id, m]) =>
        [id, m.country, m.objectType, m.opsStatus, m.rcs, m.perigee, m.apogee, m.decayed ? 1 : 0]),
    }));
  } catch (err) {
    console.warn("Impossible de mettre en cache le SATCAT:", err);
  }
  return satcatIndex;
}

function countryToColor(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  return Cesium.Color.fromHsl((hash % 360) / 360, 0.65, 0.55).toCssHexString();
}

const STORAGE_KEY = "price_orbital_cache_v1";

function saveCache(rawRecords) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      records: rawRecords,
    }));
  } catch (err) {
    console.warn("Impossible d'écrire dans localStorage:", err);
  }
}

function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Cache local corrompu, ignoré:", err);
    return null;
  }
}

// ---------- Base de données centralisée (Google Sheet via Apps Script) ----------
// URL du déploiement "Application Web" de l'Apps Script lié au Sheet qui
// centralise tous les objets suivis (TLE + synthétiques). Tant qu'elle est
// vide, l'appli retombe sur le cache local, puis reste vide si celui-ci
// aussi est vide (plus d'objets de démo codés en dur).
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzggDJ-ED4QE3-Ty2wpilMEzjFYVjGIe0eJu6kU2Xnus0YEsKIsdUpngIksAbGyzWpZ/exec";

function sheetRowToRecord(row) {
  const color = row.color || undefined;
  if (row.type === "synthetic") {
    return {
      name: row.name,
      type: "synthetic",
      a: 6_371_000 + Number(row.altitude_km) * 1000,
      inc: (Number(row.inclination_deg) * Math.PI) / 180,
      raan: (Number(row.raan_deg) * Math.PI) / 180,
      ...(color ? { color } : {}),
    };
  }
  const catnr = row.catnr !== undefined && row.catnr !== "" ? Number(row.catnr) : undefined;
  return {
    name: row.name,
    type: "tle",
    line1: row.line1,
    line2: row.line2,
    ...(Number.isFinite(catnr) ? { catnr } : {}),
    ...(color ? { color } : {}),
  };
}

function recordToSheetRow(record) {
  if (record.type === "synthetic") {
    return {
      name: record.name,
      type: "synthetic",
      line1: "",
      line2: "",
      catnr: "",
      source_url: "",
      color: record.color || "",
      altitude_km: (record.a - 6_371_000) / 1000,
      inclination_deg: (record.inc * 180) / Math.PI,
      raan_deg: (record.raan * 180) / Math.PI,
    };
  }
  return {
    name: record.name,
    type: "tle",
    line1: record.line1,
    line2: record.line2,
    catnr: record.catnr || "",
    source_url: record.source_url || "",
    color: record.color || "",
    altitude_km: "",
    inclination_deg: "",
    raan_deg: "",
  };
}

async function fetchFromSheet() {
  if (!SHEET_API_URL) return null;
  try {
    const res = await fetch(SHEET_API_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map(sheetRowToRecord);
  } catch (err) {
    console.error("Erreur de chargement du Google Sheet:", err);
    return null;
  }
}

// Ecriture "best effort" : on ne bloque jamais l'UI locale sur le réseau,
// le Sheet n'est qu'une réplique centralisée du cache local déjà à jour.
function pushRecordToSheet(record) {
  if (!SHEET_API_URL || DEMO_MODE) return;
  fetch(SHEET_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // évite le préflight CORS côté Apps Script
    body: JSON.stringify({ action: "add", ...recordToSheetRow(record) }),
  }).catch(err => console.error("Erreur d'écriture Google Sheet:", err));
}

function deleteRecordFromSheet(name) {
  if (!SHEET_API_URL || DEMO_MODE) return;
  fetch(SHEET_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "delete", name }),
  }).catch(err => console.error("Erreur de suppression Google Sheet:", err));
}

// ---------- Onglets de constellation dans le Sheet (un par groupe CelesTrak) ----------
// Chaque groupe chargé depuis CelesTrak est répliqué dans un onglet dédié du
// même Sheet (créé au besoin côté Apps Script), avec upsert par NORAD ID :
// un second chargement du même groupe ne duplique jamais rien, il ne met à
// jour que les objets dont le TLE a changé. Ça permet de recharger un groupe
// depuis le Sheet (rapide, pas de requête CelesTrak) plutôt que de refetch.

function sheetGroupRowToRecord(row, groupId) {
  const catnr = row.catnr !== undefined && row.catnr !== "" ? Number(row.catnr) : undefined;
  return {
    name: row.name,
    type: "tle",
    line1: row.line1,
    line2: row.line2,
    ...(Number.isFinite(catnr) ? { catnr } : {}),
    group: groupId,
  };
}

// ---------- Base IndexedDB locale ----------
// handles : fichier de session lié ; catalog : instantané des objets affichés.
const SHEPHERD_DB_STORES = ["handles", "catalog"];
let shepherdDbPromise = null;

function openShepherdDb() {
  if (!shepherdDbPromise) {
    shepherdDbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open("shepherd", 2);
      req.onupgradeneeded = () => {
        SHEPHERD_DB_STORES.forEach(name => {
          if (!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name);
        });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    shepherdDbPromise.catch(() => { shepherdDbPromise = null; });
  }
  return shepherdDbPromise;
}

async function shepherdDbOp(storeName, mode, fn) {
  const db = await openShepherdDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const req = fn(tx.objectStore(storeName));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- Instantané local du catalogue (démarrage instantané) ----------
// Comme data/catalog.json pour la démo, mais tenu à jour tout seul : à chaque
// changement des objets chargés, catalogRawRecords est recopié dans
// IndexedDB. Au lancement il est affiché immédiatement, puis seuls les
// groupes dont la date de synchro du Sheet a changé sont rechargés.
const CATALOG_SNAPSHOT_KEY = "current";
const CATALOG_SNAPSHOT_DEBOUNCE_MS = 1500;
let catalogSnapshotTimer = null;
let catalogSnapshotSource = null; // tableau déjà enregistré (catalogRawRecords est remplacé à chaque changement)

function buildCatalogSnapshot() {
  const groups = {};
  catalogRawRecords.forEach(r => {
    if (!catalogGroupsLoaded.has(r.group)) return;
    (groups[r.group] = groups[r.group] || []).push([r.name, r.catnr ?? "", r.line1, r.line2]);
  });
  const groupSync = {};
  Object.keys(groups).forEach(id => { groupSync[id] = (sheetGroupsMeta.get(id) || {}).lastSync || null; });
  return { savedAt: new Date().toISOString(), groups, groupSync };
}

function scheduleCatalogSnapshotSave({ force = false } = {}) {
  if (DEMO_MODE) return;
  if (!force && catalogRawRecords === catalogSnapshotSource) return;
  clearTimeout(catalogSnapshotTimer);
  catalogSnapshotTimer = setTimeout(() => {
    catalogSnapshotSource = catalogRawRecords;
    shepherdDbOp("catalog", "readwrite", store => store.put(buildCatalogSnapshot(), CATALOG_SNAPSHOT_KEY))
      .catch(err => console.warn("Instantané local du catalogue non enregistré:", err));
  }, CATALOG_SNAPSHOT_DEBOUNCE_MS);
}

async function loadCatalogSnapshot() {
  try {
    return (await shepherdDbOp("catalog", "readonly", store => store.get(CATALOG_SNAPSHOT_KEY))) || null;
  } catch (err) {
    console.warn("Instantané local du catalogue illisible:", err);
    return null;
  }
}

function applyCatalogSnapshot(snapshot) {
  catalogRawRecords = [];
  Object.entries(snapshot.groups).forEach(([groupId, rows]) => {
    rows.forEach(([name, catnr, line1, line2]) => {
      const n = catnr === "" ? NaN : Number(catnr);
      catalogRawRecords.push({ name, type: "tle", line1, line2, ...(Number.isFinite(n) ? { catnr: n } : {}), group: groupId });
    });
    catalogGroupsLoaded.add(groupId);
  });
  catalogSnapshotSource = catalogRawRecords;
  rebuildScene();
  renderCatalogExistingSummaryList();
  renderCatalogCountryFilter();
  renderCatalogTypeFilter();
}

// Timeout plus long que le défaut (15s) : contrairement au relais CelesTrak
// (simple passthrough réseau), lire un onglet Sheet de plusieurs milliers de
// lignes via l'API Google Sheets côté Apps Script est lent et dépasse
// régulièrement 15s — même traitement que le SATCAT plus bas. 45s s'est
// encore révélé trop court pour Starlink (le plus gros groupe, ~6000+
// lignes) : le timeout s'adapte donc à la taille connue du groupe (via
// sheetGroupsMeta, alimenté par listGroups) plutôt qu'une valeur fixe pour
// tous — les petits groupes gardent un échec rapide, les énormes ont plus de
// marge avant d'être déclarés en échec.
const SHEET_GROUP_FETCH_TIMEOUT_MS = 45000;

// Onglets du Sheet correspondant à un groupe du catalogue : un onglet qui
// n'y figure plus (ex. ancien "active") n'est jamais chargé.
function knownSheetGroupIds() {
  return CATALOG_GROUPS.filter(g => sheetGroupsMeta.has(g.id)).map(g => g.id);
}

function sheetGroupFetchTimeoutFor(groupId) {
  const count = sheetGroupsMeta.get(groupId)?.count || 0;
  if (count > 3000) return 120000;
  if (count > 800) return 75000;
  return SHEET_GROUP_FETCH_TIMEOUT_MS;
}

async function loadGroupFromSheet(groupId, timeoutMs = SHEET_GROUP_FETCH_TIMEOUT_MS) {
  if (!SHEET_API_URL) return null;
  const res = await fetchWithTimeout(
    `${SHEET_API_URL}?action=loadGroup&group=${encodeURIComponent(groupId)}`,
    timeoutMs
  );
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  if (!data || !data.exists) return null;
  return data; // { exists: true, records: [...], lastSync }
}

async function listGroupsFromSheet() {
  if (!SHEET_API_URL) return [];
  const res = await fetchWithTimeout(`${SHEET_API_URL}?action=listGroups`);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  return Array.isArray(data.groups) ? data.groups : [];
}

// Ecriture "best effort" (comme pushRecordToSheet) : la synchro Sheet ne doit
// jamais bloquer ni faire échouer le chargement d'un groupe à l'écran.
function syncGroupToSheet(groupId, records) {
  if (!SHEET_API_URL || DEMO_MODE) return Promise.resolve(null);
  return fetch(SHEET_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // évite le préflight CORS côté Apps Script
    body: JSON.stringify({
      action: "syncGroup",
      group: groupId,
      records: records.map(r => ({ name: r.name, catnr: r.catnr, line1: r.line1, line2: r.line2 })),
      replace: !!(CATALOG_GROUPS.find(g => g.id === groupId) || {}).volatile,
    }),
  })
    .then(res => res.json())
    .catch(err => {
      console.error("Erreur de synchro Sheet pour le groupe:", groupId, err);
      return null;
    });
}

const DIST_COLOR_RED    = Cesium.Color.fromCssColorString("#FF4C4C");
const DIST_COLOR_ORANGE = Cesium.Color.fromCssColorString("#FFA542");
const DIST_COLOR_YELLOW = Cesium.Color.fromCssColorString("#FFE156");
const DIST_COLOR_GREEN  = Cesium.Color.fromCssColorString("#7CDB6A");

// Portées recalibrées sur l'horizon radioélectrique réel des satellites de
// l'appli (altitudes ~400-1000 km => visibilité max ~2300-3700 km) plutôt
// que sur une échelle arbitraire à 10 000 km, pour que les 4 couleurs
// restent atteignables sur des traits qui ne coupent jamais la Terre.
const DIST_RED_MAX_KM = 800;
const DIST_ORANGE_MAX_KM = 1600;
const DIST_YELLOW_MAX_KM = 2500;

function getDistanceClass(distanceKm) {
  if (distanceKm < DIST_RED_MAX_KM) return "distRed";
  if (distanceKm < DIST_ORANGE_MAX_KM) return "distOrange";
  if (distanceKm < DIST_YELLOW_MAX_KM) return "distYellow";
  return "distGreen";
}

function getDistanceCesiumColor(distanceKm) {
  if (distanceKm < DIST_RED_MAX_KM) return DIST_COLOR_RED;
  if (distanceKm < DIST_ORANGE_MAX_KM) return DIST_COLOR_ORANGE;
  if (distanceKm < DIST_YELLOW_MAX_KM) return DIST_COLOR_YELLOW;
  return DIST_COLOR_GREEN;
}

// Ligne de visée ESTACA -> objet : renvoie false si le segment traverse la Terre.
function hasLineOfSight(fromPos, toPos) {
  const direction = Cesium.Cartesian3.subtract(toPos, fromPos, new Cesium.Cartesian3());
  const distance = Cesium.Cartesian3.magnitude(direction);
  Cesium.Cartesian3.normalize(direction, direction);
  // Décale l'origine de quelques mètres le long du rayon pour éviter
  // une intersection parasite au point de départ (ESTACA est au sol).
  const origin = Cesium.Cartesian3.add(
    fromPos,
    Cesium.Cartesian3.multiplyByScalar(direction, 10, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  );
  const ray = new Cesium.Ray(origin, direction);
  const intersection = Cesium.IntersectionTests.rayEllipsoid(ray, Cesium.Ellipsoid.WGS84);
  return !intersection || intersection.start > distance;
}

// ---------- Proximité instantanée entre objets (< COLLISION_RISK_KM) ----------
const COLLISION_RISK_KM = 1000;
const RISK_POINT_COLOR = Cesium.Color.fromCssColorString("#FF3B3B");
const LINK_LINE_COLOR = Cesium.Color.fromCssColorString("#B266FF");
// Blanc légèrement froid, hors de la palette des points, pour que l'orbite
// et la sphère d'incertitude ne se confondent pas avec les satellites.
const ORBIT_TRAIL_COLOR = Cesium.Color.fromCssColorString("#E6ECF2").withAlpha(0.85);

// Couleur d'identité de chaque objet (attribut modulable sur le record),
// aléatoire par défaut. Remplace le bleu unique tant que l'objet n'est pas
// en risque de collision (auquel cas RISK_POINT_COLOR prend le dessus).
function randomObjectColor() {
  return Cesium.Color.fromHsl(Math.random(), 0.65, 0.55);
}

let satRecords = [];
let linkEntities = [];

// Entité Cesium -> record : pour retrouver le satellite survolé par la souris
// (voir le picking plus bas) sans reparcourir tout satRecords à chaque
// déplacement de souris. WeakMap plutôt qu'un Map classique : pas besoin de
// nettoyer manuellement à la suppression des entités (clearAllSatEntities).
const entityToRecord = new WeakMap();
let showObjectLabels = true;

// Points et noms des satellites : une collection de primitives dessinée en
// un seul lot, plutôt qu'une entité par objet (trop lourd au-delà de
// quelques centaines). Seul l'objet suivi a une entité (voir
// ensureTrackEntity), car viewer.trackedEntity n'accepte que des entités.
// Points opaques : une seule passe de rendu au lieu de deux (opaque +
// translucide), sans contour semi-transparent.
const satPointCollection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection({
  blendOption: Cesium.BlendOption.OPAQUE,
}));
const satLabelCollection = viewer.scene.primitives.add(new Cesium.BillboardCollection());

// ---------- Débris factices ----------
// Nuage de débris inventés (orbites circulaires 300-500 km à leur
// création) pour tester la scène face aux objets réels. Ils vivent dans
// leur propre collection, hors de satRecords : ni recherche, ni distances,
// ni calcul de risque, ni liens vers les stations laser.
// Propagation : même intégrateur numérique que les objets synthétiques
// (orbit-propagator.js), exécuté dans un Web Worker. Avec la traînée, les
// débris bas et légers finissent par rentrer dans l'atmosphère : ils
// disparaissent alors de la scène.
const SYNTHETIC_DEBRIS_DEFAULT_COUNT = 2000;
const SYNTHETIC_DEBRIS_SEED = 20261110; // même nuage à chaque session
const SYNTHETIC_DEBRIS_EARTH_RADIUS_M = 6_371_000; // même rayon que addSyntheticRecord
const SYNTHETIC_DEBRIS_ALT_KM = [300, 500];
const SYNTHETIC_DEBRIS_INCLINATIONS_DEG = [53, 71, 83, 98];
const SYNTHETIC_DEBRIS_INC_JITTER_DEG = 2;
const SYNTHETIC_DEBRIS_SIZE_M = [0.1, 1];
// Rapport surface/masse des fragments, tiré en log-uniforme : hypothèse
// d'ordre de grandeur (fragments de 10 cm à 1 m), à remplacer par une
// distribution type NASA Standard Breakup Model si besoin.
const SYNTHETIC_DEBRIS_AREA_TO_MASS = [0.01, 0.1]; // m²/kg
const SYNTHETIC_DEBRIS_PIXEL_SIZE = [2, 5]; // taille du point pour 10 cm -> 1 m
const SYNTHETIC_DEBRIS_COLOR = Cesium.Color.fromCssColorString("#9FB4C8");
const SYNTHETIC_DEBRIS_UPDATE_MS = 100;
// Tolérance un peu plus lâche que pour les objets manuels : ~10 m/jour
// d'erreur d'intégration, deux fois moins de pas pour 2000 objets.
const SYNTHETIC_DEBRIS_RTOL = 1e-9;

const syntheticDebrisCollection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection({
  blendOption: Cesium.BlendOption.OPAQUE,
}));
let syntheticDebris = []; // { name, type, synthetic, a, inc, raan, M0, sizeM, areaToMass, point }
let syntheticDebrisVisible = false;
let lastSyntheticDebrisUpdateMs = 0;

// Générateur pseudo-aléatoire à graine (mulberry32) : Math.random ne se
// réinitialise pas, le nuage changerait à chaque rechargement.
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSyntheticDebris(n = SYNTHETIC_DEBRIS_DEFAULT_COUNT, seed = SYNTHETIC_DEBRIS_SEED) {
  const random = seededRandom(seed);
  // Générateur séparé pour la physique : les orbites restent celles des
  // versions précédentes du nuage.
  const randomPhys = seededRandom(seed + 1);
  const deg = Math.PI / 180;
  const [altMin, altMax] = SYNTHETIC_DEBRIS_ALT_KM;
  const [sizeMin, sizeMax] = SYNTHETIC_DEBRIS_SIZE_M;
  const [amMin, amMax] = SYNTHETIC_DEBRIS_AREA_TO_MASS;
  const debris = [];
  for (let i = 0; i < n; i++) {
    const altitudeKm = altMin + random() * (altMax - altMin);
    const baseInc = SYNTHETIC_DEBRIS_INCLINATIONS_DEG[Math.floor(random() * SYNTHETIC_DEBRIS_INCLINATIONS_DEG.length)];
    const incDeg = baseInc + (random() * 2 - 1) * SYNTHETIC_DEBRIS_INC_JITTER_DEG;
    // Loi de puissance : beaucoup plus de petits débris que de gros.
    // 1 - random() évite une division par zéro (random() peut valoir 0).
    const sizeM = Math.min(sizeMax, sizeMin / Math.pow(1 - random(), 0.6));
    debris.push({
      name: `DEB-FACTICE-${String(i + 1).padStart(4, "0")}`,
      type: "synthetic",
      synthetic: true,
      a: SYNTHETIC_DEBRIS_EARTH_RADIUS_M + altitudeKm * 1000,
      inc: incDeg * deg,
      raan: random() * 360 * deg,
      M0: random() * 2 * Math.PI,
      sizeM,
      areaToMass: amMin * Math.pow(amMax / amMin, randomPhys()),
    });
  }
  return debris;
}

function syntheticDebrisPixelSize(sizeM) {
  const [sizeMin, sizeMax] = SYNTHETIC_DEBRIS_SIZE_M;
  const [pxMin, pxMax] = SYNTHETIC_DEBRIS_PIXEL_SIZE;
  return pxMin + ((sizeM - sizeMin) / (sizeMax - sizeMin)) * (pxMax - pxMin);
}

// État initial (km, km/s, inertiel) à l'époque epochMs : même position sur
// l'orbite que le modèle képlérien d'origine à cette date.
function syntheticDebrisInitialState(d, epochMs) {
  const altitudeKm = (d.a - SYNTHETIC_DEBRIS_EARTH_RADIUS_M) / 1000;
  const n = Math.sqrt(mu / Math.pow(d.a, 3));
  const u0 = d.M0 + n * (epochMs / 1000);
  const s = OrbitPropagator.circularState(OrbitPropagator.RE + altitudeKm, d.inc, d.raan, u0);
  return { epochMs, r: s.r, v: s.v, physics: { cd: 2.2, cr: 1.3, areaToMass: d.areaToMass } };
}

// Le worker garde l'état de chaque débris et l'avance jusqu'à la date
// demandée, en repartant de l'état d'époque si c'est plus court.
const SYNTHETIC_DEBRIS_WORKER_SOURCE = `
let states = [], epochStates = [];
let P;
onmessage = (e) => {
  const msg = e.data;
  if (msg.type === "init") {
    importScripts(msg.propagatorUrl);
    P = self.OrbitPropagator;
    P.INTEGRATOR.rtol = msg.rtol;
    epochStates = msg.states.map(s => P.createState(s));
    states = epochStates.map(s => P.cloneState(s));
    return;
  }
  if (msg.type === "propagate") {
    const target = msg.timeMs;
    const out = new Float64Array(states.length * 3);
    let decayed = 0;
    for (let i = 0; i < states.length; i++) {
      let s = states[i];
      const ep = epochStates[i];
      const backBeforeDecay = s.decayed && target < s.decayMs;
      if (backBeforeDecay || Math.abs(target - ep.tMs) < Math.abs(target - s.tMs)) {
        s = states[i] = P.cloneState(ep);
      }
      P.propagateTo(s, target, P.DEFAULT_FORCE_MODEL);
      if (s.decayed) { out[3 * i] = NaN; decayed++; continue; }
      const f = P.inertialToFixed(s.y, target);
      out[3 * i] = f[0] * 1000;
      out[3 * i + 1] = f[1] * 1000;
      out[3 * i + 2] = f[2] * 1000;
    }
    postMessage({ positions: out, decayed, timeMs: target }, [out.buffer]);
  }
};`;

let syntheticDebrisWorker = null;
let syntheticDebrisWorkerBusy = false;
let syntheticDebrisDecayedCount = 0;
const syntheticDebrisLabelEl = document.getElementById("syntheticDebrisLabel");

function applySyntheticDebrisPositions(positions, decayed) {
  syntheticDebris.forEach((d, i) => {
    const x = positions[3 * i];
    if (Number.isNaN(x)) { d.point.show = false; return; }
    d.point.show = true;
    d.point.position = new Cesium.Cartesian3(x, positions[3 * i + 1], positions[3 * i + 2]);
  });
  syntheticDebrisDecayedCount = decayed;
  if (syntheticDebrisLabelEl) {
    const inOrbit = syntheticDebris.length - decayed;
    syntheticDebrisLabelEl.textContent = decayed > 0
      ? `Débris factices (${inOrbit} en orbite, ${decayed} rentrés)`
      : `Débris factices (${syntheticDebris.length})`;
  }
}

// Secours si le worker ne démarre pas : même calcul sur le fil principal,
// borné par appel (le rattrapage se fait sur plusieurs images).
function propagateSyntheticDebrisLocally(timeMs) {
  const out = new Float64Array(syntheticDebris.length * 3);
  let decayed = 0;
  syntheticDebris.forEach((d, i) => {
    if (!d.state) {
      d.epochState = OrbitPropagator.createState(syntheticDebrisInitialState(d, d.epochMs));
      d.state = OrbitPropagator.cloneState(d.epochState);
    }
    if ((d.state.decayed && timeMs < d.state.decayMs) || Math.abs(timeMs - d.epochState.tMs) < Math.abs(timeMs - d.state.tMs)) {
      d.state = OrbitPropagator.cloneState(d.epochState);
    }
    const reached = OrbitPropagator.propagateTo(d.state, timeMs, OrbitPropagator.DEFAULT_FORCE_MODEL, 200);
    if (d.state.decayed) { out[3 * i] = NaN; decayed++; return; }
    if (!reached) { out[3 * i] = d.point.show ? d.point.position.x : NaN; out[3 * i + 1] = d.point.position.y; out[3 * i + 2] = d.point.position.z; return; }
    const f = OrbitPropagator.inertialToFixed(d.state.y, timeMs);
    out[3 * i] = f[0] * 1000; out[3 * i + 1] = f[1] * 1000; out[3 * i + 2] = f[2] * 1000;
  });
  applySyntheticDebrisPositions(out, decayed);
}

function startSyntheticDebrisWorker(epochMs) {
  try {
    const blob = new Blob([SYNTHETIC_DEBRIS_WORKER_SOURCE], { type: "application/javascript" });
    syntheticDebrisWorker = new Worker(URL.createObjectURL(blob));
    syntheticDebrisWorker.onmessage = e => {
      syntheticDebrisWorkerBusy = false;
      if (syntheticDebrisVisible) applySyntheticDebrisPositions(e.data.positions, e.data.decayed);
    };
    syntheticDebrisWorker.onerror = err => {
      console.warn("Worker des débris factices indisponible, calcul local:", err.message || err);
      syntheticDebrisWorker = null;
      syntheticDebrisWorkerBusy = false;
    };
    syntheticDebrisWorker.postMessage({
      type: "init",
      propagatorUrl: new URL("orbit-propagator.js", document.baseURI).href,
      rtol: SYNTHETIC_DEBRIS_RTOL,
      states: syntheticDebris.map(d => syntheticDebrisInitialState(d, epochMs)),
    });
  } catch (err) {
    console.warn("Worker des débris factices non créé, calcul local:", err);
    syntheticDebrisWorker = null;
  }
}

function updateSyntheticDebrisPositions(jsDate) {
  const timeMs = jsDate.getTime();
  if (syntheticDebrisWorker) {
    if (syntheticDebrisWorkerBusy) return;
    syntheticDebrisWorkerBusy = true;
    syntheticDebrisWorker.postMessage({ type: "propagate", timeMs });
  } else {
    propagateSyntheticDebrisLocally(timeMs);
  }
}

// Généré au premier affichage seulement : rien ne coûte tant que la case
// n'est pas cochée. L'époque du nuage est l'instant affiché à ce moment-là.
function setSyntheticDebrisVisible(visible) {
  syntheticDebrisVisible = visible;
  if (visible && syntheticDebris.length === 0) {
    const epochMs = Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime();
    syntheticDebris = generateSyntheticDebris();
    syntheticDebris.forEach(d => {
      d.epochMs = epochMs;
      d.point = syntheticDebrisCollection.add({
        position: Cesium.Cartesian3.ZERO,
        pixelSize: syntheticDebrisPixelSize(d.sizeM),
        color: SYNTHETIC_DEBRIS_COLOR,
        show: false,
      });
    });
    startSyntheticDebrisWorker(epochMs);
  }
  if (visible) updateSyntheticDebrisPositions(Cesium.JulianDate.toDate(viewer.clock.currentTime));
  syntheticDebrisCollection.show = visible && !(conjunctionIsolated && activeConjunction);
}

viewer.clock.onTick.addEventListener(clock => {
  if (!syntheticDebrisVisible) return;
  const nowMs = performance.now();
  if (nowMs - lastSyntheticDebrisUpdateMs < SYNTHETIC_DEBRIS_UPDATE_MS) return;
  lastSyntheticDebrisUpdateMs = nowMs;
  updateSyntheticDebrisPositions(Cesium.JulianDate.toDate(clock.currentTime));
});

// ---------- Liens débris <-> stations laser ----------
// Tout débris à moins de DEBRIS_LINK_RANGE_KM (distance directe) d'une
// station laser y est relié par un trait ; le trait porte le record du
// débris (id) pour le survol et le clic -> suivi (voir pickSatRecord).
const DEBRIS_LINK_RANGE_KM = 700;
const DEBRIS_LINK_WIDTH = 2;
const DEBRIS_LINK_COLOR = Cesium.Color.fromCssColorString("#E6FF2E").withAlpha(0.9);
const debrisLinkCollection = viewer.scene.primitives.add(new Cesium.PolylineCollection());
const debrisLinks = new Map(); // "indexStation|record" -> Polyline
const debrisLinkPrimitives = new Set();

function clearDebrisStationLinks() {
  debrisLinkCollection.removeAll();
  debrisLinks.clear();
  debrisLinkPrimitives.clear();
}

function updateDebrisStationLinks() {
  const rangeM = DEBRIS_LINK_RANGE_KM * 1000;
  const active = new Set();
  satRecords.forEach((r, recordIndex) => {
    if (!r.isDebris || !r.hasPosition || !r.point.show) return;
    LASER_SITES.forEach((site, siteIndex) => {
      if (Cesium.Cartesian3.distance(site.position, r.positionCartesian) > rangeM) return;
      const key = `${siteIndex}|${recordIndex}`;
      active.add(key);
      const positions = [site.position, Cesium.Cartesian3.clone(r.positionCartesian)];
      const line = debrisLinks.get(key);
      if (line) {
        line.positions = positions;
      } else {
        // Un matériau par trait : PolylineCollection détruit le matériau d'un
        // trait quand on le retire, un matériau partagé casserait les autres.
        const material = Cesium.Material.fromType("Color", { color: DEBRIS_LINK_COLOR });
        const newLine = debrisLinkCollection.add({ positions, width: DEBRIS_LINK_WIDTH, material, id: r });
        debrisLinks.set(key, newLine);
        debrisLinkPrimitives.add(newLine);
      }
    });
  });
  debrisLinks.forEach((line, key) => {
    if (active.has(key)) return;
    debrisLinkCollection.remove(line);
    debrisLinkPrimitives.delete(line);
    debrisLinks.delete(key);
  });
}

// Au-delà de ce nombre d'objets, rendu plafonné à 1,5x la résolution CSS
// (au lieu de 2x sur un écran Retina) ; 1x rendait les points flous.
const FULL_RESOLUTION_OBJECT_LIMIT = 1500;
let labelsAutoDisabledOnce = false;

// Isolation visuelle: cases cochées dans le panneau "Risques potentiels"
// (clé "nomA::nomB") pour ne mettre en avant que certaines paires à risque.
const checkedRiskPairs = new Set();
let isolatedNames = new Set();

// Conjonction affichée après un clic dans la liste "Conjonctions à venir" :
// ses deux objets gardent leur trajectoire en couleur (objet 1 / objet 2)
// tant qu'on ne clique que sur eux ; un clic sur un autre objet efface tout.
let activeConjunction = null; // { primary, secondary, tcaMs }
let conjunctionIsolated = false; // case "Isoler la situation"
// Une couleur par trajectoire tracée, attribuée dans l'ordre de sélection
// (première couleur libre) ; une conjonction prend les deux premières.
const ORBIT_TRAIL_PALETTE = ["#4FC3F7", "#FF9F43", "#7CE38B", "#F06FD8", "#FFE066", "#B39DFF", "#FF6B6B", "#4DD0C4"]
  .map(hex => Cesium.Color.fromCssColorString(hex));
const CONJ_PRIMARY_COLOR = ORBIT_TRAIL_PALETTE[0];
const CONJ_SECONDARY_COLOR = ORBIT_TRAIL_PALETTE[1];

function nextOrbitTrailColor() {
  const used = new Set();
  orbitTrailEntities.forEach(entity => used.add(entity.trailColor));
  if (activeConjunction) { used.add(CONJ_PRIMARY_COLOR); used.add(CONJ_SECONDARY_COLOR); }
  return ORBIT_TRAIL_PALETTE.find(c => !used.has(c))
    || ORBIT_TRAIL_PALETTE[orbitTrailEntities.size % ORBIT_TRAIL_PALETTE.length];
}
// Point de conjonction (TCA) affiché avec la conjonction : entités Cesium.
let conjunctionMarkerEntities = [];
// Seul l'objet cliqué en dernier est détaillé dans "Paramètres orbitaux".
let lastClickedObjectName = null;

function isConjunctionMember(name) {
  return !!activeConjunction && (name === activeConjunction.primary || name === activeConjunction.secondary);
}

function conjunctionTrailColor(name) {
  if (!activeConjunction) return null;
  if (name === activeConjunction.primary) return CONJ_PRIMARY_COLOR;
  if (name === activeConjunction.secondary) return CONJ_SECONDARY_COLOR;
  return null;
}

// ---------- Journal des risques (export CSV) ----------
const RISK_LOG_STORAGE_KEY = "price_risk_log_v1";

function loadRiskLogFromStorage() {
  try {
    const raw = localStorage.getItem(RISK_LOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Journal des risques corrompu, ignoré:", err);
    return [];
  }
}

function saveRiskLogToStorage() {
  try {
    localStorage.setItem(RISK_LOG_STORAGE_KEY, JSON.stringify(riskLog));
  } catch (err) {
    console.warn("Impossible d'enregistrer le journal des risques:", err);
  }
}

let riskLog = loadRiskLogFromStorage();
let activeRiskEpisodes = new Map(); // clé "nomA::nomB" -> épisode en cours

function updateRiskLogCount() {
  if (riskLogCountEl) {
    riskLogCountEl.textContent = `${riskLog.length} risk(s) logged`;
  }
}

function csvEscape(value) {
  const s = String(value);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportRiskLogAsCsv() {
  const header = ["date_debut", "date_fin", "satellite_a", "satellite_b", "distance_min_km"];
  const rows = riskLog.map(entry => [
    entry.startTime,
    entry.endTime,
    entry.nameA,
    entry.nameB,
    entry.minDistanceKm.toFixed(1),
  ]);
  const csvContent = [header, ...rows].map(row => row.map(csvEscape).join(";")).join("\n");
  // BOM UTF-8 pour qu'Excel détecte correctement ls'encodage (noms accentués).
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `journal_risques_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Bouton "Isoler" du mode suivi : seul l'objet suivi reste affiché.
let isolateTrackedObject = false;

function isDimmed(name) {
  if (isolateTrackedObject) {
    const tracked = getTrackedRecord();
    if (tracked && tracked.name !== name) return true;
  }
  if (conjunctionIsolated && activeConjunction) return !isConjunctionMember(name);
  return isolatedNames.size > 0 && !isolatedNames.has(name);
}

// ---------- Orbites futures (pointillés) des satellites sélectionnés ----------
// Échantillons par tour : la résolution reste la même quelle que soit la
// longueur affichée (1 à 5 tours).
const ORBIT_TRAIL_SAMPLES_PER_REV = 360;
// Le tracé n'est recalculé qu'à cet intervalle (temps réel), pas à chaque image.
const ORBIT_TRAIL_REFRESH_MS = 250;

let selectedOrbitNames = new Set();
let orbitTrailEntities = new Map(); // nom -> entité polyline
let orbitTrailWidth = 3;
let orbitTrailRevolutions = 1; // nombre de tours de Terre affichés (1 à 5)
let orbitTrailStyle = "dashed"; // "dashed" | "solid"

function orbitTrailMaterial(color = ORBIT_TRAIL_COLOR) {
  return orbitTrailStyle === "solid"
    ? new Cesium.ColorMaterialProperty(color)
    : new Cesium.PolylineDashMaterialProperty({ color, dashLength: 16 });
}

// Marqueur d'incertitude autour d'un objet sélectionné. Objet TLE :
// ellipsoïde à 3σ issu de tleSigmaKm (dépend de l'âge du TLE), orienté
// radial / le long de la trajectoire / hors plan. Objet synthétique :
// sphère fixe (orbite inventée, donc connue exactement).
const UNCERTAINTY_SPHERE_RADIUS_M = 3000;
const UNCERTAINTY_SIGMA_SCALE = 3;

// Écart-type (1σ, km) de la position SGP4 d'un TLE selon son âge (jours
// entre l'époque du TLE et l'instant considéré). Ordres de grandeur LEO de
// la littérature (Vallado et al. 2006, Flohrer et al. 2008) : quelques
// centaines de mètres à l'époque, puis une erreur qui grandit surtout le
// long de la trajectoire (traînée mal connue). Modèle simplifié : les
// TLE publics ne sont pas fournis avec leur covariance.
const TLE_SIGMA_AT_EPOCH_KM = { radial: 0.1, along: 0.4, cross: 0.15 };
const TLE_SIGMA_GROWTH_KM_PER_DAY = { radial: 0.05, along: 1.0, cross: 0.05 };

function tleSigmaKm(ageDays) {
  const d = Math.abs(ageDays);
  return {
    radial: TLE_SIGMA_AT_EPOCH_KM.radial + TLE_SIGMA_GROWTH_KM_PER_DAY.radial * d,
    along: TLE_SIGMA_AT_EPOCH_KM.along + TLE_SIGMA_GROWTH_KM_PER_DAY.along * d,
    cross: TLE_SIGMA_AT_EPOCH_KM.cross + TLE_SIGMA_GROWTH_KM_PER_DAY.cross * d,
  };
}

function tleAgeDaysAt(record, jsDate) {
  if (!record.tleEpochMs) {
    const epoch = getTleEpochDate(record.line1);
    record.tleEpochMs = epoch ? epoch.getTime() : NaN;
  }
  return (jsDate.getTime() - record.tleEpochMs) / 86_400_000;
}
let uncertaintySphereEntities = new Map(); // nom -> entités (sphère, + pics pour un débris)

// Débris : sphère rouge hérissée de pics (6 axes + 8 diagonales du cube),
// pour les distinguer d'un coup d'œil des satellites sélectionnés.
const DEBRIS_MARKER_COLOR = Cesium.Color.fromCssColorString("#E5484D");
const DEBRIS_SPIKE_LENGTH_M = 1500;
const DEBRIS_SPIKE_BASE_RADIUS_M = 350;
const DEBRIS_SPIKE_DIRECTIONS = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
].map(([x, y, z]) => Cesium.Cartesian3.normalize(new Cesium.Cartesian3(x, y, z), new Cesium.Cartesian3()));

// Rotation amenant l'axe Z local (axe des cylindres Cesium) sur dir.
function orientationAlong(dir) {
  const dot = Cesium.Cartesian3.dot(Cesium.Cartesian3.UNIT_Z, dir);
  if (dot > 0.9999) return Cesium.Quaternion.IDENTITY;
  if (dot < -0.9999) return Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, Math.PI);
  const axis = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, dir, new Cesium.Cartesian3()), new Cesium.Cartesian3());
  return Cesium.Quaternion.fromAxisAngle(axis, Math.acos(dot));
}

// ---------- Modèles 3D personnalisables (dossier models/) ----------
// models/models.json associe un fichier glTF aux satellites, aux débris, à
// un groupe ou à un n° NORAD (voir models/README.md). Seuls les fichiers
// effectivement présents sont retenus ; sinon, la sphère reste affichée.
const MODELS_DIR = "models/";
let modelConfig = null;
const modelFileAvailable = new Map();

const modelsReady = (async () => {
  try {
    const res = await fetch(`${MODELS_DIR}models.json`, { cache: "no-cache" });
    if (!res.ok) return;
    modelConfig = await res.json();
    const specs = [modelConfig.satellite, modelConfig.debris,
      ...Object.values(modelConfig.groups || {}), ...Object.values(modelConfig.norad || {})];
    const files = new Set(specs.map(spec => (typeof spec === "string" ? spec : spec && spec.file)).filter(Boolean));
    await Promise.all(Array.from(files, async file => {
      try {
        const head = await fetch(MODELS_DIR + file, { method: "HEAD", cache: "no-cache" });
        modelFileAvailable.set(file, head.ok);
      } catch (err) {
        modelFileAvailable.set(file, false);
      }
    }));
  } catch (err) {
    console.info("Pas de configuration de modèles 3D exploitable:", err);
  }
})();

function resolveModelSpec(record) {
  if (!modelConfig) return null;
  const candidates = [
    (modelConfig.norad || {})[String(record.catnr)],
    (modelConfig.groups || {})[record.group],
    record.isDebris ? modelConfig.debris : modelConfig.satellite,
  ];
  for (const candidate of candidates) {
    const spec = typeof candidate === "string" ? { file: candidate } : candidate;
    if (spec && spec.file && modelFileAvailable.get(spec.file)) return spec;
  }
  return null;
}

// Avant du modèle (X) sur le sens de déplacement, haut (Z) à l'opposé de la
// Terre, puis correction éventuelle headingDeg/pitchDeg/rollDeg du fichier.
function modelOrientationProperty(record, spec) {
  const offset = Cesium.Quaternion.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(
    Cesium.Math.toRadians(spec.headingDeg || 0),
    Cesium.Math.toRadians(spec.pitchDeg || 0),
    Cesium.Math.toRadians(spec.rollDeg || 0)
  ));
  const basis = new Cesium.Matrix3();
  const result = new Cesium.Quaternion();
  return new Cesium.CallbackProperty(time => {
    const frame = getOrbitFrameVectors(record, Cesium.JulianDate.toDate(time));
    if (!frame) return offset;
    const z = frame.zenith;
    const y = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(z, frame.prograde, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    const x = Cesium.Cartesian3.cross(y, z, new Cesium.Cartesian3());
    Cesium.Matrix3.setColumn(basis, 0, x, basis);
    Cesium.Matrix3.setColumn(basis, 1, y, basis);
    Cesium.Matrix3.setColumn(basis, 2, z, basis);
    Cesium.Quaternion.fromRotationMatrix(basis, result);
    Cesium.Quaternion.multiply(result, offset, result);
    return isFiniteQuaternion(result) ? result : offset;
  }, false);
}

// Repère local x = le long de la trajectoire, y = hors plan, z = radial.
function uncertaintyOrientationProperty(record) {
  const basis = new Cesium.Matrix3();
  const result = new Cesium.Quaternion();
  return new Cesium.CallbackProperty(time => {
    const frame = getOrbitFrameVectors(record, Cesium.JulianDate.toDate(time));
    if (!frame) return Cesium.Quaternion.IDENTITY;
    const z = frame.zenith;
    const y = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(z, frame.prograde, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    const x = Cesium.Cartesian3.cross(y, z, new Cesium.Cartesian3());
    Cesium.Matrix3.setColumn(basis, 0, x, basis);
    Cesium.Matrix3.setColumn(basis, 1, y, basis);
    Cesium.Matrix3.setColumn(basis, 2, z, basis);
    Cesium.Quaternion.fromRotationMatrix(basis, result);
    return isFiniteQuaternion(result) ? result : Cesium.Quaternion.IDENTITY;
  }, false);
}

function addUncertaintyMarker(record, color) {
  const radius = UNCERTAINTY_SPHERE_RADIUS_M;
  const sphereColor = record.isDebris ? DEBRIS_MARKER_COLOR : color;
  const modelSpec = resolveModelSpec(record);
  const modelEntities = modelSpec ? [viewer.entities.add({
    name: `Modèle -> ${record.name}`,
    position: new Cesium.CallbackProperty(() => record.positionCartesian, false),
    orientation: modelOrientationProperty(record, modelSpec),
    model: {
      uri: MODELS_DIR + modelSpec.file,
      scale: modelSpec.scale || 1,
      minimumPixelSize: modelSpec.minimumPixelSize ?? 64,
    },
  })] : [];
  modelEntities.forEach(e => entityToRecord.set(e, record));
  if (modelSpec && !modelSpec.keepSphere) return modelEntities;

  const isTle = record.type === "tle" && record.line1;
  const fixedRadii = new Cesium.Cartesian3(radius, radius, radius);
  const radiiScratch = new Cesium.Cartesian3();
  const entities = [...modelEntities, viewer.entities.add({
    name: `Incertitude -> ${record.name}`,
    position: new Cesium.CallbackProperty(() => record.positionCartesian, false),
    orientation: isTle ? uncertaintyOrientationProperty(record) : undefined,
    ellipsoid: {
      // x : le long de la trajectoire, y : hors plan, z : radial.
      radii: isTle ? new Cesium.CallbackProperty(time => {
        const age = tleAgeDaysAt(record, Cesium.JulianDate.toDate(time));
        if (!Number.isFinite(age)) return fixedRadii;
        const sigma = tleSigmaKm(age);
        const k = UNCERTAINTY_SIGMA_SCALE * 1000;
        return Cesium.Cartesian3.fromElements(sigma.along * k, sigma.cross * k, sigma.radial * k, radiiScratch);
      }, false) : fixedRadii,
      material: sphereColor.withAlpha(record.isDebris ? 0.35 : 0.25),
      outline: true,
      outlineColor: sphereColor.withAlpha(0.6),
    },
  })];

  entities.forEach(e => entityToRecord.set(e, record));
  if (record.isDebris) {
    DEBRIS_SPIKE_DIRECTIONS.forEach(dir => {
      const offset = Cesium.Cartesian3.multiplyByScalar(dir, radius + DEBRIS_SPIKE_LENGTH_M / 2, new Cesium.Cartesian3());
      const spikePosition = new Cesium.Cartesian3();
      entities.push(viewer.entities.add({
        position: new Cesium.CallbackProperty(() => Cesium.Cartesian3.add(record.positionCartesian, offset, spikePosition), false),
        orientation: orientationAlong(dir),
        cylinder: {
          length: DEBRIS_SPIKE_LENGTH_M,
          topRadius: 0,
          bottomRadius: DEBRIS_SPIKE_BASE_RADIUS_M,
          material: DEBRIS_MARKER_COLOR.withAlpha(0.85),
        },
      }));
    });
  }
  return entities;
}

function getOrbitPeriodSeconds(record) {
  if (record.type === "synthetic") {
    if (record.orbitState) {
      const aKm = OrbitPropagator.osculatingElements(record.orbitState.y).a;
      if (aKm > 0) return 2 * Math.PI * Math.sqrt(Math.pow(aKm, 3) / OrbitPropagator.MU);
    }
    return 2 * Math.PI * Math.sqrt(Math.pow(record.a, 3) / mu);
  }
  if (record.type === "tle" && record.satrec) {
    return (2 * Math.PI / record.satrec.no) * 60;
  }
  return 5400;
}

// Le tracé est dessiné en repère inertiel, tourné selon l'orientation de la
// Terre à l'instant affiché : c'est l'ellipse de l'orbite, fixe par rapport
// aux étoiles. En repère terrestre, chaque échantillon subit la rotation de
// la Terre jusqu'à son instant : négligeable sur un tour LEO (~22°), mais une
// orbite MEO devient une boucle et une GEO se réduit à un point.
// Exception : les deux objets d'une conjonction gardent le repère terrestre,
// pour que leurs tracés se croisent exactement sur le point de rencontre.
function buildOrbitTrailSamples(record, nowSeconds) {
  const horizon = getOrbitPeriodSeconds(record) * orbitTrailRevolutions;
  const samples = Math.ceil(ORBIT_TRAIL_SAMPLES_PER_REV * orbitTrailRevolutions);
  const earthFixed = isConjunctionMember(record.name);
  const frameMs = nowSeconds * 1000;
  const times = [];
  const positions = [];
  // Synthétique : on intègre une copie de l'état d'un échantillon au
  // suivant, sans toucher à l'état affiché.
  if (record.type === "synthetic") {
    if (!record.orbitState || record.decayed) return { times, positions };
    const state = OrbitPropagator.cloneState(record.orbitState);
    for (let k = 0; k <= samples; k++) {
      const tMs = (nowSeconds + (horizon * k) / samples) * 1000;
      if (!OrbitPropagator.propagateTo(state, tMs, SYNTHETIC_FORCE_MODEL, SYNTHETIC_MAX_STEPS_PER_CALL) || state.decayed) break;
      times.push(tMs / 1000);
      positions.push(inertialKmToCartesian(state.y, earthFixed ? tMs : frameMs));
    }
    return { times, positions };
  }
  if (record.type === "tle" && record.satrec && !earthFixed) {
    const gmstFrame = satellite.gstime(new Date(frameMs));
    for (let k = 0; k <= samples; k++) {
      const t = nowSeconds + (horizon * k) / samples;
      const pv = satellite.propagate(record.satrec, new Date(t * 1000));
      if (!pv || !pv.position) continue;
      const f = satellite.eciToEcf(pv.position, gmstFrame);
      const pos = new Cesium.Cartesian3(f.x * 1000, f.y * 1000, f.z * 1000);
      if (!isFiniteCartesian(pos)) continue;
      times.push(t);
      positions.push(pos);
    }
    return { times, positions };
  }
  for (let k = 0; k <= samples; k++) {
    const t = nowSeconds + (horizon * k) / samples;
    const pos = getPositionAtTime(record, new Date(t * 1000), t);
    if (!pos) continue;
    times.push(t);
    positions.push(pos);
  }
  return { times, positions };
}

// ---------- Paramètres orbitaux (éléments képlériens, comme IRL) ----------

// Altitude réelle au-dessus du niveau de la mer (hauteur ellipsoïdale WGS84),
// recalculée depuis la position 3D courante de l'objet — contrairement aux
// éléments orbitaux, elle varie réellement au cours du temps (excentricité)
// donc on ne peut pas la déduire une fois pour toutes de "a".
function getRealAltitudeKm(record) {
  if (!record.positionCartesian) return null;
  const cartographic = Cesium.Cartographic.fromCartesian(record.positionCartesian);
  if (!cartographic) return null;
  return cartographic.height / 1000;
}

// Latitude/longitude géodétiques (WGS84) courantes, recalculées comme
// l'altitude depuis la position 3D courante — donc live, tick après tick.
function getGeodeticLatLon(record) {
  if (!record.positionCartesian) return null;
  const cartographic = Cesium.Cartographic.fromCartesian(record.positionCartesian);
  if (!cartographic) return null;
  return {
    latitudeDeg: Cesium.Math.toDegrees(cartographic.latitude),
    longitudeDeg: Cesium.Math.toDegrees(cartographic.longitude),
  };
}

function getOrbitalParams(record) {
  const RAD2DEG = 180 / Math.PI;
  const altitudeKm = getRealAltitudeKm(record);
  const altitudeRow = altitudeKm !== null
    ? { label: "Altitude (true, above sea level)", value: `${altitudeKm.toFixed(1)} km` }
    : null;
  const latLon = getGeodeticLatLon(record);
  const liveGeoRows = latLon
    ? [
        { label: "Latitude", value: `${latLon.latitudeDeg.toFixed(4)}°` },
        { label: "Longitude", value: `${latLon.longitudeDeg.toFixed(4)}°` },
      ]
    : [];

  if (record.type === "synthetic") {
    const periodMin = getOrbitPeriodSeconds(record) / 60;
    if (record.decayed) {
      const decayDate = new Date(record.orbitState.decayMs);
      return [{ label: "Status", value: `Re-entered the atmosphere on ${decayDate.toLocaleString("en-GB")}` }];
    }
    // Éléments osculateurs instantanés : Ω dérive (J2), a baisse (traînée).
    const el = record.orbitState ? OrbitPropagator.osculatingElements(record.orbitState.y) : null;
    const rows = el ? [
      { label: "Semi-major axis (a)", value: `${el.a.toFixed(1)} km` },
      { label: "Inclination (i)", value: `${(el.inc * RAD2DEG).toFixed(3)}°` },
      { label: "RAAN (Ω)", value: `${(el.raan * RAD2DEG).toFixed(3)}°` },
      { label: "Eccentricity (e)", value: el.e.toFixed(5) },
      { label: "Perigee / apogee", value: `${el.perigeeKm.toFixed(1)} / ${el.apogeeKm.toFixed(1)} km` },
      { label: "Period", value: `${periodMin.toFixed(2)} min` },
      { label: "Model", value: "Numerical: J2-J6, drag, Moon, Sun, SRP" },
    ] : [
      { label: "Semi-major axis (a)", value: `${(record.a / 1000).toFixed(0)} km` },
      { label: "Inclination (i)", value: `${(record.inc * RAD2DEG).toFixed(2)}°` },
      { label: "RAAN (Ω)", value: `${(record.raan * RAD2DEG).toFixed(2)}°` },
      { label: "Period", value: `${periodMin.toFixed(1)} min` },
    ];
    if (altitudeRow) rows.unshift(altitudeRow);
    rows.unshift(...liveGeoRows);
    return rows;
  }

  if (record.type === "tle" && record.satrec) {
    const s = record.satrec;
    const periodMin = (2 * Math.PI) / s.no;
    const meanMotionRevDay = 1440 / periodMin;
    const rows = [
      { label: "Inclination (i)", value: `${(s.inclo * RAD2DEG).toFixed(4)}°` },
      { label: "RAAN (Ω)", value: `${(s.nodeo * RAD2DEG).toFixed(4)}°` },
      { label: "Eccentricity (e)", value: s.ecco.toFixed(7) },
      { label: "Argument of perigee (ω)", value: `${(s.argpo * RAD2DEG).toFixed(4)}°` },
      { label: "Mean anomaly (M)", value: `${(s.mo * RAD2DEG).toFixed(4)}°` },
      { label: "Mean motion", value: `${meanMotionRevDay.toFixed(4)} rev/day` },
      { label: "Period", value: `${periodMin.toFixed(1)} min` },
    ];
    if (altitudeRow) rows.unshift(altitudeRow);
    rows.unshift(...liveGeoRows);
    return rows;
  }

  const fallbackRows = altitudeRow ? [altitudeRow] : [];
  fallbackRows.unshift(...liveGeoRows);
  return fallbackRows;
}

// Rendu complet du panneau (structure + valeurs) — appelé sur les
// changements de sélection (évènements ponctuels déclenchés par
// l'utilisateur), PAS sur le rafraîchissement périodique du tick (voir
// refreshOrbitalParamsValues).
// Objets affichés dans le panneau : la sélection, plus l'objet suivi par la
// caméra s'il n'en fait pas partie (suivi lancé par double-clic Cesium).
function getOrbitalParamsNames() {
  const tracked = getTrackedRecord();
  const isShown = name => selectedOrbitNames.has(name) || (tracked && tracked.name === name);
  if (activeConjunction) return new Set([activeConjunction.primary, activeConjunction.secondary]);
  if (lastClickedObjectName && isShown(lastClickedObjectName)) return new Set([lastClickedObjectName]);
  const names = new Set(selectedOrbitNames);
  if (tracked) names.add(tracked.name);
  return names;
}

function getTrackedRecord() {
  if (!viewer.trackedEntity) return null;
  return entityToRecord.get(viewer.trackedEntity) || null;
}

// Époque du TLE (ligne 1, colonnes 19-32 : AAJJJ.JJJJJJJJ), en UTC.
function getTleEpochDate(line1) {
  if (!line1 || line1.length < 32) return null;
  const yy = Number(line1.substring(18, 20));
  const dayOfYear = Number(line1.substring(20, 32));
  if (!Number.isFinite(yy) || !Number.isFinite(dayOfYear)) return null;
  const year = yy < 57 ? 2000 + yy : 1900 + yy;
  return new Date(Date.UTC(year, 0, 1) + (dayOfYear - 1) * 86_400_000);
}

function formatTleAge(epochDate) {
  const days = (Date.now() - epochDate.getTime()) / 86_400_000;
  if (days < 1) return { text: `${Math.max(1, Math.round(days * 24))} h ago`, cls: "tleAgeFresh" };
  const rounded = Math.round(days);
  const cls = days < 3 ? "tleAgeFresh" : days < 7 ? "tleAgeAging" : "tleAgeStale";
  return { text: `${rounded} d ago`, cls };
}

function renderTleSection(record) {
  if (record.type !== "tle" || !record.line1 || !record.line2) return "";
  const epoch = getTleEpochDate(record.line1);
  const age = epoch ? formatTleAge(epoch) : null;
  const meta = record.group ? sheetGroupsMeta.get(record.group) : null;
  const epochRow = epoch
    ? `<div class="orbitalParamsRow"><span class="orbitalParamsLabel">TLE epoch</span>`
      + `<span class="orbitalParamsValue">${epoch.toISOString().slice(0, 16).replace("T", " ")} UTC</span></div>`
      + `<div class="orbitalParamsRow"><span class="orbitalParamsLabel">Age</span><span class="orbitalParamsValue ${age.cls}">${age.text}</span></div>`
    : "";
  const syncRow = meta
    ? `<div class="orbitalParamsRow"><span class="orbitalParamsLabel">Sheet (${record.group})</span><span class="orbitalParamsValue">${meta.lastSync ? new Date(meta.lastSync).toLocaleDateString() : "—"}</span></div>`
    : "";
  return `<div class="tleSection">`
    + `<div class="tleSectionHeader"><span class="trailControlLabel">TLE${record.catnr !== undefined ? ` · NORAD ${record.catnr}` : ""}</span>`
    + `<button type="button" class="tleCopyBtn" data-sat-name="${record.name}">Copy</button></div>`
    + `<pre class="tleLines">${record.line1}\n${record.line2}</pre>`
    + epochRow + syncRow
    + `</div>`;
}

function updateOrbitalParamsPanel() {
  if (!orbitalParamsPanelEl || !orbitalParamsContentEl) return;

  // La visibilité du panneau lui-même est pilotée par le dock (classe
  // dockOpen) ; ici on ne gère que son contenu.
  const names = getOrbitalParamsNames();
  if (names.size === 0) {
    orbitalParamsContentEl.innerHTML = `<div class="distNone">No tracked object</div>`;
    return;
  }

  const tracked = getTrackedRecord();
  const blocks = [];
  if (activeConjunction) blocks.push(renderConjunctionSummary(activeConjunction.data));
  names.forEach(name => {
    const record = satRecords.find(r => r.name === name);
    if (!record) return;
    const isTracked = tracked === record;
    const conjRole = !activeConjunction ? null
      : name === activeConjunction.primary ? { label: "Object 1", cls: "conjDotPrimary" }
      : { label: "Object 2", cls: "conjDotSecondary" };
    const rows = getOrbitalParams(record)
      .map(p => `<div class="orbitalParamsRow"><span class="orbitalParamsLabel">${p.label}</span><span class="orbitalParamsValue">${p.value}</span></div>`)
      .join("");
    blocks.push(
      `<div class="orbitalParamsBlock">`
      + `<div class="orbitalParamsNameRow"><div class="orbitalParamsName">`
      + (conjRole ? `<span class="conjDot ${conjRole.cls}"></span><span class="conjRoleLabel">${conjRole.label}</span>` : "")
      + `${escapeHtml(record.name)}</div>`
      + `<span class="orbitalParamsActions">`
      + `<button type="button" class="groundTrackBtn" data-sat-name="${escapeHtml(record.name)}" title="Open the ground track in a window">${ICON_GROUND_TRACK}Ground track</button>`
      + (isTracked
        ? `<span class="focusBtnGroup">`
          + `<button type="button" class="focusExitBtn">Stop tracking</button>`
          + `<button type="button" class="focusIsolateBtn${isolateTrackedObject ? " focusIsolateBtnActive" : ""}" title="Show only this object">Isolate</button>`
          + `</span>`
        : "")
      + `</span>`
      + `</div>`
      + `<div class="orbitalParamsGrid" data-sat-name="${record.name}">${rows}</div>`
      + (isTracked || conjRole ? renderTleSection(record) : "")
      + `</div>`
    );
  });

  orbitalParamsContentEl.innerHTML = blocks.join("");
}

// Rafraîchissement léger (valeurs uniquement) appelé à chaque tick throttlé :
// ne touche QUE les grilles de paramètres en lecture seule.
function refreshOrbitalParamsValues() {
  if (!orbitalParamsContentEl) return;
  const countdownEl = orbitalParamsContentEl.querySelector(".conjCountdown");
  if (countdownEl && activeConjunction) countdownEl.textContent = formatConjCountdown(activeConjunction.tcaMs - currentClockMs());
  getOrbitalParamsNames().forEach(name => {
    const record = satRecords.find(r => r.name === name);
    if (!record) return;
    const gridEl = orbitalParamsContentEl.querySelector(`.orbitalParamsGrid[data-sat-name="${name}"]`);
    if (gridEl) {
      gridEl.innerHTML = getOrbitalParams(record)
        .map(p => `<div class="orbitalParamsRow"><span class="orbitalParamsLabel">${p.label}</span><span class="orbitalParamsValue">${p.value}</span></div>`)
        .join("");
    }
  });
}

function clearOrbitTrails() {
  orbitTrailEntities.forEach(entity => viewer.entities.remove(entity));
  orbitTrailEntities = new Map();
  uncertaintySphereEntities.forEach(entities => entities.forEach(e => viewer.entities.remove(e)));
  uncertaintySphereEntities = new Map();
  selectedOrbitNames = new Set();
  updateOrbitalParamsPanel();
}

// flyToOrbit : cadrer toute l'orbite (sélection seule) ; désactivé quand la
// sélection accompagne un suivi caméra, qui cadre déjà l'objet de près.
function setSelectedOrbit(name, { flyToOrbit = true } = {}) {
  if (selectedOrbitNames.has(name)) {
    selectedOrbitNames.delete(name);
    const entity = orbitTrailEntities.get(name);
    if (entity) {
      viewer.entities.remove(entity);
      orbitTrailEntities.delete(name);
    }
    const markerEntities = uncertaintySphereEntities.get(name);
    if (markerEntities) {
      markerEntities.forEach(e => viewer.entities.remove(e));
      uncertaintySphereEntities.delete(name);
    }
    updateOrbitalParamsPanel();
    return;
  }

  const record = satRecords.find(r => r.name === name);
  if (!record) return;

  selectedOrbitNames.add(name);
  const color = conjunctionTrailColor(name) || nextOrbitTrailColor();

  const nowSeconds = Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime() / 1000;
  const trailCache = { ...buildOrbitTrailSamples(record, nowSeconds), computedAtMs: performance.now(), revolutions: orbitTrailRevolutions };
  const initialPositions = trailCache.positions;

  const entity = viewer.entities.add({
    name: `Future orbit -> ${record.name}`,
    polyline: {
      // Recalcul complet toutes les ORBIT_TRAIL_REFRESH_MS ; entre deux, à
      // chaque image, le tracé part de la position affichée de l'objet et
      // les échantillons déjà dépassés sont retirés (pas de bout de
      // trajectoire "derrière" l'objet).
      positions: new Cesium.CallbackProperty(() => {
        const nowMs = performance.now();
        const t = Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime() / 1000;
        if (nowMs - trailCache.computedAtMs >= ORBIT_TRAIL_REFRESH_MS || trailCache.revolutions !== orbitTrailRevolutions) {
          Object.assign(trailCache, buildOrbitTrailSamples(record, t));
          trailCache.computedAtMs = nowMs;
          trailCache.revolutions = orbitTrailRevolutions;
        }
        const visible = [Cesium.Cartesian3.clone(record.positionCartesian)];
        for (let i = 0; i < trailCache.times.length; i++) {
          if (trailCache.times[i] > t) visible.push(trailCache.positions[i]);
        }
        return visible;
      }, false),
      width: new Cesium.CallbackProperty(() => orbitTrailWidth, false),
      material: orbitTrailMaterial(color),
      arcType: Cesium.ArcType.NONE,
    },
  });
  entity.trailColor = color;
  orbitTrailEntities.set(name, entity);

  uncertaintySphereEntities.set(name, addUncertaintyMarker(record, color));

  // La vue par défaut est très dézoomée (25 000 km d'altitude) : sans ça,
  // une orbite basse (~700-1000 km) reste un fin liseré invisible collé au globe.
  // On calcule nous-mêmes la bounding sphere (viewer.flyTo sur une entité
  // fraîchement ajoutée échoue souvent car son visualiseur n'a pas encore
  // tourné un premier tick).
  if (flyToOrbit && initialPositions.length > 0) {
    const boundingSphere = Cesium.BoundingSphere.fromPoints(initialPositions);
    viewer.camera.flyToBoundingSphere(boundingSphere, { duration: 1.2 });
  }

  updateOrbitalParamsPanel();
}

function clearAllSatEntities() {
  satRecords.forEach(r => {
    if (r.entity) viewer.entities.remove(r.entity);
    if (r.laserEntity) viewer.entities.remove(r.laserEntity);
  });
  satPointCollection.removeAll();
  satLabelCollection.removeAll();
  clearDebrisStationLinks();
  satRecords = [];
  linkEntities.forEach(e => viewer.entities.remove(e));
  linkEntities = [];
  clearOrbitTrails();
}

const MAX_OBJECTS_FOR_LINK_LINES = 80;

// ---------- Propagation SGP4 dans un Web Worker ----------
// Le calcul des positions TLE se fait hors du thread d'affichage ; le
// worker renvoie les positions en repère terrestre (m) dans un
// Float64Array transféré. Repli sur le calcul local si le worker ne
// démarre pas (satellite.js injoignable depuis le worker, etc.).
const SATELLITE_JS_URL = (document.querySelector('script[src*="satellite"]') || {}).src;
const PROPAGATION_WORKER_SOURCE = `
let satrecs = [];
onmessage = (e) => {
  const msg = e.data;
  if (msg.type === "init") {
    satrecs = msg.tles.map(([l1, l2]) => {
      try { return satellite.twoline2satrec(l1, l2); } catch (err) { return null; }
    });
    return;
  }
  if (msg.type === "propagate") {
    const date = new Date(msg.timeMs);
    const gmst = satellite.gstime(date);
    const out = new Float64Array(satrecs.length * 3);
    for (let i = 0; i < satrecs.length; i++) {
      const pv = satrecs[i] ? satellite.propagate(satrecs[i], date) : null;
      if (!pv || !pv.position) { out[3 * i] = NaN; continue; }
      const ecf = satellite.eciToEcf(pv.position, gmst);
      out[3 * i] = ecf.x * 1000;
      out[3 * i + 1] = ecf.y * 1000;
      out[3 * i + 2] = ecf.z * 1000;
    }
    postMessage({ generation: msg.generation, positions: out }, [out.buffer]);
  }
};`;

let propagationWorker = null;
let workerTleRecords = [];
let workerGeneration = 0;
let workerBusy = false;

function disablePropagationWorker(reason) {
  console.warn("Propagation dans le worker désactivée, calcul local:", reason);
  if (propagationWorker) propagationWorker.terminate();
  propagationWorker = null;
  workerTleRecords.forEach(r => { r.workerPropagated = false; });
  workerTleRecords = [];
}

try {
  if (SATELLITE_JS_URL && window.Worker) {
    const blob = new Blob([`importScripts(${JSON.stringify(SATELLITE_JS_URL)});\n${PROPAGATION_WORKER_SOURCE}`], { type: "text/javascript" });
    propagationWorker = new Worker(URL.createObjectURL(blob));
    propagationWorker.onerror = (e) => disablePropagationWorker(e.message || e);
    propagationWorker.onmessage = (e) => {
      if (e.data.generation !== workerGeneration) return; // réponse pour une scène déjà reconstruite
      workerBusy = false;
      const positions = e.data.positions;
      const tracked = getTrackedRecord();
      for (let i = 0; i < workerTleRecords.length; i++) {
        const x = positions[3 * i];
        if (Number.isNaN(x)) continue;
        const r = workerTleRecords[i];
        if (r === tracked) continue; // calculé à chaque image dans onTick
        r.positionCartesian.x = x;
        r.positionCartesian.y = positions[3 * i + 1];
        r.positionCartesian.z = positions[3 * i + 2];
        r.hasPosition = true;
        r.point.position = r.positionCartesian;
        if (r.label) r.label.position = r.positionCartesian;
      }
    };
  }
} catch (err) {
  disablePropagationWorker(err);
}

function setPropagationRecords(records) {
  workerGeneration += 1;
  workerBusy = false;
  if (!propagationWorker) return;
  workerTleRecords = records.filter(r => r.type === "tle" && r.line1 && r.line2);
  workerTleRecords.forEach(r => { r.workerPropagated = true; });
  propagationWorker.postMessage({ type: "init", tles: workerTleRecords.map(r => [r.line1, r.line2]) });
}

// Au-delà de WORKER_RATE_LIMIT_THRESHOLD objets, positions renvoyées ~10 fois
// par seconde au lieu de chaque image : chaque réponse réécrit tous les points
// (CPU + envoi au GPU). L'objet suivi, lui, est recalculé à chaque image sur
// le thread principal pour que la caméra reste fluide (voir onTick).
const WORKER_RATE_LIMIT_THRESHOLD = 1500;
const WORKER_MIN_INTERVAL_MS = 100;
let lastWorkerRequestMs = 0;

function requestWorkerPropagation(jsDate) {
  if (!propagationWorker || workerBusy || workerTleRecords.length === 0) return;
  const nowMs = performance.now();
  if (workerTleRecords.length > WORKER_RATE_LIMIT_THRESHOLD && nowMs - lastWorkerRequestMs < WORKER_MIN_INTERVAL_MS) return;
  lastWorkerRequestMs = nowMs;
  workerBusy = true;
  propagationWorker.postMessage({ type: "propagate", timeMs: jsDate.getTime(), generation: workerGeneration });
}

function satDisplayColor(record) {
  return record.inCollisionRisk ? RISK_POINT_COLOR : record.baseColor;
}

function addSatLabel(record) {
  record.label = satLabelCollection.add({
    position: record.positionCartesian,
    image: labelImage(record.name, 11),
    scale: LABEL_IMAGE_SCALE,
    color: satDisplayColor(record),
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
    pixelOffset: new Cesium.Cartesian2(7, 0),
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    id: record,
  });
}

function setObjectLabelsVisible(visible) {
  showObjectLabels = visible;
  satLabelCollection.removeAll();
  satRecords.forEach(r => { r.label = undefined; });
  if (visible) satRecords.forEach(addSatLabel);
}

// ---------- Filtre par plage d'altitude ----------
// Curseurs en échelle non linéaire (puissance ALT_SLIDER_EXPONENT) : la
// moitié basse du curseur couvre l'orbite basse, où sont la plupart des
// objets, le reste va jusqu'au-delà de la GEO.
const ALT_FILTER_MAX_KM = 40000;
const ALT_SLIDER_STEPS = 1000;
const ALT_SLIDER_EXPONENT = 2.5;
const altitudeFilter = { enabled: false, minKm: 300, maxKm: 2000 };
const altitudeScratch = new Cesium.Cartographic();

function sliderToAltKm(value) {
  return Math.round(ALT_FILTER_MAX_KM * Math.pow(value / ALT_SLIDER_STEPS, ALT_SLIDER_EXPONENT));
}

function altKmToSlider(km) {
  const clamped = Math.min(Math.max(km, 0), ALT_FILTER_MAX_KM);
  return Math.round(ALT_SLIDER_STEPS * Math.pow(clamped / ALT_FILTER_MAX_KM, 1 / ALT_SLIDER_EXPONENT));
}

function isInAltitudeRange(record) {
  if (!altitudeFilter.enabled) return true;
  if (!record.hasPosition) return false;
  const carto = Cesium.Cartographic.fromCartesian(record.positionCartesian, Cesium.Ellipsoid.WGS84, altitudeScratch);
  if (!carto) return false;
  const altKm = carto.height / 1000;
  return altKm >= altitudeFilter.minKm && altKm <= altitudeFilter.maxKm;
}

// Couleur (risque) et visibilité (isolation de paires, plage d'altitude) —
// appelé à chaque recalcul de la scène, les primitives n'ont pas de
// CallbackProperty.
// Visibilité par groupe ("Afficher / masquer" du catalogue) : décocher un
// groupe chargé le masque sans le décharger ni reconstruire la scène — seuls
// les points/noms passent en show=false. Les objets ajoutés à la main sont
// le groupe MANUAL_GROUP_KEY. L'objet suivi reste toujours affiché.
const MANUAL_GROUP_KEY = "__manuel__";
const hiddenGroups = new Set();

function recordGroupKey(record) {
  return record.group || MANUAL_GROUP_KEY;
}

const visibleObjectCounterEl = document.getElementById("visibleObjectCounter");
let lastVisibleCounterText = "";

function updateVisibleObjectCounter(visibleCount) {
  const text = `<strong>${visibleCount.toLocaleString("en-GB")}</strong> object${visibleCount > 1 ? "s" : ""} shown`;
  if (text === lastVisibleCounterText) return;
  lastVisibleCounterText = text;
  visibleObjectCounterEl.innerHTML = text;
}

function updateSatPrimitiveStyles() {
  let inRangeCount = 0;
  let visibleCount = 0;
  const tracked = getTrackedRecord();
  satRecords.forEach(r => {
    const color = satDisplayColor(r);
    r.inAltitudeRange = isInAltitudeRange(r);
    if (r.inAltitudeRange) inRangeCount += 1;
    r.groupHidden = hiddenGroups.has(recordGroupKey(r)) && r !== tracked;
    const show = !isDimmed(r.name) && (isConjunctionMember(r.name) || (r.inAltitudeRange && !r.groupHidden)) && !r.decayed;
    r.point.color = color; // le setter ignore une couleur identique
    r.point.show = show;
    if (show && r.hasPosition) visibleCount += 1;
    if (r.label) {
      r.label.color = color;
      r.label.show = show;
    }
  });
  updateAltitudeFilterCount(inRangeCount);
  updateVisibleObjectCounter(visibleCount);
}

// Entité créée à la demande pour le suivi caméra : nom toujours affiché
// tant que l'objet est suivi, même si les noms sont masqués globalement.
function ensureTrackEntity(record) {
  if (record.entity) return record.entity;
  record.entity = viewer.entities.add({
    name: record.name,
    position: new Cesium.CallbackProperty(() => record.positionCartesian, false),
    // Point de vue de la caméra en suivi (repère est/nord/haut de l'objet) :
    // ~25 km : la sphère ou le modèle reste bien visible avec du recul.
    viewFrom: new Cesium.Cartesian3(-15000, -15000, 12000),
    billboard: {
      image: labelImage(record.name, 12, 600),
      scale: LABEL_IMAGE_SCALE,
      color: new Cesium.CallbackProperty(() => satDisplayColor(record), false),
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      pixelOffset: new Cesium.Cartesian2(7, 0),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      show: new Cesium.CallbackProperty(() => viewer.trackedEntity === record.entity && !record.label, false),
    },
  });
  entityToRecord.set(record.entity, record);
  return record.entity;
}

// Satellite sous le curseur : point/nom de la collection, ou entité de suivi.
// Ce qui est sous le curseur : un objet en orbite ({ record }) ou une
// station laser ({ site }, point ou nom).
function pickSceneObject(windowPosition) {
  const picked = viewer.scene.pick(windowPosition);
  if (!picked) return {};
  if (picked.collection === satPointCollection || picked.collection === satLabelCollection) return { record: picked.id };
  if (picked.collection === debrisLinkCollection || debrisLinkPrimitives.has(picked.primitive)) return { record: picked.id };
  if (picked.id instanceof Cesium.Entity) {
    const record = entityToRecord.get(picked.id);
    if (record) return { record };
    const site = LASER_SITES.find(s => s.entity === picked.id);
    if (site) return { site };
  }
  return {};
}

function pickSatRecord(windowPosition) {
  return pickSceneObject(windowPosition).record;
}

// Vue aérienne rapprochée d'une station : caméra à la verticale du site,
// assez bas pour distinguer les bâtiments sur l'imagerie satellite.
const SITE_VIEW_ALTITUDE_M = 900;

function flyToSite(site) {
  if (viewer.trackedEntity) viewer.trackedEntity = undefined;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(site.lon, site.lat, site.alt + SITE_VIEW_ALTITUDE_M),
    orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
    duration: 2.5,
  });
}

function instantiateRecords(rawRecords) {
  clearAllSatEntities();

  const allRecords = [...rawRecords];

  if (!labelsAutoDisabledOnce && allRecords.length > MAX_OBJECTS_FOR_PAIRWISE_RISK) {
    showObjectLabels = false;
    labelsAutoDisabledOnce = true;
    if (showLabelsCheckboxEl) showLabelsCheckboxEl.checked = false;
  }

  // Le laser par objet (ligne de visibilité depuis le site de référence)
  // retestait une intersection rayon/ellipsoïde à CHAQUE FRAME DE RENDU pour
  // CHAQUE objet, indépendamment du throttle d'onTick (qui ne limite que le
  // recalcul des positions, pas la réévaluation des CallbackProperty par
  // Cesium au rendu) — et un site de référence est sélectionné par défaut
  // (voir selectedReferenceSite), donc ce test tournait réellement en
  // continu. Sur ~300 objets c'est invisible ; sur Starlink (~6000) ça fait
  // des centaines de milliers de tests rayon/ellipsoïde par seconde, et
  // c'était la cause principale du freeze — bien plus que le throttle
  // d'onTick ne pouvait compenser. Au-delà du même seuil que les liens de
  // proximité pairwise (pas davantage de sens à afficher des milliers de
  // lasers simultanés qu'à afficher leurs milliers de liens de proximité),
  // on ne crée simplement pas l'entité.
  const laserEntitiesEnabled = allRecords.length <= MAX_OBJECTS_FOR_PAIRWISE_RISK;

  // Les débris d'une même fragmentation portent tous le même nom
  // ("FENGYUN 1C DEB"...) alors que l'appli identifie les objets par leur
  // nom (sélection, conjonctions, distances) : un nom en double reçoit son
  // n° NORAD pour que chaque objet reste désignable sans ambiguïté.
  const nameCounts = new Map();
  allRecords.forEach(raw => nameCounts.set(raw.name, (nameCounts.get(raw.name) || 0) + 1));
  const uniqueName = raw => {
    if (nameCounts.get(raw.name) < 2) return raw.name;
    const catnr = raw.catnr ?? (raw.type === "tle" && raw.line1 ? parseInt(raw.line1.substring(2, 7), 10) : NaN);
    return Number.isFinite(Number(catnr)) && raw.group ? `${raw.name} (${catnr})` : raw.name;
  };

  allRecords.forEach(raw => {
    const record = { name: uniqueName(raw), type: raw.type, positionCartesian: new Cesium.Cartesian3() };

    if (raw.type === "synthetic") {
      record.a = raw.a;
      record.inc = raw.inc;
      record.raan = raw.raan;
      record.epochT = raw.epochT ?? 0;
      record.M0 = raw.M0 ?? 0;
      // Époque de l'état initial : celle de la fiche si elle existe, sinon
      // l'instant affiché au chargement de la scène.
      initSyntheticOrbitState(record, Number.isFinite(raw.epochMs) ? raw.epochMs : Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime());
    } else if (raw.type === "tle") {
      try {
        record.satrec = satellite.twoline2satrec(raw.line1, raw.line2);
      } catch (err) {
        console.warn("TLE invalide, ignoré:", raw.name, err);
        return;
      }
    } else {
      return;
    }

    const isReal = raw.type === "tle";
    // Objets ajoutés à la main (Feuille 1) : le n° NORAD n'est pas toujours
    // renseigné, mais il figure toujours dans la ligne 1 du TLE (colonnes 3-7).
    const catnrFromTle = isReal ? parseInt(raw.line1.substring(2, 7), 10) : NaN;
    record.catnr = raw.catnr ?? (Number.isFinite(catnrFromTle) ? catnrFromTle : undefined);
    if (isReal) {
      record.line1 = raw.line1;
      record.line2 = raw.line2;
    }
    record.group = raw.group;
    record.isDebris = isDebrisGroup(raw.group);
    record.inCollisionRisk = false;
    record.baseColor = raw.color ? Cesium.Color.fromCssColorString(raw.color) : randomObjectColor();

    record.point = satPointCollection.add({
      position: record.positionCartesian,
      pixelSize: isReal ? 3.6 : 3.2,
      color: record.baseColor,
      id: record,
    });
    if (showObjectLabels) addSatLabel(record);

    if (laserEntitiesEnabled) {
      record.laserEntity = viewer.entities.add({
        name: `Laser -> ${record.name}`,
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            // Copie : voir trackDistanceDrawn.
            return selectedReferenceSite ? [selectedReferenceSite.position, Cesium.Cartesian3.clone(record.positionCartesian)] : [];
          }, false),
          width: 2,
          material: new Cesium.ColorMaterialProperty(
            new Cesium.CallbackProperty(() => {
              if (!selectedReferenceSite) return DIST_COLOR_GREEN;
              const distanceKm = Cesium.Cartesian3.distance(selectedReferenceSite.position, record.positionCartesian) / 1000;
              return getDistanceCesiumColor(distanceKm);
            }, false)
          ),
          arcType: Cesium.ArcType.NONE,
          show: new Cesium.CallbackProperty(() => {
            if (!selectedReferenceSite || isDimmed(record.name)) return false;
            return hasLineOfSight(selectedReferenceSite.position, record.positionCartesian);
          }, false),
        },
      });
    }

    satRecords.push(record);
  });

  const dpr = window.devicePixelRatio || 1;
  viewer.resolutionScale = satRecords.length > FULL_RESOLUTION_OBJECT_LIMIT ? Math.min(1, 1.5 / dpr) : 1;

  setPropagationRecords(satRecords);

  // Une polyline par paire : n² entités, intenable bien avant le seuil du
  // calcul de risque lui-même.
  if (satRecords.length <= MAX_OBJECTS_FOR_LINK_LINES) {
    for (let i = 0; i < satRecords.length; i++) {
      for (let j = i + 1; j < satRecords.length; j++) {
        const a = satRecords[i];
        const b = satRecords[j];
        linkEntities.push(viewer.entities.add({
          name: `Lien proximité: ${a.name} <-> ${b.name}`,
          polyline: {
            positions: new Cesium.CallbackProperty(() => [a.positionCartesian, b.positionCartesian], false),
            width: 2,
            material: LINK_LINE_COLOR,
            arcType: Cesium.ArcType.NONE,
            show: new Cesium.CallbackProperty(() => {
              const d = Cesium.Cartesian3.distance(a.positionCartesian, b.positionCartesian) / 1000;
              const isolationOk = isolatedNames.size === 0 || (isolatedNames.has(a.name) && isolatedNames.has(b.name));
              return d < COLLISION_RISK_KM && isolationOk;
            }, false),
          },
        }));
      }
    }
  }
}

// ============================================================================
// ---------- Administration (ajout/suppression manuelle d'objets suivis) ----
// ============================================================================
// `currentRawRecords` reflète exactement la liste des objets manuels/Sheet
// passée en entrée à instantiateRecords, hors objets du catalogue CelesTrak
// en masse — voir catalogRawRecords plus bas, volontairement séparé et
// jamais persisté ici ni poussé vers le Sheet.
let currentRawRecords = [];

function persistAndReloadRecords() {
  saveCache(currentRawRecords);
  rebuildScene();
  renderAdminTable();
}

// ============================================================================
// ---------- Catalogue CelesTrak : état et fusion avec les objets manuels ----
// ============================================================================
let catalogRawRecords = [];
let catalogGroupsLoaded = new Set(); // groupes actuellement chargés dans catalogRawRecords (scène 3D)

// Reflet des onglets du Sheet (id -> { id, count, lastSync }), rafraîchi via
// listGroupsFromSheet() : sert à distinguer les groupes "déjà connus" (onglet
// Mettre à jour) des groupes "jamais importés" (onglet Importer), et à lister
// tout ce qui est disponible dans l'onglet Charger données existantes.
let sheetGroupsMeta = new Map();
let sheetGroupsMetaLoaded = false;
let catalogSelectedImportGroups = new Set(); // cases cochées dans "Importer d'autres objets"
let catalogSelectedUpdateGroups = new Set(); // cases cochées dans "Mettre à jour"

let catalogFilters = {
  countries: new Set(),   // vide = tous
  objectTypes: new Set(), // vide = tous
  search: "",
  colorBy: "constellation", // "constellation" | "category" | "country" | "none"
};

function getRecordCategory(record) {
  const group = CATALOG_GROUPS.find(g => g.id === record.group);
  return group ? group.category : "autre";
}

// Palette néon à luminosité homogène (froids majoritaires, deux accents
// chauds) ; couleur fixe par constellation selon son rang dans CATALOG_GROUPS.
const CONSTELLATION_PALETTE = [
  "#3EE6F0", // cyan
  "#5A9BFF", // bleu électrique
  "#A47CFF", // violet
  "#E46BE0", // magenta
  "#3FE0A8", // menthe
  "#FF8A5C", // corail
  "#6FD3FF", // bleu ciel
  "#C38BFF", // lavande
  "#2FC7B5", // sarcelle
  "#FFC75C", // ambre
];

function getConstellationColor(groupId) {
  const index = CATALOG_GROUPS.findIndex(g => g.id === groupId);
  const seed = index >= 0 ? index : [...String(groupId)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
  return CONSTELLATION_PALETTE[seed % CONSTELLATION_PALETTE.length];
}

function getGroupLabel(groupId) {
  const group = CATALOG_GROUPS.find(g => g.id === groupId);
  return group ? group.label : groupId;
}

// Rouge des débris : distinct du rouge "risque" (RISK_POINT_COLOR).
const DEBRIS_COLOR_HEX = "#E5484D";
let showDebrisInRed = true;

function isDebrisGroup(groupId) {
  const group = CATALOG_GROUPS.find(g => g.id === groupId);
  return !!group && group.category === "debris";
}

function applyCatalogColor(record) {
  if (showDebrisInRed && isDebrisGroup(record.group)) {
    return DEBRIS_COLOR_HEX;
  }
  if (catalogFilters.colorBy === "constellation") {
    return getConstellationColor(record.group);
  }
  if (catalogFilters.colorBy === "category") {
    return getCategoryColor(getRecordCategory(record));
  }
  if (catalogFilters.colorBy === "country" && satcatIndex) {
    const meta = satcatIndex.get(record.catnr);
    return meta && meta.country ? countryToColor(meta.country) : CATALOG_CATEGORIES.autre.colorHex;
  }
  return undefined;
}

function getFilteredCatalogRecords() {
  const search = catalogFilters.search.trim().toLowerCase();
  return catalogRawRecords
    .filter(r => {
      if (search && !r.name.toLowerCase().includes(search)) return false;
      if (catalogFilters.countries.size > 0 || catalogFilters.objectTypes.size > 0) {
        const meta = satcatIndex ? satcatIndex.get(r.catnr) : null;
        if (catalogFilters.countries.size > 0 && (!meta || !catalogFilters.countries.has(meta.country))) return false;
        if (catalogFilters.objectTypes.size > 0 && (!meta || !catalogFilters.objectTypes.has(meta.objectType))) return false;
      }
      return true;
    })
    .map(r => {
      const color = applyCatalogColor(r);
      return color ? { ...r, color } : r;
    });
}

// Seuil au-delà duquel on désactive le calcul O(n²) de proximité/risque et
// les liens polyline pair-à-pair (voir instantiateRecords + onTick) : tenable
// pour des centaines d'objets, pas pour des milliers (ex. GROUP=starlink).
const MAX_OBJECTS_FOR_PAIRWISE_RISK = 300;

// Un même objet (n° NORAD) peut figurer dans plusieurs groupes (ex. "GNSS"
// et "GPS", "Météo" et "NOAA") : on ne garde que l'exemplaire du groupe le
// plus spécifique (voir dedupeRank), et jamais un objet déjà présent parmi
// les objets ajoutés à la main.
// Plus le rang est petit, plus le groupe est prioritaire : un groupe précis
// passe toujours avant un groupe "umbrella" (GPS avant GNSS, ICEYE avant
// SAR, Starlink avant "Lancés ces 30 jours"), puis le plus petit l'emporte.
function dedupeRank(groupId, groupSizes) {
  const group = CATALOG_GROUPS.find(g => g.id === groupId);
  return (group && group.umbrella ? 1e9 : 0) + (groupSizes.get(groupId) || 0);
}

function dedupeCatalogRecords(records, manualRecords) {
  const groupSizes = new Map();
  catalogRawRecords.forEach(r => groupSizes.set(r.group, (groupSizes.get(r.group) || 0) + 1));
  const manualCatnrs = new Set(manualRecords.map(r => r.catnr).filter(Number.isFinite));
  const byCatnr = new Map();
  const withoutCatnr = [];
  records.forEach(r => {
    if (!Number.isFinite(r.catnr)) {
      withoutCatnr.push(r);
      return;
    }
    if (manualCatnrs.has(r.catnr)) return;
    const kept = byCatnr.get(r.catnr);
    if (!kept || dedupeRank(r.group, groupSizes) < dedupeRank(kept.group, groupSizes)) byCatnr.set(r.catnr, r);
  });
  return [...byCatnr.values(), ...withoutCatnr];
}

// Modules amarrés publiés avec le même TLE que leur station : un seul objet
// par station (ISS (ZARYA) 25544, station chinoise CSS (TIANHE) 48274).
const DOCKED_MODULE_CATNRS = new Set([
  49044, // ISS (NAUKA)
  53239, // CSS (WENTIAN)
  54216, // CSS (MENGTIAN)
]);

// Reconstruire la scène recrée tous les objets : sans précaution, l'objet
// suivi (et les orbites sélectionnées) disparaissent, ce qui coupait le suivi
// dès qu'un chargement de groupe se terminait en arrière-plan. On les
// rattache aux nouveaux objets (même n° NORAD, sinon même nom).
let sceneRebuildInProgress = false;

function findRebuiltRecord(previous) {
  return satRecords.find(r => Number.isFinite(previous.catnr) && r.catnr === previous.catnr)
    || satRecords.find(r => r.name === previous.name);
}

function rebuildScene() {
  const trackedBefore = getTrackedRecord();
  const selectedBefore = satRecords.filter(r => selectedOrbitNames.has(r.name));

  sceneRebuildInProgress = true;
  const catalogRecords = dedupeCatalogRecords(getFilteredCatalogRecords(), currentRawRecords)
    .filter(r => !DOCKED_MODULE_CATNRS.has(r.catnr));
  instantiateRecords([...currentRawRecords, ...catalogRecords]);

  selectedBefore.forEach(previous => {
    const rebuilt = findRebuiltRecord(previous);
    if (rebuilt && !selectedOrbitNames.has(rebuilt.name)) setSelectedOrbit(rebuilt.name, { flyToOrbit: false });
  });
  const trackedAfter = trackedBefore ? findRebuiltRecord(trackedBefore) : null;
  if (trackedAfter) {
    ensureTrackEntity(trackedAfter);
    viewer.trackedEntity = trackedAfter.entity;
  }
  sceneRebuildInProgress = false;
  if (trackedBefore && !trackedAfter) exitFocusMode();
  else if (trackedAfter) updateOrbitalParamsPanel();

  updateCatalogCounter(catalogRecords.length);
  renderCatalogLegend();
  scheduleCatalogSnapshotSave();
}

function validateTleLines(line1, line2) {
  if (!line1 || !line1.trim().startsWith("1 ")) return "La ligne 1 doit commencer par \"1 \".";
  if (!line2 || !line2.trim().startsWith("2 ")) return "La ligne 2 doit commencer par \"2 \".";
  return null;
}

function addTleRecord(name, line1, line2) {
  if (!name.trim()) return "Nom manquant.";
  const lineError = validateTleLines(line1, line2);
  if (lineError) return lineError;

  try {
    satellite.twoline2satrec(line1.trim(), line2.trim());
  } catch (err) {
    return `TLE invalide : ${err.message || err}`;
  }

  const parsedCatnr = parseInt(line1.trim().substring(2, 7), 10);
  const record = {
    name: name.trim(),
    type: "tle",
    line1: line1.trim(),
    line2: line2.trim(),
    ...(Number.isFinite(parsedCatnr) ? { catnr: parsedCatnr } : {}),
  };
  currentRawRecords.push(record);
  persistAndReloadRecords();
  pushRecordToSheet(record);
  return null;
}

function addSyntheticRecord(name, altitudeKm, inclinationDeg, raanDeg) {
  if (!name.trim()) return "Nom manquant.";
  if (!Number.isFinite(altitudeKm) || altitudeKm <= 0) return "Altitude invalide.";
  if (!Number.isFinite(inclinationDeg)) return "Inclinaison invalide.";
  if (!Number.isFinite(raanDeg)) return "RAAN invalide.";

  const record = {
    name: name.trim(),
    type: "synthetic",
    a: 6_371_000 + altitudeKm * 1000,
    inc: (inclinationDeg * Math.PI) / 180,
    raan: (raanDeg * Math.PI) / 180,
    epochMs: Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime(),
  };
  currentRawRecords.push(record);
  persistAndReloadRecords();
  pushRecordToSheet(record);
  return null;
}

function removeRecordByName(name) {
  currentRawRecords = currentRawRecords.filter(r => r.name !== name);
  persistAndReloadRecords();
  deleteRecordFromSheet(name);
}

function renderAdminTable() {
  if (!adminTableEl) return;
  if (currentRawRecords.length === 0) {
    adminTableEl.innerHTML = `<div class="distNone">No tracked object</div>`;
    return;
  }
  adminTableEl.innerHTML = currentRawRecords
    .map(r => {
      const typeLabel = r.type === "tle" ? "Réel (TLE)" : "Synthétique";
      return `<div class="adminRow">`
        + `<span class="adminRowName" title="${r.name}">${r.name}</span>`
        + `<span class="adminRowType">${typeLabel}</span>`
        + `<button type="button" class="adminRemoveBtn" data-name="${r.name}" title="Supprimer">${ICON_TRASH}</button>`
        + `</div>`;
    })
    .join("");
}

const distanceListEl = document.getElementById("distanceList");

const orbitalParamsPanelEl = document.getElementById("orbitalParamsPanel");
const orbitalParamsContentEl = document.getElementById("orbitalParamsContent");

const distancePanelEl = document.getElementById("distancePanel");

const referenceSiteSelectEl = document.getElementById("referenceSiteSelect");
const noneOption = document.createElement("option");
noneOption.value = "-1";
noneOption.textContent = "None";
referenceSiteSelectEl.appendChild(noneOption);
REFERENCE_SITES.forEach((site, index) => {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = site.name;
  referenceSiteSelectEl.appendChild(option);
});
referenceSiteSelectEl.value = "0";
referenceSiteSelectEl.addEventListener("change", () => {
  const index = Number(referenceSiteSelectEl.value);
  selectedReferenceSite = index === -1 ? null : REFERENCE_SITES[index];
});

// ---------- Station laser temporaire ----------
// Ajout d'une station pour la session seulement (rien n'est enregistré) à
// partir d'une ville, d'une adresse ou de coordonnées "lat, lon". Elle
// rejoint LASER_SITES : liste des sites, traits jaunes vers les débris, clic
// pour vue rapprochée, comme les stations du code.
const customSiteInputEl = document.getElementById("customSiteInput");
const customSiteAddBtnEl = document.getElementById("customSiteAddBtn");
const customSiteStatusEl = document.getElementById("customSiteStatus");
const siteGeocoder = new Cesium.IonGeocoderService({ scene: viewer.scene });

function parseLatLon(text) {
  const match = text.trim().match(/^(-?\d+(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)$/);
  if (!match) return null;
  const lat = parseFloat(match[1].replace(",", "."));
  const lon = parseFloat(match[2].replace(",", "."));
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon, label: `${lat.toFixed(4)}, ${lon.toFixed(4)}` };
}

async function geocodePlace(query) {
  const results = await siteGeocoder.geocode(query);
  if (!results || results.length === 0) return null;
  const { displayName, destination } = results[0];
  const position = destination instanceof Cesium.Rectangle
    ? Cesium.Rectangle.center(destination)
    : Cesium.Cartographic.fromCartesian(destination);
  return {
    lat: Cesium.Math.toDegrees(position.latitude),
    lon: Cesium.Math.toDegrees(position.longitude),
    label: displayName.split(",")[0].trim(),
  };
}

function addTemporaryLaserSite(place) {
  const site = { name: `${place.label} (temporary)`, lat: place.lat, lon: place.lon, alt: 0 };
  createLaserSiteEntity(site);
  LASER_SITES.push(site);
  REFERENCE_SITES.push({ name: site.name, position: site.position });
  const option = document.createElement("option");
  option.value = String(REFERENCE_SITES.length - 1);
  option.textContent = site.name;
  referenceSiteSelectEl.appendChild(option);
  referenceSiteSelectEl.value = option.value;
  selectedReferenceSite = REFERENCE_SITES[REFERENCE_SITES.length - 1];
  flyToSite(site);
  return site;
}

async function handleCustomSiteAdd() {
  const query = customSiteInputEl.value.trim();
  if (!query) return;
  customSiteAddBtnEl.disabled = true;
  customSiteStatusEl.textContent = "Searching...";
  try {
    const place = parseLatLon(query) || await geocodePlace(query);
    if (!place) {
      customSiteStatusEl.textContent = "Place not found.";
      return;
    }
    const site = addTemporaryLaserSite(place);
    customSiteInputEl.value = "";
    if (DEMO_MODE) document.getElementById("distancePanel").classList.add("ctaDone");
    customSiteStatusEl.textContent = `${site.name} added (${place.lat.toFixed(4)}, ${place.lon.toFixed(4)}) · removed when the page is reloaded.`;
  } catch (err) {
    console.error("Recherche de lieu:", err);
    customSiteStatusEl.textContent = `Search failed: ${err.message || err}`;
  } finally {
    customSiteAddBtnEl.disabled = false;
  }
}

customSiteAddBtnEl.addEventListener("click", handleCustomSiteAdd);
customSiteInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleCustomSiteAdd();
});

// Même comportement que cliquer sur l'objet en mouvement dans la scène 3D
// puis activer l'icône caméra de l'InfoBox : la caméra suit l'objet en continu.
// La sélection (orbite future / paramètres orbitaux / sphère d'incertitude)
// suit le même état que le suivi caméra : elle s'active avec, et se nettoie
// dès qu'on arrête de suivre, plutôt que de rester affichée pour un objet
// qu'on ne suit plus.
function toggleTrackObject(name) {
  const record = satRecords.find(r => r.name === name);
  if (!record) return;
  lastClickedObjectName = name;
  // Objet étranger à la conjonction affichée : on repart d'une scène propre.
  if (activeConjunction && !isConjunctionMember(name)) clearConjunctionDisplay();
  ensureTrackEntity(record);
  const nowTracking = viewer.trackedEntity !== record.entity;
  const previous = getTrackedRecord();
  // Les deux objets d'une conjonction gardent leur trajectoire.
  if (nowTracking && previous && previous !== record && selectedOrbitNames.has(previous.name) && !isConjunctionMember(previous.name)) {
    setSelectedOrbit(previous.name);
  }
  viewer.trackedEntity = nowTracking ? record.entity : undefined;
  if (!isConjunctionMember(name) && nowTracking !== selectedOrbitNames.has(name)) setSelectedOrbit(name, { flyToOrbit: false });
  updateOrbitalParamsPanel();
}

// Efface la conjonction affichée : trajectoires, sélection, isolement.
function clearConjunctionDisplay() {
  if (!activeConjunction) return;
  activeConjunction = null;
  clearConjunctionMarker();
  clearOrbitTrails();
  restoreConjunctionCatalog();
  applyConjunctionIsolation();
  renderConjunctionResults();
}

// Groupes du catalogue masqués avant l'ouverture d'une conjonction : les
// groupes des deux objets sont cochés le temps de la situation, puis le
// catalogue revient tel qu'il était à la sortie.
let conjCatalogSnapshot = null;

function revealConjunctionGroups(c) {
  if (conjCatalogSnapshot) {
    hiddenGroups.clear();
    conjCatalogSnapshot.forEach(key => hiddenGroups.add(key));
  } else {
    conjCatalogSnapshot = new Set(hiddenGroups);
  }
  [c.primary, c.secondary].forEach(name => {
    const record = satRecords.find(r => r.name === name);
    if (record) hiddenGroups.delete(recordGroupKey(record));
  });
  applyGroupVisibility();
}

function restoreConjunctionCatalog() {
  if (!conjCatalogSnapshot) return;
  hiddenGroups.clear();
  conjCatalogSnapshot.forEach(key => hiddenGroups.add(key));
  conjCatalogSnapshot = null;
  applyGroupVisibility();
}

function applyConjunctionIsolation() {
  const isolate = conjunctionIsolated && !!activeConjunction;
  syntheticDebrisCollection.show = syntheticDebrisVisible && !isolate;
  updateSatPrimitiveStyles();
}

// ---------- Panneau "Distance à" : top 5 + recherche floue ----------
// Avec des groupes de plusieurs centaines/milliers d'objets (Starlink...),
// une liste complète qui se retrie en continu est inexploitable pour
// retrouver un satellite précis. On affiche donc par défaut seulement le
// top 5 le plus proche + les objets déjà sélectionnés/suivis, avec une
// recherche par nom ou numéro NORAD tolérante aux fautes de frappe, et la
// liste complète repliée derrière un bouton "Afficher tout".
const TOP_CLOSEST_COUNT = 5;
const MAX_SEARCH_RESULTS = 12;
const MAX_DISTANCE_ROWS_RENDERED = 150;

let distanceSearchQuery = "";
let showAllDistances = false;
let lastComputedDistances = [];

function normalizeSearchStr(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Score de correspondance floue : plus haut = meilleure correspondance,
// -Infinity si la requête ne "ressemble" pas assez à la cible. Combine
// sous-chaîne exacte, sous-séquence ordonnée (façon recherche rapide type
// VS Code) et distance de Levenshtein en repli pour tolérer les fautes de
// frappe (ex. "starlnk" retrouve quand même "STARLINK-1007").
function fuzzyMatchScore(query, target) {
  const q = normalizeSearchStr(query).trim();
  const t = normalizeSearchStr(target);
  if (!q) return 0;
  if (!t) return -Infinity;

  const substrIdx = t.indexOf(q);
  if (substrIdx !== -1) {
    const atWordStart = substrIdx === 0 || /[\s\-_]/.test(t[substrIdx - 1]);
    return 1000 - substrIdx + (atWordStart ? 50 : 0);
  }

  let ti = 0, score = 0, lastMatchIdx = -2, matchedAll = true;
  for (let qi = 0; qi < q.length; qi++) {
    const idx = t.indexOf(q[qi], ti);
    if (idx === -1) { matchedAll = false; break; }
    score += idx === lastMatchIdx + 1 ? 8 : 2;
    lastMatchIdx = idx;
    ti = idx + 1;
  }
  if (matchedAll) return 500 + score;

  if (q.length >= 3) {
    const compareTo = t.length > q.length * 2 ? t.slice(0, q.length * 2) : t;
    const dist = levenshteinDistance(q, compareTo);
    const similarity = 1 - dist / Math.max(q.length, compareTo.length);
    if (similarity >= 0.6) return similarity * 300;
  }

  return -Infinity;
}

function searchDistanceRecords(query, distances) {
  const q = query.trim();
  if (!q) return [];
  return distances
    .map(o => {
      const nameScore = fuzzyMatchScore(q, o.name);
      const catnrScore = o.catnr !== undefined ? fuzzyMatchScore(q, String(o.catnr)) : -Infinity;
      return { ...o, matchScore: Math.max(nameScore, catnrScore) };
    })
    .filter(o => o.matchScore > -Infinity)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, MAX_SEARCH_RESULTS);
}

function renderDistanceRow(o) {
  const cls = getDistanceClass(o.distanceKm);
  const isSelected = selectedOrbitNames.has(o.name);
  const selectedCls = isSelected ? " distRowSelected" : "";
  const toggleIcon = isSelected ? "◉" : "○";
  const isTracked = !!o.record.entity && viewer.trackedEntity === o.record.entity;
  const cameraCls = isTracked ? " distRowCameraActive" : "";
  return `<div class="distRow${selectedCls}" data-sat-name="${o.name}">`
    + `<button type="button" class="distRowToggle" data-sat-name="${o.name}" title="Show/hide the future orbit">${toggleIcon}</button>`
    + `<span class="distRowName">${o.name}</span>`
    + `<span class="${cls}">${o.distanceKm.toFixed(0)} km</span>`
    + `<button type="button" class="distRowCamera${cameraCls}" data-sat-name="${o.name}" title="Follow this object with the camera">${ICON_CAMERA}</button>`
    + `</div>`;
}

function renderDistancePanel(distances) {
  lastComputedDistances = distances;
  if (!distanceListEl) return;

  if (!selectedReferenceSite) {
    distanceListEl.innerHTML = `<div class="distNone">No reference site selected</div>`;
    return;
  }
  if (distances.length === 0) {
    distanceListEl.innerHTML = `<div class="distNone">No data available</div>`;
    return;
  }

  const sections = [];

  const top5 = distances.slice(0, TOP_CLOSEST_COUNT);
  const top5Names = new Set(top5.map(o => o.name));
  sections.push(`<div class="distSectionTitle">${TOP_CLOSEST_COUNT} closest</div>`);
  sections.push(top5.map(renderDistanceRow).join(""));

  const tracked = getTrackedRecord();
  const forced = distances.filter(o => (selectedOrbitNames.has(o.name) || o.record === tracked) && !top5Names.has(o.name));
  if (forced.length > 0) {
    sections.push(`<div class="distSectionTitle">Selected / tracked</div>`);
    sections.push(forced.map(renderDistanceRow).join(""));
  }

  if (distanceSearchQuery.trim()) {
    const results = searchDistanceRecords(distanceSearchQuery, distances);
    sections.push(`<div class="distSectionTitle">Results for “${distanceSearchQuery.trim()}”</div>`);
    sections.push(results.length > 0
      ? results.map(renderDistanceRow).join("")
      : `<div class="distNone">No results</div>`);
  }

  sections.push(
    `<button type="button" id="distShowAllToggle">${showAllDistances ? "▲ Hide the full list" : `▼ Show all (${distances.length})`}</button>`
  );

  if (showAllDistances) {
    const rowsToRender = distances.slice(0, MAX_DISTANCE_ROWS_RENDERED);
    const hiddenCount = distances.length - rowsToRender.length;
    sections.push(`<div class="distSectionTitle">Full list (${distances.length})</div>`);
    sections.push(rowsToRender.map(renderDistanceRow).join(""));
    if (hiddenCount > 0) {
      sections.push(`<div class="distNone">… ${hiddenCount} more object(s) (display limit: ${MAX_DISTANCE_ROWS_RENDERED})</div>`);
    }
  }

  distanceListEl.innerHTML = sections.join("");
}

// ---------- Panneau "Plage d'altitude" ----------
const altitudeFilterToggleEl = document.getElementById("altitudeFilterToggle");
const altitudeMinSliderEl = document.getElementById("altitudeMinSlider");
const altitudeMaxSliderEl = document.getElementById("altitudeMaxSlider");
const altitudeMinInputEl = document.getElementById("altitudeMinInput");
const altitudeMaxInputEl = document.getElementById("altitudeMaxInput");
const altRangeFillEl = document.getElementById("altRangeFill");
const altitudeFilterCountEl = document.getElementById("altitudeFilterCount");
let lastAltitudeCountRenderMs = 0;

function updateAltitudeFilterCount(inRangeCount, force = false) {
  const nowMs = performance.now();
  if (!force && nowMs - lastAltitudeCountRenderMs < 500) return;
  lastAltitudeCountRenderMs = nowMs;
  altitudeFilterCountEl.textContent = altitudeFilter.enabled
    ? `${inRangeCount} / ${satRecords.length} object(s) between ${altitudeFilter.minKm} and ${altitudeFilter.maxKm} km`
    : "";
}

function renderAltitudeFilterControls() {
  altitudeMinSliderEl.value = altKmToSlider(altitudeFilter.minKm);
  altitudeMaxSliderEl.value = altKmToSlider(altitudeFilter.maxKm);
  altitudeMinInputEl.value = altitudeFilter.minKm;
  altitudeMaxInputEl.value = altitudeFilter.maxKm;
  const left = (altitudeMinSliderEl.value / ALT_SLIDER_STEPS) * 100;
  const right = (altitudeMaxSliderEl.value / ALT_SLIDER_STEPS) * 100;
  altRangeFillEl.style.left = `${left}%`;
  altRangeFillEl.style.width = `${Math.max(0, right - left)}%`;
}

function applyAltitudeFilter() {
  renderAltitudeFilterControls();
  lastAltitudeCountRenderMs = 0;
  updateSatPrimitiveStyles();
}

function setAltitudeRange(minKm, maxKm, changed) {
  if (DEMO_MODE) return; // plage imposée, voir DEMO_ALTITUDE_RANGE_KM
  let min = Math.min(Math.max(Math.round(minKm), 0), ALT_FILTER_MAX_KM);
  let max = Math.min(Math.max(Math.round(maxKm), 0), ALT_FILTER_MAX_KM);
  // La poignée déplacée pousse l'autre plutôt que de la croiser.
  if (min > max) {
    if (changed === "min") max = min;
    else min = max;
  }
  altitudeFilter.minKm = min;
  altitudeFilter.maxKm = max;
  applyAltitudeFilter();
}

altitudeFilterToggleEl.addEventListener("change", () => {
  if (DEMO_MODE) return;
  altitudeFilter.enabled = altitudeFilterToggleEl.checked;
  applyAltitudeFilter();
});
altitudeMinSliderEl.addEventListener("input", () => {
  setAltitudeRange(sliderToAltKm(Number(altitudeMinSliderEl.value)), altitudeFilter.maxKm, "min");
});
altitudeMaxSliderEl.addEventListener("input", () => {
  setAltitudeRange(altitudeFilter.minKm, sliderToAltKm(Number(altitudeMaxSliderEl.value)), "max");
});
altitudeMinInputEl.addEventListener("change", () => {
  setAltitudeRange(Number(altitudeMinInputEl.value) || 0, altitudeFilter.maxKm, "min");
});
altitudeMaxInputEl.addEventListener("change", () => {
  setAltitudeRange(altitudeFilter.minKm, Number(altitudeMaxInputEl.value) || 0, "max");
});
renderAltitudeFilterControls();

// Démo : plage 0-2000 km imposée, affichée dans le panneau Distances (le
// catalogue est verrouillé) avec ses réglages grisés.
const DEMO_ALTITUDE_RANGE_KM = [0, 2000];
if (DEMO_MODE) {
  const altitudeDetailsEl = document.getElementById("altitudeFilterDetails");
  document.getElementById("distancePanel").appendChild(altitudeDetailsEl);
  altitudeDetailsEl.open = true;
  altitudeDetailsEl.classList.add("demoFixedRange");
  altitudeFilter.enabled = true;
  [altitudeFilter.minKm, altitudeFilter.maxKm] = DEMO_ALTITUDE_RANGE_KM;
  altitudeFilterToggleEl.checked = true;
  [altitudeFilterToggleEl, altitudeMinSliderEl, altitudeMaxSliderEl, altitudeMinInputEl, altitudeMaxInputEl]
    .forEach(el => { el.disabled = true; });
  lockDemoControl(altitudeDetailsEl.querySelector(".catalogAccordionBody"), "Altitude range",
    "Only objects between 0 and 2000 km (low Earth orbit) are shown.", "Range fixed for the demo.");
  applyAltitudeFilter();
}

const distanceSearchInputEl = document.getElementById("distanceSearchInput");
distanceSearchInputEl.addEventListener("input", () => {
  distanceSearchQuery = distanceSearchInputEl.value;
  renderDistancePanel(lastComputedDistances);
});

distanceListEl.addEventListener("click", (e) => {
  const showAllBtn = e.target.closest("#distShowAllToggle");
  if (showAllBtn) {
    showAllDistances = !showAllDistances;
    renderDistancePanel(lastComputedDistances);
    return;
  }
  const cameraBtn = e.target.closest(".distRowCamera");
  if (cameraBtn) {
    toggleTrackObject(cameraBtn.dataset.satName);
    return;
  }
  const row = e.target.closest(".distRow");
  if (!row) return;
  const name = row.dataset.satName;
  if (activeConjunction && !isConjunctionMember(name)) clearConjunctionDisplay();
  if (!selectedOrbitNames.has(name)) lastClickedObjectName = name;
  setSelectedOrbit(name);
});

const sidePanelEl = document.getElementById("sidePanel");
const sidePanelContentEl = document.getElementById("sidePanelContent");

sidePanelContentEl.addEventListener("change", (e) => {
  const checkbox = e.target.closest(".riskPairCheckbox");
  if (!checkbox) return;
  const key = checkbox.dataset.pairKey;
  if (checkbox.checked) checkedRiskPairs.add(key);
  else checkedRiskPairs.delete(key);
});

const trailPanelEl = document.getElementById("trailPanel");
const trailWidthSlider = document.getElementById("trailWidthSlider");
const trailWidthValueEl = document.getElementById("trailWidthValue");
const trailRevolutionsSlider = document.getElementById("trailRevolutionsSlider");
const trailRevolutionsValueEl = document.getElementById("trailRevolutionsValue");

trailWidthSlider.addEventListener("input", () => {
  orbitTrailWidth = Number(trailWidthSlider.value);
  trailWidthValueEl.textContent = `${orbitTrailWidth.toFixed(1)} px`;
});

trailRevolutionsSlider.addEventListener("input", () => {
  orbitTrailRevolutions = Number(trailRevolutionsSlider.value);
  trailRevolutionsValueEl.textContent = `${orbitTrailRevolutions.toFixed(2)} tour${orbitTrailRevolutions > 1 ? "s" : ""}`;
});

const trailStyleSelectEl = document.getElementById("trailStyleSelect");
trailStyleSelectEl.addEventListener("change", () => {
  orbitTrailStyle = trailStyleSelectEl.value;
  orbitTrailEntities.forEach(entity => { entity.polyline.material = orbitTrailMaterial(entity.trailColor); });
});

const atmosphereLayersListEl = document.getElementById("atmosphereLayersList");

atmosphereLayersListEl.innerHTML = ATMOSPHERE_LAYERS.map(layer => `
  <label class="atmoLayerRow">
    <input type="checkbox" class="atmoLayerCheckbox" data-layer-id="${layer.id}" />
    <span class="atmoLayerSwatch" style="background:${layer.colorHex}"></span>
    <span class="atmoLayerName">${layer.name}</span>
    <span class="atmoLayerAlt">≤${layer.topKm} km</span>
  </label>
`).join("");

atmosphereLayersListEl.addEventListener("change", (e) => {
  const checkbox = e.target.closest(".atmoLayerCheckbox");
  if (!checkbox) return;
  const layer = ATMOSPHERE_LAYERS.find(l => l.id === checkbox.dataset.layerId);
  if (layer) layer.entity.ellipsoid.show = checkbox.checked;
});

const riskLogCountEl = document.getElementById("riskLogCount");
const exportRiskLogBtn = document.getElementById("exportRiskLogBtn");

exportRiskLogBtn.addEventListener("click", exportRiskLogAsCsv);
updateRiskLogCount();

const adminPanelEl = document.getElementById("adminPanel");
const adminAddPanelEl = document.getElementById("adminAddPanel");
const adminTableEl = document.getElementById("adminTable");
const adminNameEl = document.getElementById("adminName");
const adminAddTypeEl = document.getElementById("adminAddType");
const adminTleLine1El = document.getElementById("adminTleLine1");
const adminTleLine2El = document.getElementById("adminTleLine2");
const adminAltitudeEl = document.getElementById("adminAltitude");
const adminInclinationEl = document.getElementById("adminInclination");
const adminRaanEl = document.getElementById("adminRaan");
const adminAddBtn = document.getElementById("adminAddBtn");
const adminErrorEl = document.getElementById("adminError");
const adminAddFieldsTleEl = document.querySelector(".adminAddFieldsTle");
const adminAddFieldsSyntheticEl = document.querySelector(".adminAddFieldsSynthetic");

adminAddTypeEl.addEventListener("change", () => {
  const isTle = adminAddTypeEl.value === "tle";
  adminAddFieldsTleEl.style.display = isTle ? "" : "none";
  adminAddFieldsSyntheticEl.style.display = isTle ? "none" : "";
});

adminTableEl.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".adminRemoveBtn");
  if (!removeBtn) return;
  removeRecordByName(removeBtn.dataset.name);
});

adminAddBtn.addEventListener("click", () => {
  const name = adminNameEl.value;
  let error;

  if (adminAddTypeEl.value === "tle") {
    error = addTleRecord(name, adminTleLine1El.value, adminTleLine2El.value);
  } else {
    error = addSyntheticRecord(
      name,
      Number(adminAltitudeEl.value),
      Number(adminInclinationEl.value),
      Number(adminRaanEl.value)
    );
  }

  if (error) {
    adminErrorEl.textContent = error;
    return;
  }

  adminErrorEl.textContent = "";
  adminNameEl.value = "";
  adminTleLine1El.value = "";
  adminTleLine2El.value = "";
  adminAltitudeEl.value = "";
  adminInclinationEl.value = "";
  adminRaanEl.value = "";
});

// ============================================================================
// ---------- Panneau Catalogue : chargement CelesTrak "à la carte" ---------
// ============================================================================
const catalogPanelEl = document.getElementById("catalogPanel");
const catalogSearchEl = document.getElementById("catalogSearch");
const catalogColorBySelectEl = document.getElementById("catalogColorBySelect");
const catalogLegendEl = document.getElementById("catalogLegend");

const catalogExistingSummaryListEl = document.getElementById("catalogExistingSummaryList");
const catalogLoadAllExistingBtnEl = document.getElementById("catalogLoadAllExistingBtn");
// Bouton orange : décoche tout ce qui est affiché en mémorisant la sélection,
// puis la recoche telle qu'elle était au second clic.
const catalogHideSatellitesBtnEl = document.getElementById("catalogHideSatellitesBtn");
let savedVisibleGroups = null;

function shownGroupKeys() {
  const keys = Array.from(catalogGroupsLoaded);
  if (currentRawRecords.length > 0) keys.push(MANUAL_GROUP_KEY);
  return keys.filter(key => !hiddenGroups.has(key));
}

function resetUncheckAllButton() {
  savedVisibleGroups = null;
  catalogHideSatellitesBtnEl.classList.remove("catalogHideSatellitesActive");
  catalogHideSatellitesBtnEl.lastChild.textContent = " Tout désélectionner";
}

function applyGroupVisibility() {
  updateSatPrimitiveStyles();
  renderCatalogExistingSummaryList();
}

catalogHideSatellitesBtnEl.addEventListener("click", () => {
  if (savedVisibleGroups) {
    hiddenGroups.clear();
    Array.from(catalogGroupsLoaded).concat(MANUAL_GROUP_KEY)
      .filter(key => !savedVisibleGroups.includes(key))
      .forEach(key => hiddenGroups.add(key));
    savedVisibleGroups = null;
  } else {
    savedVisibleGroups = shownGroupKeys();
    savedVisibleGroups.forEach(key => hiddenGroups.add(key));
  }
  catalogHideSatellitesBtnEl.classList.toggle("catalogHideSatellitesActive", !!savedVisibleGroups);
  catalogHideSatellitesBtnEl.lastChild.textContent = savedVisibleGroups ? " Resélectionner l'origine" : " Tout désélectionner";
  applyGroupVisibility();
});
const catalogLoadExistingStatusEl = document.getElementById("catalogLoadExistingStatus");
const catalogRefreshExistingBtnEl = document.getElementById("catalogRefreshExistingBtn");

const catalogImportGroupsListEl = document.getElementById("catalogImportGroupsList");
const catalogImportBtnEl = document.getElementById("catalogImportBtn");
const catalogImportStatusEl = document.getElementById("catalogImportStatus");

const catalogUpdateGroupsListEl = document.getElementById("catalogUpdateGroupsList");
const catalogUpdateAllBtnEl = document.getElementById("catalogUpdateAllBtn");
const catalogUpdateSelectedBtnEl = document.getElementById("catalogUpdateSelectedBtn");
const catalogUpdateStatusEl = document.getElementById("catalogUpdateStatus");

const catalogLoadSatcatBtnEl = document.getElementById("catalogLoadSatcatBtn");
const catalogCountryFilterEl = document.getElementById("catalogCountryFilter");
const catalogTypeFilterEl = document.getElementById("catalogTypeFilter");
const catalogCounterEl = document.getElementById("catalogCounter");
const showLabelsCheckboxEl = document.getElementById("showLabelsCheckbox");

function formatCooldown(ms) {
  const totalMinutes = Math.ceil(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function legendColorForGroup(groupId) {
  return showDebrisInRed && isDebrisGroup(groupId) ? DEBRIS_COLOR_HEX : getConstellationColor(groupId);
}

function renderCatalogLegend() {
  if (catalogFilters.colorBy === "constellation") {
    catalogLegendEl.innerHTML = catalogGroupsLoaded.size === 0
      ? `<div class="distNone">Aucune constellation chargée</div>`
      : Array.from(catalogGroupsLoaded)
        .map(id => `<div class="catalogLegendRow"><span class="catalogLegendSwatch" style="background:${legendColorForGroup(id)};box-shadow:0 0 6px ${legendColorForGroup(id)}"></span>${getGroupLabel(id)}</div>`)
        .join("");
  } else if (catalogFilters.colorBy === "category") {
    catalogLegendEl.innerHTML = Object.values(CATALOG_CATEGORIES)
      .map(c => `<div class="catalogLegendRow"><span class="catalogLegendSwatch" style="background:${c.colorHex}"></span>${c.label}</div>`)
      .join("");
  } else if (catalogFilters.colorBy === "country") {
    catalogLegendEl.innerHTML = `<div class="distNone">Couleur par pays</div>`;
  } else {
    catalogLegendEl.innerHTML = `<div class="distNone">Couleur aléatoire</div>`;
  }
}

// Regroupe les CATALOG_GROUPS par catégorie, dans l'ordre de CATALOG_CATEGORIES.
// Ordre d'affichage des catégories dans le catalogue : les débris d'abord
// (menaces surveillées), puis les constellations.
const CATALOG_CATEGORY_ORDER = ["debris", "telecom", "navigation", "observation", "science", "habite", "amateur", "defense", "autre"];

function groupCatalogGroupsByCategory() {
  const byCategory = new Map(CATALOG_CATEGORY_ORDER.map(id => [id, []]));
  CATALOG_GROUPS.forEach(g => {
    if (!byCategory.has(g.category)) byCategory.set(g.category, []);
    byCategory.get(g.category).push(g);
  });
  return byCategory;
}

// Les catégories sont repliées par défaut (pour ne pas prendre toute la
// place du panneau) : on lit l'état actuellement ouvert dans le DOM avant de
// regénérer le HTML, pour le restaurer après coup — <details> natif gère
// l'ouverture/fermeture tout seul, on a juste à ne pas perdre son état.
function getOpenDetailsIds(containerEl) {
  return new Set(
    Array.from(containerEl.querySelectorAll("details[data-cat-id]"))
      .filter(d => d.open)
      .map(d => d.dataset.catId)
  );
}

function formatSyncDate(iso) {
  if (!iso) return "jamais synchronisé";
  const d = new Date(iso);
  return `synchro le ${d.toLocaleDateString()} à ${d.toLocaleTimeString()}`;
}

// Rendu partagé pour les listes "Importer" et "Mettre à jour" : mêmes
// catégories repliables que le reste du panneau, mais chacune ne montre que
// les groupes qui passent son filtre (jamais synchronisés / déjà connus),
// pour qu'un même groupe CelesTrak n'apparaisse jamais dans les deux à la
// fois — c'est ça qui évacue le cafouillage entre "ce qui vient du Sheet" et
// "ce qui vient de CelesTrak".
function renderFilterableGroupsList(containerEl, { filterPredicate, selectedSet, checkboxClass, statusFor, tooltipFor, showRemoveButton = true }) {
  const openIds = getOpenDetailsIds(containerEl);
  const byCategory = groupCatalogGroupsByCategory();

  const html = Array.from(byCategory.entries()).map(([categoryId, groups]) => {
    const filtered = groups.filter(filterPredicate);
    if (filtered.length === 0) return "";
    const categoryLabel = (CATALOG_CATEGORIES[categoryId] || CATALOG_CATEGORIES.autre).label;
    const rows = filtered.map(g => {
      const checked = selectedSet.has(g.id) ? "checked" : "";
      const removeBtn = showRemoveButton && catalogGroupsLoaded.has(g.id)
        ? `<button type="button" class="catalogGroupRemoveBtn" data-group-id="${g.id}" title="Retirer ce groupe de la scène">${ICON_TRASH}</button>`
        : "";
      // tooltipFor : détails secondaires (dernière synchro, id CelesTrak...)
      // déplacés hors de la ligne, affichés dans #catalogGroupTooltip au survol
      // plutôt que d'encombrer le menu — voir bindGroupTooltip.
      const tooltipAttr = tooltipFor ? ` data-tooltip="${tooltipFor(g)}"` : "";
      return `<label class="catalogGroupRow"${tooltipAttr}>`
        + `<input type="checkbox" class="${checkboxClass}" data-group-id="${g.id}" ${checked} />`
        + `<span class="catalogGroupName">${g.label}</span>`
        + `<span class="catalogGroupStatus">${statusFor(g)}</span>`
        + `${removeBtn}`
        + `</label>`;
    }).join("");
    const firstRender = !containerEl.querySelector("details");
    const openAttr = openIds.has(categoryId) || (firstRender && categoryId === "debris") ? "open" : "";
    return `<details class="catalogCategorySection" data-cat-id="${categoryId}" ${openAttr}>`
      + `<summary class="catalogCategoryTitle">${categoryLabel}</summary>${rows}</details>`;
  }).join("");

  containerEl.innerHTML = html || `<div class="distNone">Rien à afficher ici pour l'instant.</div>`;
}

function renderCatalogImportGroupsList() {
  renderFilterableGroupsList(catalogImportGroupsListEl, {
    filterPredicate: g => !g.spacetrack && !g.catnrList && !sheetGroupsMeta.has(g.id),
    selectedSet: catalogSelectedImportGroups,
    checkboxClass: "catalogImportGroupCheckbox",
    statusFor: g => {
      const cache = loadGroupCache(g.id);
      if (!cache) return "jamais importé";
      const remaining = getGroupCooldownRemainingMs(g.id);
      return remaining > 0
        ? `en cache local · rafraîchissable dans ${formatCooldown(remaining)}`
        : "en cache local · rafraîchissable";
    },
  });
}

function renderCatalogUpdateGroupsList() {
  renderFilterableGroupsList(catalogUpdateGroupsListEl, {
    filterPredicate: g => !g.spacetrack && sheetGroupsMeta.has(g.id),
    selectedSet: catalogSelectedUpdateGroups,
    checkboxClass: "catalogUpdateGroupCheckbox",
    statusFor: g => {
      const meta = sheetGroupsMeta.get(g.id);
      return `${meta.count} obj. · ${formatSyncDate(meta.lastSync)}`;
    },
  });
}

// Même liste catégorisée que "Importer" / "Mettre à jour", mais ici la case
// cochée EST l'état affiché/pas affiché (pas une sélection à valider via un
// bouton) : cocher charge immédiatement ce groupe depuis le Sheet, décocher le
// retire de la scène — donc directement indexée sur catalogGroupsLoaded plutôt
// que sur un Set de sélection en attente. Pas de bouton retirer redondant ici,
// décocher fait déjà ça.
function renderCatalogExistingSummaryList() {
  if (sheetGroupsMeta.size === 0) {
    catalogExistingSummaryListEl.innerHTML = sheetGroupsMetaLoaded
      ? `<div class="distNone">Rien dans le Sheet</div>`
      : `<div class="distNone">Chargement…</div>`;
    return;
  }
  renderFilterableGroupsList(catalogExistingSummaryListEl, {
    filterPredicate: g => sheetGroupsMeta.has(g.id),
    selectedSet: new Set(Array.from(catalogGroupsLoaded).filter(id => !hiddenGroups.has(id))),
    checkboxClass: "catalogExistingGroupCheckbox",
    showRemoveButton: false,
    statusFor: g => {
      const meta = sheetGroupsMeta.get(g.id);
      return `${meta.count} obj.`;
    },
    tooltipFor: g => {
      const meta = sheetGroupsMeta.get(g.id);
      return `${g.id} · ${formatSyncDate(meta.lastSync)}`;
    },
  });
}

async function refreshSheetGroupsMeta() {
  if (!SHEET_API_URL) return;
  try {
    const groups = await listGroupsFromSheet();
    sheetGroupsMeta = new Map(groups.map(g => [g.id, g]));
  } catch (err) {
    console.error("Erreur de chargement de la liste des onglets Sheet:", err);
  } finally {
    sheetGroupsMetaLoaded = true;
    renderCatalogExistingSummaryList();
    renderCatalogImportGroupsList();
    renderCatalogUpdateGroupsList();
  }
}

// Récupère (CelesTrak, via le cache/cooldown habituel) puis synchronise vers
// le Sheet un lot de groupes — logique partagée par "Importer" et "Mettre à
// jour" (intégrale ou sélective), qui ne diffèrent que par la liste de
// groupes proposée à l'écran, pas par ce qui se passe une fois validé.
async function loadAndSyncCelesTrakGroups(groupIds, statusEl) {
  if (groupIds.length === 0) {
    statusEl.textContent = "Sélectionne au moins un groupe.";
    return;
  }
  statusEl.textContent = "Chargement...";
  const { records: fetched, errors } = await fetchSelectedCelesTrakGroups(groupIds, (groupId, err) => {
    statusEl.textContent = err
      ? `Échec pour ${groupId} : ${err.message}`
      : `Chargement... (${groupId} reçu)`;
  });
  catalogRawRecords = [
    ...catalogRawRecords.filter(r => !groupIds.includes(r.group)),
    ...fetched,
  ];
  const failedGroupIds = new Set(errors.map(e => e.groupId));
  groupIds.forEach(id => { if (!failedGroupIds.has(id)) catalogGroupsLoaded.add(id); });
  rebuildScene();
  renderCatalogCountryFilter();
  renderCatalogTypeFilter();
  statusEl.textContent = errors.length > 0
    ? `${fetched.length} objet(s) chargé(s) · échec : ${errors.map(e => `${e.groupId} (${e.message})`).join(", ")}`
    : `${fetched.length} objet(s) chargé(s) — ${new Date().toLocaleTimeString()}`;

  // Synchro Sheet en arrière-plan (best-effort, non bloquante) : upsert, donc
  // jamais de doublon même si le groupe était déjà connu (cas "Mettre à jour").
  const fetchedByGroup = new Map();
  fetched.forEach(r => {
    if (!fetchedByGroup.has(r.group)) fetchedByGroup.set(r.group, []);
    fetchedByGroup.get(r.group).push(r);
  });
  for (const [groupId, records] of fetchedByGroup) {
    syncGroupToSheet(groupId, records).then(result => {
      if (!result || !result.ok) {
        statusEl.textContent += ` · Sheet[${groupId}] : échec de la synchro${result && result.error ? ` (${result.error})` : ""}`;
        return;
      }
      sheetGroupsMeta.set(groupId, { id: groupId, count: result.total, lastSync: result.lastSync });
      scheduleCatalogSnapshotSave({ force: true });
      sheetGroupsMetaLoaded = true;
      statusEl.textContent += ` · Sheet[${groupId}] : +${result.added} ↻${result.updated}`;
      renderCatalogExistingSummaryList();
      renderCatalogImportGroupsList();
      renderCatalogUpdateGroupsList();
    });
  }
}

function getDistinctCountriesInCatalog() {
  const set = new Set();
  catalogRawRecords.forEach(r => {
    const meta = satcatIndex ? satcatIndex.get(r.catnr) : null;
    if (meta && meta.country) set.add(meta.country);
  });
  return Array.from(set).sort();
}

function getDistinctObjectTypesInCatalog() {
  const set = new Set();
  catalogRawRecords.forEach(r => {
    const meta = satcatIndex ? satcatIndex.get(r.catnr) : null;
    if (meta && meta.objectType) set.add(meta.objectType);
  });
  return Array.from(set).sort();
}

function objectTypeLabelFr(type) {
  if (type === "PAYLOAD") return "Charge utile";
  if (type === "ROCKET BODY") return "Étage de fusée";
  if (type === "DEBRIS") return "Débris (masse morte)";
  return type;
}

function renderCatalogCountryFilter() {
  const countries = getDistinctCountriesInCatalog();
  if (countries.length === 0) {
    catalogCountryFilterEl.innerHTML = `<div class="distNone">Aucun groupe chargé</div>`;
    return;
  }
  catalogCountryFilterEl.innerHTML = countries.map(code => {
    const checked = catalogFilters.countries.has(code) ? "checked" : "";
    return `<label class="atmoLayerRow"><input type="checkbox" class="catalogCountryCheckbox" data-country="${code}" ${checked}/><span class="atmoLayerName">${code}</span></label>`;
  }).join("");
}

function renderCatalogTypeFilter() {
  const types = getDistinctObjectTypesInCatalog();
  if (types.length === 0) {
    catalogTypeFilterEl.innerHTML = `<div class="distNone">Aucun groupe chargé</div>`;
    return;
  }
  catalogTypeFilterEl.innerHTML = types.map(t => {
    const checked = catalogFilters.objectTypes.has(t) ? "checked" : "";
    return `<label class="atmoLayerRow"><input type="checkbox" class="catalogTypeCheckbox" data-type="${t}" ${checked}/><span class="atmoLayerName">${objectTypeLabelFr(t)}</span></label>`;
  }).join("");
}

function updateCatalogCounter(count) {
  catalogCounterEl.textContent = `${count} objet(s) catalogue affiché(s) · ${satRecords.length} au total sur la scène`;
}

// Recherche d'un objet précis (nom ou n° NORAD) parmi ceux chargés : un clic
// sur un résultat (ou Entrée pour le premier) le passe en mode suivi. Si
// l'objet n'est pas chargé, recherche en ligne (CelesTrak puis Space-Track) :
// l'objet choisi rejoint le groupe "recherches", enregistré dans le Sheet.
const catalogSearchResultsEl = document.getElementById("catalogSearchResults");
const catalogSearchStatusEl = document.getElementById("catalogSearchStatus");
let catalogSearchMatches = [];
let catalogSearchTimer = null;
// { query, loading, results, source, error } pour la requête en cours de saisie.
let catalogOnlineSearch = null;

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// NAME= de CelesTrak est une sous-chaîne exacte : "uvsq sat ng" ne trouve
// pas "UVSQ-SAT NG". On tente la saisie telle quelle, avec des tirets, puis
// son mot le plus long, et le tri flou fait le reste.
function onlineNameQueries(query) {
  const upper = query.trim().toUpperCase().replace(/\s+/g, " ");
  const longestWord = upper.split(/[\s\-_]+/).sort((a, b) => b.length - a.length)[0] || "";
  return [...new Set([upper, upper.replace(/ /g, "-"), longestWord])].filter(q => q.length >= 2);
}

function onlineMatchScore(query, name) {
  const compact = s => String(s).replace(/[\s\-_]+/g, "");
  return Math.max(fuzzyMatchScore(query, name), fuzzyMatchScore(compact(query), compact(name)));
}

function rankOnlineResults(query, records) {
  const scored = records.map(r => ({ r, score: onlineMatchScore(query, r.name) }));
  const matching = scored.filter(m => m.score > -Infinity);
  return (matching.length > 0 ? matching : scored)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SEARCH_RESULTS)
    .map(m => m.r);
}

async function searchObjectOnline(query) {
  const q = query.trim();
  const isCatnr = /^\d{1,9}$/.test(q);
  const params = isCatnr ? [`CATNR=${q}`] : onlineNameQueries(q).map(n => `NAME=${encodeURIComponent(n)}`);
  let celestrakError = null;
  for (const param of params) {
    try {
      const url = `https://celestrak.org/NORAD/elements/gp.php?${param}&FORMAT=tle`;
      const res = await fetchWithTimeout(celestrakProxyUrl(url));
      if (!res.ok) throw new Error("HTTP " + res.status);
      const records = parseValidTleBlock(await res.text());
      if (records.length > 0) return { source: "CelesTrak", results: rankOnlineResults(q, records) };
    } catch (err) {
      celestrakError = err;
    }
  }
  try {
    const stQuery = isCatnr ? { catnrs: [Number(q)] } : { name: onlineNameQueries(q).pop() };
    const records = await fetchFromSpaceTrack(stQuery);
    return { source: "Space-Track", results: rankOnlineResults(q, records) };
  } catch (err) {
    const parts = [celestrakError && `CelesTrak : ${celestrakError.message}`, `Space-Track : ${err.message}`];
    throw new Error(parts.filter(Boolean).join(" · "));
  }
}

async function runCatalogOnlineSearch() {
  const q = catalogSearchEl.value.trim();
  if (q.length < 2 || DEMO_MODE) return;
  catalogOnlineSearch = { query: q, loading: true, results: [] };
  renderCatalogSearchResults();
  try {
    const { source, results } = await searchObjectOnline(q);
    if (!catalogOnlineSearch || catalogOnlineSearch.query !== q) return;
    catalogOnlineSearch = { query: q, loading: false, results, source };
  } catch (err) {
    console.error("Recherche en ligne:", err);
    if (!catalogOnlineSearch || catalogOnlineSearch.query !== q) return;
    catalogOnlineSearch = { query: q, loading: false, results: [], error: err.message || String(err) };
  }
  renderCatalogSearchResults();
}

function setCatalogSearchStatus(text) {
  catalogSearchStatusEl.textContent = text;
  catalogSearchStatusEl.style.display = text ? "block" : "none";
}

function addSearchedObject(found) {
  const already = satRecords.find(r => r.catnr === found.catnr);
  if (already) {
    trackFromCatalogSearch(already);
    setCatalogSearchStatus(`${found.name} était déjà chargé (${catalogGroupLabel(already)}).`);
    return;
  }
  const record = { name: found.name, type: "tle", line1: found.line1, line2: found.line2, catnr: found.catnr, group: SEARCH_GROUP_ID };
  catalogRawRecords = [
    ...catalogRawRecords.filter(r => !(r.group === SEARCH_GROUP_ID && r.catnr === record.catnr)),
    record,
  ];
  catalogGroupsLoaded.add(SEARCH_GROUP_ID);
  hiddenGroups.delete(SEARCH_GROUP_ID);
  saveGroupCache(SEARCH_GROUP_ID, catalogRawRecords.filter(r => r.group === SEARCH_GROUP_ID));
  rebuildScene();
  renderCatalogExistingSummaryList();
  renderCatalogCountryFilter();
  renderCatalogTypeFilter();
  trackFromCatalogSearch(satRecords.find(r => r.catnr === record.catnr));

  const label = `${record.name} (${record.catnr})`;
  if (DEMO_MODE || !SHEET_API_URL) {
    setCatalogSearchStatus(`${label} ajouté à la scène.`);
    return;
  }
  setCatalogSearchStatus(`${label} ajouté · enregistrement dans le Sheet...`);
  syncGroupToSheet(SEARCH_GROUP_ID, [record]).then(result => {
    if (!result || !result.ok) {
      setCatalogSearchStatus(`${label} ajouté, mais échec de l'enregistrement dans le Sheet${result && result.error ? ` (${result.error})` : ""}.`);
      return;
    }
    sheetGroupsMeta.set(SEARCH_GROUP_ID, { id: SEARCH_GROUP_ID, count: result.total, lastSync: result.lastSync });
    scheduleCatalogSnapshotSave({ force: true });
    sheetGroupsMetaLoaded = true;
    setCatalogSearchStatus(`${label} enregistré dans le Sheet (onglet « ${SEARCH_GROUP_ID} »), inclus dans les mises à jour.`);
    renderCatalogExistingSummaryList();
    renderCatalogUpdateGroupsList();
  });
}

function catalogGroupLabel(record) {
  if (!record.group) return "Ajout manuel";
  const group = CATALOG_GROUPS.find(g => g.id === record.group);
  return group ? group.label : record.group;
}

function renderCatalogSearchResults() {
  const q = catalogSearchEl.value.trim();
  if (!q) {
    catalogSearchMatches = [];
    catalogSearchResultsEl.innerHTML = "";
    catalogSearchResultsEl.style.display = "none";
    return;
  }
  catalogSearchMatches = satRecords
    .map(r => {
      const nameScore = fuzzyMatchScore(q, r.name);
      const catnrScore = r.catnr !== undefined ? fuzzyMatchScore(q, String(r.catnr)) : -Infinity;
      return { record: r, score: Math.max(nameScore, catnrScore) };
    })
    .filter(m => m.score > -Infinity)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SEARCH_RESULTS)
    .map(m => m.record);

  catalogSearchResultsEl.style.display = "block";
  const tracked = getTrackedRecord();
  const localHtml = catalogSearchMatches.length === 0
    ? `<div class="catalogSearchEmpty">Aucun objet chargé ne correspond.</div>`
    : catalogSearchMatches.map((r, i) => {
      const norad = r.catnr !== undefined ? ` · ${r.catnr}` : "";
      const cls = r === tracked ? " catalogSearchResultTracked" : "";
      return `<button type="button" class="catalogSearchResult${cls}" data-index="${i}">`
        + `<span class="catalogSearchResultName">${escapeHtml(r.name)}</span>`
        + `<span class="catalogSearchResultMeta">${catalogGroupLabel(r)}${norad}</span></button>`;
    }).join("");
  catalogSearchResultsEl.innerHTML = localHtml + renderCatalogOnlineSection(q);
}

function renderCatalogOnlineSection(q) {
  if (DEMO_MODE || q.length < 2) return "";
  const online = catalogOnlineSearch && catalogOnlineSearch.query === q ? catalogOnlineSearch : null;
  const title = `<div class="catalogSearchOnlineTitle">En ligne</div>`;
  if (!online) {
    return title + `<button type="button" class="catalogSearchResult catalogSearchOnlineBtn">`
      + `<span class="catalogSearchResultName">Chercher « ${escapeHtml(q)} » sur CelesTrak / Space-Track</span></button>`;
  }
  if (online.loading) return title + `<div class="catalogSearchEmpty">Recherche en ligne...</div>`;
  if (online.error) return title + `<div class="catalogSearchEmpty">Échec : ${escapeHtml(online.error)}</div>`;
  if (online.results.length === 0) return title + `<div class="catalogSearchEmpty">Introuvable sur CelesTrak et Space-Track.</div>`;
  const loadedCatnrs = new Set(satRecords.map(r => r.catnr));
  return title + online.results.map((r, i) => {
    const meta = loadedCatnrs.has(r.catnr) ? `déjà chargé · ${r.catnr}` : `+ ajouter · ${online.source} · ${r.catnr}`;
    return `<button type="button" class="catalogSearchResult" data-online-index="${i}">`
      + `<span class="catalogSearchResultName">${escapeHtml(r.name)}</span>`
      + `<span class="catalogSearchResultMeta">${meta}</span></button>`;
  }).join("");
}

function trackFromCatalogSearch(record) {
  if (!record || !satRecords.includes(record)) return;
  if (record.entity && viewer.trackedEntity === record.entity) enterFocusMode();
  else toggleTrackObject(record.name);
  catalogSearchEl.value = "";
  catalogOnlineSearch = null;
  renderCatalogSearchResults();
}

catalogSearchEl.addEventListener("input", () => {
  clearTimeout(catalogSearchTimer);
  setCatalogSearchStatus("");
  catalogSearchTimer = setTimeout(renderCatalogSearchResults, 120);
});

// Entrée : premier objet chargé ; à défaut, premier résultat en ligne ; à
// défaut, lance la recherche en ligne.
catalogSearchEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    clearTimeout(catalogSearchTimer);
    renderCatalogSearchResults();
    const q = catalogSearchEl.value.trim();
    const online = catalogOnlineSearch && catalogOnlineSearch.query === q ? catalogOnlineSearch : null;
    if (catalogSearchMatches.length > 0) trackFromCatalogSearch(catalogSearchMatches[0]);
    else if (online && online.results.length > 0) addSearchedObject(online.results[0]);
    else if (!online || online.error) runCatalogOnlineSearch();
  } else if (e.key === "Escape") {
    catalogSearchEl.value = "";
    catalogOnlineSearch = null;
    renderCatalogSearchResults();
  }
});

catalogSearchResultsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".catalogSearchResult");
  if (!btn) return;
  if (btn.classList.contains("catalogSearchOnlineBtn")) {
    runCatalogOnlineSearch();
  } else if (btn.dataset.onlineIndex !== undefined) {
    addSearchedObject(catalogOnlineSearch.results[Number(btn.dataset.onlineIndex)]);
  } else {
    trackFromCatalogSearch(catalogSearchMatches[Number(btn.dataset.index)]);
  }
});

const catalogDebrisRedCheckboxEl = document.getElementById("catalogDebrisRedCheckbox");
catalogDebrisRedCheckboxEl.addEventListener("change", () => {
  showDebrisInRed = catalogDebrisRedCheckboxEl.checked;
  rebuildScene();
});

const syntheticDebrisCheckboxEl = document.getElementById("syntheticDebrisCheckbox");
syntheticDebrisCheckboxEl.addEventListener("change", () => {
  setSyntheticDebrisVisible(syntheticDebrisCheckboxEl.checked);
});

catalogColorBySelectEl.addEventListener("change", () => {
  catalogFilters.colorBy = catalogColorBySelectEl.value;
  renderCatalogLegend();
  rebuildScene();
});

// Case cochée dans "Importer" ou "Mettre à jour" (délégation : les deux
// listes vivent dans des containers distincts, chacun avec sa propre classe
// de case à cocher, donc pas d'ambiguïté sur quel Set mettre à jour).
catalogImportGroupsListEl.addEventListener("change", (e) => {
  const checkbox = e.target.closest(".catalogImportGroupCheckbox");
  if (!checkbox) return;
  const groupId = checkbox.dataset.groupId;
  if (checkbox.checked) catalogSelectedImportGroups.add(groupId);
  else catalogSelectedImportGroups.delete(groupId);
});

catalogUpdateGroupsListEl.addEventListener("change", (e) => {
  const checkbox = e.target.closest(".catalogUpdateGroupCheckbox");
  if (!checkbox) return;
  const groupId = checkbox.dataset.groupId;
  if (checkbox.checked) catalogSelectedUpdateGroups.add(groupId);
  else catalogSelectedUpdateGroups.delete(groupId);
});

// Retirer un groupe de la scène 3D — partagé par le bouton poubelle
// ("Importer"/"Mettre à jour") et par le décochage direct dans "Charger
// données existantes" ci-dessous.
function removeCatalogGroupFromScene(groupId) {
  catalogRawRecords = catalogRawRecords.filter(r => r.group !== groupId);
  catalogGroupsLoaded.delete(groupId);
  hiddenGroups.delete(groupId);
  catalogSelectedImportGroups.delete(groupId);
  catalogSelectedUpdateGroups.delete(groupId);
  rebuildScene();
  renderCatalogImportGroupsList();
  renderCatalogUpdateGroupsList();
  renderCatalogExistingSummaryList();
  renderCatalogCountryFilter();
  renderCatalogTypeFilter();
}

// Le bouton poubelle peut apparaître dans la liste "Importer" ou "Mettre à
// jour" selon que le groupe est déjà dans le Sheet ou non — un seul handler
// par container suffit puisque chacun ne contient que ses propres groupes.
function handleCatalogGroupRemoveClick(e) {
  const removeBtn = e.target.closest(".catalogGroupRemoveBtn");
  if (!removeBtn) return;
  removeCatalogGroupFromScene(removeBtn.dataset.groupId);
}
catalogImportGroupsListEl.addEventListener("click", handleCatalogGroupRemoveClick);
catalogUpdateGroupsListEl.addEventListener("click", handleCatalogGroupRemoveClick);

// "Charger données existantes" : pas de sélection à valider par un bouton,
// cocher charge immédiatement le groupe depuis le Sheet, décocher le retire
// de la scène.
catalogExistingSummaryListEl.addEventListener("change", async (e) => {
  const checkbox = e.target.closest(".catalogExistingGroupCheckbox");
  if (!checkbox) return;
  const groupId = checkbox.dataset.groupId;
  if (!checkbox.checked) {
    hiddenGroups.add(groupId);
    applyGroupVisibility();
    return;
  }
  hiddenGroups.delete(groupId);
  if (catalogGroupsLoaded.has(groupId)) {
    applyGroupVisibility();
    return;
  }
  checkbox.disabled = true;
  await loadExistingGroupsFromSheet([groupId], catalogLoadExistingStatusEl);
});

catalogImportBtnEl.addEventListener("click", async () => {
  catalogImportBtnEl.disabled = true;
  await loadAndSyncCelesTrakGroups(Array.from(catalogSelectedImportGroups), catalogImportStatusEl);
  catalogSelectedImportGroups.clear();
  renderCatalogImportGroupsList();
  renderCatalogUpdateGroupsList();
  catalogImportBtnEl.disabled = false;
});

// CelesTrak demande de ne pas re-solliciter la même ressource plus d'une
// fois toutes les ~2h (voir CATALOG_MIN_REFETCH_MS) : une mise à jour
// répétée plusieurs fois par jour n'apporte rien (le cooldown la sert depuis
// le cache local de toute façon) et risque de faire bannir l'IP à terme.
const UPDATE_RATE_LIMIT_WARNING =
  "CelesTrak limite les requêtes à environ 1 par groupe toutes les 2h.\n\n"
  + "Évite de lancer une mise à jour plusieurs fois par jour : ça n'apporte rien "
  + "tant que le cooldown n'est pas écoulé, et ça risque de faire bloquer l'accès à CelesTrak.\n\n"
  + "Continuer ?";

catalogUpdateSelectedBtnEl.addEventListener("click", async () => {
  if (!window.confirm(UPDATE_RATE_LIMIT_WARNING)) return;
  catalogUpdateSelectedBtnEl.disabled = true;
  await loadAndSyncCelesTrakGroups(Array.from(catalogSelectedUpdateGroups), catalogUpdateStatusEl);
  renderCatalogUpdateGroupsList();
  catalogUpdateSelectedBtnEl.disabled = false;
});

// ---------- Import Space-Track (débris moyens) ----------
// Tout se passe côté Apps Script (connexion, requête, écriture des onglets) ;
// le site recharge ensuite les onglets depuis le Sheet.
const spacetrackImportBtnEl = document.getElementById("spacetrackImportBtn");
const spacetrackImportStatusEl = document.getElementById("spacetrackImportStatus");

spacetrackImportBtnEl.addEventListener("click", async () => {
  if (DEMO_MODE) return;
  spacetrackImportBtnEl.disabled = true;
  spacetrackImportStatusEl.textContent = "Import Space-Track en cours (jusqu'à quelques minutes)...";
  try {
    const res = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "spacetrackImport", size: "MEDIUM" }),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "échec");
    spacetrackImportStatusEl.textContent = `${result.total} débris moyens reçus — `
      + result.groups.map(g => `${g.id.replace("st-deb-moyens-", "")} km : ${g.count}`).join(", ");
    await refreshSheetGroupsMeta();
    const loadedIds = result.groups.filter(g => g.count > 0).map(g => g.id);
    if (loadedIds.length > 0) await loadExistingGroupsFromSheet(loadedIds, catalogLoadExistingStatusEl);
  } catch (err) {
    console.error("Import Space-Track:", err);
    spacetrackImportStatusEl.textContent = `Échec de l'import Space-Track : ${err.message || err}`;
  } finally {
    spacetrackImportBtnEl.disabled = false;
  }
});

catalogUpdateAllBtnEl.addEventListener("click", async () => {
  if (!window.confirm(UPDATE_RATE_LIMIT_WARNING)) return;
  const allKnownGroupIds = CATALOG_GROUPS.filter(g => !g.spacetrack && sheetGroupsMeta.has(g.id)).map(g => g.id);
  catalogUpdateAllBtnEl.disabled = true;
  await loadAndSyncCelesTrakGroups(allKnownGroupIds, catalogUpdateStatusEl);
  renderCatalogUpdateGroupsList();
  catalogUpdateAllBtnEl.disabled = false;
});

catalogLoadSatcatBtnEl.addEventListener("click", async () => {
  catalogLoadSatcatBtnEl.disabled = true;
  catalogLoadSatcatBtnEl.textContent = "Chargement du SATCAT...";
  try {
    await fetchSatcatIndex();
    renderCatalogCountryFilter();
    renderCatalogTypeFilter();
    catalogCountryFilterEl.style.display = "";
    catalogTypeFilterEl.style.display = "";
    catalogLoadSatcatBtnEl.style.display = "none";
  } catch (err) {
    console.error("Erreur de chargement du SATCAT:", err);
    catalogLoadSatcatBtnEl.textContent = "Échec — réessayer";
    catalogLoadSatcatBtnEl.disabled = false;
  }
});

catalogCountryFilterEl.addEventListener("change", (e) => {
  const checkbox = e.target.closest(".catalogCountryCheckbox");
  if (!checkbox) return;
  const code = checkbox.dataset.country;
  if (checkbox.checked) catalogFilters.countries.add(code);
  else catalogFilters.countries.delete(code);
  rebuildScene();
});

catalogTypeFilterEl.addEventListener("change", (e) => {
  const checkbox = e.target.closest(".catalogTypeCheckbox");
  if (!checkbox) return;
  const t = checkbox.dataset.type;
  if (checkbox.checked) catalogFilters.objectTypes.add(t);
  else catalogFilters.objectTypes.delete(t);
  rebuildScene();
});

showLabelsCheckboxEl.addEventListener("change", () => {
  setObjectLabelsVisible(showLabelsCheckboxEl.checked);
});

// ---------- Onglet "Charger données existantes" ----------
catalogRefreshExistingBtnEl.addEventListener("click", () => {
  catalogRefreshExistingBtnEl.disabled = true;
  refreshSheetGroupsMeta().finally(() => { catalogRefreshExistingBtnEl.disabled = false; });
});

// Charge depuis le Sheet (pas de requête CelesTrak) un lot de groupes déjà
// connus — logique partagée par "Charger toutes les données existantes" et
// "Charger la sélection", qui ne diffèrent que par la liste de groupes.
async function loadExistingGroupsFromSheet(groupIds, statusEl) {
  if (groupIds.length === 0) {
    statusEl.textContent = "Rien à charger — sélectionne au moins une constellation.";
    return;
  }
  statusEl.textContent = "Chargement depuis le Sheet...";

  let totalLoaded = 0;
  const failed = [];
  const fromLocalCache = [];
  for (const groupId of groupIds) {
    const timeoutMs = sheetGroupFetchTimeoutFor(groupId);
    if (timeoutMs > SHEET_GROUP_FETCH_TIMEOUT_MS) {
      statusEl.textContent = `Chargement de ${groupId} depuis le Sheet (gros groupe, peut prendre jusqu'à ${Math.round(timeoutMs / 1000)}s)...`;
    }
    try {
      const data = await loadGroupFromSheet(groupId, timeoutMs);
      let records;
      if (data && data.exists && data.records.length > 0) {
        records = data.records.map(r => sheetGroupRowToRecord(r, groupId));
      } else {
        // Onglet absent ou vide (synchro précédente échouée) : dernier
        // téléchargement CelesTrak gardé dans le navigateur, s'il existe.
        const cached = loadGroupCache(groupId);
        if (!cached || !cached.records || cached.records.length === 0) {
          failed.push({ groupId, message: "vide dans le Sheet, pas de cache local" });
          continue;
        }
        records = cached.records.map(r => ({ ...r, group: groupId }));
        fromLocalCache.push(groupId);
      }
      catalogRawRecords = [...catalogRawRecords.filter(r => r.group !== groupId), ...records];
      catalogGroupsLoaded.add(groupId);
      totalLoaded += records.length;
    } catch (err) {
      console.error("Erreur de chargement Sheet pour le groupe:", groupId, err);
      failed.push({ groupId, message: err.message || String(err) });
    }
  }

  rebuildScene();
  renderCatalogImportGroupsList();
  renderCatalogUpdateGroupsList();
  renderCatalogExistingSummaryList();
  renderCatalogCountryFilter();
  renderCatalogTypeFilter();
  statusEl.textContent = failed.length > 0
    ? `${totalLoaded} objet(s) chargé(s) sur ${groupIds.length} constellation(s) · échec : ${failed.map(f => `${f.groupId} (${f.message})`).join(", ")}`
    : `${totalLoaded} objet(s) chargé(s) depuis ${groupIds.length} constellation(s) — ${new Date().toLocaleTimeString()}`;
  if (fromLocalCache.length > 0) {
    statusEl.textContent += ` · cache local (Sheet vide) : ${fromLocalCache.join(", ")}`;
  }
}


catalogLoadAllExistingBtnEl.addEventListener("click", async () => {
  hiddenGroups.clear();
  resetUncheckAllButton();
  if (DEMO_MODE) {
    // Tout est déjà chargé depuis l'instantané : il suffit de tout réafficher.
    applyGroupVisibility();
    return;
  }
  const groupIds = knownSheetGroupIds();
  catalogLoadAllExistingBtnEl.disabled = true;
  await loadExistingGroupsFromSheet(groupIds, catalogLoadExistingStatusEl);
  catalogLoadAllExistingBtnEl.disabled = false;
});

// Bulle de détails au survol d'une ligne ayant un data-tooltip (voir
// renderFilterableGroupsList) : un seul élément partagé, positionné près du
// curseur en fixed pour ne jamais se faire couper par le scroll de la liste.
const catalogGroupTooltipEl = document.getElementById("catalogGroupTooltip");
let hoveredTooltipRowEl = null;

function bindGroupTooltip(containerEl) {
  containerEl.addEventListener("mousemove", (e) => {
    const row = e.target.closest(".catalogGroupRow[data-tooltip]");
    if (!row) {
      if (hoveredTooltipRowEl) {
        hoveredTooltipRowEl = null;
        catalogGroupTooltipEl.style.display = "none";
      }
      return;
    }
    if (row !== hoveredTooltipRowEl) {
      hoveredTooltipRowEl = row;
      catalogGroupTooltipEl.textContent = row.dataset.tooltip;
      catalogGroupTooltipEl.style.display = "block";
    }
    catalogGroupTooltipEl.style.left = `${e.clientX + 14}px`;
    catalogGroupTooltipEl.style.top = `${e.clientY + 14}px`;
  });
  containerEl.addEventListener("mouseleave", () => {
    hoveredTooltipRowEl = null;
    catalogGroupTooltipEl.style.display = "none";
  });
}
bindGroupTooltip(catalogExistingSummaryListEl);

renderCatalogLegend();
renderCatalogImportGroupsList();
renderCatalogUpdateGroupsList();
renderCatalogExistingSummaryList();
// En démo, la liste des groupes vient de l'instantané (voir loadDemoSnapshot).
const sheetGroupsMetaReady = DEMO_MODE ? Promise.resolve() : refreshSheetGroupsMeta();
setInterval(() => {
  if (catalogPanelEl.classList.contains("dockOpen")) {
    renderCatalogImportGroupsList();
    renderCatalogUpdateGroupsList();
    renderCatalogExistingSummaryList();
  }
}, 60000);

// ============================================================================
// ---------- Vecteur personnalisé (illustration ponctuelle, ex. PowerPoint) -
// ============================================================================
// Trace une droite depuis l'objet actuellement suivi par la caméra
// (viewer.trackedEntity), dans une direction du repère orbital local
// (prograde/rétrograde/normale/anti-normale/nadir/zénith), avec un point
// d'arrivée mis en évidence et un indicateur d'altitude en pointillé.
// Purement illustratif : l'indicateur d'altitude descend à la verticale
// (même longitude/latitude) du point d'arrivée jusqu'à l'altitude indiquée
// — ce n'est pas un vrai calcul de tangence de ligne de visée (impossible
// pour prograde/normale, perpendiculaires au rayon terrestre : tout
// déplacement le long de ces axes ne peut qu'éloigner de la Terre, jamais
// en rapprocher).
let customVectorEnabled = false;
let customVectorEntity = null;
let customVectorPointEntity = null;
let customVectorAltitudeEntity = null;
let customVectorConfig = {
  direction: "prograde",
  lengthKm: 40,
  color: "#FFE156",
  widthPx: 3,
  showPoint: true,
  showAltitudeIndicator: true,
  altitudeKm: 7,
};

// Repère orbital local (radial/along-track/cross-track) reconstruit à partir
// de la position et de la vitesse instantanées du satellite. La vitesse
// ECI est tournée en ECF via la même rotation GMST que la position (voir
// getTLEPosition plus haut), pour rester dans le même repère fixe que le
// reste de la scène Cesium.
// Vitesse de rotation de la Terre (rad/s, sidérale) — nécessaire pour
// corriger la vitesse ECEF (voir commentaire ci-dessous).
const EARTH_ROTATION_RATE = 7.2921150e-5;

// Un NaN dans une position, une orientation ou une taille arrête le rendu
// Cesium entier (volume englobant NaN -> nombre de frustums invalide).
function isFiniteCartesian(c) {
  return !!c && Number.isFinite(c.x) && Number.isFinite(c.y) && Number.isFinite(c.z);
}

function isFiniteQuaternion(q) {
  return !!q && Number.isFinite(q.x) && Number.isFinite(q.y) && Number.isFinite(q.z) && Number.isFinite(q.w);
}

function getOrbitFrameVectors(record, jsDate) {
  if (record.type !== "tle" || !record.satrec || !record.positionCartesian) return null;
  // Position pas encore calculée (scène tout juste reconstruite) : vecteur
  // nul, dont la normalisation donnerait NaN.
  if (!record.hasPosition || !isFiniteCartesian(record.positionCartesian)
    || Cesium.Cartesian3.magnitudeSquared(record.positionCartesian) < 1) return null;
  const posVel = satellite.propagate(record.satrec, jsDate);
  if (!posVel || !posVel.velocity) return null;
  const gmst = satellite.gstime(jsDate);

  // satellite.eciToEcf ne fait qu'une rotation GMST : ça donne la vitesse
  // ECI simplement exprimée dans les axes ECEF à cet instant, PAS la vraie
  // vitesse relative au repère ECEF (qui tourne). Il manque le terme de
  // transport ω×r (théorème de transport, référentiel non galiléen) — sans
  // lui, la direction "prograde" dévie de quelques degrés de la tangente
  // réelle à la trajectoire pointillée (elle-même construite en ECEF via
  // buildOrbitTrailPositions), l'écart croissant avec la vitesse de rotation
  // terrestre perpendiculaire à l'axe des pôles (~0.5 km/s à l'équateur,
  // contre ~7.5 km/s de vitesse orbitale en LEO → quelques degrés).
  const velEcfRotationOnly = satellite.eciToEcf(posVel.velocity, gmst); // km/s
  const posKm = Cesium.Cartesian3.multiplyByScalar(record.positionCartesian, 0.001, new Cesium.Cartesian3());
  const transportCorrection = new Cesium.Cartesian3(
    EARTH_ROTATION_RATE * posKm.y,
    -EARTH_ROTATION_RATE * posKm.x,
    0
  );
  const trueVelEcf = Cesium.Cartesian3.add(
    new Cesium.Cartesian3(velEcfRotationOnly.x, velEcfRotationOnly.y, velEcfRotationOnly.z),
    transportCorrection,
    new Cesium.Cartesian3()
  );
  const prograde = Cesium.Cartesian3.normalize(trueVelEcf, new Cesium.Cartesian3());
  const zenith = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.clone(record.positionCartesian),
    new Cesium.Cartesian3()
  );
  const normal = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.cross(zenith, prograde, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  );
  return {
    prograde,
    retrograde: Cesium.Cartesian3.negate(prograde, new Cesium.Cartesian3()),
    normal,
    antiNormal: Cesium.Cartesian3.negate(normal, new Cesium.Cartesian3()),
    nadir: Cesium.Cartesian3.negate(zenith, new Cesium.Cartesian3()),
    zenith,
  };
}

function getCustomVectorTargetRecord() {
  if (!viewer.trackedEntity) return null;
  return satRecords.find(r => r.entity === viewer.trackedEntity) || null;
}

function getCustomVectorEndpoint() {
  const record = getCustomVectorTargetRecord();
  if (!record || !record.positionCartesian) return null;
  const jsDate = Cesium.JulianDate.toDate(viewer.clock.currentTime);
  const frame = getOrbitFrameVectors(record, jsDate);
  if (!frame) return null;
  const direction = frame[customVectorConfig.direction];
  if (!direction) return null;
  const offset = Cesium.Cartesian3.multiplyByScalar(direction, customVectorConfig.lengthKm * 1000, new Cesium.Cartesian3());
  return Cesium.Cartesian3.add(record.positionCartesian, offset, new Cesium.Cartesian3());
}

function getCustomVectorAltitudePoint() {
  const endpoint = getCustomVectorEndpoint();
  if (!endpoint) return null;
  const cartographic = Cesium.Cartographic.fromCartesian(endpoint);
  if (!cartographic) return null;
  return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, customVectorConfig.altitudeKm * 1000);
}

function customVectorColorProperty() {
  return new Cesium.CallbackProperty(() => Cesium.Color.fromCssColorString(customVectorConfig.color), false);
}

// Les entités ne sont créées qu'une fois (au premier "Afficher / mettre à
// jour") ; ensuite, toute la config (direction, longueur, couleur...) est
// lue en live par les CallbackProperty à chaque frame, donc "mettre à jour"
// n'a rien de plus à faire que changer customVectorConfig.
function ensureCustomVectorEntities() {
  if (customVectorEntity) return;

  customVectorEntity = viewer.entities.add({
    name: "Vecteur personnalisé",
    polyline: {
      positions: new Cesium.CallbackProperty(() => {
        const record = getCustomVectorTargetRecord();
        const endpoint = getCustomVectorEndpoint();
        if (!record || !endpoint) return [];
        return [Cesium.Cartesian3.clone(record.positionCartesian), endpoint];
      }, false),
      width: new Cesium.CallbackProperty(() => customVectorConfig.widthPx, false),
      material: new Cesium.ColorMaterialProperty(customVectorColorProperty()),
      arcType: Cesium.ArcType.NONE,
      show: new Cesium.CallbackProperty(() => customVectorEnabled && !!getCustomVectorEndpoint(), false),
    },
  });

  customVectorPointEntity = viewer.entities.add({
    name: "Point d'arrivée — vecteur personnalisé",
    position: new Cesium.CallbackProperty(() => getCustomVectorEndpoint() || Cesium.Cartesian3.ZERO, false),
    point: {
      pixelSize: 10,
      color: customVectorColorProperty(),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      show: new Cesium.CallbackProperty(() => customVectorEnabled && customVectorConfig.showPoint && !!getCustomVectorEndpoint(), false),
    },
  });

  customVectorAltitudeEntity = viewer.entities.add({
    name: "Indicateur altitude — vecteur personnalisé",
    polyline: {
      positions: new Cesium.CallbackProperty(() => {
        const endpoint = getCustomVectorEndpoint();
        const altPoint = getCustomVectorAltitudePoint();
        if (!endpoint || !altPoint) return [];
        return [endpoint, altPoint];
      }, false),
      width: 2,
      material: new Cesium.PolylineDashMaterialProperty({ color: customVectorColorProperty(), dashLength: 10 }),
      arcType: Cesium.ArcType.NONE,
      show: new Cesium.CallbackProperty(() => customVectorEnabled && customVectorConfig.showAltitudeIndicator && !!getCustomVectorEndpoint(), false),
    },
  });
}

function removeCustomVectorEntities() {
  [customVectorEntity, customVectorPointEntity, customVectorAltitudeEntity].forEach(e => {
    if (e) viewer.entities.remove(e);
  });
  customVectorEntity = null;
  customVectorPointEntity = null;
  customVectorAltitudeEntity = null;
  customVectorEnabled = false;
}

const customVectorPanelEl = document.getElementById("customVectorPanel");
const customVectorTargetEl = document.getElementById("customVectorTarget");
const customVectorDirectionEl = document.getElementById("customVectorDirection");
const customVectorLengthEl = document.getElementById("customVectorLength");
const customVectorColorEl = document.getElementById("customVectorColor");
const customVectorWidthEl = document.getElementById("customVectorWidth");
const customVectorShowPointEl = document.getElementById("customVectorShowPoint");
const customVectorShowAltitudeEl = document.getElementById("customVectorShowAltitude");
const customVectorAltitudeEl = document.getElementById("customVectorAltitude");
const customVectorApplyBtnEl = document.getElementById("customVectorApplyBtn");
const customVectorRemoveBtnEl = document.getElementById("customVectorRemoveBtn");
const customVectorStatusEl = document.getElementById("customVectorStatus");

function updateCustomVectorTargetDisplay() {
  const record = getCustomVectorTargetRecord();
  customVectorTargetEl.textContent = record
    ? record.name
    : "Aucun — active le suivi caméra sur un satellite";
}

customVectorDirectionEl.addEventListener("change", () => {
  customVectorConfig.direction = customVectorDirectionEl.value;
});
customVectorLengthEl.addEventListener("input", () => {
  customVectorConfig.lengthKm = Number(customVectorLengthEl.value) || 0;
});
customVectorColorEl.addEventListener("input", () => {
  customVectorConfig.color = customVectorColorEl.value;
});
customVectorWidthEl.addEventListener("input", () => {
  customVectorConfig.widthPx = Math.max(0.5, Number(customVectorWidthEl.value) || 1);
});
customVectorShowPointEl.addEventListener("change", () => {
  customVectorConfig.showPoint = customVectorShowPointEl.checked;
});
customVectorShowAltitudeEl.addEventListener("change", () => {
  customVectorConfig.showAltitudeIndicator = customVectorShowAltitudeEl.checked;
});
customVectorAltitudeEl.addEventListener("input", () => {
  customVectorConfig.altitudeKm = Number(customVectorAltitudeEl.value) || 0;
});

customVectorApplyBtnEl.addEventListener("click", () => {
  const record = getCustomVectorTargetRecord();
  if (!record) {
    customVectorStatusEl.textContent = "Active le suivi caméra (🎥, panneau Distance) sur un satellite d'abord.";
    return;
  }
  ensureCustomVectorEntities();
  customVectorEnabled = true;
  customVectorStatusEl.textContent = `Vecteur actif sur ${record.name}.`;
});

customVectorRemoveBtnEl.addEventListener("click", () => {
  removeCustomVectorEntities();
  customVectorStatusEl.textContent = "Vecteur supprimé.";
});

updateCustomVectorTargetDisplay();
setInterval(updateCustomVectorTargetDisplay, 1000);

// ---------- Persistance de la disposition du dock (panneau ouvert + position) ----------
// Chaque panneau retrouve, à l'ouverture suivante de la page, l'état et la position
// où l'utilisateur l'avait laissé (glisser-déposer via makePanelDraggable ci-dessous).
const DOCK_UI_STORAGE_KEY = "price_dock_ui_v2";
// Première visite (aucune disposition enregistrée) : seul le catalogue est ouvert.
const DEFAULT_OPEN_PANELS = DEMO_MODE ? DEMO_OPEN_PANELS : ["catalogPanel"];

function loadDockUiState() {
  try {
    const raw = localStorage.getItem(DOCK_UI_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("Impossible de lire la disposition du dock:", err);
    return {};
  }
}

function saveDockUiState(state) {
  try {
    localStorage.setItem(DOCK_UI_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Impossible d'écrire la disposition du dock:", err);
  }
}

function updateDockUiState(panelId, patch) {
  const state = loadDockUiState();
  state[panelId] = { ...state[panelId], ...patch };
  saveDockUiState(state);
}

function rectsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

// panelId -> { left, top, width, height } de sa position/taille CSS par
// défaut, capturée une seule fois à sa première ouverture (voir setPanelOpen)
// — sert de cible à l'aimantation "retour à sa place" pendant un
// glisser-déposer, avec aperçu clignotant (voir makePanelDraggable plus bas).
const panelHomeRects = new Map();
const HOME_SNAP_THRESHOLD_PX = 50;
const panelSnapPreviewEl = document.getElementById("panelSnapPreview");

function showSnapPreview(homeRect) {
  panelSnapPreviewEl.style.left = `${homeRect.left}px`;
  panelSnapPreviewEl.style.top = `${homeRect.top}px`;
  panelSnapPreviewEl.style.width = `${homeRect.width}px`;
  panelSnapPreviewEl.style.height = `${homeRect.height}px`;
  panelSnapPreviewEl.style.display = "block";
}

function hideSnapPreview() {
  panelSnapPreviewEl.style.display = "none";
}

function isNearHome(left, top, home) {
  return !!home
    && Math.abs(left - home.left) < HOME_SNAP_THRESHOLD_PX
    && Math.abs(top - home.top) < HOME_SNAP_THRESHOLD_PX;
}

// Cherche, à partir de sa position CSS par défaut, la première position en
// balayant en diagonale qui ne chevauche aucun autre panneau actuellement
// ouvert — seulement utilisé à l'ouverture d'un panneau qui n'a jamais été
// positionné à la main (voir l'appel dans setPanelOpen). panelEl doit déjà
// être rendu visible (display:block) pour que ses dimensions soient mesurables.
function findFreePanelPosition(panelEl) {
  const margin = 12;
  const step = 24;
  const rect = panelEl.getBoundingClientRect();
  const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);

  const others = Array.from(document.querySelectorAll(".dockManaged.dockOpen"))
    .filter(el => el !== panelEl)
    .map(el => el.getBoundingClientRect());

  for (let i = 0; i < 30; i++) {
    const left = Math.min(rect.left + i * step, maxLeft);
    const top = Math.min(rect.top + i * step, maxTop);
    const candidate = { left, top, right: left + rect.width, bottom: top + rect.height };
    if (!others.some(o => rectsOverlap(candidate, o))) {
      return { left, top };
    }
  }
  return null; // aucune position libre trouvée (trop de panneaux ouverts à la fois) : position par défaut inchangée
}

// ---------- Dock central : ouvre/ferme les panneaux flottants ----------
// Tous les panneaux sont masqués par défaut (classe CSS dockManaged) pour ne
// pas encombrer l'écran ; un clic sur une icône du dock (ou sur le bouton de fermeture du
// panneau) bascule sa visibilité.
function setPanelOpen(panelId, open, { persist = true } = {}) {
  if (open && isDemoLockedPanel(panelId)) return;
  const panelEl = document.getElementById(panelId);
  // Exclut .dockCloseBtn, qui porte aussi un data-panel mais n'est pas un
  // bouton d'ouverture.
  const triggerBtns = document.querySelectorAll(`.dockBtn[data-panel="${panelId}"]`);
  if (panelEl) {
    if (!open) delete panelEl.dataset.peek;
    panelEl.classList.toggle("dockOpen", open);
    // !panelEl.style.left : le panneau n'a jamais été positionné à la main
    // (ni glissé cette session, ni restauré d'une session précédente) — dans
    // ce cas seulement, on lui trouve une place libre plutôt que de le laisser
    // apparaître à sa position CSS par défaut, qui peut chevaucher un panneau
    // déjà ouvert ailleurs (voir demande : ouvrir les panneaux un par un ne
    // doit jamais faire apparaître le nouveau par-dessus un existant).
    if (open && !panelEl.style.left) {
      // Dernier moment où la position/taille est encore celle du CSS par
      // défaut : c'est la cible de l'aimantation "retour à sa place" pendant
      // un glisser-déposer (voir panelHomeRects / makePanelDraggable).
      if (!panelHomeRects.has(panelId)) {
        const homeRect = panelEl.getBoundingClientRect();
        panelHomeRects.set(panelId, { left: homeRect.left, top: homeRect.top, width: homeRect.width, height: homeRect.height });
      }
      const freePos = findFreePanelPosition(panelEl);
      if (freePos) {
        panelEl.style.left = `${freePos.left}px`;
        panelEl.style.top = `${freePos.top}px`;
        panelEl.style.right = "auto";
        panelEl.style.bottom = "auto";
        panelEl.style.transform = "none";
      }
    }
  }
  triggerBtns.forEach(btn => {
    btn.classList.toggle("dockBtnActive", open);
  });
  if (persist) updateDockUiState(panelId, { open });
}

// [data-panel] exclut le bouton "Réorganiser", qui porte la même classe pour
// l'habillage visuel mais ne pilote aucun panneau.
document.querySelectorAll(".dockBtn[data-panel]").forEach(btn => {
  btn.addEventListener("click", () => {
    const panelId = btn.dataset.panel;
    const panelEl = document.getElementById(panelId);
    // Panneau ouvert en aperçu (survol) : le clic l'épingle au lieu de le fermer.
    if (panelEl.dataset.peek === "1") {
      cancelDockPeekTimers(panelId);
      delete panelEl.dataset.peek;
      setPanelOpen(panelId, true);
      return;
    }
    setPanelOpen(panelId, !panelEl.classList.contains("dockOpen"));
  });
});

// ---------- Aperçu au survol du dock ----------
// Survoler un bouton du dock affiche son panneau ; il reste ouvert tant que
// la souris est sur le bouton ou dans le panneau (on peut cliquer dedans),
// et se referme dès qu'on en sort. Un clic sur le bouton l'épingle comme
// avant. L'aperçu n'est pas mémorisé dans la disposition.
const DOCK_PEEK_OPEN_DELAY_MS = 150;
const DOCK_PEEK_CLOSE_DELAY_MS = 350;
const dockPeekTimers = new Map(); // panelId -> { open, close }

function cancelDockPeekTimers(panelId) {
  const t = dockPeekTimers.get(panelId);
  if (!t) return;
  clearTimeout(t.open);
  clearTimeout(t.close);
  dockPeekTimers.delete(panelId);
}

function dockPeekTimer(panelId) {
  if (!dockPeekTimers.has(panelId)) dockPeekTimers.set(panelId, {});
  return dockPeekTimers.get(panelId);
}

function isDockPeekInUse(panelId) {
  const panelEl = document.getElementById(panelId);
  const btns = document.querySelectorAll(`.dockBtn[data-panel="${panelId}"]`);
  if (panelEl.matches(":hover") || Array.from(btns).some(b => b.matches(":hover"))) return true;
  // Seule une liste déroulante ouverte retient l'aperçu : son menu natif
  // sort du panneau et déclencherait mouseleave.
  const active = document.activeElement;
  return !!active && panelEl.contains(active) && active.tagName === "SELECT";
}

function scheduleDockPeekClose(panelId) {
  const panelEl = document.getElementById(panelId);
  if (panelEl.dataset.peek !== "1") return;
  const t = dockPeekTimer(panelId);
  clearTimeout(t.close);
  t.close = setTimeout(() => {
    if (panelEl.dataset.peek !== "1") return;
    if (isDockPeekInUse(panelId)) return;
    setPanelOpen(panelId, false, { persist: false });
  }, DOCK_PEEK_CLOSE_DELAY_MS);
}

document.querySelectorAll(".dockBtn[data-panel]").forEach(btn => {
  const panelId = btn.dataset.panel;
  const panelEl = document.getElementById(panelId);
  if (!panelEl) return;
  btn.addEventListener("mouseenter", () => {
    const t = dockPeekTimer(panelId);
    clearTimeout(t.close);
    if (panelEl.classList.contains("dockOpen")) return;
    t.open = setTimeout(() => {
      if (panelEl.classList.contains("dockOpen") || !btn.matches(":hover")) return;
      setPanelOpen(panelId, true, { persist: false });
      panelEl.dataset.peek = "1";
      topPanelZIndex += 1;
      panelEl.style.zIndex = String(topPanelZIndex);
    }, DOCK_PEEK_OPEN_DELAY_MS);
  });
  btn.addEventListener("mouseleave", () => {
    clearTimeout(dockPeekTimer(panelId).open);
    scheduleDockPeekClose(panelId);
  });
});

document.querySelectorAll(".dockManaged").forEach(panelEl => {
  if (!panelEl.id) return;
  panelEl.addEventListener("mouseenter", () => clearTimeout(dockPeekTimer(panelEl.id).close));
  panelEl.addEventListener("mouseleave", () => scheduleDockPeekClose(panelEl.id));
  panelEl.addEventListener("focusout", () => scheduleDockPeekClose(panelEl.id));
});

document.querySelectorAll(".dockCloseBtn").forEach(btn => {
  btn.addEventListener("click", () => setPanelOpen(btn.dataset.panel, false));
});

// Démo : boutons verrouillés grisés, bulle au survol avec le titre et le rôle
// du panneau (repris de son en-tête), sans l'ouvrir.
if (DEMO_MODE) {
  document.querySelectorAll(".dockBtn[data-panel]").forEach(btn => {
    if (!isDemoLockedPanel(btn.dataset.panel)) return;
    const panelEl = document.getElementById(btn.dataset.panel);
    const header = panelEl && panelEl.querySelector(".distancePanelHeader");
    const title = (header && header.querySelector(".distancePanelTitle") || {}).textContent || btn.title;
    const info = (header && header.querySelector(".infoTip") || { dataset: {} }).dataset.info || "";
    lockDemoControl(btn, title, info);
  });
}

// Chevauchement autorisé entre panneaux : au clic (n'importe où dedans, pas
// seulement l'en-tête), celui-ci repasse devant les autres — comme une
// fenêtre système — plutôt que de garder l'ordre du DOM figé pour toujours.
var topPanelZIndex = 100000;
document.addEventListener("pointerdown", (e) => {
  const panelEl = e.target.closest(".dockManaged");
  if (!panelEl) return;
  topPanelZIndex += 1;
  panelEl.style.zIndex = String(topPanelZIndex);
});

// Aimantation aux bords de l'écran : un panneau (ou le dock) lâché à moins de
// EDGE_SNAP_THRESHOLD_PX d'un bord vient se souder contre ce bord plutôt que
// de rester à quelques pixels près de là où la souris l'a lâché.
const EDGE_SNAP_THRESHOLD_PX = 14;
const EDGE_SNAP_MARGIN_PX = 12;

function snapElementToEdges(el) {
  const rect = el.getBoundingClientRect();
  let left = rect.left;
  let top = rect.top;

  if (rect.left < EDGE_SNAP_THRESHOLD_PX) {
    left = EDGE_SNAP_MARGIN_PX;
  } else if (window.innerWidth - rect.right < EDGE_SNAP_THRESHOLD_PX) {
    left = window.innerWidth - rect.width - EDGE_SNAP_MARGIN_PX;
  }

  if (rect.top < EDGE_SNAP_THRESHOLD_PX) {
    top = EDGE_SNAP_MARGIN_PX;
  } else if (window.innerHeight - rect.bottom < EDGE_SNAP_THRESHOLD_PX) {
    top = window.innerHeight - rect.height - EDGE_SNAP_MARGIN_PX;
  }

  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

// Pointer events (souris, doigt, stylet) : sur téléphone, les événements
// souris ne suivent pas un glissement au doigt. La capture du pointeur garde
// le glissement même si le doigt sort de l'en-tête.
function makePanelDraggable(panelEl, handleEl, { onDrop } = {}) {
  let dragPointerId = null;
  let offsetX = 0;
  let offsetY = 0;

  handleEl.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest("button, input, select, textarea, a")) return;
    dragPointerId = e.pointerId;
    handleEl.setPointerCapture(e.pointerId);
    const rect = panelEl.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    panelEl.style.left = `${rect.left}px`;
    panelEl.style.top = `${rect.top}px`;
    panelEl.style.right = "auto";
    panelEl.style.bottom = "auto";
    panelEl.style.transform = "none";
    panelEl.classList.add("panelDragging");
    document.body.style.userSelect = "none";
    e.preventDefault();
  });

  handleEl.addEventListener("pointermove", (e) => {
    if (e.pointerId !== dragPointerId) return;
    const maxLeft = window.innerWidth - panelEl.offsetWidth;
    const maxTop = window.innerHeight - panelEl.offsetHeight;
    const left = Math.min(Math.max(0, e.clientX - offsetX), Math.max(0, maxLeft));
    const top = Math.min(Math.max(0, e.clientY - offsetY), Math.max(0, maxTop));
    panelEl.style.left = `${left}px`;
    panelEl.style.top = `${top}px`;

    const home = panelHomeRects.get(panelEl.id);
    if (isNearHome(left, top, home)) {
      showSnapPreview(home);
    } else {
      hideSnapPreview();
    }
  });

  function endDrag(e) {
    if (e.pointerId !== dragPointerId) return;
    dragPointerId = null;
    const left = parseFloat(panelEl.style.left);
    const top = parseFloat(panelEl.style.top);
    const home = panelHomeRects.get(panelEl.id);
    if (isNearHome(left, top, home)) {
      panelEl.style.left = `${home.left}px`;
      panelEl.style.top = `${home.top}px`;
      panelEl.style.width = `${home.width}px`;
      panelEl.style.height = `${home.height}px`;
    } else {
      snapElementToEdges(panelEl);
    }
    hideSnapPreview();
    panelEl.classList.remove("panelDragging");
    document.body.style.userSelect = "";
    if (onDrop) onDrop(panelEl);
    updateDockUiState(panelEl.id, { left: panelEl.style.left, top: panelEl.style.top });
  }
  handleEl.addEventListener("pointerup", endDrag);
  handleEl.addEventListener("pointercancel", endDrag);
}

makePanelDraggable(distancePanelEl, distancePanelEl.querySelector(".distancePanelHeader"));
makePanelDraggable(sidePanelEl, sidePanelEl.querySelector(".distancePanelHeader"));
makePanelDraggable(trailPanelEl, trailPanelEl.querySelector(".distancePanelHeader"));
makePanelDraggable(orbitalParamsPanelEl, orbitalParamsPanelEl.querySelector(".distancePanelHeader"));
makePanelDraggable(adminPanelEl, adminPanelEl.querySelector(".distancePanelHeader"));
makePanelDraggable(adminAddPanelEl, adminAddPanelEl.querySelector(".distancePanelHeader"));
makePanelDraggable(catalogPanelEl, catalogPanelEl.querySelector(".distancePanelHeader"));
makePanelDraggable(customVectorPanelEl, customVectorPanelEl.querySelector(".distancePanelHeader"));

// Le dock lui-même reste déplaçable (comme les panneaux) : on le prend n'importe
// où sauf sur un bouton, qui doit continuer à ouvrir/fermer son panneau au clic.
// Lâché près du bord gauche ou droit, il se soude au bord ET bascule en
// disposition verticale (icônes empilées) plutôt que de rester une barre
// horizontale plaquée contre un bord étroit.
const dockEl = document.getElementById("dock");

function updateDockOrientation() {
  const rect = dockEl.getBoundingClientRect();
  const nearLeft = rect.left < EDGE_SNAP_THRESHOLD_PX;
  const nearRight = window.innerWidth - rect.right < EDGE_SNAP_THRESHOLD_PX;
  dockEl.classList.toggle("dockVertical", nearLeft || nearRight);
}

makePanelDraggable(dockEl, dockEl, { onDrop: updateDockOrientation });

// Remet le dock et tous les panneaux à leur position par défaut (celle du
// CSS), sans changer ce qui est ouvert ou fermé — juste la disposition.
const dockLayoutResetBtnEl = document.getElementById("dockLayoutResetBtn");
function resetDockLayout() {
  localStorage.removeItem(DOCK_UI_STORAGE_KEY);
  document.querySelectorAll(".dockManaged").forEach(panelEl => {
    panelEl.style.left = "";
    panelEl.style.top = "";
    panelEl.style.right = "";
    panelEl.style.bottom = "";
    panelEl.style.transform = "";
    panelEl.style.zIndex = "";
  });
  dockEl.style.left = "";
  dockEl.style.top = "";
  dockEl.style.right = "";
  dockEl.style.bottom = "";
  dockEl.style.transform = "";
  dockEl.classList.remove("dockVertical");

  // Une fois toutes les positions relâchées, replace les panneaux actuellement
  // ouverts pour qu'ils ne se chevauchent pas non plus entre eux (même
  // recherche de place libre que l'ouverture d'un panneau jamais positionné) —
  // sinon "réorganiser" pourrait très bien retomber sur des positions par
  // défaut qui se chevauchent.
  document.querySelectorAll(".dockManaged.dockOpen").forEach(panelEl => {
    const freePos = findFreePanelPosition(panelEl);
    if (freePos) {
      panelEl.style.left = `${freePos.left}px`;
      panelEl.style.top = `${freePos.top}px`;
      panelEl.style.right = "auto";
      panelEl.style.bottom = "auto";
      panelEl.style.transform = "none";
    }
  });
}
dockLayoutResetBtnEl.addEventListener("click", resetDockLayout);

// Panneau "À propos / Mentions légales", en dehors du dock (ce n'est pas un
// outil de simulation) : déclenché par la marque en haut à gauche plutôt que
// par une icône du dock, mais géré par le même système ouvert/fermé/déplaçable.
const legalPanelEl = document.getElementById("legalPanel");
const legalInfoBtnEl = document.getElementById("legalInfoBtn");
legalInfoBtnEl.addEventListener("click", () => {
  setPanelOpen("legalPanel", !legalPanelEl.classList.contains("dockOpen"));
});
makePanelDraggable(legalPanelEl, legalPanelEl.querySelector(".distancePanelHeader"));

// ---------- Réduire / agrandir les panneaux ----------
// Réduire : seul l'en-tête reste visible. Agrandir : le panneau occupe
// presque tout l'écran ; un second clic rend la position et la taille
// d'avant. Le redimensionnement libre reste possible par le coin bas-droit.
const PANEL_ICON_MINIMIZE = '<svg class="btnIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 12h12"/></svg>';
const PANEL_ICON_EXPAND = '<svg class="btnIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>';
const PANEL_ICON_RESTORE = '<svg class="btnIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h6V4M20 14h-6v6M10 10 3 3M14 14l7 7"/></svg>';
const PANEL_ICON_GRIP = '<svg class="btnIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18"/><path d="M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/></svg>';
const PANEL_MAXIMIZED_MARGIN_PX = 12;
const PANEL_MAXIMIZED_TOP_PX = 46;

const panelSavedGeometry = new Map();

function savePanelGeometry(panelEl) {
  panelSavedGeometry.set(panelEl.id, {
    left: panelEl.style.left, top: panelEl.style.top,
    right: panelEl.style.right, bottom: panelEl.style.bottom,
    width: panelEl.style.width, height: panelEl.style.height,
    transform: panelEl.style.transform,
  });
}

function restorePanelGeometry(panelEl) {
  const saved = panelSavedGeometry.get(panelEl.id);
  if (!saved) return;
  Object.assign(panelEl.style, saved);
  panelSavedGeometry.delete(panelEl.id);
}

function setPanelMaximized(panelEl, maximized, expandBtn) {
  if (maximized === panelEl.classList.contains("panelMaximized")) return;
  if (maximized) {
    if (panelEl.classList.contains("panelMinimized")) setPanelMinimized(panelEl, false);
    savePanelGeometry(panelEl);
    Object.assign(panelEl.style, {
      left: `${PANEL_MAXIMIZED_MARGIN_PX}px`,
      top: `${PANEL_MAXIMIZED_TOP_PX}px`,
      right: "auto", bottom: "auto", transform: "none",
      width: `${window.innerWidth - 2 * PANEL_MAXIMIZED_MARGIN_PX}px`,
      height: `${window.innerHeight - PANEL_MAXIMIZED_TOP_PX - 90}px`,
    });
  } else {
    restorePanelGeometry(panelEl);
  }
  panelEl.classList.toggle("panelMaximized", maximized);
  expandBtn.innerHTML = maximized ? PANEL_ICON_RESTORE : PANEL_ICON_EXPAND;
  expandBtn.title = maximized ? "Restore size" : "Maximise";
}

function setPanelMinimized(panelEl, minimized) {
  if (minimized === panelEl.classList.contains("panelMinimized")) return;
  if (minimized) {
    const expandBtn = panelEl.querySelector(".panelExpandBtn");
    if (expandBtn) setPanelMaximized(panelEl, false, expandBtn);
    panelEl.dataset.minimizedHeight = panelEl.style.height;
    panelEl.style.height = "";
  } else {
    panelEl.style.height = panelEl.dataset.minimizedHeight || "";
  }
  panelEl.classList.toggle("panelMinimized", minimized);
  const minimizeBtn = panelEl.querySelector(".panelMinimizeBtn");
  if (minimizeBtn) minimizeBtn.title = minimized ? "Expand" : "Minimise";
}

document.querySelectorAll(".dockManaged .distancePanelHeader .dockCloseBtn").forEach(closeBtn => {
  const panelEl = closeBtn.closest(".dockManaged");
  const controls = document.createElement("div");
  controls.className = "panelHeaderControls";

  const minimizeBtn = document.createElement("button");
  minimizeBtn.type = "button";
  minimizeBtn.className = "dockCloseBtn panelControlBtn panelMinimizeBtn";
  minimizeBtn.title = "Minimise";
  minimizeBtn.innerHTML = PANEL_ICON_MINIMIZE;

  const expandBtn = document.createElement("button");
  expandBtn.type = "button";
  expandBtn.className = "dockCloseBtn panelControlBtn panelExpandBtn";
  expandBtn.title = "Maximise";
  expandBtn.innerHTML = PANEL_ICON_EXPAND;

  const grip = document.createElement("div");
  grip.className = "panelGrip";
  grip.title = "Hold to move";
  grip.innerHTML = PANEL_ICON_GRIP;

  closeBtn.replaceWith(controls);
  controls.append(grip, minimizeBtn, expandBtn, closeBtn);

  minimizeBtn.addEventListener("click", () => {
    setPanelMinimized(panelEl, !panelEl.classList.contains("panelMinimized"));
  });
  expandBtn.addEventListener("click", () => {
    setPanelMaximized(panelEl, !panelEl.classList.contains("panelMaximized"), expandBtn);
  });
  // Double-clic sur l'en-tête : réduit / déplie.
  closeBtn.closest(".distancePanelHeader").addEventListener("dblclick", (e) => {
    if (e.target.closest("button")) return;
    setPanelMinimized(panelEl, !panelEl.classList.contains("panelMinimized"));
  });
  // Un panneau fermé puis rouvert revient à sa taille normale.
  closeBtn.addEventListener("click", () => {
    setPanelMaximized(panelEl, false, expandBtn);
    setPanelMinimized(panelEl, false);
  });
});

// Au chargement, chaque panneau retrouve sa position et son état (ouvert/fermé)
// de la session précédente ; par défaut (première visite) tout reste fermé pour
// laisser un écran dégagé, l'utilisateur choisit ce qu'il fait apparaître.
// ============================================================================
// ---------- Session (fichier shepherd-session.ini) -------------------------
// ============================================================================
// Tout l'état de la session (caméra, fenêtres, réglages, objets affichés)
// est écrit en continu dans localStorage et, s'il est lié, dans un fichier
// INI éditable à la main. Au lancement : localStorage est appliqué tout de
// suite ; si le fichier a été modifié depuis (date de modif plus récente et
// contenu différent), il est recopié dans localStorage et la page recharge.
const SESSION_FILE_NAME = "shepherd-session.ini";
const SESSION_STORAGE_KEY = "price_session_v1";
const SESSION_RELOAD_FLAG_KEY = "price_session_reloaded_from";
const SESSION_AUTOSAVE_MS = 2000;
// Le fichier est écrit juste après localStorage : en deçà de cet écart, ses
// dates sont considérées comme identiques.
const SESSION_MTIME_TOLERANCE_MS = 3000;

// Réglages portés par un élément de formulaire : relus/réappliqués tels
// quels, en déclenchant ses événements pour que le handler existant suive.
const SESSION_CONTROLS = [
  { section: "affichage", key: "noms_objets",       id: "showLabelsCheckbox",       help: "Noms des objets dans la scène 3D" },
  { section: "affichage", key: "debris_en_rouge",   id: "catalogDebrisRedCheckbox", help: "Débris en rouge quelle que soit la coloration" },
  { section: "affichage", key: "debris_factices",   id: "syntheticDebrisCheckbox",  help: "Nuage de 2000 débris factices (300-500 km)" },
  { section: "affichage", key: "couleur_par",       id: "catalogColorBySelect",     help: "Coloration des objets" },
  { section: "affichage", key: "site_reference",    id: "referenceSiteSelect",      help: "Site de référence du panneau Distances" },
  { section: "orbites",   key: "largeur_px",        id: "trailWidthSlider",         help: "Épaisseur du tracé d'orbite (1 à 10)" },
  { section: "orbites",   key: "tours",             id: "trailRevolutionsSlider",   help: "Nombre de tours d'orbite tracés (1 à 5)" },
  { section: "orbites",   key: "style",             id: "trailStyleSelect",         help: "Style du tracé d'orbite" },
  { section: "altitude",  key: "filtre_actif",      id: "altitudeFilterToggle",     help: "Filtre d'altitude activé" },
  { section: "altitude",  key: "min_km",            id: "altitudeMinInput",         help: "Altitude minimale affichée (km)" },
  { section: "altitude",  key: "max_km",            id: "altitudeMaxInput",         help: "Altitude maximale affichée (km)" },
];

// Clés INI des fenêtres <-> champs de l'état du dock (DOCK_UI_STORAGE_KEY).
const SESSION_PANEL_KEYS = { open: "ouvert", left: "x", top: "y" };

const NAME_LIST_SEPARATOR = " | ";

function formatSessionNumber(n, decimals) {
  return Number.isFinite(n) ? String(Number(n.toFixed(decimals))) : "";
}

function splitList(value, separator = ",") {
  return String(value || "").split(separator).map(s => s.trim()).filter(Boolean);
}

function parseSessionBool(value) {
  return /^(1|true|oui|on|yes)$/i.test(String(value).trim());
}

function controlSessionValue(el) {
  if (el.type === "checkbox") return el.checked ? "1" : "0";
  return el.value;
}

function controlHelp(control, el) {
  if (el.tagName !== "SELECT") return control.help;
  const options = Array.from(el.options).map(o => `${o.value} = ${o.textContent.trim()}`).join(", ");
  return `${control.help} (${options})`;
}

let lastSessionCamera = null;

function captureCameraForSession() {
  // Pendant un suivi, la caméra est relative à l'objet : on garde la
  // dernière vue libre.
  if (viewer.trackedEntity && lastSessionCamera) return lastSessionCamera;
  const carto = viewer.camera.positionCartographic;
  lastSessionCamera = {
    longitude_deg: formatSessionNumber(Cesium.Math.toDegrees(carto.longitude), 4),
    latitude_deg: formatSessionNumber(Cesium.Math.toDegrees(carto.latitude), 4),
    altitude_km: formatSessionNumber(carto.height / 1000, 1),
    cap_deg: formatSessionNumber(Cesium.Math.toDegrees(viewer.camera.heading), 2),
    tangage_deg: formatSessionNumber(Cesium.Math.toDegrees(viewer.camera.pitch), 2),
    roulis_deg: formatSessionNumber(Cesium.Math.toDegrees(viewer.camera.roll), 2),
  };
  return lastSessionCamera;
}

// Sections ordonnées : [{ name, help?, entries: [[clé, valeur, aide?]] }].
function buildSessionSections() {
  const sections = [];
  const section = (name, help) => {
    const s = { name, help, entries: [] };
    sections.push(s);
    return s;
  };

  const cam = captureCameraForSession();
  const camera = section("camera", "Vue libre (hors suivi d'un objet)");
  camera.entries.push(
    ["longitude_deg", cam.longitude_deg],
    ["latitude_deg", cam.latitude_deg],
    ["altitude_km", cam.altitude_km, "Altitude de la caméra"],
    ["cap_deg", cam.cap_deg, "0 = nord en haut"],
    ["tangage_deg", cam.tangage_deg, "-90 = regard vertical vers le sol"],
    ["roulis_deg", cam.roulis_deg],
  );

  const temps = section("temps");
  temps.entries.push(
    ["acceleration", formatSessionNumber(viewer.clock.multiplier, 3), "1 = temps réel"],
    ["en_marche", viewer.clock.shouldAnimate ? "1" : "0", "0 = horloge en pause"],
  );

  SESSION_CONTROLS.forEach(control => {
    const el = document.getElementById(control.id);
    if (!el) return;
    const s = sections.find(x => x.name === control.section) || section(control.section);
    s.entries.push([control.key, controlSessionValue(el), controlHelp(control, el)]);
  });

  const affichage = sections.find(x => x.name === "affichage") || section("affichage");
  const visibleLayers = Array.from(atmosphereLayersListEl.querySelectorAll(".atmoLayerCheckbox:checked")).map(cb => cb.dataset.layerId);
  affichage.entries.push(["couches_atmosphere", visibleLayers.join(", "),
    `Couches d'atmosphère visibles (${ATMOSPHERE_LAYERS.map(l => l.id).join(", ")})`]);

  const catalogue = section("catalogue", "Objets affichés");
  catalogue.entries.push(
    ["groupes_masques", Array.from(hiddenGroups).join(", "),
      `Groupes chargés mais masqués (ids d'onglet du Sheet, ${MANUAL_GROUP_KEY} = ajouts manuels)`],
    ["pays", Array.from(catalogFilters.countries).join(", "), "Filtre pays (codes SATCAT), vide = tous"],
    ["types", Array.from(catalogFilters.objectTypes).join(", "), "Filtre type d'objet (PAYLOAD, ROCKET BODY, DEBRIS...), vide = tous"],
  );

  const dockState = loadDockUiState();
  Object.keys(dockState).sort().forEach(panelId => {
    const saved = dockState[panelId] || {};
    const s = section(`fenetre.${panelId}`);
    Object.entries(saved).forEach(([field, value]) => {
      const key = SESSION_PANEL_KEYS[field] || field;
      if (field === "open") s.entries.push([key, value ? "1" : "0"]);
      else if (field === "left" || field === "top") s.entries.push([key, String(value).replace(/px$/, ""), "pixels"]);
      else s.entries.push([key, String(value)]);
    });
  });

  return sections;
}

function sessionSectionsToIni(sections, savedAtIso) {
  const lines = [
    "; Shepherd — session (disposition, réglages, objets affichés)",
    "; Modifiable à la main : enregistre puis recharge la page.",
    "; Booléens : 1 / 0. Listes : séparées par des virgules. Commentaires : ;",
    "",
    "[session]",
    "version = 1",
    `sauvegarde = ${savedAtIso}`,
  ];
  sections.forEach(s => {
    lines.push("");
    if (s.help) lines.push(`; ${s.help}`);
    lines.push(`[${s.name}]`);
    const width = Math.max(...s.entries.map(([k]) => k.length), 0);
    s.entries.forEach(([key, value, help]) => {
      lines.push(`${key.padEnd(width)} = ${value}${help ? `    ; ${help}` : ""}`);
    });
  });
  return lines.join("\n") + "\n";
}

function parseIni(text) {
  const out = {};
  let current = null;
  String(text).split(/\r?\n/).forEach(raw => {
    const line = raw.trim();
    if (!line || line.startsWith(";") || line.startsWith("#")) return;
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      current = sectionMatch[1].trim();
      out[current] = out[current] || {};
      return;
    }
    const eq = line.indexOf("=");
    if (eq === -1 || !current) return;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).replace(/\s+;.*$/, "").trim();
    out[current][key] = value;
  });
  return out;
}

// Contenu sans commentaires ni date de sauvegarde : sert à savoir si deux
// versions du fichier décrivent la même session.
function sessionFingerprint(parsed) {
  const copy = JSON.parse(JSON.stringify(parsed || {}));
  if (copy.session) delete copy.session.sauvegarde;
  return JSON.stringify(Object.keys(copy).sort().map(k => [k, Object.keys(copy[k]).sort().map(f => [f, copy[k][f]])]));
}

function readLocalSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null; // { savedAt, ini }
  } catch (err) {
    console.warn("Session locale illisible, ignorée:", err);
    return null;
  }
}

function writeLocalSession(ini, savedAtMs) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ savedAt: savedAtMs, ini }));
  } catch (err) {
    console.warn("Impossible d'enregistrer la session:", err);
  }
}

// ---------- Application d'une session ----------

// Fenêtres : réécrit l'état du dock lu par restoreDockUiState juste après.
function applySessionDock(parsed) {
  const state = {};
  const fieldByKey = Object.fromEntries(Object.entries(SESSION_PANEL_KEYS).map(([f, k]) => [k, f]));
  Object.entries(parsed).forEach(([sectionName, values]) => {
    if (!sectionName.startsWith("fenetre.")) return;
    const panelId = sectionName.slice("fenetre.".length);
    const saved = {};
    Object.entries(values).forEach(([key, value]) => {
      const field = fieldByKey[key] || key;
      if (field === "open") saved.open = parseSessionBool(value);
      else if ((field === "left" || field === "top") && value !== "") saved[field] = /px$/.test(value) ? value : `${value}px`;
      else saved[field] = value;
    });
    state[panelId] = saved;
  });
  if (Object.keys(state).length > 0) saveDockUiState(state);
}

function applySessionCamera(parsed) {
  const cam = parsed.camera || {};
  const lon = Number(cam.longitude_deg), lat = Number(cam.latitude_deg), altKm = Number(cam.altitude_km);
  if (![lon, lat, altKm].every(Number.isFinite) || cam.longitude_deg === "" || cam.altitude_km === "") return;
  const deg = v => (Number.isFinite(Number(v)) && v !== "" ? Cesium.Math.toRadians(Number(v)) : undefined);
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, Math.max(altKm, 0.1) * 1000),
    orientation: { heading: deg(cam.cap_deg) ?? 0, pitch: deg(cam.tangage_deg) ?? -Cesium.Math.PI_OVER_TWO, roll: deg(cam.roulis_deg) ?? 0 },
  });
}

function applySessionControls(parsed) {
  const temps = parsed.temps || {};
  const multiplier = Number(temps.acceleration);
  if (temps.acceleration !== undefined && temps.acceleration !== "" && Number.isFinite(multiplier)) viewer.clock.multiplier = multiplier;
  if (temps.en_marche !== undefined && temps.en_marche !== "") viewer.clock.shouldAnimate = parseSessionBool(temps.en_marche);

  SESSION_CONTROLS.forEach(control => {
    const value = (parsed[control.section] || {})[control.key];
    const el = document.getElementById(control.id);
    if (value === undefined || !el) return;
    if (el.type === "checkbox") {
      const checked = parseSessionBool(value);
      if (el.checked === checked) return;
      el.checked = checked;
    } else {
      if (el.tagName === "SELECT" && !Array.from(el.options).some(o => o.value === value)) return;
      if (el.value === value) return;
      el.value = value;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });

  const affichage = parsed.affichage || {};
  if (affichage.couches_atmosphere !== undefined) {
    const visible = new Set(splitList(affichage.couches_atmosphere));
    atmosphereLayersListEl.querySelectorAll(".atmoLayerCheckbox").forEach(cb => {
      const checked = visible.has(cb.dataset.layerId);
      if (cb.checked === checked) return;
      cb.checked = checked;
      cb.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  const catalogue = parsed.catalogue || {};
  if (catalogue.groupes_masques !== undefined) {
    hiddenGroups.clear();
    splitList(catalogue.groupes_masques).forEach(id => hiddenGroups.add(id));
  }
}

// Une fois les objets chargés : filtres SATCAT, orbites tracées, objet suivi.
async function applySessionObjects(parsed) {
  const catalogue = parsed.catalogue || {};
  const countries = splitList(catalogue.pays);
  const types = splitList(catalogue.types);
  if (countries.length > 0 || types.length > 0) {
    try {
      await fetchSatcatIndex();
      catalogFilters.countries = new Set(countries);
      catalogFilters.objectTypes = new Set(types);
      renderCatalogCountryFilter();
      renderCatalogTypeFilter();
      catalogCountryFilterEl.style.display = "";
      catalogTypeFilterEl.style.display = "";
      catalogLoadSatcatBtnEl.style.display = "none";
      rebuildScene();
    } catch (err) {
      console.warn("Filtres pays/type de la session non appliqués (SATCAT indisponible):", err);
    }
  }
  applyGroupVisibility();

  // Objet suivi et orbites tracées ne sont volontairement pas restaurés :
  // chaque lancement démarre sans objet mis en avant.
}

// ---------- Fichier lié (File System Access API, Chrome / Edge) ----------
const sessionFileBtnEl = document.getElementById("sessionFileBtn");
const SESSION_FILE_SUPPORTED = typeof window.showSaveFilePicker === "function";
let sessionFileHandle = null;
let sessionFileWritable = false;
let sessionFileWriteChain = Promise.resolve();

const loadSessionFileHandle = () => shepherdDbOp("handles", "readonly", store => store.get("sessionFile"));
const storeSessionFileHandle = handle => shepherdDbOp("handles", "readwrite", store => store.put(handle, "sessionFile"));

function renderSessionFileBtn() {
  if (!sessionFileBtnEl) return;
  sessionFileBtnEl.classList.toggle("sessionFileLinked", !!sessionFileHandle && sessionFileWritable);
  sessionFileBtnEl.classList.toggle("sessionFilePending", !!sessionFileHandle && !sessionFileWritable);
  let title;
  if (!SESSION_FILE_SUPPORTED) title = `Télécharger la session (${SESSION_FILE_NAME}) — liaison automatique : Chrome ou Edge`;
  else if (!sessionFileHandle) title = `Lier un fichier de session (${SESSION_FILE_NAME}) : enregistré en continu, modifiable à la main`;
  else if (!sessionFileWritable) title = `Fichier de session ${sessionFileHandle.name} : clic pour autoriser l'écriture`;
  else title = `Session enregistrée en continu dans ${sessionFileHandle.name} · clic : enregistrer maintenant · Alt+clic : changer de fichier`;
  sessionFileBtnEl.title = title;
  sessionFileBtnEl.setAttribute("aria-label", title);
}

function writeSessionFile(ini) {
  if (!sessionFileHandle || !sessionFileWritable) return Promise.resolve();
  sessionFileWriteChain = sessionFileWriteChain.then(async () => {
    try {
      const writable = await sessionFileHandle.createWritable();
      await writable.write(ini);
      await writable.close();
    } catch (err) {
      console.warn("Écriture du fichier de session impossible:", err);
      sessionFileWritable = false;
      renderSessionFileBtn();
    }
  });
  return sessionFileWriteChain;
}

async function requestSessionFilePermission() {
  if (!sessionFileHandle) return false;
  try {
    sessionFileWritable = (await sessionFileHandle.requestPermission({ mode: "readwrite" })) === "granted";
  } catch (err) {
    sessionFileWritable = false;
  }
  renderSessionFileBtn();
  return sessionFileWritable;
}

async function linkSessionFile() {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: SESSION_FILE_NAME,
      types: [{ description: "Session Shepherd", accept: { "text/plain": [".ini"] } }],
    });
    sessionFileHandle = handle;
    sessionFileWritable = true;
    await storeSessionFileHandle(handle);
  } catch (err) {
    if (err.name !== "AbortError") console.error("Liaison du fichier de session:", err);
  }
  renderSessionFileBtn();
}

function downloadSessionFile(ini) {
  const url = URL.createObjectURL(new Blob([ini], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = SESSION_FILE_NAME;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Fichier à relire au lancement : celui lié s'il est lisible sans demander
// d'autorisation, sinon celui servi à côté de index.html.
async function readSessionFile() {
  if (sessionFileHandle) {
    try {
      if ((await sessionFileHandle.queryPermission({ mode: "read" })) === "granted") {
        const file = await sessionFileHandle.getFile();
        return { text: await file.text(), mtime: file.lastModified };
      }
    } catch (err) {
      console.warn("Fichier de session lié illisible:", err);
    }
  }
  try {
    const res = await fetch(SESSION_FILE_NAME, { cache: "no-store" });
    if (!res.ok) return null;
    const lastModified = Date.parse(res.headers.get("Last-Modified") || "");
    return { text: await res.text(), mtime: Number.isFinite(lastModified) ? lastModified : 0 };
  } catch (err) {
    return null;
  }
}

// ---------- Sauvegarde continue ----------
let sessionAutosaveEnabled = false;
let lastSessionFingerprint = null;

function saveSessionNow({ force = false } = {}) {
  const savedAt = new Date();
  const ini = sessionSectionsToIni(buildSessionSections(), savedAt.toISOString());
  const fingerprint = sessionFingerprint(parseIni(ini));
  if (!force && fingerprint === lastSessionFingerprint) return null;
  lastSessionFingerprint = fingerprint;
  writeLocalSession(ini, savedAt.getTime());
  writeSessionFile(ini);
  return ini;
}

setInterval(() => {
  if (sessionAutosaveEnabled) saveSessionNow();
}, SESSION_AUTOSAVE_MS);

window.addEventListener("pagehide", () => {
  if (sessionAutosaveEnabled) saveSessionNow();
});

if (sessionFileBtnEl) {
  sessionFileBtnEl.addEventListener("click", async (e) => {
    if (!SESSION_FILE_SUPPORTED) {
      downloadSessionFile(saveSessionNow({ force: true }));
      return;
    }
    if (!sessionFileHandle || e.altKey) await linkSessionFile();
    else if (!sessionFileWritable) await requestSessionFilePermission();
    if (sessionFileWritable) saveSessionNow({ force: true });
  });
}

// Autorisation d'écriture perdue au redémarrage du navigateur : redemandée
// au premier clic (le navigateur n'accepte la demande qu'après un geste).
document.addEventListener("pointerdown", function regrantSessionFileOnce(e) {
  if (!sessionFileHandle || sessionFileWritable) return;
  if (sessionFileBtnEl && sessionFileBtnEl.contains(e.target)) return;
  document.removeEventListener("pointerdown", regrantSessionFileOnce, true);
  // Le fichier a pu être modifié à la main pendant qu'il était illisible :
  // on le relit avant de l'écraser.
  requestSessionFilePermission().then(async ok => {
    if (ok && !(await adoptNewerSessionFile())) saveSessionNow({ force: true });
  });
}, true);

// ---------- Restauration au lancement ----------
const restoredSession = (() => {
  if (DEMO_MODE) return null;
  const local = readLocalSession();
  return local ? { savedAt: local.savedAt, parsed: parseIni(local.ini) } : null;
})();

if (restoredSession) {
  applySessionDock(restoredSession.parsed);
  applySessionCamera(restoredSession.parsed);
  applySessionControls(restoredSession.parsed);
}

(async function syncSessionFileAtStartup() {
  if (DEMO_MODE) {
    if (sessionFileBtnEl) {
      lockDemoControl(sessionFileBtnEl, "Session file",
        "Continuously saves the layout, filters and tracked objects to a file, to pick up later.");
    }
    return;
  }
  if (SESSION_FILE_SUPPORTED) {
    try {
      sessionFileHandle = (await loadSessionFileHandle()) || null;
      if (sessionFileHandle) {
        sessionFileWritable = (await sessionFileHandle.queryPermission({ mode: "readwrite" })) === "granted";
      }
    } catch (err) {
      console.warn("Fichier de session lié introuvable:", err);
      sessionFileHandle = null;
    }
  }
  renderSessionFileBtn();
  await adoptNewerSessionFile();
})();

// Fichier plus récent que la session locale et différent d'elle (modifié à
// la main) : il devient la session et la page recharge. Renvoie true si la
// page va recharger.
async function adoptNewerSessionFile() {
  const file = await readSessionFile();
  if (!file) return false;
  const parsed = parseIni(file.text);
  if (!parsed.session) return false; // pas un fichier de session (ex. page d'erreur)
  const local = readLocalSession();
  const localParsed = local ? parseIni(local.ini) : null;
  const differs = !localParsed || sessionFingerprint(parsed) !== sessionFingerprint(localParsed);
  const newer = file.mtime === 0 ? !local : file.mtime > (local ? local.savedAt : 0) + SESSION_MTIME_TOLERANCE_MS;
  if (!differs || !newer) return false;
  // Garde-fou : une seule recharge par version du fichier.
  const marker = `${file.mtime}:${file.text.length}`;
  try {
    if (sessionStorage.getItem(SESSION_RELOAD_FLAG_KEY) === marker) return false;
    sessionStorage.setItem(SESSION_RELOAD_FLAG_KEY, marker);
  } catch (err) { /* sessionStorage indisponible : recharge quand même */ }
  sessionAutosaveEnabled = false;
  writeLocalSession(file.text, Date.now());
  location.reload();
  return true;
}

(function restoreDockUiState() {
  // La démo repart toujours de la disposition par défaut.
  const state = DEMO_MODE ? {} : loadDockUiState();
  if (Object.keys(state).length === 0) {
    DEFAULT_OPEN_PANELS.forEach(panelId => setPanelOpen(panelId, true));
    return;
  }
  Object.keys(state).forEach(panelId => {
    const saved = state[panelId];
    const panelEl = document.getElementById(panelId);
    if (!panelEl || !saved) return;
    if (saved.left && saved.top) {
      panelEl.style.left = saved.left;
      panelEl.style.top = saved.top;
      panelEl.style.right = "auto";
      panelEl.style.bottom = "auto";
      panelEl.style.transform = "none";
    }
    if (saved.open) setPanelOpen(panelId, true);
  });
  // La disposition verticale du dock n'est pas persistée comme un booléen à
  // part : on la recalcule simplement depuis la position restaurée.
  if (state.dock) updateDockOrientation();
})();

// Les panneaux HTML (distances / risques) n'ont pas besoin d'être reconstruits
// à 60 fps comme les positions 3D : ça remplaçait le DOM en continu (clignotement
// visible dans DevTools) et empêchait les clics de se poser correctement sur les
// boutons. On les limite à ~3 rendus/seconde, largement suffisant pour du texte.
const PANEL_RENDER_INTERVAL_MS = 300;
let lastPanelRenderMs = 0;

// Recalculer la position SGP4 de chaque objet (+ réécrire sa position sur son
// entité Cesium) à chaque frame de rendu est ce qui fait chuter le FPS sur les
// grosses constellations (Starlink ~6000 objets × jusqu'à 60 fois/seconde) —
// mais pour une poignée d'objets ce recalcul est quasi gratuit, et le limiter
// quand même ne fait que rendre le mouvement moins fluide (sauts toutes les
// 100ms) sans aucun gain de FPS mesurable. Le throttle ne s'applique donc
// qu'au-delà d'un seuil où le coût du recalcul devient réellement le goulot
// d'étranglement ; en dessous, comportement identique à avant (recalcul à
// chaque tick).
const SCENE_UPDATE_INTERVAL_MS = 100;
const SCENE_UPDATE_THROTTLE_THRESHOLD = 1500;
let lastSceneUpdateMs = 0;

function updateTrackedPositionNow(jsDate) {
  const tracked = getTrackedRecord();
  if (!tracked || !tracked.workerPropagated) return;
  const pos = getPositionAtTime(tracked, jsDate, jsDate.getTime() / 1000);
  if (!pos) return;
  Cesium.Cartesian3.clone(pos, tracked.positionCartesian);
  tracked.hasPosition = true;
  tracked.point.position = tracked.positionCartesian;
  if (tracked.label) tracked.label.position = tracked.positionCartesian;
}

viewer.clock.onTick.addEventListener((clock) => {
  const tickDate = Cesium.JulianDate.toDate(clock.currentTime);
  requestWorkerPropagation(tickDate);
  updateTrackedPositionNow(tickDate);
  const nowMs = performance.now();
  if (satRecords.length > SCENE_UPDATE_THROTTLE_THRESHOLD && nowMs - lastSceneUpdateMs < SCENE_UPDATE_INTERVAL_MS) {
    return;
  }
  lastSceneUpdateMs = nowMs;

  const jsDate = Cesium.JulianDate.toDate(clock.currentTime);
  const t = jsDate.getTime() / 1000;

  // Rien de tout ce qui suit ne doit tourner pour un panneau que l'utilisateur
  // n'a pas ouvert : ça ne sert à rien à l'écran et ça coûte du calcul pour
  // rien (le calcul de risque par paires, O(n²), est le plus cher des trois).
  const distancePanelVisible = distancePanelEl.classList.contains("dockOpen");
  const riskPanelVisible = sidePanelEl.classList.contains("dockOpen");
  const orbitalParamsPanelVisible = orbitalParamsPanelEl.classList.contains("dockOpen");

  const distances = [];
  satRecords.forEach(r => {
    let pos;
    if (r.workerPropagated) {
      pos = r.hasPosition ? r.positionCartesian : null;
    } else {
      pos = getPositionAtTime(r, jsDate, t);
      if (pos) {
        r.positionCartesian = pos;
        r.hasPosition = true;
        r.point.position = pos;
        if (r.label) r.label.position = pos;
      }
    }
    if (pos && r.inAltitudeRange !== false && !r.groupHidden) {
      if (distancePanelVisible && selectedReferenceSite) {
        const distanceKm = Cesium.Cartesian3.distance(selectedReferenceSite.position, pos) / 1000;
        distances.push({ name: r.name, distanceKm, record: r, catnr: r.catnr });
      }
    }
  });

  if (distancePanelVisible) distances.sort((a, b) => a.distanceKm - b.distanceKm);

  const objectCountAllowsRisk = satRecords.length <= MAX_OBJECTS_FOR_PAIRWISE_RISK;
  const riskPairs = [];
  if (riskPanelVisible) {
    satRecords.forEach(r => { r.minPeerDistanceKm = Infinity; });
    if (objectCountAllowsRisk) {
      for (let i = 0; i < satRecords.length; i++) {
        for (let j = i + 1; j < satRecords.length; j++) {
          const a = satRecords[i];
          const b = satRecords[j];
          const d = Cesium.Cartesian3.distance(a.positionCartesian, b.positionCartesian) / 1000;
          if (d < a.minPeerDistanceKm) a.minPeerDistanceKm = d;
          if (d < b.minPeerDistanceKm) b.minPeerDistanceKm = d;
          if (d < COLLISION_RISK_KM) riskPairs.push({ nameA: a.name, nameB: b.name, distanceKm: d });
        }
      }
    }
    satRecords.forEach(r => { r.inCollisionRisk = r.minPeerDistanceKm < COLLISION_RISK_KM; });

    riskPairs.forEach(p => { p.key = `${p.nameA}::${p.nameB}`; });

    // Journal des risques : une ligne par épisode (transition "pas de risque" ->
    // "risque" jusqu'à la sortie du seuil), avec la distance minimale observée.
    // Ne tourne donc, comme le reste, que panneau ouvert — le journal aura un
    // trou pour toute période où le panneau était fermé.
    const activeRiskKeys = new Set();
    riskPairs.forEach(p => {
      activeRiskKeys.add(p.key);
      const episode = activeRiskEpisodes.get(p.key);
      if (!episode) {
        activeRiskEpisodes.set(p.key, {
          nameA: p.nameA,
          nameB: p.nameB,
          startTime: jsDate.toISOString(),
          minDistanceKm: p.distanceKm,
        });
      } else if (p.distanceKm < episode.minDistanceKm) {
        episode.minDistanceKm = p.distanceKm;
      }
    });
    for (const [key, episode] of activeRiskEpisodes) {
      if (!activeRiskKeys.has(key)) {
        riskLog.push({
          startTime: episode.startTime,
          endTime: jsDate.toISOString(),
          nameA: episode.nameA,
          nameB: episode.nameB,
          minDistanceKm: episode.minDistanceKm,
        });
        activeRiskEpisodes.delete(key);
        saveRiskLogToStorage();
        updateRiskLogCount();
      }
    }

    const currentPairKeys = new Set(riskPairs.map(p => p.key));
    for (const key of checkedRiskPairs) {
      if (!currentPairKeys.has(key)) checkedRiskPairs.delete(key);
    }
    isolatedNames = new Set();
    for (const key of checkedRiskPairs) {
      const [nameA, nameB] = key.split("::");
      isolatedNames.add(nameA);
      isolatedNames.add(nameB);
    }
  } else {
    satRecords.forEach(r => { r.inCollisionRisk = false; });
  }
  updateSatPrimitiveStyles();
  updateDebrisStationLinks();

  if (nowMs - lastPanelRenderMs >= PANEL_RENDER_INTERVAL_MS) {
    lastPanelRenderMs = nowMs;

    if (orbitalParamsPanelVisible) refreshOrbitalParamsValues();

    if (riskPanelVisible && sidePanelContentEl) {
      if (!objectCountAllowsRisk) {
        sidePanelContentEl.innerHTML = `<div class="distNone">Disabled above ${MAX_OBJECTS_FOR_PAIRWISE_RISK} displayed objects (currently ${satRecords.length})</div>`;
      } else if (riskPairs.length === 0) {
        sidePanelContentEl.innerHTML = `<div class="distNone">No risk detected</div>`;
      } else {
        riskPairs.sort((a, b) => a.distanceKm - b.distanceKm);
        sidePanelContentEl.innerHTML = riskPairs
          .map(p => {
            const checked = checkedRiskPairs.has(p.key) ? "checked" : "";
            return `<div class="riskPairRow"><input type="checkbox" class="riskPairCheckbox" data-pair-key="${p.key}" ${checked}><span class="riskPairNames">${p.nameA} ↔ ${p.nameB}</span><span class="distRed">${p.distanceKm.toFixed(0)} km</span></div>`;
          })
          .join("");
      }
    }

    if (distancePanelVisible) renderDistancePanel(distances);
  }
});

// ---------- Conjonctions : point de plus courte approche et Pc ----------
// Criblage asymétrique : les objets "à protéger" (un groupe ou la
// sélection) contre tous les autres objets TLE chargés, sur un horizon
// donné à partir de l'instant affiché. Même démarche que les analyses de
// conjonction opérationnelles, en simplifié :
//   1. filtre périgée/apogée : on écarte les paires dont les tranches
//      d'altitude ne se recouvrent pas ;
//   2. échantillonnage SGP4 toutes les CONJ_STEP_S secondes ; à chaque
//      minimum local de distance, extrapolation linéaire (position +
//      vitesse relatives) pour écarter les passages lointains ;
//   3. recherche du TCA (time of closest approach) par section dorée ;
//   4. probabilité de collision Pc par la méthode de Foster (intégrale 2D
//      de la densité gaussienne dans le plan de rencontre sur un disque de
//      rayon CONJ_HARD_BODY_RADIUS_KM), covariances estimées par tleSigmaKm.
// Les objets synthétiques n'y sont pas inclus (pas de TLE).
const CONJ_STEP_S = 60;
const CONJ_REPORT_KM = 5;                // distance de passage maximale retenue
const CONJ_HARD_BODY_RADIUS_KM = 0.02;   // rayon combiné des deux objets (20 m)
const CONJ_ALTITUDE_PAD_KM = 30;         // marge du filtre périgée/apogée
const CONJ_MAX_PAIR_STEPS = 2.5e9;       // au-delà, on demande de réduire le périmètre
const CONJ_MAX_RESULTS = 150;
// Seuils usuels (NASA CARA) : Pc ≥ 1e-4 rouge, ≥ 1e-7 jaune.
const CONJ_PC_RED = 1e-4;
const CONJ_PC_YELLOW = 1e-7;
const CONJ_SELECTION_KEY = "__selection__";
const CONJ_LEAD_TIME_MS = 10_000; // l'horloge est placée ce délai avant le TCA

const CONJUNCTION_WORKER_SOURCE = `
const MU = 398600.4418, RE = 6378.137;
function epochMsFromLine1(l1) {
  const yy = Number(l1.substring(18, 20)), day = Number(l1.substring(20, 32));
  const year = yy < 57 ? 2000 + yy : 1900 + yy;
  return Date.UTC(year, 0, 1) + (day - 1) * 86400000;
}
function sigmaAt(cfg, ageDays) {
  const d = Math.abs(ageDays);
  return [cfg.s0.radial + cfg.ds.radial * d, cfg.s0.along + cfg.ds.along * d, cfg.s0.cross + cfg.ds.cross * d];
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => Math.sqrt(dot(a, a));
const unit = a => { const n = norm(a); return [a[0] / n, a[1] / n, a[2] / n]; };
function ricBasis(r, v) {
  const R = unit(r), C = unit(cross(r, v)), I = cross(C, R);
  return [R, I, C];
}
// Covariance inertielle 3x3 d'un objet à partir de ses écarts-types RIC.
function covariance(r, v, sig) {
  const B = ricBasis(r, v);
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[i][j] += sig[k] * sig[k] * B[k][i] * B[k][j];
  return M;
}
const quad = (M, a, b) => { let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += a[i] * M[i][j] * b[j]; return s; };
// erfc à précision relative ~1e-7 (Numerical Recipes, erfcc).
function erfc(x) {
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806
    + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}
// P(a < N(0,1) < b), stable dans les queues.
function normalInterval(a, b) {
  const s = Math.SQRT1_2;
  if (a >= 0) return 0.5 * (erfc(a * s) - erfc(b * s));
  if (b <= 0) return 0.5 * (erfc(-b * s) - erfc(-a * s));
  return 1 - 0.5 * erfc(b * s) - 0.5 * erfc(-a * s);
}
// Foster : intégrale de N(m, P) sur le disque de rayon R centré à l'origine.
function collisionProbability(mx, my, pxx, pxy, pyy, R) {
  const th = 0.5 * Math.atan2(2 * pxy, pxx - pyy);
  const c = Math.cos(th), s = Math.sin(th);
  const s1 = Math.sqrt(Math.max(1e-12, c * c * pxx + 2 * c * s * pxy + s * s * pyy));
  const s2 = Math.sqrt(Math.max(1e-12, s * s * pxx - 2 * c * s * pxy + c * c * pyy));
  const m1 = c * mx + s * my, m2 = -s * mx + c * my;
  const n = 200, h = 2 * R / n;
  let sum = 0;
  for (let k = 0; k <= n; k++) {
    const x = -R + k * h;
    const half = Math.sqrt(Math.max(0, R * R - x * x));
    const fx = Math.exp(-0.5 * ((x - m1) / s1) ** 2) / (Math.sqrt(2 * Math.PI) * s1)
      * normalInterval((-half - m2) / s2, (half - m2) / s2);
    sum += fx * (k === 0 || k === n ? 1 : k % 2 ? 4 : 2);
  }
  return sum * h / 3;
}

onmessage = (e) => {
  const job = e.data;
  importScripts(job.satelliteUrl);
  const objs = job.objects.map(o => {
    let satrec = null;
    try { satrec = satellite.twoline2satrec(o.l1, o.l2); } catch (err) { satrec = null; }
    if (!satrec || satrec.error) return null;
    const n = satrec.no / 60, a = Math.cbrt(MU / (n * n));
    return { name: o.name, catnr: o.catnr, satrec, epochMs: epochMsFromLine1(o.l1),
      perigee: a * (1 - satrec.ecco) - RE, apogee: a * (1 + satrec.ecco) - RE };
  });
  const prim = job.primaryIdx.filter(i => objs[i]);
  const sec = job.secondaryIdx.filter(i => objs[i]);

  // 1. Filtre périgée / apogée.
  const pairsA = [], pairsB = [];
  for (const i of prim) {
    const a = objs[i];
    for (const j of sec) {
      const b = objs[j];
      if (a.catnr !== undefined && a.catnr === b.catnr) continue;
      if (Math.max(a.perigee, b.perigee) - Math.min(a.apogee, b.apogee) > job.altitudePadKm) continue;
      pairsA.push(i); pairsB.push(j);
    }
  }
  const nSteps = Math.floor(job.horizonS / job.stepS) + 1;
  const nPairs = pairsA.length;
  postMessage({ type: "progress", text: nPairs + " pairs after altitude filter (out of " + prim.length * sec.length + ")" });
  if (nPairs * nSteps > job.maxPairSteps) {
    postMessage({ type: "done", error: "Too many pairs (" + nPairs + ") for this time window: please select a smaller group or a shorter window." });
    return;
  }

  const posvel = (o, ms) => {
    const pv = satellite.propagate(o.satrec, new Date(ms));
    if (!pv || !pv.position || !pv.velocity || Number.isNaN(pv.position.x)) return null;
    return { r: [pv.position.x, pv.position.y, pv.position.z], v: [pv.velocity.x, pv.velocity.y, pv.velocity.z] };
  };

  // 2. Échantillonnage, minima locaux, préfiltre linéaire.
  const involved = Array.from(new Set(pairsA.concat(pairsB)));
  const slot = new Int32Array(objs.length).fill(-1);
  involved.forEach((idx, k) => { slot[idx] = k; });
  let cur = new Float64Array(involved.length * 6), prev = new Float64Array(involved.length * 6);
  const dPrev = new Float32Array(nPairs).fill(Infinity), dPrev2 = new Float32Array(nPairs).fill(Infinity);
  const candidates = [];
  const lastProgress = { t: Date.now() };
  for (let k = 0; k < nSteps; k++) {
    const ms = job.startMs + k * job.stepS * 1000;
    for (let m = 0; m < involved.length; m++) {
      const pv = posvel(objs[involved[m]], ms);
      const o = m * 6;
      if (!pv) { cur[o] = NaN; continue; }
      cur[o] = pv.r[0]; cur[o + 1] = pv.r[1]; cur[o + 2] = pv.r[2];
      cur[o + 3] = pv.v[0]; cur[o + 4] = pv.v[1]; cur[o + 5] = pv.v[2];
    }
    for (let p = 0; p < nPairs; p++) {
      const oa = slot[pairsA[p]] * 6, ob = slot[pairsB[p]] * 6;
      const dx = cur[ob] - cur[oa], dy = cur[ob + 1] - cur[oa + 1], dz = cur[ob + 2] - cur[oa + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      // Minimum local à l'échantillon précédent (k - 1).
      if (k >= 2 && dPrev[p] < dPrev2[p] && dPrev[p] <= d) {
        const rx = prev[ob] - prev[oa], ry = prev[ob + 1] - prev[oa + 1], rz = prev[ob + 2] - prev[oa + 2];
        const vx = prev[ob + 3] - prev[oa + 3], vy = prev[ob + 4] - prev[oa + 4], vz = prev[ob + 5] - prev[oa + 5];
        const v2 = vx * vx + vy * vy + vz * vz;
        const tau = v2 > 0 ? -(rx * vx + ry * vy + rz * vz) / v2 : 0;
        const lx = rx + vx * tau, ly = ry + vy * tau, lz = rz + vz * tau;
        // Marge pour la courbure des trajectoires sur ±1 pas.
        if (Math.sqrt(lx * lx + ly * ly + lz * lz) < job.reportKm + 20) candidates.push({ p, ms: ms - job.stepS * 1000 });
      }
      dPrev2[p] = dPrev[p];
      dPrev[p] = Number.isNaN(d) ? Infinity : d;
    }
    const swap = prev; prev = cur; cur = swap;
    if (Date.now() - lastProgress.t > 400) {
      lastProgress.t = Date.now();
      postMessage({ type: "progress", text: "Criblage " + Math.round(100 * k / nSteps) + " % · " + nPairs + " paires · " + candidates.length + " candidats" });
    }
  }

  // 3. TCA par section dorée sur ±1 pas autour du minimum échantillonné.
  const results = [];
  const gr = (Math.sqrt(5) - 1) / 2;
  for (const cnd of candidates) {
    const A = objs[pairsA[cnd.p]], B = objs[pairsB[cnd.p]];
    const dist = ms => { const a = posvel(A, ms), b = posvel(B, ms); return a && b ? norm(sub(b.r, a.r)) : Infinity; };
    let lo = cnd.ms - job.stepS * 1000, hi = cnd.ms + job.stepS * 1000;
    let x1 = hi - gr * (hi - lo), x2 = lo + gr * (hi - lo), f1 = dist(x1), f2 = dist(x2);
    for (let it = 0; it < 40 && hi - lo > 1; it++) {
      if (f1 < f2) { hi = x2; x2 = x1; f2 = f1; x1 = hi - gr * (hi - lo); f1 = dist(x1); }
      else { lo = x1; x1 = x2; f1 = f2; x2 = lo + gr * (hi - lo); f2 = dist(x2); }
    }
    const tca = (lo + hi) / 2;
    const a = posvel(A, tca), b = posvel(B, tca);
    if (!a || !b) continue;
    const dr = sub(b.r, a.r), dv = sub(b.v, a.v);
    const miss = norm(dr);
    if (miss > job.reportKm) continue;

    // 4. Pc (Foster) dans le plan de rencontre.
    const sa = sigmaAt(job.sigma, (tca - A.epochMs) / 86400000);
    const sb = sigmaAt(job.sigma, (tca - B.epochMs) / 86400000);
    const Ca = covariance(a.r, a.v, sa), Cb = covariance(b.r, b.v, sb);
    const C = Ca.map((row, i) => row.map((x, j) => x + Cb[i][j]));
    const z = unit(dv);
    const along = dot(dr, z);
    const perp = [dr[0] - along * z[0], dr[1] - along * z[1], dr[2] - along * z[2]];
    const pn = norm(perp);
    const x = pn > 1e-9 ? [perp[0] / pn, perp[1] / pn, perp[2] / pn] : unit(cross(z, [0, 0, 1]));
    const y = cross(z, x);
    const pc = collisionProbability(pn, 0, quad(C, x, x), quad(C, x, y), quad(C, y, y), job.hardBodyRadiusKm);
    const B3 = ricBasis(a.r, a.v);
    results.push({
      primary: A.name, secondary: B.name, tcaMs: tca, missKm: miss, relSpeedKmS: norm(dv),
      radialKm: dot(dr, B3[0]), alongKm: dot(dr, B3[1]), crossKm: dot(dr, B3[2]), pc,
      sigmaPrimary: sa, sigmaSecondary: sb,
    });
  }
  results.sort((r1, r2) => (r2.pc - r1.pc) || (r1.missKm - r2.missKm));
  postMessage({ type: "done", results: results.slice(0, job.maxResults), pairs: nPairs, candidates: candidates.length, found: results.length });
};`;

const conjPrimarySelectEl = document.getElementById("conjPrimarySelect");
const conjHorizonSelectEl = document.getElementById("conjHorizonSelect");
const conjRunBtnEl = document.getElementById("conjRunBtn");
const conjStatusEl = document.getElementById("conjStatus");
const conjResultsEl = document.getElementById("conjResults");
const conjClickCtaEl = document.getElementById("conjClickCta"); // démo uniquement, null sinon
let conjunctionWorker = null;
let conjunctionResults = [];
// Invite "clique sur une situation" (démo) : affichée jusqu'au premier clic sur une ligne.
let conjRowClicked = !DEMO_MODE;
const DEMO_CONJ_DEFAULT_PRIMARY_KEY = "starlink";
// Démo : Starlink reste présélectionné tant que le visiteur n'a rien choisi
// (la liste peut être remplie avant que Starlink soit chargé).
let conjPrimaryUserChosen = false;

function refreshConjunctionPrimaryOptions() {
  const previous = DEMO_MODE && !conjPrimaryUserChosen ? DEMO_CONJ_DEFAULT_PRIMARY_KEY : conjPrimarySelectEl.value;
  const counts = new Map();
  satRecords.forEach(r => {
    if (r.type !== "tle") return;
    const key = recordGroupKey(r);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const options = [`<option value="${CONJ_SELECTION_KEY}">Selected objects (${selectedOrbitNames.size})</option>`];
  Array.from(counts.entries())
    .map(([key, count]) => {
      const group = CATALOG_GROUPS.find(g => g.id === key);
      const label = key === MANUAL_GROUP_KEY ? "Added manually" : group ? group.label : key;
      return { key, label, count };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "fr"))
    .forEach(o => options.push(`<option value="${escapeHtml(o.key)}">${escapeHtml(o.label)} (${o.count})</option>`));
  conjPrimarySelectEl.innerHTML = options.join("");
  if (Array.from(conjPrimarySelectEl.options).some(o => o.value === previous)) conjPrimarySelectEl.value = previous;
}

function conjPcClass(pc) {
  if (pc >= CONJ_PC_RED) return "distRed";
  if (pc >= CONJ_PC_YELLOW) return "distYellow";
  return "distGreen";
}

function formatPc(pc) {
  return pc < 1e-12 ? "< 1e-12" : pc.toExponential(1);
}

function renderConjunctionResults() {
  if (conjClickCtaEl) conjClickCtaEl.hidden = conjRowClicked || conjunctionResults.length === 0;
  if (conjunctionResults.length === 0) {
    conjResultsEl.innerHTML = `<div class="distNone">No pass closer than ${CONJ_REPORT_KM} km</div>`;
    return;
  }
  const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const isActive = c => activeConjunction && activeConjunction.primary === c.primary
    && activeConjunction.secondary === c.secondary && activeConjunction.tcaMs === c.tcaMs;
  conjResultsEl.innerHTML = conjunctionResults.map((c, i) => `
    <div class="conjRow${isActive(c) ? " conjRowActive" : ""}${i === 0 && !conjRowClicked ? " conjRowCta" : ""}" data-conj-index="${i}" title="Click: clock set 10 s before TCA, with both orbits and the encounter point">
      <span class="conjNames"><span class="conjDot conjDotPrimary"></span>${escapeHtml(c.primary)} ↔ <span class="conjDot conjDotSecondary"></span>${escapeHtml(c.secondary)}</span>
      <span class="conjPc ${conjPcClass(c.pc)}">Pc ${formatPc(c.pc)}</span>
      <span class="conjMeta">${dateFmt.format(new Date(c.tcaMs))} · ${c.missKm < 1 ? (c.missKm * 1000).toFixed(0) + " m" : c.missKm.toFixed(2) + " km"} · ${c.relSpeedKmS.toFixed(1)} km/s</span>
      <span class="conjMeta">R ${c.radialKm.toFixed(2)} · T ${c.alongKm.toFixed(2)} · N ${c.crossKm.toFixed(2)} km · σT ${c.sigmaPrimary[1].toFixed(1)}/${c.sigmaSecondary[1].toFixed(1)} km</span>
    </div>`).join("");
}

function runConjunctionAnalysis() {
  const key = conjPrimarySelectEl.value;
  const tleRecords = satRecords.filter(r => r.type === "tle" && r.line1 && r.line2);
  const isPrimary = key === CONJ_SELECTION_KEY
    ? r => selectedOrbitNames.has(r.name)
    : r => recordGroupKey(r) === key;
  const primaryIdx = [], secondaryIdx = [];
  tleRecords.forEach((r, i) => (isPrimary(r) ? primaryIdx : secondaryIdx).push(i));
  if (primaryIdx.length === 0) {
    conjStatusEl.textContent = key === CONJ_SELECTION_KEY ? "No object selected: please click an object or select a group." : "No TLE object in this group.";
    return;
  }
  if (secondaryIdx.length === 0) {
    conjStatusEl.textContent = "No other loaded object to compare against: please load debris or other groups.";
    return;
  }
  if (conjunctionWorker) conjunctionWorker.terminate();
  try {
    const blob = new Blob([CONJUNCTION_WORKER_SOURCE], { type: "application/javascript" });
    conjunctionWorker = new Worker(URL.createObjectURL(blob));
  } catch (err) {
    conjStatusEl.textContent = "Analysis unavailable: the browser blocks the Web Worker.";
    return;
  }
  const startMs = Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime();
  const horizonS = Number(conjHorizonSelectEl.value);
  const t0 = performance.now();
  conjRunBtnEl.disabled = true;
  if (DEMO_MODE) document.getElementById("sidePanel").classList.add("ctaDone");
  conjStatusEl.textContent = `Preparing: ${primaryIdx.length} object(s) to protect against ${secondaryIdx.length}…`;
  conjunctionWorker.onmessage = e => {
    const msg = e.data;
    if (msg.type === "progress") { conjStatusEl.textContent = msg.text; return; }
    conjRunBtnEl.disabled = false;
    conjunctionWorker.terminate();
    conjunctionWorker = null;
    if (msg.error) { conjStatusEl.textContent = msg.error; return; }
    conjunctionResults = msg.results;
    const seconds = ((performance.now() - t0) / 1000).toFixed(1);
    conjStatusEl.textContent = `${msg.found} pass(es) < ${CONJ_REPORT_KM} km over ${horizonS / 3600} h · ${msg.pairs} pairs · ${seconds} s`;
    renderConjunctionResults();
  };
  conjunctionWorker.onerror = err => {
    conjRunBtnEl.disabled = false;
    conjStatusEl.textContent = `Analysis interrupted: ${err.message || err}`;
  };
  conjunctionWorker.postMessage({
    satelliteUrl: SATELLITE_JS_URL,
    objects: tleRecords.map(r => ({ name: r.name, catnr: r.catnr, l1: r.line1, l2: r.line2 })),
    primaryIdx, secondaryIdx, startMs, horizonS,
    stepS: CONJ_STEP_S,
    reportKm: CONJ_REPORT_KM,
    hardBodyRadiusKm: CONJ_HARD_BODY_RADIUS_KM,
    altitudePadKm: CONJ_ALTITUDE_PAD_KM,
    maxPairSteps: CONJ_MAX_PAIR_STEPS,
    maxResults: CONJ_MAX_RESULTS,
    sigma: { s0: TLE_SIGMA_AT_EPOCH_KM, ds: TLE_SIGMA_GROWTH_KM_PER_DAY },
  });
}

conjRunBtnEl.addEventListener("click", runConjunctionAnalysis);
conjPrimarySelectEl.addEventListener("focus", refreshConjunctionPrimaryOptions);
conjPrimarySelectEl.addEventListener("change", () => { conjPrimaryUserChosen = true; });
document.getElementById("conjunctionBlock").addEventListener("pointerenter", refreshConjunctionPrimaryOptions);
conjResultsEl.addEventListener("click", e => {
  const row = e.target.closest(".conjRow");
  if (!row) return;
  const c = conjunctionResults[Number(row.dataset.conjIndex)];
  if (!c) return;
  if (!conjRowClicked) {
    conjRowClicked = true;
    renderConjunctionResults();
  }
  if (activeConjunction && activeConjunction.data === c) exitConjunction();
  else showConjunction(c);
});

// Affiche une conjonction seule : sélection précédente effacée, horloge
// CONJ_LEAD_TIME_MS avant le TCA, trajectoire de l'objet 1 en bleu et de l'objet 2 en
// orange, caméra cadrée sur la rencontre.
function clearConjunctionMarker() {
  conjunctionMarkerEntities.forEach(e => viewer.entities.remove(e));
  conjunctionMarkerEntities = [];
}

// Point de plus courte approche : milieu des deux positions au TCA (repère
// terrestre, comme les trajectoires : c'est là que les deux tracés se
// croisent), étiquette avec l'heure, la distance et la Pc, et segment
// entre les deux objets à cet instant (visible en zoomant).
const CONJ_MARKER_COLOR = Cesium.Color.fromCssColorString("#FFFFFF");
const CONJ_MARKER_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });

function currentClockMs() {
  return Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime();
}

function formatConjCountdown(dtMs) {
  const s = Math.abs(dtMs) / 1000;
  const pad = n => String(n).padStart(2, "0");
  let t;
  if (s < 60) {
    t = `${s.toFixed(1)} s`;
  } else {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    t = h > 0 ? `${h} h ${pad(m)} min ${pad(sec)} s` : `${m} min ${pad(sec)} s`;
  }
  return dtMs >= 0 ? `Conjunction in ${t}` : `Conjunction ${t} ago`;
}

function renderConjunctionSummary(c) {
  const row = (label, value, cls = "") => `<div class="orbitalParamsRow"><span class="orbitalParamsLabel">${label}</span><span class="orbitalParamsValue ${cls}">${value}</span></div>`;
  const missText = c.missKm < 1 ? `${(c.missKm * 1000).toFixed(0)} m` : `${c.missKm.toFixed(2)} km`;
  const tca = new Date(c.tcaMs).toISOString().slice(0, 19).replace("T", " ");
  return `<div class="orbitalParamsBlock conjSummaryBlock">`
    + `<div class="orbitalParamsNameRow"><div class="orbitalParamsName">Conjunction</div>`
    + `<span class="focusBtnGroup">`
    + `<button type="button" class="groundTrackBtn conjGroundTrackBtn" title="Ground track of both objects, with the encounter point">${ICON_GROUND_TRACK}Ground track</button>`
    + `<button type="button" class="focusExitBtn conjExitBtn">Leave the situation</button>`
    + `<button type="button" class="focusIsolateBtn conjIsolateBtn${conjunctionIsolated ? " focusIsolateBtnActive" : ""}" title="Show only these two objects">Isolate</button>`
    + `</span></div>`
    + `<div class="conjCountdown">${formatConjCountdown(c.tcaMs - currentClockMs())}</div>`
    + `<div class="orbitalParamsGrid">`
    + row("TCA", `${tca} UTC`)
    + row("Miss distance", missText)
    + row("Relative speed", `${c.relSpeedKmS.toFixed(2)} km/s`)
    + row("Pc", formatPc(c.pc), conjPcClass(c.pc))
    + row("Radial (R)", `${c.radialKm.toFixed(3)} km`)
    + row("Along-track (T)", `${c.alongKm.toFixed(3)} km`)
    + row("Cross-track (N)", `${c.crossKm.toFixed(3)} km`)
    + row("σT object 1 / 2", `${c.sigmaPrimary[1].toFixed(1)} / ${c.sigmaSecondary[1].toFixed(1)} km`)
    + `</div></div>`;
}

const CONJ_COUNTDOWN_BG = Cesium.Color.fromCssColorString("#0D0F14").withAlpha(0.85);

// Trait entre la position courante d'un objet et le point de conjonction.
// Masqué tant que l'objet n'a pas de position valide ou qu'il est sur le
// point (segment dégénéré : Cesium ne sait pas le dessiner).
function addConjunctionLeadLine(record, mid, color) {
  const valid = () => record.hasPosition && isFiniteCartesian(record.positionCartesian)
    && Cesium.Cartesian3.distance(record.positionCartesian, mid) > 1;
  let lastPositions = null;
  conjunctionMarkerEntities.push(viewer.entities.add({
    name: `${record.name} → conjunction point`,
    polyline: {
      show: new Cesium.CallbackProperty(valid, false),
      positions: new Cesium.CallbackProperty(() => {
        if (valid()) lastPositions = [Cesium.Cartesian3.clone(record.positionCartesian), mid];
        return lastPositions || [mid, Cesium.Cartesian3.add(mid, new Cesium.Cartesian3(10, 0, 0), new Cesium.Cartesian3())];
      }, false),
      width: 2,
      material: color.withAlpha(0.9),
      arcType: Cesium.ArcType.NONE,
    },
  }));
  return valid;
}

function showConjunctionMarker(c, pA, pB) {
  clearConjunctionMarker();
  if (!isFiniteCartesian(pA) || !isFiniteCartesian(pB)) return;
  const mid = Cesium.Cartesian3.midpoint(pA, pB, new Cesium.Cartesian3());
  const missText = c.missKm < 1 ? `${(c.missKm * 1000).toFixed(0)} m` : `${c.missKm.toFixed(2)} km`;
  conjunctionMarkerEntities.push(viewer.entities.add({
    name: `Conjunction ${c.primary} ↔ ${c.secondary}`,
    position: mid,
    point: {
      pixelSize: 11,
      color: CONJ_MARKER_COLOR.withAlpha(0.15),
      outlineColor: CONJ_MARKER_COLOR,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: `TCA ${CONJ_MARKER_TIME_FORMAT.format(new Date(c.tcaMs))}\n${missText} · ${c.relSpeedKmS.toFixed(1)} km/s · Pc ${formatPc(c.pc)}`,
      font: "12px 'IBM Plex Mono', monospace",
      fillColor: CONJ_MARKER_COLOR,
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString("#0D0F14").withAlpha(0.85),
      backgroundPadding: new Cesium.Cartesian2(7, 5),
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(12, -10),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  }));
  conjunctionMarkerEntities.push(viewer.entities.add({
    name: "Miss distance at TCA",
    polyline: {
      positions: [pA, pB],
      width: 2,
      material: new Cesium.PolylineDashMaterialProperty({ color: CONJ_MARKER_COLOR, dashLength: 8 }),
      arcType: Cesium.ArcType.NONE,
    },
  }));

  const recA = satRecords.find(r => r.name === c.primary);
  const recB = satRecords.find(r => r.name === c.secondary);
  const validA = recA ? addConjunctionLeadLine(recA, mid, CONJ_PRIMARY_COLOR) : null;
  if (recB) addConjunctionLeadLine(recB, mid, CONJ_SECONDARY_COLOR);

  // Décompte encadré, au milieu du trait de l'objet 1.
  conjunctionMarkerEntities.push(viewer.entities.add({
    name: "Time to conjunction",
    position: new Cesium.CallbackProperty((time, result) => (validA && validA()
      ? Cesium.Cartesian3.midpoint(recA.positionCartesian, mid, result || new Cesium.Cartesian3())
      : Cesium.Cartesian3.clone(mid, result)), false),
    label: {
      text: new Cesium.CallbackProperty(() => formatConjCountdown(c.tcaMs - currentClockMs()), false),
      font: "600 13px 'IBM Plex Mono', monospace",
      fillColor: CONJ_PRIMARY_COLOR,
      showBackground: true,
      backgroundColor: CONJ_COUNTDOWN_BG,
      backgroundPadding: new Cesium.Cartesian2(8, 5),
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  }));
}

function showConjunction(c) {
  activeConjunction = null;
  clearConjunctionMarker();
  clearOrbitTrails();
  lastClickedObjectName = null;
  const tracked = getTrackedRecord();
  if (tracked && tracked.name !== c.primary && tracked.name !== c.secondary) viewer.trackedEntity = undefined;
  activeConjunction = { primary: c.primary, secondary: c.secondary, tcaMs: c.tcaMs, data: c };
  revealConjunctionGroups(c);
  // 10 s avant le TCA : à 10-15 km/s de vitesse relative, une minute avant
  // les deux objets sont encore à plusieurs centaines de km l'un de l'autre.
  const startDate = new Date(c.tcaMs - CONJ_LEAD_TIME_MS);
  viewer.clock.currentTime = Cesium.JulianDate.fromDate(startDate);
  [c.primary, c.secondary].forEach(name => setSelectedOrbit(name, { flyToOrbit: false }));
  applyConjunctionIsolation();
  renderConjunctionResults();
  setPanelOpen("orbitalParamsPanel", true, { persist: false });
  updateOrbitalParamsPanel();

  const records = [c.primary, c.secondary].map(name => satRecords.find(r => r.name === name)).filter(Boolean);
  const points = records.map(r => getPositionAtTime(r, new Date(c.tcaMs), c.tcaMs / 1000)).filter(Boolean);
  if (points.length === 2) showConjunctionMarker(c, points[0], points[1]);
  if (points.length > 0) {
    const sphere = Cesium.BoundingSphere.fromPoints(points);
    sphere.radius = Math.max(sphere.radius, 150_000);
    // Après le retour éventuel à la vue globale déclenché par la fin du suivi.
    setTimeout(() => viewer.camera.flyToBoundingSphere(sphere, { duration: 1.2 }), 50);
  }
}

const conjIsolateCheckboxEl = document.getElementById("conjIsolateCheckbox");
conjIsolateCheckboxEl.addEventListener("change", () => {
  conjunctionIsolated = conjIsolateCheckboxEl.checked;
  applyConjunctionIsolation();
  updateOrbitalParamsPanel();
});

function exitConjunction() {
  const tracked = getTrackedRecord();
  if (tracked && isConjunctionMember(tracked.name)) viewer.trackedEntity = undefined;
  clearConjunctionDisplay();
}
refreshConjunctionPrimaryOptions();

// ---------- Survol d'un objet en orbite : nom + vitesse ----------
// Bulle personnalisée plutôt que l'infoBox Cesium par défaut (désactivée,
// voir la config du viewer) — cohérente avec le reste de la DA, et limitée
// aux satellites (entityToRecord ne contient que ceux-là, pas les sites sol).
const objectHoverTooltipEl = document.getElementById("objectHoverTooltip");
const objectHoverHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

// scene.pick relance un rendu de sélection de toute la scène : limité à ~10 fois par seconde.
const HOVER_PICK_INTERVAL_MS = 100;
let lastHoverPickMs = 0;

objectHoverHandler.setInputAction((movement) => {
  const nowMs = performance.now();
  if (nowMs - lastHoverPickMs < HOVER_PICK_INTERVAL_MS) return;
  lastHoverPickMs = nowMs;
  const { record, site } = pickSceneObject(movement.endPosition);
  viewer.scene.canvas.style.cursor = record || site ? "pointer" : "";
  if (site) {
    objectHoverTooltipEl.innerHTML = `<div class="objectHoverName">${site.name}</div>`
      + `<div class="objectHoverSpeed">Click: close-up view of the site</div>`;
    objectHoverTooltipEl.style.left = `${movement.endPosition.x + 16}px`;
    objectHoverTooltipEl.style.top = `${movement.endPosition.y + 16}px`;
    objectHoverTooltipEl.style.display = "block";
    return;
  }
  if (!record) {
    objectHoverTooltipEl.style.display = "none";
    return;
  }

  const jsDate = Cesium.JulianDate.toDate(viewer.clock.currentTime);
  const speedKmS = getObjectSpeedKmS(record, jsDate);
  objectHoverTooltipEl.innerHTML = `<div class="objectHoverName">${record.name}</div>`
    + (speedKmS !== null ? `<div class="objectHoverSpeed">${speedKmS.toFixed(2)} km/s</div>` : "");
  objectHoverTooltipEl.style.left = `${movement.endPosition.x + 16}px`;
  objectHoverTooltipEl.style.top = `${movement.endPosition.y + 16}px`;
  objectHoverTooltipEl.style.display = "block";
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// Clic sur un objet : même effet que l'icône caméra du panneau Distance.
objectHoverHandler.setInputAction((click) => {
  const { record, site } = pickSceneObject(click.position);
  if (site) {
    flyToSite(site);
    return;
  }
  if (!record) return;
  if (record.entity && viewer.trackedEntity === record.entity) enterFocusMode();
  else toggleTrackObject(record.name);
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// ---------- Mode suivi ----------
// Pendant le suivi d'un objet, seuls les panneaux utiles au suivi restent à
// l'écran ; ceux ouverts avant sont rouverts à la sortie. Rien n'est
// persisté (persist: false) pour ne pas écraser la disposition enregistrée.
const FOCUS_PANEL_IDS = ["orbitalParamsPanel", "customVectorPanel", "trailPanel"];
let focusRestorePanelIds = null;

function enterFocusMode() {
  if (!focusRestorePanelIds) {
    // En démo, les panneaux du suivi sont verrouillés : on garde ceux ouverts.
    focusRestorePanelIds = DEMO_MODE ? [] : Array.from(document.querySelectorAll(".dockManaged.dockOpen")).map(el => el.id);
    focusRestorePanelIds.forEach(id => setPanelOpen(id, false, { persist: false }));

    // Sans position glissée à la main, les paramètres orbitaux reprennent
    // leur place par défaut en bord d'écran.
    const saved = loadDockUiState().orbitalParamsPanel;
    if (!saved || !saved.left) {
      ["left", "top", "right", "bottom", "transform"].forEach(prop => { orbitalParamsPanelEl.style[prop] = ""; });
    }
  }
  // Hors du if : les panneaux du suivi ont pu être fermés à la main pendant
  // le suivi, on les rouvre à chaque nouvel objet suivi.
  FOCUS_PANEL_IDS.forEach(id => setPanelOpen(id, true, { persist: false }));
  updateOrbitalParamsPanel();
}

function exitFocusMode() {
  if (!focusRestorePanelIds) return;
  if (isolateTrackedObject) {
    isolateTrackedObject = false;
    updateSatPrimitiveStyles();
  }
  FOCUS_PANEL_IDS.forEach(id => setPanelOpen(id, false, { persist: false }));
  focusRestorePanelIds.forEach(id => setPanelOpen(id, true, { persist: false }));
  focusRestorePanelIds = null;
  updateOrbitalParamsPanel();
  // Après la sortie du suivi, Cesium remet le repère caméra à plat au tick suivant.
  setTimeout(flyToEarthOverview, 0);
}

viewer.trackedEntityChanged.addEventListener((entity) => {
  if (sceneRebuildInProgress) return; // suivi rétabli à la fin de rebuildScene
  const record = entity ? entityToRecord.get(entity) : undefined;
  // Suivi lancé sur une entité annexe (modèle, sphère) : on le reporte sur
  // l'entité de suivi de l'objet, la seule qui porte le point de vue.
  if (record && entity !== record.entity) {
    ensureTrackEntity(record);
    viewer.trackedEntity = record.entity;
    return;
  }
  if (record) enterFocusMode();
  else exitFocusMode();
});

orbitalParamsContentEl.addEventListener("click", (e) => {
  if (e.target.closest(".conjGroundTrackBtn")) {
    if (activeConjunction) openGroundTrackConjunction(activeConjunction.data);
    return;
  }
  const groundTrackBtn = e.target.closest(".groundTrackBtn");
  if (groundTrackBtn) {
    openGroundTrack(groundTrackBtn.dataset.satName);
    return;
  }
  if (e.target.closest(".conjExitBtn")) {
    exitConjunction();
    return;
  }
  if (e.target.closest(".conjIsolateBtn")) {
    conjunctionIsolated = !conjunctionIsolated;
    conjIsolateCheckboxEl.checked = conjunctionIsolated;
    applyConjunctionIsolation();
    updateOrbitalParamsPanel();
    return;
  }
  if (e.target.closest(".focusIsolateBtn")) {
    isolateTrackedObject = !isolateTrackedObject;
    updateSatPrimitiveStyles();
    updateOrbitalParamsPanel();
    return;
  }
  if (e.target.closest(".focusExitBtn")) {
    const tracked = getTrackedRecord();
    if (tracked && selectedOrbitNames.has(tracked.name)) toggleTrackObject(tracked.name);
    else viewer.trackedEntity = undefined;
    return;
  }
  const copyBtn = e.target.closest(".tleCopyBtn");
  if (copyBtn) {
    const record = satRecords.find(r => r.name === copyBtn.dataset.satName);
    if (!record) return;
    const text = `${record.name}\n${record.line1}\n${record.line2}`;
    navigator.clipboard.writeText(text).then(
      () => { copyBtn.textContent = "Copied"; },
      () => { copyBtn.textContent = "Failed"; },
    ).finally(() => setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500));
  }
});

// ---------- Distance objet suivi <-> station de référence ----------
// Trait rouge fin entre la station choisie dans "Distances et altitude" et
// l'objet suivi, avec la distance en temps réel au milieu (étiquette HTML
// repositionnée à chaque image, texte rafraîchi ~4 fois par seconde).
const TRACK_DISTANCE_COLOR = Cesium.Color.fromCssColorString("#E5484D");
const TRACK_DISTANCE_TEXT_INTERVAL_MS = 250;
const trackDistanceLabelEl = document.getElementById("trackDistanceLabel");
const trackDistanceMidpoint = new Cesium.Cartesian3();
let lastTrackDistanceTextMs = 0;

function trackDistanceEndpoints() {
  const tracked = getTrackedRecord();
  if (!tracked || !tracked.hasPosition || !selectedReferenceSite) return null;
  return [selectedReferenceSite.position, tracked.positionCartesian];
}

// Le modèle 3D lit sa position (copie) dans Viewer._onTick, avant que notre
// onTick ne mette à jour positionCartesian sur place. Un trait qui garde la
// référence serait dessiné avec la position de l'image suivante, donc en
// avance sur le modèle en accéléré : on copie au même moment que le modèle.
// L'étiquette reprend la même copie pour rester au milieu du trait.
let trackDistanceDrawn = null;

viewer.entities.add({
  name: "Tracked object to station distance",
  polyline: {
    positions: new Cesium.CallbackProperty(() => {
      const endpoints = trackDistanceEndpoints();
      trackDistanceDrawn = endpoints && [Cesium.Cartesian3.clone(endpoints[0]), Cesium.Cartesian3.clone(endpoints[1])];
      return trackDistanceDrawn || [];
    }, false),
    width: 1.5,
    material: TRACK_DISTANCE_COLOR.withAlpha(0.9),
    arcType: Cesium.ArcType.NONE,
  },
});

const toWindowCoordinates = Cesium.SceneTransforms.worldToWindowCoordinates
  || Cesium.SceneTransforms.wgs84ToWindowCoordinates;

viewer.scene.postRender.addEventListener(() => {
  const endpoints = trackDistanceEndpoints() && trackDistanceDrawn;
  if (!endpoints) {
    trackDistanceLabelEl.style.display = "none";
    return;
  }
  Cesium.Cartesian3.midpoint(endpoints[0], endpoints[1], trackDistanceMidpoint);
  const screen = toWindowCoordinates(viewer.scene, trackDistanceMidpoint);
  if (!screen) {
    trackDistanceLabelEl.style.display = "none";
    return;
  }
  const nowMs = performance.now();
  if (nowMs - lastTrackDistanceTextMs >= TRACK_DISTANCE_TEXT_INTERVAL_MS) {
    lastTrackDistanceTextMs = nowMs;
    const km = Cesium.Cartesian3.distance(endpoints[0], endpoints[1]) / 1000;
    trackDistanceLabelEl.textContent = `${selectedReferenceSite.name} · ${Math.round(km).toLocaleString("en-GB")} km`;
  }
  trackDistanceLabelEl.style.left = `${screen.x}px`;
  trackDistanceLabelEl.style.top = `${screen.y}px`;
  trackDistanceLabelEl.style.display = "block";
});

const dataStatusEl = document.getElementById("dataStatus");

(async function initRecords() {
  // La démo publique n'affiche pas les objets ajoutés à la main.
  if (DEMO_MODE) {
    currentRawRecords = [];
    dataStatusEl.textContent = "Shepherd demo";
    return;
  }
  // Cache local affiché tout de suite, remplacé par le Sheet dès sa réponse.
  const cache = loadCache();
  const hasCache = !!(cache && cache.records && cache.records.length > 0);
  let fontsReady = false;
  labelFontsReady.then(() => { fontsReady = true; });
  await Promise.resolve();
  const shownBeforeFonts = hasCache && !fontsReady;
  if (hasCache) {
    currentRawRecords = cache.records;
    rebuildScene();
    renderAdminTable();
    dataStatusEl.textContent = `Cache local — ${new Date(cache.savedAt).toLocaleString()}`;
  }

  const sheetRecords = await fetchFromSheet();
  await labelFontsReady;
  if (sheetRecords) {
    const changed = !hasCache || JSON.stringify(sheetRecords) !== JSON.stringify(cache.records);
    currentRawRecords = sheetRecords;
    saveCache(sheetRecords);
    // Noms dessinés avec la police de secours : redessinés avec la vraie.
    if (changed || shownBeforeFonts) rebuildScene();
    dataStatusEl.textContent = `Google Sheet — ${new Date().toLocaleTimeString()}`;
    renderAdminTable();
    return;
  }

  if (!hasCache) {
    currentRawRecords = [];
    rebuildScene();
    dataStatusEl.textContent = "Aucune donnée manuelle — charge un groupe dans le Catalogue CelesTrak";
  }
  renderAdminTable();
})();

// Recharge depuis le Sheet les constellations qui étaient affichées lors de
// la session précédente.
// Sans session enregistrée (première visite), tout ce que contient le Sheet
// est affiché ; on décoche ensuite ce qu'on ne veut pas voir.
// Groupes importés d'office une première fois depuis CelesTrak si leur
// onglet n'existe pas encore dans le Sheet.
const AUTO_ADDED_GROUP_IDS = ["debris-etages-fusee", "debris-satellites-morts", "debris-grands"];
const autoAddFlagKey = groupId => `price_auto_group_${groupId}_v1`;

// Au lancement, tout ce que contient le Sheet est affiché.
// Démo publique : tous les objets viennent d'un instantané livré avec le site
// (data/catalog.json, généré par preparer-demo.sh) — un seul fichier statique,
// au lieu d'interroger le Sheet groupe par groupe au lancement.
const DEMO_SNAPSHOT_URL = "data/catalog.json";

async function loadDemoSnapshot() {
  const res = await fetch(DEMO_SNAPSHOT_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const snapshot = await res.json();
  const groups = Object.entries(snapshot.groups);
  sheetGroupsMeta = new Map(groups.map(([id, rows]) => [id, { id, count: rows.length, lastSync: snapshot.generatedAt }]));
  sheetGroupsMetaLoaded = true;
  catalogRawRecords = [];
  groups.forEach(([id, rows]) => {
    rows.forEach(row => catalogRawRecords.push(sheetGroupRowToRecord(row, id)));
    catalogGroupsLoaded.add(id);
  });
  rebuildScene();
  renderCatalogExistingSummaryList();
  renderCatalogCountryFilter();
  renderCatalogTypeFilter();
  catalogLoadExistingStatusEl.textContent = `${catalogRawRecords.length.toLocaleString("en-GB")} objects · data from ${new Date(snapshot.generatedAt).toLocaleDateString("en-GB")}`;
  renderDemoTrackBar(groups.map(([id]) => id));
  refreshConjunctionPrimaryOptions();
}

// Démo : un bouton par constellation de l'instantané, qui suit un de ses
// satellites (tiré au hasard parmi ceux affichés, différent de l'objet suivi).
function renderDemoTrackBar(groupIds) {
  const barEl = document.createElement("div");
  barEl.id = "demoTrackBar";
  groupIds.forEach(groupId => {
    const def = CATALOG_GROUPS.find(g => g.id === groupId);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "demoTrackBtn";
    btn.textContent = `Track a ${def ? def.label : groupId} satellite`;
    btn.addEventListener("click", () => trackRandomInGroup(groupId));
    barEl.appendChild(btn);
  });
  document.body.appendChild(barEl);
}

function trackRandomInGroup(groupId) {
  const tracked = getTrackedRecord();
  const candidates = satRecords.filter(r => r.group === groupId && r.hasPosition
    && r.inAltitudeRange !== false && !r.groupHidden && r !== tracked);
  if (candidates.length === 0) return;
  toggleTrackObject(candidates[Math.floor(Math.random() * candidates.length)].name);
}

// Instantané local affiché sans attendre le réseau ; renvoie l'instantané
// (null s'il n'y en a pas).
async function showCatalogSnapshotAtStartup() {
  const snapshot = await loadCatalogSnapshot();
  if (!snapshot || !snapshot.groups || Object.keys(snapshot.groups).length === 0) return null;
  let fontsReady = false;
  labelFontsReady.then(() => { fontsReady = true; });
  // L'affichage prime : la police des noms n'est attendue que brièvement.
  await Promise.race([labelFontsReady, new Promise(resolve => setTimeout(resolve, 300))]);
  applyCatalogSnapshot(snapshot);
  // Noms dessinés avec la police de secours : redessinés une fois la vraie chargée.
  if (!fontsReady) labelFontsReady.then(rebuildScene);
  catalogLoadExistingStatusEl.textContent = `${catalogRawRecords.length.toLocaleString("en-GB")} objets · instantané local du `
    + `${new Date(snapshot.savedAt).toLocaleString("en-GB")} · vérification du Sheet...`;
  return snapshot;
}

async function loadAllGroupsAtStartup(snapshot) {
  if (DEMO_MODE) {
    await Promise.race([labelFontsReady, new Promise(resolve => setTimeout(resolve, 300))]);
    try {
      await loadDemoSnapshot();
      return;
    } catch (err) {
      console.warn("Instantané de démo indisponible, chargement depuis le Sheet:", err);
      await refreshSheetGroupsMeta();
    }
  }
  await Promise.all([sheetGroupsMetaReady, labelFontsReady]);
  let groupIds = knownSheetGroupIds();
  const autoAddPending = AUTO_ADDED_GROUP_IDS.filter(id => !localStorage.getItem(autoAddFlagKey(id)));
  autoAddPending.forEach(id => {
    if (sheetGroupsMeta.has(id) && !groupIds.includes(id)) groupIds.push(id);
  });
  if (snapshot) {
    // Seuls les groupes absents de l'instantané ou resynchronisés depuis.
    const syncAt = snapshot.groupSync || {};
    groupIds = groupIds.filter(id => !catalogGroupsLoaded.has(id)
      || (sheetGroupsMeta.get(id) || {}).lastSync !== (syncAt[id] || null));
  }
  if (groupIds.length > 0) {
    catalogLoadExistingStatusEl.textContent = snapshot
      ? `Instantané local affiché · mise à jour de ${groupIds.length} groupe(s) depuis le Sheet...`
      : `Chargement de tous les objets du Sheet (${groupIds.length} groupes)...`;
    await loadExistingGroupsFromSheet(groupIds, catalogLoadExistingStatusEl);
  } else if (snapshot) {
    catalogLoadExistingStatusEl.textContent = `${catalogRawRecords.length.toLocaleString("en-GB")} objets · à jour avec le Sheet`;
  }

  const toImport = DEMO_MODE ? [] : autoAddPending.filter(id => !sheetGroupsMeta.has(id));
  if (toImport.length > 0) {
    await loadAndSyncCelesTrakGroups(toImport, catalogImportStatusEl);
    renderCatalogImportGroupsList();
    renderCatalogUpdateGroupsList();
    renderCatalogExistingSummaryList();
  }
  autoAddPending.forEach(id => {
    if (!catalogGroupsLoaded.has(id)) return;
    try { localStorage.setItem(autoAddFlagKey(id), "1"); } catch (err) { /* réessayé au prochain chargement */ }
  });
}

// La sauvegarde de session ne démarre qu'une fois l'objet suivi et les
// orbites de la session précédente rétablis, sinon elle les effacerait.
// Filet de sécurité si le chargement ne se termine jamais.
const SESSION_AUTOSAVE_FALLBACK_MS = 120000;
setTimeout(() => { sessionAutosaveEnabled = true; }, SESSION_AUTOSAVE_FALLBACK_MS);

(async function startupWithSession() {
  let sessionObjectsApplied = false;
  const applyObjectsOnce = async () => {
    if (sessionObjectsApplied || !restoredSession) return;
    sessionObjectsApplied = true;
    try {
      await applySessionObjects(restoredSession.parsed);
    } catch (err) {
      console.error("Restauration des objets de la session:", err);
    }
  };
  let snapshot = null;
  if (!DEMO_MODE) {
    snapshot = await showCatalogSnapshotAtStartup();
    if (snapshot) {
      await applyObjectsOnce();
      sessionAutosaveEnabled = true;
    }
  }
  try {
    await loadAllGroupsAtStartup(snapshot);
  } catch (err) {
    console.error("Chargement des groupes au démarrage:", err);
  }
  // Démo : liste des conjonctions remplie dès le chargement, Starlink présélectionné.
  if (DEMO_MODE) refreshConjunctionPrimaryOptions();
  await applyObjectsOnce();
  sessionAutosaveEnabled = true;
})();

// ---------- Trace au sol (fenêtre 2D) ----------
// Point sous l'objet (longitude, latitude géodésiques) sur une carte
// équirectangulaire. Fond sombre vectoriel (Natural Earth via world-atlas,
// 1:50 M, puis 1:10 M en zoom fort) : net à tous les zooms. Fond
// "Satellite" : tuiles Natural Earth II livrées avec CesiumJS. Tout est servi
// avec CORS, donc exportable. L'horloge pilotée depuis la fenêtre est celle
// du globe.
const groundTrackPanelEl = document.getElementById("groundTrackPanel");
const groundTrackCanvasEl = document.getElementById("groundTrackCanvas");
const groundTrackMapWrapEl = document.getElementById("groundTrackMapWrap");
const groundTrackObjectEl = document.getElementById("groundTrackObject");
const gtColorInputEl = document.getElementById("gtColorInput");
const gtRevsInputEl = document.getElementById("gtRevsInput");
const gtRevsValueEl = document.getElementById("gtRevsValue");
const gtWidthInputEl = document.getElementById("gtWidthInput");
const gtWidthValueEl = document.getElementById("gtWidthValue");
const gtGridInputEl = document.getElementById("gtGridInput");
const gtPastInputEl = document.getElementById("gtPastInput");
const gtNightInputEl = document.getElementById("gtNightInput");
const gtMapStyleSelectEl = document.getElementById("gtMapStyleSelect");
const gtPlayBtnEl = document.getElementById("gtPlayBtn");
const gtSpeedSelectEl = document.getElementById("gtSpeedSelect");
const gtNowBtnEl = document.getElementById("gtNowBtn");
const gtScrubInputEl = document.getElementById("gtScrubInput");
const gtClockTimeEl = document.getElementById("gtClockTime");
const gtClockOffsetEl = document.getElementById("gtClockOffset");
const gtExportStatusEl = document.getElementById("gtExportStatus");

const GROUND_TRACK_STORAGE_KEY = "shepherd_ground_track_v1";
const GROUND_TRACK_SAMPLES_PER_REV = 720;
const GROUND_TRACK_IDLE_FRAME_MS = 100; // horloge lente, sans interaction
const GROUND_TRACK_MAP_LEVEL = 2;
const GROUND_TRACK_TILE_COLS = 8;
const GROUND_TRACK_TILE_ROWS = 4;
const GROUND_TRACK_TILE_PX = 256;
const GROUND_TRACK_MAX_ZOOM = 60;
const GROUND_TRACK_DETAIL_ZOOM = 5; // au-delà : contours 1:10 M
const GT_STYLE = {
  space: "#05070B",
  oceanDark: "#080C13",
  landDark: "#222D3B",
  borderDark: "rgba(140, 170, 200, 0.42)",
  oceanSat: "#0B1E33",
  night: "rgba(0, 0, 0, 0.36)",
  terminator: "rgba(255, 214, 102, 0.35)",
};
const JSPDF_URL = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js";
const WORLD_ATLAS_URL = res => `https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-${res}.json`;
const DEG = Math.PI / 180;

const groundTrackSettings = {
  color: "#FFD54F",
  revolutions: 3,
  widthPx: 2,
  grid: true,
  past: true,
  night: true,
  mapStyle: "dark", // "dark" | "satellite"
};
try {
  Object.assign(groundTrackSettings, JSON.parse(localStorage.getItem(GROUND_TRACK_STORAGE_KEY) || "{}"));
} catch (err) { /* réglages par défaut */ }

function saveGroundTrackSettings() {
  try {
    localStorage.setItem(GROUND_TRACK_STORAGE_KEY, JSON.stringify(groundTrackSettings));
  } catch (err) { /* stockage indisponible : réglages perdus au rechargement */ }
}

// Objets affichés : un seul, ou les deux objets d'une conjonction (couleurs
// imposées : objet 1 en bleu, objet 2 en orange, comme sur le globe).
let groundTrackTargets = []; // [{ name, color, labelSide }] ; color null = couleur des réglages
let groundTrackConj = null; // { tcaMs, missKm, pc } en mode conjonction
const groundTrackCaches = new Map(); // nom -> { revolutions, past, nowMs, refreshAfterMs, points }
let groundTrackLoopRunning = false;
let groundTrackLastFrameMs = 0;
let groundTrackLastClockUiMs = 0;
let groundTrackDirty = true;
let groundTrackScrubbing = false;

function loadScriptOnce(url) {
  loadScriptOnce.cache = loadScriptOnce.cache || new Map();
  if (!loadScriptOnce.cache.has(url)) {
    loadScriptOnce.cache.set(url, new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = () => { loadScriptOnce.cache.delete(url); reject(new Error(`${url} injoignable`)); };
      document.head.appendChild(script);
    }));
  }
  return loadScriptOnce.cache.get(url);
}

// ----- Fond satellite (raster) -----
const groundTrackBaseMap = document.createElement("canvas");
groundTrackBaseMap.width = GROUND_TRACK_TILE_COLS * GROUND_TRACK_TILE_PX;
groundTrackBaseMap.height = GROUND_TRACK_TILE_ROWS * GROUND_TRACK_TILE_PX;
let groundTrackBaseMapState = "idle"; // idle | loading | ready | failed

function loadGroundTrackBaseMap() {
  if (groundTrackBaseMapState !== "idle") return;
  groundTrackBaseMapState = "loading";
  const ctx = groundTrackBaseMap.getContext("2d");
  const jobs = [];
  for (let x = 0; x < GROUND_TRACK_TILE_COLS; x++) {
    for (let y = 0; y < GROUND_TRACK_TILE_ROWS; y++) {
      jobs.push(new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, x * GROUND_TRACK_TILE_PX, (GROUND_TRACK_TILE_ROWS - 1 - y) * GROUND_TRACK_TILE_PX);
          resolve();
        };
        img.onerror = reject;
        img.src = Cesium.buildModuleUrl(`Assets/Textures/NaturalEarthII/${GROUND_TRACK_MAP_LEVEL}/${x}/${y}.jpg`);
      }));
    }
  }
  Promise.all(jobs)
    .then(() => { groundTrackBaseMapState = "ready"; groundTrackDirty = true; })
    .catch(err => {
      console.warn("Fond satellite de la trace au sol indisponible:", err);
      groundTrackBaseMapState = "failed";
    });
}

// ----- Fond sombre (vectoriel) -----
// Un Path2D par polygone, en coordonnées (lon, −lat), avec sa boîte
// englobante pour ne dessiner que ce qui est visible. Natural Earth coupe
// les polygones à l'antiméridien, mais un même bord sur ce méridien peut
// alterner 180° et −180° : ce saut est ramené sur place, sinon le tracé
// traverse toute la carte. Un vrai franchissement est déroulé (et dessiné
// aussi décalé de ±360°) ; un anneau qui fait le tour du pôle est refermé
// par le pôle.
const groundTrackVector = {}; // res -> [{ path, minLon, maxLon, minLat, maxLat }]
const groundTrackVectorState = {}; // res -> loading | ready | failed

async function loadGroundTrackVector(res) {
  if (groundTrackVectorState[res]) return;
  groundTrackVectorState[res] = "loading";
  try {
    await loadScriptOnce(TOPOJSON_URL);
    const response = await fetch(WORLD_ATLAS_URL(res));
    if (!response.ok) throw new Error("HTTP " + response.status);
    const topo = await response.json();
    const collection = topojson.feature(topo, topo.objects.countries);
    const features = [];
    collection.features.forEach(f => {
      if (!f.geometry) return;
      const polygons = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
      polygons.forEach(rings => {
        const path = new Path2D();
        let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
        rings.forEach(ring => {
          const pts = [];
          let offset = 0;
          let prevRaw = null;
          ring.forEach(([lon, lat]) => {
            if (pts.length > 0) {
              const prev = pts[pts.length - 1][0];
              const d = lon + offset - prev;
              if (Math.abs(d) > 180) {
                if (Math.abs(lon) >= 179.999 && Math.abs(prevRaw) >= 179.999) {
                  pts.push([prev, lat]);
                  prevRaw = lon;
                  return;
                }
                offset += d > 0 ? -360 : 360;
              }
            }
            pts.push([lon + offset, lat]);
            prevRaw = lon;
          });
          if (pts.length > 1 && Math.abs(pts[pts.length - 1][0] - pts[0][0]) > 180) {
            const meanLat = pts.reduce((sum, p) => sum + p[1], 0) / pts.length;
            const poleLat = meanLat < 0 ? -90 : 90;
            pts.push([pts[pts.length - 1][0], poleLat], [pts[0][0], poleLat]);
          }
          pts.forEach(([lon, lat], i) => {
            if (i === 0) path.moveTo(lon, -lat);
            else path.lineTo(lon, -lat);
            if (lon < minLon) minLon = lon;
            if (lon > maxLon) maxLon = lon;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
          });
          path.closePath();
        });
        features.push({ path, minLon, maxLon, minLat, maxLat });
      });
    });
    groundTrackVector[res] = features;
    groundTrackVectorState[res] = "ready";
    groundTrackDirty = true;
  } catch (err) {
    console.warn(`Contours ${res} de la trace au sol indisponibles:`, err);
    groundTrackVectorState[res] = "failed";
  }
}

// ----- Calculs -----
function wrapLonDeg(lon) {
  return ((lon + 540) % 360) - 180;
}

// Point subsolaire (précision ~0,01°, suffisante pour l'ombre de la nuit).
function subsolarPoint(date) {
  const d = date.getTime() / 86_400_000 - 10957.5; // jours depuis J2000.0
  const g = (357.529 + 0.98560028 * d) * DEG;
  const q = 280.459 + 0.98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * DEG;
  const e = (23.439 - 0.00000036 * d) * DEG;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  return { lonDeg: wrapLonDeg((ra - satellite.gstime(date)) / DEG), latDeg: dec / DEG };
}

function groundTrackPeriodMs(record) {
  return getOrbitPeriodSeconds(record) * 1000;
}

function tleSubPoint(record, ms) {
  const date = new Date(ms);
  const pv = satellite.propagate(record.satrec, date);
  if (!pv || !pv.position || Number.isNaN(pv.position.x)) return null;
  const geo = satellite.eciToGeodetic(pv.position, satellite.gstime(date));
  return { ms, lon: geo.longitude / DEG, lat: geo.latitude / DEG };
}

function fixedKmToSubPoint(f, ms) {
  return {
    ms,
    lon: Math.atan2(f[1], f[0]) / DEG,
    lat: Math.atan2(f[2], Math.hypot(f[0], f[1])) / DEG,
  };
}

// Échantillons de fromMs à toMs. Objet synthétique : propagation d'une copie
// de son état, vers l'avant uniquement (pas de tour passé).
function computeGroundTrack(record, nowMs) {
  const periodMs = groundTrackPeriodMs(record);
  const stepMs = periodMs / GROUND_TRACK_SAMPLES_PER_REV;
  const pastMs = groundTrackSettings.past ? Math.min(periodMs, periodMs * groundTrackSettings.revolutions) : 0;
  const fromMs = nowMs - pastMs;
  const toMs = nowMs + periodMs * groundTrackSettings.revolutions;
  const points = [];
  if (record.type === "tle" && record.satrec) {
    for (let ms = fromMs; ms <= toMs + 1; ms += stepMs) {
      const p = tleSubPoint(record, ms);
      if (p) points.push(p);
    }
  } else if (record.type === "synthetic" && record.orbitState && !record.decayed) {
    const state = OrbitPropagator.cloneState(record.orbitState);
    for (let ms = nowMs; ms <= toMs + 1; ms += stepMs) {
      if (!OrbitPropagator.propagateTo(state, ms, SYNTHETIC_FORCE_MODEL, SYNTHETIC_MAX_STEPS_PER_CALL) || state.decayed) break;
      points.push(fixedKmToSubPoint(OrbitPropagator.inertialToFixed(state.y, ms), ms));
    }
  }
  return {
    name: record.name, revolutions: groundTrackSettings.revolutions, past: groundTrackSettings.past,
    nowMs, fromMs, toMs, refreshAfterMs: nowMs + Math.max(stepMs * 3, periodMs * 0.05), points,
  };
}

function currentSubPoint(record, nowMs) {
  if (record.type === "tle" && record.satrec) return tleSubPoint(record, nowMs);
  if (record.positionCartesian && isFiniteCartesian(record.positionCartesian)) {
    const c = Cesium.Cartographic.fromCartesian(record.positionCartesian);
    if (c) return { ms: nowMs, lon: c.longitude / DEG, lat: c.latitude / DEG };
  }
  return null;
}

function getGroundTrack(record, nowMs) {
  const c = groundTrackCaches.get(record.name);
  const stale = !c || c.revolutions !== groundTrackSettings.revolutions
    || c.past !== groundTrackSettings.past || nowMs < c.nowMs || nowMs > c.refreshAfterMs;
  if (!stale) return c;
  const track = computeGroundTrack(record, nowMs);
  groundTrackCaches.set(record.name, track);
  return track;
}

// ----- Vue et projection -----
// zoom 1 : le monde entier tient dans le cadre (quelle que soit sa forme).
// Centre en degrés (clon, clat).
const groundTrackView = { zoom: 1, clon: 0, clat: 0 };

function makeProjection(x, y, w, h, view = groundTrackView) {
  const k = Math.min(w / 360, h / 180) * view.zoom; // px par degré
  const ox = x + w / 2 - (view.clon + 180) * k;
  const oy = y + h / 2 - (90 - view.clat) * k;
  return {
    k, ox, oy,
    px: lon => ox + (lon + 180) * k,
    py: lat => oy + (90 - lat) * k,
    lon: sx => (sx - ox) / k - 180,
    lat: sy => 90 - (sy - oy) / k,
  };
}

// Garde la carte dans le cadre : centrée si elle est plus petite que lui,
// sinon sans laisser de vide sur les bords.
function clampGroundTrackView(w, h) {
  const v = groundTrackView;
  v.zoom = Math.min(GROUND_TRACK_MAX_ZOOM, Math.max(1, v.zoom));
  const k = Math.min(w / 360, h / 180) * v.zoom;
  const halfLon = w / (2 * k), halfLat = h / (2 * k);
  v.clon = halfLon >= 180 ? 0 : Math.min(180 - halfLon, Math.max(-180 + halfLon, v.clon));
  v.clat = halfLat >= 90 ? 0 : Math.min(90 - halfLat, Math.max(-90 + halfLat, v.clat));
}

// ----- Dessin : fond (mis en cache), puis nuit et traces à chaque image -----
function drawSatelliteBase(ctx, proj, x, y, w, h) {
  ctx.fillStyle = GT_STYLE.oceanSat;
  ctx.fillRect(proj.px(-180), proj.py(90), 360 * proj.k, 180 * proj.k);
  if (groundTrackBaseMapState !== "ready") return;
  const lon0 = Math.max(-180, proj.lon(x)), lon1 = Math.min(180, proj.lon(x + w));
  const lat1 = Math.min(90, proj.lat(y)), lat0 = Math.max(-90, proj.lat(y + h));
  if (lon1 <= lon0 || lat1 <= lat0) return;
  const bw = groundTrackBaseMap.width, bh = groundTrackBaseMap.height;
  const sx = ((lon0 + 180) / 360) * bw, sw = ((lon1 - lon0) / 360) * bw;
  const sy = ((90 - lat1) / 180) * bh, sh = ((lat1 - lat0) / 180) * bh;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(groundTrackBaseMap, sx, sy, sw, sh,
    proj.px(lon0), proj.py(lat1), (lon1 - lon0) * proj.k, (lat1 - lat0) * proj.k);
  ctx.fillStyle = "rgba(6, 12, 24, 0.3)";
  ctx.fillRect(x, y, w, h);
}

function drawDarkBase(ctx, proj, x, y, w, h, scale) {
  ctx.fillStyle = GT_STYLE.oceanDark;
  ctx.fillRect(proj.px(-180), proj.py(90), 360 * proj.k, 180 * proj.k);
  const detailed = groundTrackView.zoom >= GROUND_TRACK_DETAIL_ZOOM && groundTrackVectorState["10m"] === "ready";
  const features = detailed ? groundTrackVector["10m"] : groundTrackVector["50m"];
  if (!features) return;
  const lon0 = Math.max(-180, proj.lon(x)), lon1 = Math.min(180, proj.lon(x + w));
  const lat1 = proj.lat(y), lat0 = proj.lat(y + h);
  const visible = []; // [feature, décalage en degrés]
  features.forEach(f => {
    if (f.maxLat < lat0 || f.minLat > lat1) return;
    [0, -360, 360].forEach(shift => {
      if (f.maxLon + shift >= lon0 && f.minLon + shift <= lon1) visible.push([f, shift]);
    });
  });
  ctx.save();
  ctx.beginPath();
  ctx.rect(proj.px(-180), proj.py(90), 360 * proj.k, 180 * proj.k);
  ctx.clip();
  ctx.transform(proj.k, 0, 0, proj.k, proj.ox + 180 * proj.k, proj.oy + 90 * proj.k);
  const drawAll = op => visible.forEach(([f, shift]) => {
    if (shift !== 0) ctx.translate(shift, 0);
    op(f.path);
    if (shift !== 0) ctx.translate(-shift, 0);
  });
  ctx.fillStyle = GT_STYLE.landDark;
  drawAll(path => ctx.fill(path));
  ctx.strokeStyle = GT_STYLE.borderDark;
  ctx.lineWidth = (0.8 * scale) / proj.k;
  ctx.lineJoin = "round";
  drawAll(path => ctx.stroke(path));
  ctx.restore();
}

// Pas de grille adapté au zoom : au moins ~80 px entre deux lignes.
function gridStepDeg(pxPerDeg) {
  const steps = [30, 15, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05];
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i] * pxPerDeg >= 80) return steps[i];
  }
  return 30;
}

function formatGridDeg(value, pos, neg) {
  if (Math.abs(value) < 1e-9) return "0°";
  const abs = Math.abs(value);
  const text = Number.isInteger(abs) ? String(abs) : abs.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${text}°${value < 0 ? neg : pos}`;
}

function drawGrid(ctx, proj, x, y, w, h, scale) {
  const step = gridStepDeg(proj.k);
  const lonMin = Math.max(-180, proj.lon(x)), lonMax = Math.min(180, proj.lon(x + w));
  const latMax = Math.min(90, proj.lat(y)), latMin = Math.max(-90, proj.lat(y + h));
  const top = Math.max(y, proj.py(90)), bottom = Math.min(y + h, proj.py(-90));
  const left = Math.max(x, proj.px(-180)), right = Math.min(x + w, proj.px(180));
  const fontPx = Math.round(10.5 * scale);
  ctx.save();
  ctx.lineWidth = 1;
  const first = v => Math.ceil(v / step - 1e-9) * step;
  for (let lon = first(lonMin); lon <= lonMax + 1e-9; lon += step) {
    ctx.strokeStyle = Math.abs(lon) < 1e-9 ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.09)";
    const sx = Math.round(proj.px(lon)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(sx, top);
    ctx.lineTo(sx, bottom);
    ctx.stroke();
  }
  for (let lat = first(latMin); lat <= latMax + 1e-9; lat += step) {
    ctx.strokeStyle = Math.abs(lat) < 1e-9 ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.09)";
    const sy = Math.round(proj.py(lat)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(left, sy);
    ctx.lineTo(right, sy);
    ctx.stroke();
  }
  ctx.font = `500 ${fontPx}px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(231,233,236,0.78)";
  ctx.strokeStyle = "rgba(5,7,11,0.9)";
  ctx.lineWidth = Math.max(2.5, fontPx / 4);
  ctx.lineJoin = "round";
  const haloText = (text, tx, ty) => { ctx.strokeText(text, tx, ty); ctx.fillText(text, tx, ty); };
  ctx.textBaseline = "bottom";
  ctx.textAlign = "center";
  const lonEvery = step * proj.k < 60 * scale ? 2 : 1;
  let i = 0;
  for (let lon = first(lonMin); lon <= lonMax + 1e-9; lon += step, i++) {
    const sx = proj.px(lon);
    if (i % lonEvery !== 0 || sx < left + 26 * scale || sx > right - 26 * scale) continue;
    haloText(formatGridDeg(Math.round(lon * 100) / 100, "E", "W"), sx, bottom - 4 * scale);
  }
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  for (let lat = first(latMin); lat <= latMax + 1e-9; lat += step) {
    const sy = proj.py(lat) - 3 * scale;
    if (sy < top + fontPx || sy > bottom - fontPx * 2) continue;
    haloText(formatGridDeg(Math.round(lat * 100) / 100, "N", "S"), left + 5 * scale, sy);
  }
  ctx.restore();
}

function drawStaticLayer(ctx, proj, x, y, w, h, scale) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = GT_STYLE.space;
  ctx.fillRect(x, y, w, h);
  if (groundTrackSettings.mapStyle === "satellite") drawSatelliteBase(ctx, proj, x, y, w, h);
  else drawDarkBase(ctx, proj, x, y, w, h, scale);
  if (groundTrackSettings.grid) drawGrid(ctx, proj, x, y, w, h, scale);
  ctx.restore();
}

function drawNightShade(ctx, proj, x, y, w, h, date, scale) {
  const sun = subsolarPoint(date);
  const tanDec = Math.tan(Math.max(Math.abs(sun.latDeg), 0.05) * DEG) * (sun.latDeg < 0 ? -1 : 1);
  const lon0 = Math.max(-180, proj.lon(x) - 1), lon1 = Math.min(180, proj.lon(x + w) + 1);
  const steps = Math.max(90, Math.ceil(w / 4));
  const line = [];
  for (let i = 0; i <= steps; i++) {
    const lon = lon0 + ((lon1 - lon0) * i) / steps;
    line.push([proj.px(lon), proj.py(Math.atan(-Math.cos((lon - sun.lonDeg) * DEG) / tanDec) / DEG)]);
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  // Soleil au-dessus de l'hémisphère nord : la nuit est sous le terminateur.
  const poleY = proj.py(tanDec > 0 ? -90 : 90);
  ctx.beginPath();
  line.forEach(([sx, sy], i) => (i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)));
  ctx.lineTo(line[line.length - 1][0], poleY);
  ctx.lineTo(line[0][0], poleY);
  ctx.closePath();
  ctx.fillStyle = GT_STYLE.night;
  ctx.fill();
  ctx.beginPath();
  line.forEach(([sx, sy], i) => (i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)));
  ctx.strokeStyle = GT_STYLE.terminator;
  ctx.lineWidth = 1 * scale;
  ctx.setLineDash([4 * scale, 4 * scale]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Soleil
  const sx = proj.px(sun.lonDeg), sy = proj.py(sun.latDeg);
  const r = 5 * scale;
  ctx.fillStyle = "rgba(255, 214, 102, 0.18)";
  ctx.beginPath();
  ctx.arc(sx, sy, r * 2.2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = "#FFD666";
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

// Polyline sur la carte, coupée proprement au passage de l'antiméridien.
function strokeWrappedPath(ctx, points, proj) {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (i === 0) { ctx.moveTo(proj.px(p.lon), proj.py(p.lat)); continue; }
    const prev = points[i - 1];
    const dLon = p.lon - prev.lon;
    if (Math.abs(dLon) > 180) {
      const edge = dLon < 0 ? 180 : -180; // côté vers lequel on sort
      const lonUnwrapped = p.lon + (dLon < 0 ? 360 : -360);
      const f = (edge - prev.lon) / (lonUnwrapped - prev.lon);
      const latEdge = prev.lat + f * (p.lat - prev.lat);
      ctx.lineTo(proj.px(edge), proj.py(latEdge));
      ctx.moveTo(proj.px(-edge), proj.py(latEdge));
    }
    ctx.lineTo(proj.px(p.lon), proj.py(p.lat));
  }
  ctx.stroke();
}

// Point de la trace le plus proche de (mx, my) à moins de maxPx : projection
// sur chaque segment, puis position recalculée exactement à l'instant obtenu.
function findGroundTrackHover(record, points, proj, mx, my, maxPx) {
  let best = null;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (Math.abs(b.lon - a.lon) > 180) continue;
    const ax = proj.px(a.lon), ay = proj.py(a.lat), bx = proj.px(b.lon), by = proj.py(b.lat);
    if (Math.max(ax, bx) < mx - maxPx || Math.min(ax, bx) > mx + maxPx
      || Math.max(ay, by) < my - maxPx || Math.min(ay, by) > my + maxPx) continue;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const f = len2 > 0 ? Math.min(1, Math.max(0, ((mx - ax) * dx + (my - ay) * dy) / len2)) : 0;
    const d = Math.hypot(ax + f * dx - mx, ay + f * dy - my);
    if (d <= maxPx && (!best || d < best.d)) best = { d, ms: a.ms + f * (b.ms - a.ms), a, b, f };
  }
  if (!best) return null;
  const exact = record.type === "tle" && record.satrec ? tleSubPoint(record, best.ms) : null;
  const p = exact || { ms: best.ms, lon: best.a.lon + best.f * (best.b.lon - best.a.lon), lat: best.a.lat + best.f * (best.b.lat - best.a.lat) };
  return { ...p, sx: proj.px(p.lon), sy: proj.py(p.lat) };
}

function drawTrack(ctx, proj, x, y, w, h, track, nowPoint, scale, color, labelSide = "right") {
  const past = track.points.filter(p => p.ms <= nowPoint.ms);
  const future = track.points.filter(p => p.ms > nowPoint.ms);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = groundTrackSettings.widthPx * scale;
  ctx.strokeStyle = color;
  if (past.length > 0) {
    ctx.globalAlpha = 0.4;
    strokeWrappedPath(ctx, [...past, nowPoint], proj);
  }
  ctx.globalAlpha = 1;
  strokeWrappedPath(ctx, [nowPoint, ...future], proj);

  // Position actuelle
  const cx = proj.px(nowPoint.lon), cy = proj.py(nowPoint.lat);
  const r = 5 * scale;
  ctx.fillStyle = color;
  ctx.strokeStyle = "#05070B";
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  const fontPx = Math.round(12 * scale);
  ctx.font = `600 ${fontPx}px Inter, sans-serif`;
  const label = track.name;
  const tw = ctx.measureText(label).width;
  const flip = labelSide === "left" ? cx - r - 8 * scale - tw >= x + 4 : cx + r + 8 * scale + tw > x + w - 4;
  const lx = flip ? cx - r - 6 * scale - tw : cx + r + 6 * scale;
  ctx.fillStyle = "rgba(5,7,11,0.85)";
  ctx.fillRect(lx - 4 * scale, cy - fontPx * 0.75, tw + 8 * scale, fontPx * 1.5);
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "middle";
  ctx.fillText(label, lx, cy);
  ctx.restore();
}

// Point de plus courte approche : sous l'objet 1 à l'instant du TCA.
function drawConjunctionMarker(ctx, proj, x, y, w, h, scale) {
  const rec = satRecords.find(r => r.name === groundTrackTargets[0].name);
  const p = rec && rec.type === "tle" && rec.satrec ? tleSubPoint(rec, groundTrackConj.tcaMs) : null;
  if (!p) return;
  const cx = proj.px(p.lon), cy = proj.py(p.lat);
  const r = 7 * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = "#05070B";
  ctx.beginPath();
  ctx.arc(cx, cy, r + 1.5 * scale, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.75 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.moveTo(cx - r * 0.6, cy - r * 0.6);
  ctx.lineTo(cx + r * 0.6, cy + r * 0.6);
  ctx.moveTo(cx + r * 0.6, cy - r * 0.6);
  ctx.lineTo(cx - r * 0.6, cy + r * 0.6);
  ctx.stroke();
  const fontPx = Math.round(11.5 * scale);
  ctx.font = `600 ${fontPx}px "IBM Plex Mono", monospace`;
  const label = `TCA ${CLOCK_TIME_FORMAT.format(new Date(groundTrackConj.tcaMs))}`;
  const tw = ctx.measureText(label).width;
  const lx = cx - tw / 2, ly = cy + r + 6 * scale;
  ctx.fillStyle = "rgba(5,7,11,0.9)";
  ctx.fillRect(lx - 4 * scale, ly, tw + 8 * scale, fontPx * 1.5);
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "top";
  ctx.fillText(label, lx, ly + fontPx * 0.25);
  ctx.restore();
}

function drawHoverMarker(ctx, hover) {
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "#05070B";
  ctx.beginPath();
  ctx.arc(hover.sx, hover.sy, 4.5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Nuit, traces, point de rencontre et point survolé, au-dessus du fond.
// Renvoie le point de trace survolé si hoverAt = { x, y } est fourni.
function drawDynamicLayer(ctx, proj, x, y, w, h, { scale = 1, hoverAt = null } = {}) {
  const nowMs = currentClockMs();
  if (groundTrackSettings.night) drawNightShade(ctx, proj, x, y, w, h, new Date(nowMs), scale);

  const targets = groundTrackTargets
    .map(t => ({ ...t, record: satRecords.find(r => r.name === t.name) }))
    .filter(t => t.record && !t.record.decayed);
  const message = groundTrackTargets.length === 0 ? "No object selected"
    : targets.length === 0 ? "Object not found in the scene"
    : null;
  if (message) {
    ctx.fillStyle = "rgba(231,233,236,0.8)";
    ctx.font = `500 ${Math.round(13 * scale)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, x + w / 2, y + h / 2);
    ctx.textAlign = "left";
    return null;
  }
  let hover = null;
  targets.forEach(t => {
    const nowPoint = currentSubPoint(t.record, nowMs);
    if (!nowPoint) return;
    const color = t.color || groundTrackSettings.color;
    const track = getGroundTrack(t.record, nowMs);
    drawTrack(ctx, proj, x, y, w, h, track, nowPoint, scale, color, t.labelSide);
    if (!hoverAt) return;
    const allPoints = [...track.points.filter(p => p.ms <= nowMs), nowPoint, ...track.points.filter(p => p.ms > nowMs)];
    const h1 = findGroundTrackHover(t.record, allPoints, proj, hoverAt.x, hoverAt.y, 10);
    if (h1) {
      h1.d = Math.hypot(h1.sx - hoverAt.x, h1.sy - hoverAt.y);
      if (!hover || h1.d < hover.d) hover = { ...h1, name: t.name, color };
    }
  });
  if (groundTrackConj) drawConjunctionMarker(ctx, proj, x, y, w, h, scale);
  if (hover) drawHoverMarker(ctx, hover);
  return hover;
}

// ----- Taille du canevas -----
// Panneau sans hauteur imposée : carte 2:1 sur toute la largeur. Agrandi,
// redimensionné à la main ou en plein écran : le canevas prend toute la
// place et la carte s'y adapte (zoom 1 = monde entier visible).
function isGroundTrackFullscreen() {
  return document.fullscreenElement === groundTrackPanelEl;
}

function sizeGroundTrackCanvas() {
  const fixedHeight = isGroundTrackFullscreen()
    || groundTrackPanelEl.classList.contains("panelMaximized") || !!groundTrackPanelEl.style.height;
  groundTrackPanelEl.classList.toggle("gtFixedHeight", fixedHeight);
  const cssW = Math.max(100, Math.floor(groundTrackMapWrapEl.clientWidth));
  const cssH = Math.max(60, Math.floor(fixedHeight ? groundTrackMapWrapEl.clientHeight : cssW / 2));
  const dpr = window.devicePixelRatio || 1;
  groundTrackCanvasEl.style.width = `${cssW}px`;
  groundTrackCanvasEl.style.height = `${cssH}px`;
  const pxW = Math.round(cssW * dpr), pxH = Math.round(cssH * dpr);
  if (groundTrackCanvasEl.width !== pxW || groundTrackCanvasEl.height !== pxH) {
    groundTrackCanvasEl.width = pxW;
    groundTrackCanvasEl.height = pxH;
  }
  clampGroundTrackView(cssW, cssH);
  groundTrackDirty = true;
}

new ResizeObserver(() => {
  if (groundTrackPanelEl.classList.contains("dockOpen")) sizeGroundTrackCanvas();
}).observe(groundTrackPanelEl);

// ----- Survol : encadré objet / date / latitude / longitude -----
const groundTrackTooltipEl = document.createElement("div");
groundTrackTooltipEl.id = "groundTrackTooltip";
groundTrackMapWrapEl.appendChild(groundTrackTooltipEl);
let groundTrackMouse = null; // position du pointeur dans le canevas (px CSS)
let groundTrackDrag = null;

function formatLatLon(value, pos, neg) {
  return `${Math.abs(value).toFixed(4)}° ${value < 0 ? neg : pos}`;
}

function updateGroundTrackTooltip(hover) {
  if (!hover || groundTrackDrag) {
    groundTrackTooltipEl.style.display = "none";
    return;
  }
  const date = new Date(hover.ms);
  groundTrackTooltipEl.innerHTML = `<div class="gtTipName"><span class="gtTipDot" style="background:${hover.color}"></span>${escapeHtml(hover.name)}</div>`
    + `<div class="gtTipDate">${CLOCK_DATE_FORMAT.format(date)} · ${CLOCK_TIME_FORMAT.format(date)}</div>`
    + `<div><span class="gtTipLabel">Lat</span> ${formatLatLon(hover.lat, "N", "S")}</div>`
    + `<div><span class="gtTipLabel">Lon</span> ${formatLatLon(hover.lon, "E", "W")}</div>`;
  groundTrackTooltipEl.style.display = "block";
  const tipW = groundTrackTooltipEl.offsetWidth, tipH = groundTrackTooltipEl.offsetHeight;
  const cw = groundTrackCanvasEl.clientWidth, ch = groundTrackCanvasEl.clientHeight;
  let left = hover.sx + 14, top = hover.sy + 14;
  if (left + tipW > cw) left = hover.sx - tipW - 14;
  if (top + tipH > ch) top = hover.sy - tipH - 14;
  groundTrackTooltipEl.style.left = `${groundTrackCanvasEl.offsetLeft + Math.max(0, left)}px`;
  groundTrackTooltipEl.style.top = `${groundTrackCanvasEl.offsetTop + Math.max(0, top)}px`;
}

// ----- Rendu à l'écran -----
// Le fond (carte, grille) n'est redessiné que si la vue ou les réglages
// changent ; à chaque image on ne recolle que lui, puis nuit et traces.
const groundTrackStaticCanvas = document.createElement("canvas");
let groundTrackStaticKey = "";

function groundTrackScreenScale(w) {
  return Math.max(0.9, Math.min(1.4, w / 800));
}

function renderGroundTrackCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w = groundTrackCanvasEl.width / dpr, h = groundTrackCanvasEl.height / dpr;
  clampGroundTrackView(w, h);
  const proj = makeProjection(0, 0, w, h);
  const scale = groundTrackScreenScale(w);
  const v = groundTrackView;
  const key = [groundTrackCanvasEl.width, groundTrackCanvasEl.height, v.zoom, v.clon, v.clat,
    groundTrackSettings.mapStyle, groundTrackSettings.grid, groundTrackBaseMapState,
    groundTrackVectorState["50m"], groundTrackVectorState["10m"]].join("|");
  if (key !== groundTrackStaticKey) {
    groundTrackStaticKey = key;
    groundTrackStaticCanvas.width = groundTrackCanvasEl.width;
    groundTrackStaticCanvas.height = groundTrackCanvasEl.height;
    const sctx = groundTrackStaticCanvas.getContext("2d");
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawStaticLayer(sctx, proj, 0, 0, w, h, scale);
  }
  const ctx = groundTrackCanvasEl.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(groundTrackStaticCanvas, 0, 0);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const hover = drawDynamicLayer(ctx, proj, 0, 0, w, h, { scale, hoverAt: groundTrackDrag ? null : groundTrackMouse });
  updateGroundTrackTooltip(hover);
  groundTrackZoomLabelEl.textContent = `×${v.zoom < 10 ? v.zoom.toFixed(1) : Math.round(v.zoom)}`;
}

// ----- Zoom, déplacement, plein écran -----
// Molette : zoom centré sur le pointeur. Glisser : déplacer. Double-clic ou
// ⟲ : vue d'ensemble. ⛶ : plein écran (Échap pour sortir).
const groundTrackZoomBarEl = document.createElement("div");
groundTrackZoomBarEl.className = "gtZoomBar";
groundTrackZoomBarEl.innerHTML = '<button type="button" data-gt-zoom="in" title="Zoom in">+</button>'
  + '<button type="button" data-gt-zoom="out" title="Zoom out">−</button>'
  + '<button type="button" data-gt-zoom="reset" title="Full view (double-click on the map)">⟲</button>'
  + '<span class="gtZoomLabel"></span>'
  + '<button type="button" data-gt-zoom="fullscreen" class="gtFullscreenBtn" title="Full screen (Esc to exit)">'
  + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>';
groundTrackMapWrapEl.appendChild(groundTrackZoomBarEl);
const groundTrackZoomLabelEl = groundTrackZoomBarEl.querySelector(".gtZoomLabel");

function zoomGroundTrackAt(factor, sx, sy) {
  const w = groundTrackCanvasEl.clientWidth, h = groundTrackCanvasEl.clientHeight;
  const before = makeProjection(0, 0, w, h);
  const lon = before.lon(sx), lat = before.lat(sy);
  const v = groundTrackView;
  v.zoom = Math.min(GROUND_TRACK_MAX_ZOOM, Math.max(1, v.zoom * factor));
  const k = Math.min(w / 360, h / 180) * v.zoom;
  v.clon = lon - (sx - w / 2) / k;
  v.clat = lat + (sy - h / 2) / k;
  clampGroundTrackView(w, h);
  if (v.zoom >= GROUND_TRACK_DETAIL_ZOOM && groundTrackSettings.mapStyle === "dark") loadGroundTrackVector("10m");
  groundTrackDirty = true;
}

function resetGroundTrackView() {
  Object.assign(groundTrackView, { zoom: 1, clon: 0, clat: 0 });
  groundTrackDirty = true;
}

function toggleGroundTrackFullscreen() {
  if (isGroundTrackFullscreen()) document.exitFullscreen();
  else if (groundTrackPanelEl.requestFullscreen) groundTrackPanelEl.requestFullscreen().catch(err => console.warn("Plein écran refusé:", err));
}

document.addEventListener("fullscreenchange", () => {
  groundTrackPanelEl.classList.toggle("gtFullscreen", isGroundTrackFullscreen());
  requestAnimationFrame(sizeGroundTrackCanvas);
});

groundTrackZoomBarEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-gt-zoom]");
  if (!btn) return;
  const w = groundTrackCanvasEl.clientWidth, h = groundTrackCanvasEl.clientHeight;
  const action = btn.dataset.gtZoom;
  if (action === "in") zoomGroundTrackAt(1.6, w / 2, h / 2);
  else if (action === "out") zoomGroundTrackAt(1 / 1.6, w / 2, h / 2);
  else if (action === "reset") resetGroundTrackView();
  else toggleGroundTrackFullscreen();
});

groundTrackCanvasEl.addEventListener("wheel", (e) => {
  e.preventDefault();
  const rect = groundTrackCanvasEl.getBoundingClientRect();
  const delta = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY; // lignes -> px
  zoomGroundTrackAt(Math.pow(1.0018, -delta), e.clientX - rect.left, e.clientY - rect.top);
}, { passive: false });

groundTrackCanvasEl.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  groundTrackDrag = { x: e.clientX, y: e.clientY, clon: groundTrackView.clon, clat: groundTrackView.clat };
  groundTrackCanvasEl.setPointerCapture(e.pointerId);
  groundTrackCanvasEl.classList.add("gtDragging");
});

groundTrackCanvasEl.addEventListener("pointermove", (e) => {
  const rect = groundTrackCanvasEl.getBoundingClientRect();
  groundTrackMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  groundTrackDirty = true;
  if (!groundTrackDrag) return;
  const w = groundTrackCanvasEl.clientWidth, h = groundTrackCanvasEl.clientHeight;
  const k = Math.min(w / 360, h / 180) * groundTrackView.zoom;
  groundTrackView.clon = groundTrackDrag.clon - (e.clientX - groundTrackDrag.x) / k;
  groundTrackView.clat = groundTrackDrag.clat + (e.clientY - groundTrackDrag.y) / k;
  clampGroundTrackView(w, h);
});

function endGroundTrackDrag() {
  groundTrackDrag = null;
  groundTrackCanvasEl.classList.remove("gtDragging");
  groundTrackDirty = true;
}
groundTrackCanvasEl.addEventListener("pointerup", endGroundTrackDrag);
groundTrackCanvasEl.addEventListener("pointercancel", endGroundTrackDrag);
groundTrackCanvasEl.addEventListener("pointerleave", () => { groundTrackMouse = null; groundTrackDirty = true; });
groundTrackCanvasEl.addEventListener("dblclick", resetGroundTrackView);

// Raccourcis quand le pointeur est sur la carte : F plein écran, 0 vue d'ensemble.
document.addEventListener("keydown", (e) => {
  if (!groundTrackPanelEl.classList.contains("dockOpen") || !groundTrackMouse) return;
  if (e.target.closest && e.target.closest("input, select, textarea")) return;
  if (e.key === "f" || e.key === "F") { e.preventDefault(); toggleGroundTrackFullscreen(); }
  else if (e.key === "0") resetGroundTrackView();
});

// ----- Horloge -----
function formatOffset(ms) {
  const sign = ms < 0 ? "−" : "+";
  const totalMin = Math.round(Math.abs(ms) / 60000);
  const d = Math.floor(totalMin / 1440), hh = Math.floor((totalMin % 1440) / 60), mm = totalMin % 60;
  if (totalMin === 0) return "now";
  return `${sign}${d > 0 ? `${d} d ` : ""}${hh > 0 || d > 0 ? `${hh} h ` : ""}${String(mm).padStart(2, "0")} min`;
}

function updateGroundTrackClockUi() {
  const nowMs = currentClockMs();
  const date = new Date(nowMs);
  gtClockTimeEl.textContent = `${CLOCK_DATE_FORMAT.format(date)} · ${CLOCK_TIME_FORMAT.format(date)}`;
  const offsetMs = nowMs - Date.now();
  gtClockOffsetEl.textContent = Math.abs(offsetMs) < 30000 ? "real time" : `${formatOffset(offsetMs)} from now`;
  gtPlayBtnEl.textContent = viewer.clock.shouldAnimate ? "❚❚" : "▶";
  gtPlayBtnEl.classList.toggle("gtPlayBtnPaused", !viewer.clock.shouldAnimate);
  const speed = String(viewer.clock.multiplier);
  if (gtSpeedSelectEl.value !== speed && document.activeElement !== gtSpeedSelectEl) {
    if (!Array.from(gtSpeedSelectEl.options).some(o => o.value === speed)) {
      const opt = document.createElement("option");
      opt.value = speed;
      opt.textContent = `×${viewer.clock.multiplier}`;
      opt.dataset.custom = "1";
      gtSpeedSelectEl.querySelectorAll("option[data-custom]").forEach(o => o.remove());
      gtSpeedSelectEl.appendChild(opt);
    }
    gtSpeedSelectEl.value = speed;
  }
  if (!groundTrackScrubbing) {
    gtScrubInputEl.value = String(Math.round(offsetMs / 60000));
  }
}

function setClockMs(ms) {
  viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date(ms));
  groundTrackDirty = true;
}

gtPlayBtnEl.addEventListener("click", () => {
  viewer.clock.shouldAnimate = !viewer.clock.shouldAnimate;
  updateGroundTrackClockUi();
});
gtSpeedSelectEl.addEventListener("change", () => {
  viewer.clock.multiplier = Number(gtSpeedSelectEl.value);
  viewer.clock.shouldAnimate = true;
});
gtNowBtnEl.addEventListener("click", () => {
  setClockMs(Date.now());
  viewer.clock.multiplier = 1;
  viewer.clock.shouldAnimate = true;
});
groundTrackPanelEl.querySelectorAll("[data-gt-step]").forEach(btn => {
  btn.addEventListener("click", () => setClockMs(currentClockMs() + Number(btn.dataset.gtStep) * 1000));
});
gtScrubInputEl.addEventListener("input", () => {
  groundTrackScrubbing = true;
  setClockMs(Date.now() + Number(gtScrubInputEl.value) * 60000);
});
gtScrubInputEl.addEventListener("change", () => { groundTrackScrubbing = false; });

// ----- Réglages -----
function renderGroundTrackSettings() {
  gtColorInputEl.value = groundTrackSettings.color;
  gtRevsInputEl.value = String(groundTrackSettings.revolutions);
  gtRevsValueEl.textContent = `${groundTrackSettings.revolutions} rev${groundTrackSettings.revolutions > 1 ? "s" : ""}`;
  gtWidthInputEl.value = String(groundTrackSettings.widthPx);
  gtWidthValueEl.textContent = `${groundTrackSettings.widthPx} px`;
  gtGridInputEl.checked = groundTrackSettings.grid;
  gtPastInputEl.checked = groundTrackSettings.past;
  gtNightInputEl.checked = groundTrackSettings.night;
  gtMapStyleSelectEl.value = groundTrackSettings.mapStyle;
}

function ensureGroundTrackMapData() {
  if (groundTrackSettings.mapStyle === "satellite") loadGroundTrackBaseMap();
  else {
    loadGroundTrackVector("50m");
    if (groundTrackView.zoom >= GROUND_TRACK_DETAIL_ZOOM) loadGroundTrackVector("10m");
  }
}

function bindGroundTrackSetting(el, key, read, eventName = "input") {
  el.addEventListener(eventName, () => {
    groundTrackSettings[key] = read(el);
    renderGroundTrackSettings();
    saveGroundTrackSettings();
    ensureGroundTrackMapData();
    groundTrackDirty = true;
  });
}
bindGroundTrackSetting(gtColorInputEl, "color", el => el.value);
bindGroundTrackSetting(gtRevsInputEl, "revolutions", el => Number(el.value));
bindGroundTrackSetting(gtWidthInputEl, "widthPx", el => Number(el.value));
bindGroundTrackSetting(gtGridInputEl, "grid", el => el.checked);
bindGroundTrackSetting(gtPastInputEl, "past", el => el.checked);
bindGroundTrackSetting(gtNightInputEl, "night", el => el.checked);
bindGroundTrackSetting(gtMapStyleSelectEl, "mapStyle", el => el.value, "change");
renderGroundTrackSettings();

// ----- Ouverture et boucle de rendu -----
// Redessin à chaque image pendant une interaction ou une horloge accélérée,
// sinon toutes les GROUND_TRACK_IDLE_FRAME_MS.
function groundTrackFrame(t) {
  if (!groundTrackPanelEl.classList.contains("dockOpen")) {
    groundTrackLoopRunning = false;
    return;
  }
  const fastClock = viewer.clock.shouldAnimate && Math.abs(viewer.clock.multiplier) >= 5;
  if (groundTrackDirty || fastClock || t - groundTrackLastFrameMs >= GROUND_TRACK_IDLE_FRAME_MS) {
    groundTrackDirty = false;
    groundTrackLastFrameMs = t;
    renderGroundTrackCanvas();
  }
  if (t - groundTrackLastClockUiMs >= 200) {
    groundTrackLastClockUiMs = t;
    updateGroundTrackClockUi();
  }
  requestAnimationFrame(groundTrackFrame);
}

function showGroundTrackPanel(targets, conj, title) {
  groundTrackTargets = targets;
  groundTrackConj = conj;
  groundTrackCaches.clear();
  groundTrackObjectEl.textContent = title;
  gtColorInputEl.disabled = !!conj;
  gtColorInputEl.closest(".gtColor").title = conj
    ? "Fixed colours for a conjunction: object 1 in blue, object 2 in orange"
    : "Track colour";
  gtExportStatusEl.textContent = "";
  ensureGroundTrackMapData();
  setPanelOpen("groundTrackPanel", true, { persist: false });
  topPanelZIndex += 1;
  groundTrackPanelEl.style.zIndex = String(topPanelZIndex);
  sizeGroundTrackCanvas();
  groundTrackDirty = true;
  if (!groundTrackLoopRunning) {
    groundTrackLoopRunning = true;
    requestAnimationFrame(groundTrackFrame);
  }
}

function openGroundTrack(name) {
  const record = satRecords.find(r => r.name === name);
  const norad = record && record.catnr !== undefined ? ` · NORAD ${record.catnr}` : "";
  showGroundTrackPanel([{ name, color: null }], null, `${name}${norad}`);
}

function openGroundTrackConjunction(c) {
  showGroundTrackPanel(
    [
      { name: c.primary, color: CONJ_PRIMARY_COLOR.toCssColorString(), labelSide: "right" },
      { name: c.secondary, color: CONJ_SECONDARY_COLOR.toCssColorString(), labelSide: "left" },
    ],
    { tcaMs: c.tcaMs, missKm: c.missKm, pc: c.pc },
    `${c.primary} ↔ ${c.secondary}`,
  );
}

makePanelDraggable(groundTrackPanelEl, groundTrackPanelEl.querySelector(".distancePanelHeader"));

// ----- Export -----
// Même cadrage que la carte affichée, en 2400 px de large.
const GROUND_TRACK_EXPORT_W = 2400;
const GROUND_TRACK_EXPORT_HEADER = 110;
const GROUND_TRACK_EXPORT_FOOTER = 44;
const EXPORT_DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC",
});

function renderGroundTrackExportCanvas() {
  const cw = groundTrackCanvasEl.clientWidth || 2, ch = groundTrackCanvasEl.clientHeight || 1;
  const mapW = GROUND_TRACK_EXPORT_W;
  const mapH = Math.round(mapW * ch / cw);
  const canvas = document.createElement("canvas");
  canvas.width = mapW;
  canvas.height = GROUND_TRACK_EXPORT_HEADER + mapH + GROUND_TRACK_EXPORT_FOOTER;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0D0F14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const record = groundTrackTargets.length > 0 ? satRecords.find(r => r.name === groundTrackTargets[0].name) : null;
  const nowMs = currentClockMs();
  const periodMs = record ? groundTrackPeriodMs(record) : 0;
  const endMs = nowMs + periodMs * groundTrackSettings.revolutions;
  const pad = 36;
  ctx.fillStyle = "#B8922E";
  ctx.font = '600 22px Inter, sans-serif';
  ctx.textBaseline = "top";
  ctx.fillText("SHEPHERD · GROUND TRACK", pad, 22);
  ctx.fillStyle = "#E7E9EC";
  ctx.font = '600 38px Inter, sans-serif';
  ctx.fillText(groundTrackObjectEl.textContent, pad, 50);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(231,233,236,0.75)";
  ctx.font = '500 22px "IBM Plex Mono", monospace';
  ctx.fillText(`${EXPORT_DATE_FORMAT.format(new Date(nowMs))} → ${EXPORT_DATE_FORMAT.format(new Date(endMs))} UTC`, canvas.width - pad, 30);
  if (groundTrackConj) {
    const c = groundTrackConj;
    const miss = c.missKm < 1 ? `${(c.missKm * 1000).toFixed(0)} m` : `${c.missKm.toFixed(2)} km`;
    ctx.fillText(`TCA ${EXPORT_DATE_FORMAT.format(new Date(c.tcaMs))} UTC · ${miss} · Pc ${formatPc(c.pc)}`, canvas.width - pad, 62);
  } else {
    ctx.fillText(`${groundTrackSettings.revolutions} rev${groundTrackSettings.revolutions > 1 ? "s" : ""} · period ${(periodMs / 60000).toFixed(1)} min`, canvas.width - pad, 62);
  }
  ctx.textAlign = "left";

  // Même vue qu'à l'écran : le zoom est relatif au cadre, donc le cadrage
  // est identique à une résolution plus élevée.
  const scale = groundTrackScreenScale(cw) * (mapW / cw);
  const proj = makeProjection(0, GROUND_TRACK_EXPORT_HEADER, mapW, mapH);
  drawStaticLayer(ctx, proj, 0, GROUND_TRACK_EXPORT_HEADER, mapW, mapH, scale);
  drawDynamicLayer(ctx, proj, 0, GROUND_TRACK_EXPORT_HEADER, mapW, mapH, { scale });

  ctx.fillStyle = "rgba(231,233,236,0.55)";
  ctx.font = '400 18px Inter, sans-serif';
  ctx.textBaseline = "middle";
  const source = groundTrackSettings.mapStyle === "satellite" ? "Natural Earth II (CesiumJS)" : "Natural Earth (world-atlas)";
  ctx.fillText(`Base map: ${source} · Positions: SGP4 from public TLEs · Faint line: past revolution · Dark area: night`,
    pad, GROUND_TRACK_EXPORT_HEADER + mapH + GROUND_TRACK_EXPORT_FOOTER / 2);
  return canvas;
}

function groundTrackFileName(ext) {
  const safe = (groundTrackTargets.map(t => t.name).join("_vs_") || "objet").replace(/[^\w.-]+/g, "_");
  const stamp = new Date(currentClockMs()).toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return `ground-track_${safe}_${stamp}.${ext}`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportGroundTrack(format) {
  if (groundTrackTargets.length === 0) return;
  const mapLoading = groundTrackSettings.mapStyle === "satellite"
    ? groundTrackBaseMapState === "loading"
    : groundTrackVectorState["50m"] === "loading";
  if (mapLoading) {
    gtExportStatusEl.textContent = "Map still loading, please try again in a moment.";
    return;
  }
  gtExportStatusEl.textContent = "Export...";
  try {
    const canvas = renderGroundTrackExportCanvas();
    if (format === "pdf") {
      await loadScriptOnce(JSPDF_URL);
      const doc = new window.jspdf.jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth(), pageH = doc.internal.pageSize.getHeight();
      const margin = 8;
      const ratio = canvas.width / canvas.height;
      let w = pageW - 2 * margin, h = w / ratio;
      if (h > pageH - 2 * margin) { h = pageH - 2 * margin; w = h * ratio; }
      doc.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", (pageW - w) / 2, (pageH - h) / 2, w, h);
      doc.save(groundTrackFileName("pdf"));
    } else {
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const blob = await new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error("image vide"))), mime, 0.92));
      downloadBlob(blob, groundTrackFileName(format === "png" ? "png" : "jpg"));
    }
    gtExportStatusEl.textContent = "Exported.";
  } catch (err) {
    console.error("Export de la trace au sol:", err);
    gtExportStatusEl.textContent = `Export failed: ${err.message || err}`;
  }
}

groundTrackPanelEl.querySelectorAll("[data-gt-export]").forEach(btn => {
  btn.addEventListener("click", () => exportGroundTrack(btn.dataset.gtExport));
});

// ---------- Bulles d'aide "i" ----------
// Les explications des panneaux sont rangées dans data-info et ne
// s'affichent qu'au clic. Écoute en phase de capture : un "i" placé dans
// un <summary> ne doit pas ouvrir/fermer le volet.
const infoTipBubbleEl = document.getElementById("infoTipBubble");
let openInfoTipEl = null;

function closeInfoTip() {
  if (!openInfoTipEl) return;
  openInfoTipEl.classList.remove("infoTipOpen");
  openInfoTipEl = null;
  infoTipBubbleEl.hidden = true;
}

function openInfoTip(btn) {
  closeInfoTip();
  openInfoTipEl = btn;
  btn.classList.add("infoTipOpen");
  infoTipBubbleEl.textContent = btn.dataset.info;
  infoTipBubbleEl.hidden = false;
  const r = btn.getBoundingClientRect();
  const w = infoTipBubbleEl.offsetWidth;
  const h = infoTipBubbleEl.offsetHeight;
  const left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
  const below = r.bottom + 6;
  const top = below + h > window.innerHeight - 8 ? Math.max(8, r.top - h - 6) : below;
  infoTipBubbleEl.style.left = `${left}px`;
  infoTipBubbleEl.style.top = `${top}px`;
}

document.addEventListener("click", e => {
  const btn = e.target.closest(".infoTip");
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    if (openInfoTipEl === btn) closeInfoTip();
    else openInfoTip(btn);
    return;
  }
  if (!e.target.closest("#infoTipBubble")) closeInfoTip();
}, true);

document.addEventListener("keydown", e => { if (e.key === "Escape") closeInfoTip(); });
window.addEventListener("resize", closeInfoTip);

// ---------- Diagnostic d'arrêt du rendu ----------
// Cesium stoppe le rendu sur la première exception ; on journalise la pile
// et les objets dont la position n'est pas un nombre fini pour retrouver
// la cause.
viewer.scene.renderError.addEventListener((scene, error) => {
  const invalid = satRecords.filter(r => r.positionCartesian && !isFiniteCartesian(r.positionCartesian)).map(r => r.name);
  console.error("Rendu Cesium arrêté :", error && error.stack ? error.stack : error);
  console.error("Objets à position invalide :", invalid.length ? invalid : "aucun",
    "· sélection :", Array.from(selectedOrbitNames), "· conjonction :", activeConjunction);
});

// ---------- Bouton "Vue Terre" (en bas à droite) ----------
// Quitte le suivi éventuel et recentre la caméra sur le globe entier.
document.getElementById("resetViewBtn").addEventListener("click", () => {
  if (viewer.trackedEntity) viewer.trackedEntity = undefined;
  flyToEarthOverview();
});
