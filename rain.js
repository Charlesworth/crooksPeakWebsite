/* =====================================================================
   Matrix digital rain — cascading katakana + digits.
   Progressive enhancement: page works without JS. No console errors.
   ===================================================================== */
(function () {
    "use strict";

    var canvas = document.getElementById("rain");
    if (!canvas || !canvas.getContext) { return; }
    var ctx = canvas.getContext("2d");
    if (!ctx) { return; }

    // Half-width katakana + digits — the classic Matrix glyph set.
    var GLYPHS = (
        "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ" +
        "0123456789"
    ).split("");

    var FONT_SIZE = 16;
    var COL_WIDTH = 16;
    var dpr = Math.max(1, window.devicePixelRatio || 1);

    var cols = [];
    var widthCss = 0, heightCss = 0;

    function makeColumn(initial) {
        var len = 8 + Math.floor(Math.random() * 22);
        // pick distinct-ish glyph set for the column
        var glyphs = [];
        for (var i = 0; i < len; i++) {
            glyphs.push(GLYPHS[(Math.random() * GLYPHS.length) | 0]);
        }
        return {
            x: 0,            // px (css)
            y: 0,            // head position in px (css), negative = above viewport
            speed: 1.5 + Math.random() * 3.5,   // px per tick
            glyphs: glyphs,
            len: len
        };
    }

    function resize() {
        dpr = Math.max(1, window.devicePixelRatio || 1);
        widthCss = document.documentElement.clientWidth || window.innerWidth;
        heightCss = document.documentElement.clientHeight || window.innerHeight;
        canvas.width = Math.floor(widthCss * dpr);
        canvas.height = Math.floor(heightCss * dpr);
        canvas.style.width = widthCss + "px";
        canvas.style.height = heightCss + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var nCols = Math.ceil(widthCss / COL_WIDTH);
        cols = new Array(nCols);
        for (var i = 0; i < nCols; i++) {
            var c = makeColumn(true);
            c.x = i * COL_WIDTH;
            // Initial columns spread through the viewport so the screen
            // isn't empty on load; recycled columns re-enter from above.
            c.y = Math.random() * heightCss;
            cols[i] = c;
        }
    }

    function drawFrame() {
        // Fade trails: paint translucent black over the whole canvas instead of clearing.
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(0, 0, widthCss, heightCss);

        ctx.font = FONT_SIZE + "px " + "ui-monospace, 'Cascadia Mono', 'Courier New', monospace";
        ctx.textBaseline = "top";

        for (var i = 0; i < cols.length; i++) {
            var c = cols[i];
            // draw trail
            for (var t = 0; t < c.len; t++) {
                var gy = c.y - t * FONT_SIZE;
                if (gy < -FONT_SIZE || gy > heightCss) { continue; }
                var g = c.glyphs[t % c.glyphs.length];
                if (t === 0) {
                    // leading head: bright near-white green
                    ctx.fillStyle = "#c8ffc8";
                    ctx.fillText(g, c.x + 2, gy);
                } else {
                    // trail fades from green toward transparent via alpha
                    var a = 1 - (t / c.len);
                    ctx.fillStyle = "rgba(0,255,65," + a.toFixed(3) + ")";
                    ctx.fillText(g, c.x + 2, gy);
                }
            }

            c.y += c.speed;
            // when tail clears bottom, recycle to top with new glyphs
            if (c.y - c.len * FONT_SIZE > heightCss) {
                var nc = makeColumn(false);
                nc.x = c.x;
                nc.y = -Math.random() * (FONT_SIZE * 4);
                cols[i] = nc;
            }
        }
    }

    function drawStatic() {
        // Single frozen frame for reduced-motion / no-anim users.
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, widthCss, heightCss);
        ctx.font = FONT_SIZE + "px " + "ui-monospace, 'Cascadia Mono', 'Courier New', monospace";
        ctx.textBaseline = "top";
        for (var i = 0; i < cols.length; i++) {
            var c = cols[i];
            for (var t = 0; t < c.len; t++) {
                var gy = ((i * 53 + t * 17) % heightCss);
                if (gy < 0) { gy += heightCss; }
                ctx.fillStyle = "rgba(0,255,65," + (0.6 - t / c.len * 0.6).toFixed(3) + ")";
                ctx.fillText(c.glyphs[t % c.glyphs.length], c.x + 2, gy);
            }
        }
    }

    var reduced = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var running = false;
    var lastTick = 0;
    var TICK_MS = 55;   // ~18fps — chunky authentic feel

    function loop(ts) {
        if (!running) { return; }
        if (!lastTick) { lastTick = ts; }
        if (ts - lastTick >= TICK_MS) {
            drawFrame();
            lastTick = ts;
        }
        if (!document.hidden) {
            window.requestAnimationFrame(loop);
        } else {
            // pause when hidden; resume on visibility restore
            running = false;
        }
    }

    function start() {
        if (running) { return; }
        running = true;
        lastTick = 0;
        window.requestAnimationFrame(loop);
    }

    // ---- boot line typewriter (progressive enhancement) ----
    function bootLine() {
        var el = document.getElementById("bootLine");
        if (!el) { return; }
        var text = "> loading crooks_peak.exe ... OK";
        if (reduced) {
            el.textContent = text;
            return;
        }
        var i = 0;
        el.textContent = "";
        (function type() {
            if (i <= text.length) {
                el.textContent = text.slice(0, i);
                i++;
                window.setTimeout(type, 45);
            }
        })();
    }

    // ---- init ----
    function init() {
        resize();
        if (reduced) {
            drawStatic();
        } else {
            // draw one frame immediately so it isn't empty before first tick
            drawFrame();
            start();
        }
        bootLine();
    }

    // debounced resize
    var resizeTimer = null;
    window.addEventListener("resize", function () {
        if (resizeTimer) { window.clearTimeout(resizeTimer); }
        resizeTimer = window.setTimeout(function () {
            resize();
            if (reduced) { drawStatic(); } else { drawFrame(); }
        }, 150);
    });

    // resume when tab becomes visible again
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden && !reduced && !running) {
            start();
        }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
