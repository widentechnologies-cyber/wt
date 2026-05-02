document.addEventListener("DOMContentLoaded", () => {
    const whatsappNumber = "18068378815";
    const contactEndpoint = "https://script.google.com/macros/s/AKfycbyGj2EIn2aTecP4YfEEqi83xEL0nkxxWxR_9JG4y5OsuJWkTt_x1DEh8-K7SNlDgdcW2Q/exec";
    const inServicePage = window.location.pathname.includes("/pages/");
    const faviconPath = inServicePage ? "../favicon.svg" : "favicon.svg";

    let favicon = document.querySelector("link[rel='icon']");
    if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
    }
    favicon.type = "image/svg+xml";
    favicon.href = faviconPath;

    const navbar = document.getElementById("navbar");
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");
    const contactForm = document.getElementById("contact-form");

    if (menuToggle && mobileMenu) {
        const mobileServicesTrigger = mobileMenu.querySelector(".flex.flex-col a[href='services.html'], .flex.flex-col a[href='../services.html']");
        const mobileServicesList = mobileMenu.querySelector(".mobile-services");

        if (mobileServicesTrigger && mobileServicesList) {
            // Ensure sub-services appear directly under Services item.
            mobileServicesTrigger.insertAdjacentElement("afterend", mobileServicesList);
            mobileServicesTrigger.setAttribute("aria-expanded", "false");
            mobileServicesTrigger.addEventListener("click", (event) => {
                if (window.innerWidth >= 768) {
                    return;
                }
                event.preventDefault();
                const isOpen = mobileServicesList.classList.toggle("open");
                mobileServicesTrigger.setAttribute("aria-expanded", String(isOpen));
            });
        }

        menuToggle.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            if (!isOpen && mobileServicesList && mobileServicesTrigger) {
                mobileServicesList.classList.remove("open");
                mobileServicesTrigger.setAttribute("aria-expanded", "false");
            }
            if (menuIcon) {
                menuIcon.setAttribute("data-lucide", isOpen ? "x" : "menu");
                if (window.lucide) {
                    lucide.createIcons();
                }
            }
        });

        mobileMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", (event) => {
                if (link === mobileServicesTrigger && window.innerWidth < 768) {
                    event.preventDefault();
                    return;
                }
                mobileMenu.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                if (mobileServicesList && mobileServicesTrigger) {
                    mobileServicesList.classList.remove("open");
                    mobileServicesTrigger.setAttribute("aria-expanded", "false");
                }
                if (menuIcon) {
                    menuIcon.setAttribute("data-lucide", "menu");
                    if (window.lucide) {
                        lucide.createIcons();
                    }
                }
            });
        });
    }

    if (navbar) {
        const syncNavbar = () => {
            if (window.scrollY > 20) {
                navbar.classList.add("nav-glass", "py-4");
                navbar.classList.remove("py-6");
            } else {
                navbar.classList.remove("nav-glass", "py-4");
                navbar.classList.add("py-6");
            }
        };
        syncNavbar();
        window.addEventListener("scroll", syncNavbar);
    }

    const heroElements = document.querySelectorAll(".hero-animate");
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }, 120 * index);
    });

    const revealElements = document.querySelectorAll(".reveal");
    if (revealElements.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: "0px 0px -50px 0px", threshold: 0.01 });

        revealElements.forEach((el) => observer.observe(el));
    }

    if (window.lucide) {
        lucide.createIcons();
    }

    if (contactForm) {
        const submitButton = contactForm.querySelector("button[type='submit']");
        const defaultButtonText = submitButton ? submitButton.textContent : "Send Message";
        const statusElementId = "contact-form-status";
        let statusElement = document.getElementById(statusElementId);

        if (!statusElement) {
            statusElement = document.createElement("p");
            statusElement.id = statusElementId;
            statusElement.className = "text-sm mt-3";
            contactForm.appendChild(statusElement);
        }

        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!submitButton) {
                return;
            }

            const nameValue = String((contactForm.querySelector("#name") || {}).value || "").trim();
            const emailValue = String((contactForm.querySelector("#email") || {}).value || "").trim();
            const messageValue = String((contactForm.querySelector("#message") || {}).value || "").trim();

            const payload = new URLSearchParams();
            // Lowercase keys (common doPost usage)
            payload.append("name", nameValue);
            payload.append("email", emailValue);
            payload.append("message", messageValue);
            // Title-case keys (matches sheet headers: Name, Email, Message)
            payload.append("Name", nameValue);
            payload.append("Email", emailValue);
            payload.append("Message", messageValue);

            submitButton.disabled = true;
            submitButton.textContent = "Sending...";
            statusElement.textContent = "";
            statusElement.classList.remove("text-red-400", "text-emerald-400");

            try {
                const response = await fetch(contactEndpoint, {
                    method: "POST",
                    mode: "cors",
                    redirect: "follow",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                    },
                    body: payload.toString()
                });

                const responseText = await response.text();
                let responseJson = null;
                try {
                    responseJson = JSON.parse(responseText);
                } catch (jsonError) {
                    responseJson = null;
                }

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }

                if (responseJson && (responseJson.ok === false || responseJson.result === "error")) {
                    throw new Error(responseJson.error || "Apps Script returned an error.");
                }

                submitButton.textContent = "Success";
                statusElement.textContent = "Message submitted.";
                statusElement.classList.add("text-emerald-400");
                contactForm.reset();
                setTimeout(() => {
                    submitButton.textContent = defaultButtonText;
                    submitButton.disabled = false;
                    statusElement.textContent = "";
                    statusElement.classList.remove("text-emerald-400");
                }, 1600);
            } catch (error) {
                submitButton.textContent = "Try Again";
                statusElement.textContent = `Submission failed: ${error.message}`;
                statusElement.classList.add("text-red-400");
                setTimeout(() => {
                    submitButton.textContent = defaultButtonText;
                    submitButton.disabled = false;
                }, 2200);
            }
        });
    }

    document.querySelectorAll(".whatsapp-float").forEach((link) => {
        link.setAttribute("href", `https://wa.me/${whatsappNumber}`);
        link.setAttribute("aria-label", "Chat on WhatsApp");
        link.setAttribute("title", "WhatsApp");
        link.innerHTML = `
            <svg viewBox="0 0 32 32" aria-hidden="true" class="w-6 h-6 fill-current">
                <path d="M16.02 3.2c-7.08 0-12.8 5.72-12.8 12.8 0 2.26.6 4.47 1.73 6.4L3.2 28.8l6.55-1.7a12.78 12.78 0 0 0 6.27 1.64c7.07 0 12.78-5.72 12.78-12.8S23.1 3.2 16.02 3.2Zm0 23.4c-1.95 0-3.86-.52-5.53-1.5l-.4-.24-3.9 1 1.05-3.8-.26-.4a10.55 10.55 0 0 1-1.62-5.63c0-5.86 4.77-10.63 10.66-10.63 5.87 0 10.64 4.77 10.64 10.64A10.64 10.64 0 0 1 16.02 26.6Zm5.85-7.95c-.32-.16-1.9-.94-2.2-1.05-.3-.1-.5-.16-.72.16-.2.32-.8 1.05-.97 1.27-.16.2-.33.24-.62.08-.3-.16-1.24-.45-2.37-1.45a8.94 8.94 0 0 1-1.64-2.04c-.17-.3-.02-.46.13-.62.14-.13.3-.33.46-.5.16-.15.2-.27.3-.45.1-.16.05-.3-.03-.46-.08-.16-.72-1.74-.98-2.4-.27-.62-.53-.54-.72-.54h-.62c-.22 0-.56.08-.85.4-.3.32-1.12 1.1-1.12 2.66 0 1.56 1.15 3.07 1.3 3.3.16.2 2.24 3.42 5.43 4.8.76.33 1.36.53 1.83.67.76.24 1.45.2 2 .12.6-.1 1.9-.78 2.16-1.53.27-.75.27-1.4.18-1.54-.08-.14-.3-.22-.62-.38Z"/>
            </svg>
        `;
    });
});