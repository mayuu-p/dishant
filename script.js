document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("header, section, div[id]"); 
    const navLinks = document.querySelectorAll(".nav-container a, nav a"); // Apne navbar ke links ka sahi selector ensure karein

    // 1. Smooth Scroll aur URL Hash History Setup (Back button fix ke liye)
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" });
                // Browser history me hash add karo taaki back karne par sahi section khule
                history.pushState(null, null, targetId);
                updateActiveLink(targetId);
            }
        });
    });

    // Active link toggle karne ka function
    function updateActiveLink(hash) {
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === hash) {
                link.classList.add("active");
            }
        });
    }

    // 2. Intersection Observer (Scroll ke sath auto change)
    const observerOptions = {
        root: null,
        rootMargin: "-40% 0px -40% 0px", // Screen ke bilkul center area ko target karega
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Agar user manually scroll kar raha hai to track karo
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                if (id && (window.innerHeight + window.scrollY) < document.documentElement.scrollHeight - 50) {
                    updateActiveLink(`#${id}`);
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // 3. Strict Bottom Fix (Contact Me section select hone ke liye)
    window.addEventListener("scroll", () => {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 60) {
            // Niche '#' ke baad wahi naam likhna jo aapke contact section ki HTML id ka hai
            updateActiveLink("#contacts"); 
        }
    });

    // 4. Browser Back Button press karne par pichle section par smoothly le jaane ke liye
    window.addEventListener("popstate", () => {
        const currentHash = window.location.hash || "#top"; // default to top if no hash
        const targetSection = document.querySelector(currentHash);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: "smooth" });
            updateActiveLink(currentHash);
        }
    });
});
