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
      if (overlap) {
        verdict.innerHTML = '<b style="color:' + p.faint + '">Интервалы перекрываются.</b> Разница не показана — данных мало.';
      } else {
        verdict.innerHTML = '<b style="color:' + p.accent + '">Интервалы разошлись.</b> Разница пережила смену зерна при n = ' + n + '.';
      }
    }

    if (!hero) {
      const controls = document.createElement("div");
      controls.className = "lm-fig__controls";

      const label = document.createElement("label");
      label.className = "lm-fig__slider";
      const cap = document.createElement("span");
      cap.textContent = "зёрен: ";
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
      reseed.textContent = "Другое зерно";
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
    hint.innerHTML = "Тащите синюю точку. <b>Среднее</b> гонится за выбросом; <b>IQM</b> стоит: он отбросил лучшую и худшую четверть.";

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
    const tokens = ["кошка", "села", "на", "коврик", "потому", "что", "устала"];
    // Похожести запрос→ключ, выставлены руками, чтобы картинка что-то значила:
    // «устала» смотрит на того, кто устал; «коврик» — на «села … на».
    const S = [
      [3, 1, 0, 1, 0, 0, 1],   // кошка
      [2, 3, 0, 0, 0, 0, 1],   // села
      [0, 2, 3, 2, 0, 0, 0],   // на
      [1, 2, 2, 3, 0, 0, 0],   // коврик
      [0, 0, 0, 0, 3, 2, 2],   // потому
      [0, 0, 0, 0, 2, 3, 2],   // что
      [3, 2, 0, 0, 1, 0, 3],   // устала
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
    label.textContent = "смотрит на";
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
    scap.textContent = "масштаб softmax: ";
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
      const w = softmax(S[q], T);
      const max = Math.max(...w);
      kChips.forEach((c, j) => {
        c.style.background = "color-mix(in srgb, " + p.accent + " " + Math.round(w[j] * 100) + "%, transparent)";
        c.style.color = w[j] > 0.45 ? "#0a0b0e" : p.paper;
        c.style.borderColor = j === w.indexOf(max) ? p.accent : "transparent";
      });
      sOut.textContent = T.toFixed(1);
      const top = w.indexOf(max);
      verdict.innerHTML = "«" + tokens[q] + "» сильнее всего смотрит на «" + tokens[top] +
        "» (" + (max * 100).toFixed(0) + "%). Масштаб острит внимание при малом значении и размазывает при большом — это и есть роль <b>1/&radic;d</b>.";
    }
    draw();
  }

  // --- Диспетчер -----------------------------------------------------------

  const KINDS = { "ci-overlap": ciOverlap, "mean-vs-iqm": meanIqm, "attention": attention };

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
