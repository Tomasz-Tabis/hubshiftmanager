(() => {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    const form = document.getElementById("demoForm");
    const success = document.getElementById("demoSuccess");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Bootstrap validation
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        // Tu podepniesz integrację (np. endpoint / PHP / Zapier / Formspree / WordPress)
        // Na razie pokazujemy sukces jako placeholder:
        form.classList.remove("was-validated");
        form.reset();
        success?.classList.remove("d-none");
        setTimeout(() => success?.classList.add("d-none"), 5000);
    });
})();

// Hero image switcher
(() => {
    const img = document.getElementById("heroShot");
    const tabs = document.getElementById("heroTabs");
    if (!img || !tabs) return;

    tabs.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-hero-img]");
        if (!btn) return;

        const nextSrc = btn.getAttribute("data-hero-img");
        if (!nextSrc || img.getAttribute("src") === nextSrc) return;

        tabs.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        img.classList.add("is-fading");
        setTimeout(() => {
            img.src = nextSrc;
            img.onload = () => img.classList.remove("is-fading");
            // fallback gdy cache:
            setTimeout(() => img.classList.remove("is-fading"), 220);
        }, 160);
    });
})();

// Count-up when visible
(() => {
    const els = document.querySelectorAll(".countup");
    if (!els.length) return;

    const animate = (el) => {
        const to = parseInt(el.getAttribute("data-to") || "0", 10);
        const duration = 900;
        const start = performance.now();

        const step = (t) => {
            const p = Math.min((t - start) / duration, 1);
            const val = Math.round(to * p);
            el.textContent = String(val);
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting && !e.target.dataset.done) {
                e.target.dataset.done = "1";
                animate(e.target);
            }
        });
    }, { threshold: 0.35 });

    els.forEach(el => io.observe(el));
})();