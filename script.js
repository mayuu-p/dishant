document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("header, section, div[id]"); 
    const navLinks = document.querySelectorAll(".nav-container a, nav a");

    // 1. Initial State Setup: Jab website pehli baar load ho to ek home state save kar lo
    if (!window.location.hash) {
        history.replaceState({ pos: 'home' }, '', window.location.pathname);
    }

    // 2. Links par click karne par smooth scroll (Bina history kharab kiye)
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" });
                
                // Naye page ki history create nahi hogi, sirf position change track hogi
                if (targetId !== '#home' && targetId !== '#top') {
                    history.pushState({ pos: 'inside' }, '', window.location.pathname + targetId);
                } else {
                    history.pushState({ pos: 'home' }, '', window.location.pathname);
                }
                updateActiveLink(targetId);
            }
        });
    });

    function updateActiveLink(hash) {
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === hash) {
                link.classList.add("active");
            }
        });
    }

    // 3. Intersection Observer: Scroll ke sath auto highlight badalna
    const observerOptions = {
        root: null,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                // Normal scrolling mein history kharab nahi karenge, sirf link highlight badlenge
                if (id && (window.innerHeight + window.scrollY) < document.documentElement.scrollHeight - 60) {
                    updateActiveLink(`#${id}`);
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Strict Bottom Touch (Contact Me selection fix)
    window.addEventListener("scroll", () => {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 60) {
            updateActiveLink("#contacts"); 
        }
    });

    // 4. SMART BACK BUTTON CONTROLLER (Direct home aur fir exit karne ke liye)
    window.addEventListener("popstate", (event) => {
        // Agar user kisi section se back dabata hai, to use seedha top par bhejo
        if (window.scrollY > 100) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateActiveLink("#home");
            // History state ko wapas clean kar do taaki agla click exit kare
            history.replaceState({ pos: 'home' }, '', window.location.pathname);
        } else {
            // Agar user pehle se hi top/home par hai aur back dabata hai, to browser default behavior se direct exit ho jayega
            history.back();
        }
    });
});
