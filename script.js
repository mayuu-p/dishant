document.addEventListener("DOMContentLoaded", () => {
    // 1. Apne saare sections ki IDs aur navbar ke links ko select karein
    const sections = document.querySelectorAll("header, section, div[id]"); 
    const navLinks = document.querySelectorAll(".nav-container a, nav a"); // Apne navbar ke links ka sahi selector check kar lena

    // 2. Intersection Observer Setup (Scroll track karne ke liye)
    const observerOptions = {
        root: null,
        rootMargin: "-30% 0px -40% 0px", // Screen ke beech ke area ko target karega
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                if (id) {
                    navLinks.forEach(link => {
                        link.classList.remove("active"); // Pehle sabhi se orange color hatao
                        if (link.getAttribute("href") === `#${id}`) {
                            link.classList.add("active"); // Sirf jo dikh raha hai uspar lagao
                        }
                    });
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // 3. Special Fix: Jab user website ke bilkul bottom (niche) par pahuch jaye
    window.addEventListener("scroll", () => {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
            navLinks.forEach(link => link.classList.remove("active"));
            // Niche di gayi line mein '#' ke baad apne contact section ki sahi ID likhein (jaise #contacts)
            const contactLink = document.querySelector('a[href="#contacts"]'); 
            if (contactLink) contactLink.classList.add("active");
        }
    });
});
