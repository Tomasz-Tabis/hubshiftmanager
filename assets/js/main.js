const form = document.getElementById("demoForm");
const success = document.getElementById("demoSuccess");

form.addEventListener("submit", function(e){

    e.preventDefault();

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    const formData = new FormData(form);

    fetch("send-demo.php", {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(data => {

            if(data.status === "success"){

                form.reset();
                form.classList.remove("was-validated");

                success.classList.remove("d-none");

                setTimeout(() => {
                    success.classList.add("d-none");
                }, 5000);

            } else {

                alert(data.message);

            }

        })
        .catch(() => {

            alert("Server fout. Probeer later opnieuw.");

        });

});

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

// KPI: count-up + progress-bar animation (together)
(() => {
    const counters = document.querySelectorAll(".kpi2 .countup");
    if (!counters.length) return;

    const DURATION = 900;

    const animateNumber = (el, to) => {
        const start = performance.now();
        const step = (t) => {
            const p = Math.min((t - start) / DURATION, 1);
            el.textContent = String(Math.round(to * p));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const animateBar = (bar, toPercent) => {
        // start from 0 and animate to target
        bar.style.width = "0%";
        bar.style.transition = `width ${DURATION}ms ease`;

        // next frame -> apply target width (transition will run)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                bar.style.width = `${toPercent}%`;
            });
        });
    };

    const run = (counter) => {
        const to = parseInt(counter.getAttribute("data-to") || "0", 10);
        const kpi = counter.closest(".kpi2");
        if (!kpi) return;

        const bar = kpi.querySelector(".progress-bar");
        const progressTarget = bar
            ? parseInt(bar.getAttribute("data-progress") || String(to), 10)
            : to;

        animateNumber(counter, to);
        if (bar) animateBar(bar, progressTarget);
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const counter = e.target;
            if (counter.dataset.done) return;
            counter.dataset.done = "1";
            run(counter);
        });
    }, { threshold: 0.35 });

    counters.forEach(c => io.observe(c));
})();

// Count-up when visible (for .countup)
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

// Lightbox

// Hero image fullscreen lightbox
(() => {

    const heroImg = document.getElementById("heroShot");
    const lightbox = document.getElementById("heroLightbox");
    const lightboxImg = document.getElementById("heroLightboxImg");
    const closeBtn = document.querySelector(".hero-lightbox-close");

    if(!heroImg) return;

    heroImg.addEventListener("click", () => {
        lightbox.classList.add("active");
        lightboxImg.src = heroImg.src;
    });

    closeBtn.addEventListener("click", () => {
        lightbox.classList.remove("active");
    });

    lightbox.addEventListener("click", (e) => {
        if(e.target === lightbox){
            lightbox.classList.remove("active");
        }
    });

    document.addEventListener("keydown", (e) => {
        if(e.key === "Escape"){
            lightbox.classList.remove("active");
        }
    });

})();