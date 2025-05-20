// Enable hidden nav bar with hover functionality
{
    const nav = document.querySelector(".header");
    const hoverTrigger = document.querySelector(".nav-hover-trigger");
    let lastScrollY = window.scrollY;
    let isHovering = false;
    let scrollTimeout;

    // Function to show navbar
    function showNavbar() {
        nav.classList.remove("nav--hidden");
    }

    // Function to hide navbar
    function hideNavbar() {
        if (!isHovering) {
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

    // Mobile menu toggle
    function toggleMobileMenu(menu) {
        menu.classList.toggle('open');
    }
}

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