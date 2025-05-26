// Enable hidden nav bar with hover functionality
{
    const nav = document.querySelector(".header");
    const hoverTrigger = document.querySelector(".nav-hover-trigger");
    let lastScrollY = window.scrollY;
    let isHovering = false;
    let isMobileMenuOpen = false;
    let scrollTimeout;

    // Function to show navbar
    function showNavbar() {
        nav.classList.remove("nav--hidden");
    }

    // Function to hide navbar
    function hideNavbar() {
        if (!isHovering && !isMobileMenuOpen) {
            nav.classList.add("nav--hidden");
        }
    }

    // Handle scroll events
    window.addEventListener("scroll", () => {
        clearTimeout(scrollTimeout);
        
        if (lastScrollY < window.scrollY && window.scrollY > 100) {
            // Scrolling down and not at the top
            scrollTimeout = setTimeout(hideNavbar, 100);
        } else {
            // Scrolling up or at the top
            showNavbar();
        }

        lastScrollY = window.scrollY;
    });

    // Handle hover events for both navbar and trigger area
    [nav, hoverTrigger].forEach(element => {
        element.addEventListener("mouseenter", () => {
            isHovering = true;
            showNavbar();
        });

        element.addEventListener("mouseleave", () => {
            isHovering = false;
            if (lastScrollY < window.scrollY && window.scrollY > 100) {
                hideNavbar();
            }
        });
    });
}

// Mobile menu functionality
document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.getElementById("hamburger-icon");
    const mobileNav = document.querySelector(".mobile-nav");
    const overlay = document.querySelector(".mobile-menu-overlay");
    const mobileLinks = document.querySelectorAll(".mobile-link");
    const closeButton = document.querySelector(".mobile-close");
    const body = document.body;

    function toggleMenu() {
        hamburger.classList.toggle("active");
        mobileNav.classList.toggle("active");
        overlay.classList.toggle("active");
        body.classList.toggle("menu-open");
        
        // Show navbar when mobile menu is open
        if (mobileNav.classList.contains("active")) {
            document.querySelector(".header").classList.remove("nav--hidden");
        }
    }

    // Toggle menu on hamburger click
    hamburger.addEventListener("click", toggleMenu);

    // Close menu when clicking close button
    closeButton.addEventListener("click", toggleMenu);

    // Close menu when clicking overlay
    overlay.addEventListener("click", toggleMenu);

    // Close menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            toggleMenu();
            
            // Smooth scroll to section
            const href = link.getAttribute("href");
            if (href.startsWith("#")) {
                event.preventDefault();
                const section = document.querySelector(href);
                if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    });

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileNav.classList.contains("active")) {
            toggleMenu();
        }
    });
});

// Lazy loading images
document.addEventListener("DOMContentLoaded", function() {
    const lazyImages = document.querySelectorAll("img[loading='lazy']");
    
    if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove("lazy");
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
}); 