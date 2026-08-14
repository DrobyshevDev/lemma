/* ---------------------------------------------------------------------------
   lemma — интерактивные фигуры.

   Одна задача: дать читателю не картинку формулы, а прибор. Двигаешь параметр —
   меняется вывод, и меняется тут же. Формула объясняет, что произойдёт; прибор
   показывает, что произошло, и на нём видно, где рассуждение ломается.

   Без зависимостей. Каждая фигура объявляется в разметке одним контейнером
   `<div data-lm-fig="имя" ...>`, скрипт её гидрирует. Цвета читаются из тех же
   CSS-переменных, что и тема, поэтому фигура не знает своей палитры и не
   разъезжается с ней. Всё уважает prefers-reduced-motion: там, где движение
   несёт смысл, оно заменяется статикой, а не выключается молча.
--------------------------------------------------------------------------- */

(function () {
  "use strict";

  const SVGNS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Язык ----------------------------------------------------------------
  // Строки берутся по языку страницы (<html lang>), который i18n-плагин ставит
  // per-build. Так один и тот же виджет говорит по-русски на ru-странице и
  // по-английски на en-странице, а разметка остаётся одна.
  function lang() {
    return (document.documentElement.getAttribute("lang") || "ru").startsWith("en") ? "en" : "ru";
  }
  const STR = {
    ru: {
      distBase: "База",
      distMethod: "Метод",
      distVerdict: "Два распределения результата, база и метод. Они перекрываются: разницу не отличить от шума.",
      seeds: "зёрен: ",
      reseed: "Другое зерно",
      overlap: (f) => '<b style="color:' + f + '">Интервалы перекрываются.</b> Разница не показана — данных мало.',
      separated: (a, n) => '<b style="color:' + a + '">Интервалы разошлись.</b> Разница пережила смену зерна при n = ' + n + '.',
      meanHint: "Тащите синюю точку. <b>Среднее</b> гонится за выбросом; <b>IQM</b> стоит: он отбросил лучшую и худшую четверть.",
      attTokens: ["кошка", "села", "на", "коврик", "потому", "что", "устала"],
      attLook: "смотрит на",
      attScale: "масштаб softmax: ",
      attVerdict: (q, top, pct) => "«" + q + "» сильнее всего смотрит на «" + top + "» (" + pct +
        "%). Масштаб острит внимание при малом значении и размазывает при большом — это и есть роль <b>1/&radic;d</b>.",
    },
    en: {
      distBase: "Baseline",
      distMethod: "Method",
      distVerdict: "Two result distributions, baseline and method. They overlap: the difference cannot be told from noise.",
      seeds: "seeds: ",
      reseed: "Reseed",
      overlap: (f) => '<b style="color:' + f + '">The intervals overlap.</b> No difference shown — too little data.',
      separated: (a, n) => '<b style="color:' + a + '">The intervals separated.</b> The difference survived a change of seed at n = ' + n + '.',
      meanHint: "Drag the blue point. The <b>mean</b> chases the outlier; the <b>IQM</b> stays put — it dropped the best and worst quarter.",
      attTokens: ["cat", "sat", "on", "mat", "because", "so", "tired"],
      attLook: "attends to",
      attScale: "softmax scale: ",
      attVerdict: (q, top, pct) => "“" + q + "” attends most to “" + top + "” (" + pct +
        "%). The scale sharpens attention when small and spreads it when large — this is the role of <b>1/&radic;d</b>.",
    },
  };
  function S() { return STR[lang()]; }

  // --- Утилиты -------------------------------------------------------------

  // Детерминированный ГПСЧ. Нужен, а не Math.random, потому что «другое зерно»
  // должно быть воспроизводимым: одна и та же кнопка на двух машинах ведёт к
  // одной картинке, и скриншот в CI не пляшет от прогона к прогону.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Стандартная нормаль из равномерной, метод Бокса — Мюллера.
  function gaussian(rng) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function token(el, name, fallback) {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
  }

  function svg(tag, attrs) {
    const node = document.createElementNS(SVGNS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function num(el, name, fallback) {
    const v = parseFloat(el.getAttribute(name));
    return Number.isFinite(v) ? v : fallback;
  }

  // --- Палитра -------------------------------------------------------------
  // Читается один раз с корня документа: тема выставляет переменные на схеме
  // slate, которая и активна.

  function palette(el) {
    return {
      accent: token(el, "--accent", "#a5b0ff"),
      accentDeep: token(el, "--accent-deep", "#7b8aff"),
      gold: token(el, "--gold", "#d8b678"),
      paper: token(el, "--paper", "#eceef2"),
      dim: token(el, "--paper-dim", "#9aa1ad"),
      faint: token(el, "--paper-faint", "#6f7783"),
      line: token(el, "--ink-line", "#1e2128"),
      lineLit: token(el, "--ink-line-lit", "#2c313b"),
      raised: token(el, "--ink-raised", "#101217"),
    };
  }

  /* =========================================================================
     Фигура: перекрытие интервалов — «результат или шум»
     -------------------------------------------------------------------------
     Два результата с 95-процентными интервалами на одной оси: метод и база.
     Истинная разница между ними зафиксирована и мала. Ползунок «зёрна» сжимает
     интервалы как 1/sqrt(n); кнопка «другое зерно» пересэмплирует наблюдаемые
     средние. Пока интервалы перекрываются, вердикт: разница не показана.

     Это первый модуль курса, поставленный руками: одно число из одного запуска
     — не свойство метода, а одно наблюдение случайной величины.
     ========================================================================= */

  function ciOverlap(el) {
    const p = palette(el);
    const muMethod = num(el, "data-mu-method", 0.928);
    const muBase = num(el, "data-mu-base", 0.905);
    const sigma = num(el, "data-sigma", 0.02);
    const lo = num(el, "data-lo", 0.86);
    const hi = num(el, "data-hi", 0.965);
    const hero = el.getAttribute("data-mode") === "hero";

    const W = 440, H = hero ? 200 : 220;
    const padL = 16, padR = 16, top = hero ? 34 : 30;
    const rowGap = 52;
    const axisY = top + rowGap + 34;
    const plotL = padL, plotR = W - padR;

    const x = (val) => plotL + ((val - lo) / (hi - lo)) * (plotR - plotL);

    const frame = svg("svg", {
      viewBox: `0 0 ${W} ${H}`, width: "100%", role: "img",
      "aria-label": "Два результата с доверительными интервалами на одной оси; когда интервалы перекрываются, разница между методом и базой не показана.",
    });
    frame.style.display = "block";

    // Ось: тонкая линия и две-три засечки.
    frame.appendChild(svg("line", { x1: plotL, y1: axisY, x2: plotR, y2: axisY, stroke: p.line, "stroke-width": 1 }));
    for (const t of [lo, (lo + hi) / 2, hi]) {
      frame.appendChild(svg("line", { x1: x(t), y1: axisY, x2: x(t), y2: axisY + 5, stroke: p.faint, "stroke-width": 1 }));
      const lab = svg("text", { x: x(t), y: axisY + 16, "text-anchor": "middle", fill: p.faint, "font-size": 9 });
      lab.textContent = t.toFixed(2);
      lab.style.fontFamily = "var(--mono)";
      frame.appendChild(lab);
    }

    // Две строки: база (золото), метод (акцент). Каждая — группа, которую мы
    // двигаем при пересчёте.
    function row(y, color, name) {
      const g = svg("g", {});
      const bar = svg("line", { y1: y, y2: y, stroke: color, "stroke-width": 2.5, "stroke-linecap": "round" });
      const capL = svg("line", { y1: y - 5, y2: y + 5, stroke: color, "stroke-width": 1.5 });
      const capR = svg("line", { y1: y - 5, y2: y + 5, stroke: color, "stroke-width": 1.5 });
      const dot = svg("circle", { cy: y, r: 3.5, fill: color });
      const tag = svg("text", { x: plotL, y: y - 12, fill: color, "font-size": 10 });
      tag.textContent = name; tag.style.fontFamily = "var(--mono)"; tag.style.letterSpacing = ".04em";
      const val = svg("text", { y: y - 12, "text-anchor": "end", x: plotR, fill: p.dim, "font-size": 10 });
      val.style.fontFamily = "var(--mono)";
      for (const n of [bar, capL, capR, dot, tag, val]) g.appendChild(n);
      if (!reduceMotion) {
        for (const n of [bar, capL, capR, dot]) n.style.transition = "all .5s cubic-bezier(.4,0,.2,1)";
      }
      frame.appendChild(g);
      return { bar, capL, capR, dot, val };
    }

    const rBase = row(top + 8, p.gold, "База");
    const rMethod = row(top + 8 + rowGap, p.accent, "Метод");

    // Управление и вердикт живут в HTML: текст там резче, чем в SVG, а вердикт
    // обязан быть словами, а не только цветом.
    const verdict = document.createElement("p");
    verdict.className = "lm-fig__verdict";

    el.appendChild(frame);
    el.appendChild(verdict);

    let n = num(el, "data-n", hero ? 5 : 6);
    let seed = 1;

    function draw() {
      const se = sigma / Math.sqrt(n);
      const half = 1.96 * se;
      const rng = mulberry32(seed * 2654435761);
      const obsBase = muBase + gaussian(rng) * se;
      const obsMethod = muMethod + gaussian(rng) * se;

      function place(r, obs) {
        r.bar.setAttribute("x1", x(obs - half));
        r.bar.setAttribute("x2", x(obs + half));
        r.capL.setAttribute("x1", x(obs - half)); r.capL.setAttribute("x2", x(obs - half));
        r.capR.setAttribute("x1", x(obs + half)); r.capR.setAttribute("x2", x(obs + half));
        r.dot.setAttribute("cx", x(obs));
        r.val.textContent = obs.toFixed(3);
      }
      place(rBase, obsBase);
      place(rMethod, obsMethod);

      const overlap = obsBase + half >= obsMethod - half;
      verdict.innerHTML = overlap ? S().overlap(p.faint) : S().separated(p.accent, n);
    }

    if (!hero) {
      const controls = document.createElement("div");
      controls.className = "lm-fig__controls";

      const label = document.createElement("label");
      label.className = "lm-fig__slider";
      const cap = document.createElement("span");
      cap.textContent = S().seeds;
      const nOut = document.createElement("b");
      nOut.textContent = n;
      const slider = document.createElement("input");
      slider.type = "range"; slider.min = "3"; slider.max = "30"; slider.step = "1"; slider.value = n;
      slider.setAttribute("aria-label", "число зёрен ГПСЧ");
      slider.addEventListener("input", () => { n = +slider.value; nOut.textContent = n; draw(); });
      cap.appendChild(nOut);
      label.appendChild(cap);
      label.appendChild(slider);

      const reseed = document.createElement("button");
      reseed.type = "button";
      reseed.className = "lm-fig__btn";
      reseed.textContent = S().reseed;
      reseed.addEventListener("click", () => { seed = (seed % 999) + 1; draw(); });

      controls.appendChild(label);
      controls.appendChild(reseed);
      el.appendChild(controls);
      draw();
    } else {
      draw();
      // На лендинге фигура сама перебирает зёрна: пять запусков подряд, и видно,
      // что «лучший» скачет между методом и базой. На reduced-motion — один кадр.
      if (!reduceMotion) {
        setInterval(() => { seed = (seed % 6) + 1; draw(); }, 2600);
      }
    }
  }

  /* =========================================================================
     Фигура: среднее против IQM — где среднее врёт
     -------------------------------------------------------------------------
     Восемь запусков на числовой оси, один — выброс, его можно тащить. Среднее
     гонится за выбросом, межквартильное среднее стоит. Понимание робастности
     живёт в том, что маркеры разъезжаются под пальцем.
     ========================================================================= */

  function meanIqm(el) {
    const p = palette(el);
    const base = [10, 11, 9, 10, 12, 9, 11];
    const lo = 0, hi = 65;
    const W = 440, H = 150;
    const padL = 18, padR = 18, axisY = 96;
    const plotL = padL, plotR = W - padR;
    const x = (v) => plotL + ((v - lo) / (hi - lo)) * (plotR - plotL);
    const inv = (px) => lo + ((px - plotL) / (plotR - plotL)) * (hi - lo);

    let outlier = 60;

    const frame = svg("svg", {
      viewBox: `0 0 ${W} ${H}`, width: "100%", role: "img",
      "aria-label": "Восемь результатов на числовой оси; среднее и межквартильное среднее показаны маркерами. Перетаскивание выброса сдвигает среднее, но не межквартильное среднее.",
    });
    frame.style.display = "block";
    frame.style.touchAction = "none";

    frame.appendChild(svg("line", { x1: plotL, y1: axisY, x2: plotR, y2: axisY, stroke: p.line, "stroke-width": 1 }));

    // Маркеры сводок: две вертикали с подписями сверху.
    function marker(color, name) {
      const g = svg("g", {});
      const l = svg("line", { y1: 34, y2: axisY + 6, stroke: color, "stroke-width": 1.5, "stroke-dasharray": "3 3" });
      const t = svg("text", { y: 26, "text-anchor": "middle", fill: color, "font-size": 10 });
      t.style.fontFamily = "var(--mono)";
      g.appendChild(l); g.appendChild(t);
      frame.appendChild(g);
      return { l, t };
    }
    const mMean = marker(p.gold, "среднее");
    const mIqm = marker(p.accent, "IQM");

    const dots = [];
    function ensureDots(vals) {
      while (dots.length < vals.length) {
        const c = svg("circle", { cy: axisY, r: 5, fill: p.raised, stroke: p.dim, "stroke-width": 1.5 });
        frame.appendChild(c); dots.push(c);
      }
    }

    function mean(a) { return a.reduce((s, v) => s + v, 0) / a.length; }
    function iqm(a) {
      const s = [...a].sort((u, v) => u - v);
      const k = Math.floor(s.length / 4);
      const mid = s.slice(k, s.length - k);
      return mean(mid);
    }

    const draggable = svg("circle", { cy: axisY, r: 7, fill: p.accent, stroke: p.paper, "stroke-width": 1.5, cursor: "ew-resize" });
    draggable.setAttribute("role", "slider");
    draggable.setAttribute("tabindex", "0");
    draggable.setAttribute("aria-label", "выброс, перетаскиваемый по оси");

    function draw() {
      const vals = base.concat([outlier]);
      ensureDots(vals);
      vals.forEach((v, i) => { dots[i].setAttribute("cx", x(v)); });
      draggable.setAttribute("cx", x(outlier));
      draggable.setAttribute("aria-valuenow", Math.round(outlier));
      const mv = mean(vals), iv = iqm(vals);
      mMean.l.setAttribute("x1", x(mv)); mMean.l.setAttribute("x2", x(mv));
      mMean.t.setAttribute("x", x(mv)); mMean.t.textContent = "среднее " + mv.toFixed(1);
      mIqm.l.setAttribute("x1", x(iv)); mIqm.l.setAttribute("x2", x(iv));
      mIqm.t.setAttribute("x", x(iv)); mIqm.t.textContent = "IQM " + iv.toFixed(1);
    }

    frame.appendChild(draggable);

    // Тащим мышью, пальцем и стрелками с клавиатуры — три пути к одному
    // действию, потому что фигура на трогать, а не только на смотреть.
    let dragging = false;
    function clientToVal(clientX) {
      const box = frame.getBoundingClientRect();
      const px = ((clientX - box.left) / box.width) * W;
      return Math.max(13, Math.min(hi, inv(px)));
    }
    function onMove(e) {
      if (!dragging) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      outlier = clientToVal(cx); draw(); e.preventDefault();
    }
    function start(e) { dragging = true; onMove(e); }
    function end() { dragging = false; }
    draggable.addEventListener("mousedown", start);
    draggable.addEventListener("touchstart", start, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", end);
    window.addEventListener("touchend", end);
    draggable.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { outlier = Math.max(13, outlier - 2); draw(); e.preventDefault(); }
      if (e.key === "ArrowRight") { outlier = Math.min(hi, outlier + 2); draw(); e.preventDefault(); }
    });

    const hint = document.createElement("p");
    hint.className = "lm-fig__verdict";
    hint.innerHTML = S().meanHint;

    el.appendChild(frame);
    el.appendChild(hint);
    draw();
  }

  /* =========================================================================
     Фигура: внимание — «кликни слово, увидь, на что оно смотрит»
     -------------------------------------------------------------------------
     Само-внимание на игрушечном предложении. Клик по слову-запросу — и второй
     ряд подсвечивается по весам softmax(похожесть / T). Ползунок масштаба — это
     и есть роль 1/sqrt(d): маленький T делает внимание острым, большой —
     размазывает его по всем словам. Здесь видно то, что в формуле спрятано.
     ========================================================================= */

  function attention(el) {
    const p = palette(el);
    const tokens = S().attTokens;
    // Похожести запрос→ключ, выставлены руками, чтобы картинка что-то значила:
    // «устала» смотрит на того, кто устал; «коврик» — на «села … на». Порядок
    // строк — роли (кто, действие, предлог, место, причина…), поэтому матрица
    // осмысленна и для английских токенов на тех же позициях.
    const SCORES = [
      [3, 1, 0, 1, 0, 0, 1],   // кошка / cat
      [2, 3, 0, 0, 0, 0, 1],   // села / sat
      [0, 2, 3, 2, 0, 0, 0],   // на / on
      [1, 2, 2, 3, 0, 0, 0],   // коврик / mat
      [0, 0, 0, 0, 3, 2, 2],   // потому / because
      [0, 0, 0, 0, 2, 3, 2],   // что / so
      [3, 2, 0, 0, 1, 0, 3],   // устала / tired
    ];
    let q = 6;      // запрос по умолчанию — «устала»
    let T = 1;      // масштаб (температура softmax)

    function softmax(row, t) {
      const z = row.map((v) => v / t);
      const m = Math.max(...z);
      const e = z.map((v) => Math.exp(v - m));
      const s = e.reduce((a, b) => a + b, 0);
      return e.map((v) => v / s);
    }

    const qRow = document.createElement("div");
    qRow.className = "lm-att__row";
    const label = document.createElement("div");
    label.className = "lm-att__label";
    label.textContent = S().attLook;
    const kRow = document.createElement("div");
    kRow.className = "lm-att__row";

    const qChips = tokens.map((tok, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "lm-att__chip lm-att__chip--q";
      b.textContent = tok;
      b.setAttribute("aria-pressed", i === q ? "true" : "false");
      b.addEventListener("click", () => { q = i; draw(); });
      qRow.appendChild(b);
      return b;
    });
    const kChips = tokens.map((tok) => {
      const s = document.createElement("span");
      s.className = "lm-att__chip lm-att__chip--k";
      s.textContent = tok;
      kRow.appendChild(s);
      return s;
    });

    const controls = document.createElement("div");
    controls.className = "lm-fig__controls";
    const slabel = document.createElement("label");
    slabel.className = "lm-fig__slider";
    const scap = document.createElement("span");
    scap.textContent = S().attScale;
    const sOut = document.createElement("b");
    const slider = document.createElement("input");
    slider.type = "range"; slider.min = "0.4"; slider.max = "3"; slider.step = "0.1"; slider.value = "1";
    slider.setAttribute("aria-label", "температура softmax");
    slider.addEventListener("input", () => { T = +slider.value; draw(); });
    scap.appendChild(sOut);
    slabel.appendChild(scap); slabel.appendChild(slider);
    controls.appendChild(slabel);

    const verdict = document.createElement("p");
    verdict.className = "lm-fig__verdict";

    el.appendChild(qRow);
    el.appendChild(label);
    el.appendChild(kRow);
    el.appendChild(controls);
    el.appendChild(verdict);

    function draw() {
      qChips.forEach((c, i) => c.setAttribute("aria-pressed", i === q ? "true" : "false"));
      const w = softmax(SCORES[q], T);
      const max = Math.max(...w);
      kChips.forEach((c, j) => {
        c.style.background = "color-mix(in srgb, " + p.accent + " " + Math.round(w[j] * 100) + "%, transparent)";
        c.style.color = w[j] > 0.45 ? "#0a0b0e" : p.paper;
        c.style.borderColor = j === w.indexOf(max) ? p.accent : "transparent";
      });
      sOut.textContent = T.toFixed(1);
      const top = w.indexOf(max);
      verdict.innerHTML = S().attVerdict(tokens[q], tokens[top], (max * 100).toFixed(0));
    }
    draw();
  }

  /* =========================================================================
     Фигура: два распределения — «результат или шум», колоколами
     -------------------------------------------------------------------------
     Мейнстримный образ статистики: два нормальных распределения результата,
     база и метод, с закрашенным перекрытием. Пока колокола налезают друг на
     друга, разницу между ними не отличить от шума. Заголовочная версия тихо
     дышит зёрнами; на reduced-motion стоит один кадр.
     ========================================================================= */

  function distOverlap(el) {
    const p = palette(el);
    const muMethod = num(el, "data-mu-method", 0.928);
    const muBase = num(el, "data-mu-base", 0.905);
    const sigma = num(el, "data-sigma", 0.02);
    const lo = num(el, "data-lo", 0.85);
    const hi = num(el, "data-hi", 0.985);
    const hero = el.getAttribute("data-mode") === "hero";

    const W = 460, H = 300;
    const padX = 20, top = 42, axisY = H - 40;
    const peakH = axisY - top;
    const x = (v) => padX + ((v - lo) / (hi - lo)) * (W - 2 * padX);
    const pdf = (v, mu) => Math.exp(-0.5 * ((v - mu) / sigma) ** 2);   // пик = 1
    const N = 96;
    const xs = Array.from({ length: N + 1 }, (_, i) => lo + (i / N) * (hi - lo));

    const frame = svg("svg", {
      viewBox: `0 0 ${W} ${H}`, width: "100%", role: "img",
      "aria-label": "Два нормальных распределения результата, база и метод, перекрываются: разницу не отличить от шума.",
    });
    frame.style.display = "block";

    frame.appendChild(svg("line", { x1: padX, y1: axisY, x2: W - padX, y2: axisY, stroke: p.line, "stroke-width": 1 }));
    for (const t of [lo, (lo + hi) / 2, hi]) {
      frame.appendChild(svg("line", { x1: x(t), y1: axisY, x2: x(t), y2: axisY + 5, stroke: p.faint, "stroke-width": 1 }));
      const lab = svg("text", { x: x(t), y: axisY + 17, "text-anchor": "middle", fill: p.faint, "font-size": 10 });
      lab.textContent = t.toFixed(2); lab.style.fontFamily = "var(--mono)";
      frame.appendChild(lab);
    }

    // Заливка + обводка + пик-подпись для одного колокола. Возвращает узлы,
    // которые двигаем при пересчёте, чтобы не пересоздавать SVG на каждый кадр.
    function bell(color, name) {
      const fill = svg("path", { fill: color, "fill-opacity": ".16", stroke: "none" });
      const line = svg("path", { fill: "none", stroke: color, "stroke-width": 2 });
      const mean = svg("line", { y1: top - 6, y2: axisY, stroke: color, "stroke-width": 1, "stroke-dasharray": "3 4", "stroke-opacity": ".7" });
      const tag = svg("text", { fill: color, "font-size": 11, "text-anchor": "middle" });
      tag.textContent = name; tag.style.fontFamily = "var(--mono)"; tag.style.letterSpacing = ".02em";
      for (const n of [fill, line, mean, tag]) frame.appendChild(n);
      return { fill, line, mean, tag };
    }
    const overlap = svg("path", { fill: p.paper, "fill-opacity": ".14", stroke: "none" });
    frame.appendChild(overlap);
    const bBase = bell(p.gold, S().distBase);
    const bMethod = bell(p.accent, S().distMethod);

    const verdict = document.createElement("p");
    verdict.className = "lm-fig__verdict";
    verdict.textContent = S().distVerdict;

    el.appendChild(frame);
    el.appendChild(verdict);

    function path(ys, closeAxis) {
      let d = closeAxis ? `M ${x(xs[0]).toFixed(1)} ${axisY}` : `M ${x(xs[0]).toFixed(1)} ${ys[0].toFixed(1)}`;
      for (let i = 0; i <= N; i++) d += ` L ${x(xs[i]).toFixed(1)} ${ys[i].toFixed(1)}`;
      if (closeAxis) d += ` L ${x(xs[N]).toFixed(1)} ${axisY} Z`;
      return d;
    }

    function render(mB, mM) {
      const yB = xs.map((v) => axisY - peakH * pdf(v, mB));
      const yM = xs.map((v) => axisY - peakH * pdf(v, mM));
      bBase.fill.setAttribute("d", path(yB, true));
      bBase.line.setAttribute("d", path(yB, false));
      bMethod.fill.setAttribute("d", path(yM, true));
      bMethod.line.setAttribute("d", path(yM, false));
      // перекрытие — область под нижним из колоколов (больший y ближе к оси)
      const yOv = xs.map((v, i) => Math.max(yB[i], yM[i]));
      overlap.setAttribute("d", path(yOv, true));
      bBase.mean.setAttribute("x1", x(mB)); bBase.mean.setAttribute("x2", x(mB));
      bBase.tag.setAttribute("x", x(mB)); bBase.tag.setAttribute("y", axisY - peakH - 10);
      bMethod.mean.setAttribute("x1", x(mM)); bMethod.mean.setAttribute("x2", x(mM));
      bMethod.tag.setAttribute("x", x(mM)); bMethod.tag.setAttribute("y", axisY - peakH - 10);
    }

    render(muBase, muMethod);

    if (hero && !reduceMotion) {
      // Тихо дышим зёрнами: наблюдаемые средние немного гуляют вокруг истинных,
      // и видно, что «лучший» скачет, а колокола всё равно налезают.
      let seed = 1;
      setInterval(() => {
        seed = (seed % 6) + 1;
        const rng = mulberry32(seed * 2654435761);
        render(muBase + gaussian(rng) * sigma * 0.32, muMethod + gaussian(rng) * sigma * 0.32);
      }, 2800);
    }
  }

  // --- Диспетчер -----------------------------------------------------------

  const KINDS = {
    "ci-overlap": ciOverlap,
    "mean-vs-iqm": meanIqm,
    "attention": attention,
    "dist-overlap": distOverlap,
  };

  function hydrate(root) {
    (root || document).querySelectorAll("[data-lm-fig]").forEach((el) => {
      if (el.dataset.lmReady) return;
      const fn = KINDS[el.getAttribute("data-lm-fig")];
      if (!fn) return;
      el.dataset.lmReady = "1";
      try { fn(el); } catch (err) { console.error("lemma-viz:", err); }
    });
  }

  // Material переопределяет document$ при навигации; без instant-навигации это
  // просто «после загрузки». Поддерживаем оба пути, чтобы фигуры оживали и на
  // лендинге, и на странице модуля.
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(() => hydrate(document));
  } else if (document.readyState !== "loading") {
    hydrate(document);
  } else {
    document.addEventListener("DOMContentLoaded", () => hydrate(document));
  }
})();
