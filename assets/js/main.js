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