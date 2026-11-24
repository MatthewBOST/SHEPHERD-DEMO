// Propagateur numérique haute fidélité (méthode de Cowell), même principe
// que GMAT : on intègre r'' = somme des accélérations avec un Runge-Kutta
// à pas adaptatif, au lieu d'une formule fermée.
//
// Forces :
//   - gravité terrestre : terme central + harmoniques zonales J2 à J6 (EGM-96)
//   - traînée atmosphérique : atmosphère exponentielle par tranches
//     (Vallado, Fundamentals of Astrodynamics, tableau 8-4), co-rotative
//   - Lune et Soleil : masses ponctuelles, éphémérides analytiques basse
//     précision (Vallado, algorithmes 29 et 31, ~0,01° pour le Soleil,
//     ~0,3° pour la Lune : largement suffisant pour une perturbation)
//   - pression de radiation solaire : modèle "boulet de canon", ombre
//     cylindrique de la Terre
//
// Intégrateur : Dormand-Prince 5(4), pas adaptatif, contrôle d'erreur
// relatif/absolu (même famille que le PrinceDormand45 de GMAT).
//
// Unités internes : km, km/s, secondes. Repère inertiel : équateur et
// équinoxe moyens de la date (assimilé à TEME, écart négligeable ici).
// Le fichier est chargé tel quel dans la page et dans les workers
// (importScripts) : il n'utilise ni Cesium ni le DOM.
(function (root) {
  "use strict";

  const MU = 398600.4418;              // km³/s²
  const RE = 6378.137;                 // km, rayon équatorial WGS-84
  const FLATTENING = 1 / 298.257223563;
  const OMEGA_EARTH = 7.292115e-5;     // rad/s
  // Harmoniques zonales non normalisées, EGM-96 (index = degré).
  const J = [0, 0, 1.08262668e-3, -2.53265649e-6, -1.61962159e-6, -2.27296083e-7, 5.40681239e-7];
  const MU_SUN = 1.32712440018e11;     // km³/s²
  const MU_MOON = 4902.800066;         // km³/s²
  const AU = 149597870.7;              // km
  const SOLAR_PRESSURE = 4.56e-6;      // N/m² à 1 UA
  const DECAY_ALTITUDE_KM = 120;       // en dessous : rentrée atmosphérique
  const DEG = Math.PI / 180;
  const TWO_PI = 2 * Math.PI;

  const DEFAULT_FORCE_MODEL = {
    zonalDegree: 6,   // 0 = Terre ponctuelle, 2 = J2 seul, jusqu'à 6
    drag: true,
    thirdBody: true,
    srp: true,
  };

  // Paramètres physiques par défaut d'un objet sans information.
  const DEFAULT_PHYSICS = {
    cd: 2.2,            // coefficient de traînée
    cr: 1.3,            // coefficient de réflectivité
    areaToMass: 0.01,   // m²/kg, ordre de grandeur d'un satellite
  };

  const INTEGRATOR = {
    rtol: 1e-10,
    atol: 1e-7,        // km et km/s
    initialStep: 30,   // s
    maxStep: 300,      // s
    minStep: 1e-3,     // s
  };

  // ---------- Temps ----------

  function julianDate(ms) {
    return ms / 86400000 + 2440587.5;
  }

  // Temps sidéral moyen de Greenwich (IAU-82), même formule que satellite.js.
  function gmst(ms) {
    const tut1 = (julianDate(ms) - 2451545.0) / 36525.0;
    let temp = -6.2e-6 * tut1 * tut1 * tut1 + 0.093104 * tut1 * tut1
      + (876600.0 * 3600 + 8640184.812866) * tut1 + 67310.54841;
    temp = ((temp * DEG) / 240.0) % TWO_PI;
    return temp < 0 ? temp + TWO_PI : temp;
  }

  // ---------- Éphémérides Soleil / Lune (km, repère inertiel de la date) ----------

  function sunPosition(ms) {
    const T = (julianDate(ms) - 2451545.0) / 36525;
    const lambdaM = 280.460 + 36000.771 * T;
    const M = (357.5291092 + 35999.05034 * T) * DEG;
    const lambda = (lambdaM + 1.914666471 * Math.sin(M) + 0.019994643 * Math.sin(2 * M)) * DEG;
    const r = (1.000140612 - 0.016708617 * Math.cos(M) - 0.000139589 * Math.cos(2 * M)) * AU;
    const eps = (23.439291 - 0.0130042 * T) * DEG;
    return [r * Math.cos(lambda), r * Math.cos(eps) * Math.sin(lambda), r * Math.sin(eps) * Math.sin(lambda)];
  }

  function moonPosition(ms) {
    const T = (julianDate(ms) - 2451545.0) / 36525;
    const s = deg => Math.sin(deg * DEG);
    const c = deg => Math.cos(deg * DEG);
    const lambda = (218.32 + 481267.8813 * T
      + 6.29 * s(134.9 + 477198.85 * T) - 1.27 * s(259.2 - 413335.38 * T)
      + 0.66 * s(235.7 + 890534.23 * T) + 0.21 * s(269.9 + 954397.70 * T)
      - 0.19 * s(357.5 + 35999.05 * T) - 0.11 * s(186.6 + 966404.05 * T)) * DEG;
    const phi = (5.13 * s(93.3 + 483202.03 * T) + 0.28 * s(228.2 + 960400.87 * T)
      - 0.28 * s(318.3 + 6003.18 * T) - 0.17 * s(217.6 - 407332.20 * T)) * DEG;
    const parallax = (0.9508 + 0.0518 * c(134.9 + 477198.85 * T) + 0.0095 * c(259.2 - 413335.38 * T)
      + 0.0078 * c(235.7 + 890534.23 * T) + 0.0028 * c(269.9 + 954397.70 * T)) * DEG;
    const eps = (23.439291 - 0.0130042 * T) * DEG;
    const r = RE / Math.sin(parallax);
    const cp = Math.cos(phi), sp = Math.sin(phi), cl = Math.cos(lambda), sl = Math.sin(lambda);
    return [
      r * cp * cl,
      r * (Math.cos(eps) * cp * sl - Math.sin(eps) * sp),
      r * (Math.sin(eps) * cp * sl + Math.cos(eps) * sp),
    ];
  }

  // Soleil et Lune bougent lentement : positions calculées aux bornes de
  // tranches de 10 min puis interpolées linéairement (erreur < 1 km sur la
  // Lune), partagées par tous les objets propagés au même instant.
  const EPHEM_BUCKET_MS = 600000;
  const ephemCache = new Map();
  function ephemAt(bucket) {
    let e = ephemCache.get(bucket);
    if (!e) {
      const ms = bucket * EPHEM_BUCKET_MS;
      e = { sun: sunPosition(ms), moon: moonPosition(ms) };
      if (ephemCache.size > 512) ephemCache.clear();
      ephemCache.set(bucket, e);
    }
    return e;
  }
  function thirdBodyPositions(ms, out) {
    const x = ms / EPHEM_BUCKET_MS;
    const b = Math.floor(x);
    const f = x - b;
    const e0 = ephemAt(b), e1 = ephemAt(b + 1);
    for (let k = 0; k < 3; k++) {
      out.sun[k] = e0.sun[k] + (e1.sun[k] - e0.sun[k]) * f;
      out.moon[k] = e0.moon[k] + (e1.moon[k] - e0.moon[k]) * f;
    }
    return out;
  }

  // ---------- Atmosphère ----------

  // [altitude de base km, densité de base kg/m³, hauteur d'échelle km]
  const ATMOSPHERE_TABLE = [
    [0, 1.225, 7.249], [25, 3.899e-2, 6.349], [30, 1.774e-2, 6.682], [40, 3.972e-3, 7.554],
    [50, 1.057e-3, 8.382], [60, 3.206e-4, 7.714], [70, 8.770e-5, 6.549], [80, 1.905e-5, 5.799],
    [90, 3.396e-6, 5.382], [100, 5.297e-7, 5.877], [110, 9.661e-8, 7.263], [120, 2.438e-8, 9.473],
    [130, 8.484e-9, 12.636], [140, 3.845e-9, 16.149], [150, 2.070e-9, 22.523], [180, 5.464e-10, 29.740],
    [200, 2.789e-10, 37.105], [250, 7.248e-11, 45.546], [300, 2.418e-11, 53.628], [350, 9.518e-12, 53.298],
    [400, 3.725e-12, 58.515], [450, 1.585e-12, 60.828], [500, 6.967e-13, 63.822], [600, 1.454e-13, 71.835],
    [700, 3.614e-14, 88.667], [800, 1.170e-14, 124.64], [900, 5.245e-15, 181.05], [1000, 3.019e-15, 268.00],
  ];

  function atmosphereDensity(altitudeKm) {
    if (altitudeKm > 2500) return 0;
    let row = ATMOSPHERE_TABLE[0];
    for (let i = ATMOSPHERE_TABLE.length - 1; i >= 0; i--) {
      if (altitudeKm >= ATMOSPHERE_TABLE[i][0]) { row = ATMOSPHERE_TABLE[i]; break; }
    }
    return row[1] * Math.exp(-(altitudeKm - row[0]) / row[2]);
  }

  // Hauteur au-dessus de l'ellipsoïde WGS-84 (approximation au premier
  // ordre en aplatissement : erreur de quelques dizaines de mètres).
  function altitudeKm(x, y, z) {
    const r = Math.sqrt(x * x + y * y + z * z);
    const s = z / r;
    return r - RE * (1 - FLATTENING * s * s);
  }

  // ---------- Modèle de forces ----------

  const scratchBodies = { sun: [0, 0, 0], moon: [0, 0, 0] };

  // Accélération totale (km/s²) écrite dans out[0..2].
  function acceleration(ms, r, v, phys, model, out) {
    const x = r[0], y = r[1], z = r[2];
    const r2 = x * x + y * y + z * z;
    const rn = Math.sqrt(r2);
    const r3 = r2 * rn;

    let ax = -MU * x / r3, ay = -MU * y / r3, az = -MU * z / r3;

    // Harmoniques zonales (voir la dérivation du potentiel
    // V = μ/r [1 − Σ Jn (Re/r)^n Pn(sin φ)]).
    const nmax = Math.min(model.zonalDegree | 0, 6);
    if (nmax >= 2) {
      const s = z / rn;
      let pPrev = 1, p = s;           // P0, P1
      let dpPrev = 0, dp = 1;         // P0', P1'
      let ratio = RE / rn;            // (Re/r)^n, mis à jour à chaque degré
      for (let n = 2; n <= nmax; n++) {
        const pn = ((2 * n - 1) * s * p - (n - 1) * pPrev) / n;
        const dpn = n * p + s * dp;
        pPrev = p; p = pn; dpPrev = dp; dp = dpn;
        ratio *= RE / rn;
        const k = MU * J[n] * ratio / r3;  // μ Jn Re^n / r^(n+3)
        const common = (n + 1) * pn + s * dpn;
        ax += k * x * common;
        ay += k * y * common;
        az += k * ((n + 1) * s * pn - (1 - s * s) * dpn) * rn;
      }
    }

    // Traînée : vitesse relative à l'atmosphère qui tourne avec la Terre.
    if (model.drag && phys.cd * phys.areaToMass > 0) {
      const h = altitudeKm(x, y, z);
      const rho = atmosphereDensity(h);
      if (rho > 0) {
        const vrx = v[0] + OMEGA_EARTH * y;
        const vry = v[1] - OMEGA_EARTH * x;
        const vrz = v[2];
        const vr = Math.sqrt(vrx * vrx + vry * vry + vrz * vrz);
        const k = -0.5 * rho * phys.cd * phys.areaToMass * vr * 1000;
        ax += k * vrx; ay += k * vry; az += k * vrz;
      }
    }

    if (model.thirdBody || model.srp) {
      const bodies = thirdBodyPositions(ms, scratchBodies);
      const sun = bodies.sun, moon = bodies.moon;
      if (model.thirdBody) {
        // Forme directe μ3 [(r3 − r)/|r3 − r|³ − r3/|r3|³].
        const addBody = (b, mu3) => {
          const dx = b[0] - x, dy = b[1] - y, dz = b[2] - z;
          const d3 = Math.pow(dx * dx + dy * dy + dz * dz, 1.5);
          const b3 = Math.pow(b[0] * b[0] + b[1] * b[1] + b[2] * b[2], 1.5);
          ax += mu3 * (dx / d3 - b[0] / b3);
          ay += mu3 * (dy / d3 - b[1] / b3);
          az += mu3 * (dz / d3 - b[2] / b3);
        };
        addBody(sun, MU_SUN);
        addBody(moon, MU_MOON);
      }
      if (model.srp && phys.cr * phys.areaToMass > 0) {
        const sn = Math.sqrt(sun[0] * sun[0] + sun[1] * sun[1] + sun[2] * sun[2]);
        const ux = sun[0] / sn, uy = sun[1] / sn, uz = sun[2] / sn;
        // Ombre cylindrique : côté nuit et à moins d'un rayon terrestre de l'axe Terre-Soleil.
        const along = x * ux + y * uy + z * uz;
        const px = x - along * ux, py = y - along * uy, pz = z - along * uz;
        const inShadow = along < 0 && px * px + py * py + pz * pz < RE * RE;
        if (!inShadow) {
          const dx = sun[0] - x, dy = sun[1] - y, dz = sun[2] - z;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const k = -SOLAR_PRESSURE * phys.cr * phys.areaToMass * (AU / d) * (AU / d) / 1000 / d;
          ax += k * dx; ay += k * dy; az += k * dz;
        }
      }
    }

    out[0] = ax; out[1] = ay; out[2] = az;
    return out;
  }

  // ---------- Intégrateur Dormand-Prince 5(4) ----------

  const C2 = 1 / 5, C3 = 3 / 10, C4 = 4 / 5, C5 = 8 / 9;
  const A21 = 1 / 5;
  const A31 = 3 / 40, A32 = 9 / 40;
  const A41 = 44 / 45, A42 = -56 / 15, A43 = 32 / 9;
  const A51 = 19372 / 6561, A52 = -25360 / 2187, A53 = 64448 / 6561, A54 = -212 / 729;
  const A61 = 9017 / 3168, A62 = -355 / 33, A63 = 46732 / 5247, A64 = 49 / 176, A65 = -5103 / 18656;
  const B1 = 35 / 384, B3 = 500 / 1113, B4 = 125 / 192, B5 = -2187 / 6784, B6 = 11 / 84;
  // Différence ordre 5 − ordre 4 (estimateur d'erreur).
  const E1 = 71 / 57600, E3 = -71 / 16695, E4 = 71 / 1920, E5 = -17253 / 339200, E6 = 22 / 525, E7 = -1 / 40;

  const K = Array.from({ length: 7 }, () => new Float64Array(6));
  const Y = new Float64Array(6);
  const Y5 = new Float64Array(6);
  const tmpR = new Float64Array(3), tmpV = new Float64Array(3), tmpA = new Float64Array(3);

  function deriv(ms, y, phys, model, out) {
    tmpR[0] = y[0]; tmpR[1] = y[1]; tmpR[2] = y[2];
    tmpV[0] = y[3]; tmpV[1] = y[4]; tmpV[2] = y[5];
    acceleration(ms, tmpR, tmpV, phys, model, tmpA);
    out[0] = y[3]; out[1] = y[4]; out[2] = y[5];
    out[3] = tmpA[0]; out[4] = tmpA[1]; out[5] = tmpA[2];
  }

  function stage(y0, h, coefs, ks, out) {
    for (let i = 0; i < 6; i++) {
      let s = 0;
      for (let j = 0; j < coefs.length; j++) s += coefs[j] * ks[j][i];
      out[i] = y0[i] + h * s;
    }
  }

  // Un pas d'essai de taille h (s) depuis state ; renvoie l'erreur
  // normalisée (≤ 1 : pas accepté) et laisse le résultat dans Y5.
  function tryStep(state, h, phys, model) {
    const t0 = state.tMs;
    const y0 = state.y;
    deriv(t0, y0, phys, model, K[0]);
    stage(y0, h, [A21], [K[0]], Y); deriv(t0 + C2 * h * 1000, Y, phys, model, K[1]);
    stage(y0, h, [A31, A32], [K[0], K[1]], Y); deriv(t0 + C3 * h * 1000, Y, phys, model, K[2]);
    stage(y0, h, [A41, A42, A43], [K[0], K[1], K[2]], Y); deriv(t0 + C4 * h * 1000, Y, phys, model, K[3]);
    stage(y0, h, [A51, A52, A53, A54], [K[0], K[1], K[2], K[3]], Y); deriv(t0 + C5 * h * 1000, Y, phys, model, K[4]);
    stage(y0, h, [A61, A62, A63, A64, A65], [K[0], K[1], K[2], K[3], K[4]], Y); deriv(t0 + h * 1000, Y, phys, model, K[5]);
    stage(y0, h, [B1, 0, B3, B4, B5, B6], [K[0], K[1], K[2], K[3], K[4], K[5]], Y5);
    deriv(t0 + h * 1000, Y5, phys, model, K[6]);
    let err = 0;
    for (let i = 0; i < 6; i++) {
      const e = h * (E1 * K[0][i] + E3 * K[2][i] + E4 * K[3][i] + E5 * K[4][i] + E6 * K[5][i] + E7 * K[6][i]);
      const scale = INTEGRATOR.atol + INTEGRATOR.rtol * Math.max(Math.abs(y0[i]), Math.abs(Y5[i]));
      err = Math.max(err, Math.abs(e) / scale);
    }
    return err;
  }

  // ---------- États ----------

  // state : { tMs, y (Float64Array r,v), h (dernier pas, s), phys, decayed, decayMs, steps }
  function createState({ epochMs, r, v, physics }) {
    const y = new Float64Array(6);
    y.set(r, 0); y.set(v, 3);
    return {
      tMs: epochMs,
      y,
      h: INTEGRATOR.initialStep,
      phys: Object.assign({}, DEFAULT_PHYSICS, physics || {}),
      decayed: false,
      decayMs: null,
      steps: 0,
    };
  }

  function cloneState(s) {
    return {
      tMs: s.tMs, y: new Float64Array(s.y), h: s.h, phys: s.phys,
      decayed: s.decayed, decayMs: s.decayMs, steps: s.steps,
    };
  }

  // Avance (ou recule) l'état jusqu'à targetMs. maxSteps borne le travail
  // d'un appel : renvoie true si la date est atteinte, false s'il faut
  // rappeler plus tard (l'état a progressé autant que permis).
  function propagateTo(state, targetMs, model = DEFAULT_FORCE_MODEL, maxSteps = Infinity) {
    if (state.decayed) return true;
    let steps = 0;
    while (state.tMs !== targetMs) {
      if (steps >= maxSteps) return false;
      const remaining = (targetMs - state.tMs) / 1000;
      const dir = remaining > 0 ? 1 : -1;
      let h = Math.min(Math.abs(state.h), INTEGRATOR.maxStep, Math.abs(remaining)) * dir;
      let err;
      for (;;) {
        err = tryStep(state, h, state.phys, model);
        if (err <= 1 || Math.abs(h) <= INTEGRATOR.minStep) break;
        h *= Math.max(0.2, 0.9 * Math.pow(err, -0.2));
      }
      const lastStep = Math.abs(h) >= Math.abs(remaining) - 1e-9;
      state.y.set(Y5);
      state.tMs = lastStep ? targetMs : state.tMs + h * 1000;
      // Le pas raccourci pour tomber pile sur la cible ne sert pas de
      // référence au pas suivant.
      if (!lastStep || err > 0.1) {
        const grow = err > 0 ? Math.min(5, 0.9 * Math.pow(err, -0.2)) : 5;
        state.h = Math.min(INTEGRATOR.maxStep, Math.max(INTEGRATOR.minStep, Math.abs(h) * grow));
      }
      steps++;
      state.steps++;
      if (altitudeKm(state.y[0], state.y[1], state.y[2]) < DECAY_ALTITUDE_KM) {
        state.decayed = true;
        state.decayMs = state.tMs;
        return true;
      }
    }
    return true;
  }

  // Poussée instantanée (km/s, repère inertiel) : tir laser, manœuvre.
  function applyImpulse(state, dv) {
    state.y[3] += dv[0]; state.y[4] += dv[1]; state.y[5] += dv[2];
  }

  // Orbite circulaire (a en km, angles en rad, u = argument de latitude).
  function circularState(aKm, inc, raan, u) {
    const vc = Math.sqrt(MU / aKm);
    const cu = Math.cos(u), su = Math.sin(u);
    const ci = Math.cos(inc), si = Math.sin(inc);
    const cO = Math.cos(raan), sO = Math.sin(raan);
    return {
      r: [aKm * (cO * cu - sO * ci * su), aKm * (sO * cu + cO * ci * su), aKm * si * su],
      v: [vc * (-cO * su - sO * ci * cu), vc * (-sO * su + cO * ci * cu), vc * si * cu],
    };
  }

  // Inertiel -> terrestre (rotation de −GMST autour de z), en km.
  function inertialToFixed(r, ms) {
    const g = gmst(ms);
    const c = Math.cos(g), s = Math.sin(g);
    return [c * r[0] + s * r[1], -s * r[0] + c * r[1], r[2]];
  }

  // Éléments osculateurs (a km, angles rad) à partir de r, v.
  function osculatingElements(y) {
    const rx = y[0], ry = y[1], rz = y[2], vx = y[3], vy = y[4], vz = y[5];
    const r = Math.sqrt(rx * rx + ry * ry + rz * rz);
    const v2 = vx * vx + vy * vy + vz * vz;
    const hx = ry * vz - rz * vy, hy = rz * vx - rx * vz, hz = rx * vy - ry * vx;
    const h = Math.sqrt(hx * hx + hy * hy + hz * hz);
    const rv = rx * vx + ry * vy + rz * vz;
    const ex = ((v2 - MU / r) * rx - rv * vx) / MU;
    const ey = ((v2 - MU / r) * ry - rv * vy) / MU;
    const ez = ((v2 - MU / r) * rz - rv * vz) / MU;
    const e = Math.sqrt(ex * ex + ey * ey + ez * ez);
    const a = 1 / (2 / r - v2 / MU);
    const inc = Math.acos(Math.max(-1, Math.min(1, hz / h)));
    let raan = Math.atan2(hx, -hy);
    if (raan < 0) raan += TWO_PI;
    return { a, e, inc, raan, perigeeKm: a * (1 - e) - RE, apogeeKm: a * (1 + e) - RE };
  }

  function speedKmS(state) {
    const y = state.y;
    return Math.sqrt(y[3] * y[3] + y[4] * y[4] + y[5] * y[5]);
  }

  root.OrbitPropagator = {
    MU, RE, OMEGA_EARTH, J, DECAY_ALTITUDE_KM,
    DEFAULT_FORCE_MODEL, DEFAULT_PHYSICS, INTEGRATOR,
    julianDate, gmst, sunPosition, moonPosition, atmosphereDensity, altitudeKm,
    acceleration, createState, cloneState, propagateTo, applyImpulse,
    circularState, inertialToFixed, osculatingElements, speedKmS,
  };
})(typeof self !== "undefined" ? self : this);
