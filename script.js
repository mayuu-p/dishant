document.addEventListener("DOMContentLoaded", () => {
    // 1. Apne saare sections aur unke corresponding links ko select karein
    // Dhyan rakhein ki HTML me aapke contact section ki ID id="contacts" ho aur link href="#contacts" ho
    const sections = document.querySelectorAll("header, section, div[id]"); 
    const navLinks = document.querySelectorAll(".nav-container a, nav a, .header a"); // Aapke navbar links ka selector

    function removeActiveClasses() {
        navLinks.forEach(link => link.classList.remove("active")); // Sabse pehle HOME samet sabhi se orange color hatao
    }

    // 2. Intersection Observer Logic
    const observerOptions = {
        root: null,
        rootMargin: "-45% 0px -45% 0px", // Screen ke bilkul center area ko sateek track karega
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                // Check karein agar bottom touch nahi hua hai to normal tracking chalegi
                if (id && (window.innerHeight + window.scrollY) < document.documentElement.scrollHeight - 80) {
                    removeActiveClasses();
                    const activeLink = document.querySelector(`a[href="#${id}"]`);
                    if (activeLink) activeLink.classList.add("active");
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // 3. Strict Bottom Touch Fix (Jab page end par ho to sirf CONTACTS highlight hoga)
    window.addEventListener("scroll", () => {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 80) {
            removeActiveClasses();
            const contactLink = document.querySelector('a[href="#contacts"]'); // Apne contact link ka href yahan verify karein
            if (contactLink) contactLink.classList.add("active");
        }
    });
});
