document.addEventListener('DOMContentLoaded', function() {

    // === GLOBÁLIS VÁLTOZÓK ===
    let portfolioData = [];
    let blogData = [];

    // === FŐ INICIALIZÁLÓ FÜGGVÉNY ===
    async function initializePage() {
        try {
            // JAVÍTÁS: A statikus data.json-t töltjük be a fejlesztéshez
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('data.json nem található!');
            const data = await response.json();
            
            portfolioData = data.portfolio;
            blogData = data.blog;
            
            // A beállításokat (amiket a CMS fog kezelni) egyelőre statikusan definiáljuk
            const settings = {
                about_image: "images/ülő_programozó.svg",
                contact: {
                    profile_pic: "images/mackócsalád.webp",
                    name: "Kollár Pál",
                    title: "Webfejlesztő, A Webkoll alapítója",
                    email: "hello@webkoll.com",
                    phone: "+36 70 905 5576",
                    location: "2014 Csobánka, Magyarország",
                    facebook: "#",
                    instagram: "#",
                    linkedin: "#",
                    github: "#"
                },
                quote_options: [
                    "Landing oldal",
                    "Céges weboldal",
                    "Portfólió oldal",
                    "Webáruház (alap)"
                ]
            };

            // Tartalmak megjelenítése a megfelelő helyeken
            populateAboutSection(settings);
            populatePortfolio(portfolioData);
            populateBlog(blogData);
            populateQuoteFormOptions(settings.quote_options);
            populateContactSection(settings.contact);
            populateFooter(settings.contact);

        } catch (error) {
            console.error("Hiba a dinamikus tartalom betöltésekor:", error);
        }

        // Egyéb funkciók inicializálása
        initializeSwiper();
        initializeModal();
        initializeMobileMenu();
        initializeForms();
        createCanvasAnimation('hero-canvas');
    }

    // === TARTALOM MEGJELENÍTŐ FÜGGVÉNYEK (részben módosítva) ===

    function populateAboutSection(settings) {
        const container = document.getElementById('about-us-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="about-me-intro">
                <h2>Miért pont a Webkoll?</h2>
                <div class="section-icon"><i class="fa-solid fa-handshake-simple"></i></div>
                <p>Mert mi pontosan tudjuk, milyen érzés a másik oldalon állni. A Webkoll nem egy arctalan ügynökség – egy olyan vállalkozás, ami a saját tapasztalatainkból született, azzal a céllal, hogy végre olyan weboldalakat adjunk, amilyeneket mi is szerettünk volna kapni.</p>
            </div>
            <ul class="why-us-list">
                <li><i class="fa-solid fa-comments"></i><div><strong>Nincsenek Félreértések, Csak Közös Munka:</strong><p>Személyesen velem, a fejlesztővel dolgozol az első ötlettől az utolsó simításig. Nincsenek felesleges közvetítők. A te víziód és az én szakértelmem – ez a leghatékonyabb út a tökéletes végeredményig.</p></div></li>
                <li><i class="fa-solid fa-drafting-compass"></i><div><strong>Egyedi Weboldal, Ami Rólad Szól:</strong><p>Nem hiszünk a sablonokban, mert a te vállalkozásod sem sablonos. Minden projekt egy tiszta lap, egy méretre szabott alkotás, ami a te márkád egyedi karakterét és erősségeit tükrözi.</p></div></li>
                <li><i class="fa-solid fa-bolt"></i><div><strong>Jövőálló Technológia, Ami Neked Dolgozik:</strong><p>A modern JAMstack technológia nem csak egy divatos kifejezés. Számodra ez villámgyors betöltődést, maximális biztonságot és alacsony fenntartási költségeket jelent, felesleges frissítések és rejtett hibák nélkül.</p></div></li>
                <li><i class="fa-solid fa-wand-magic-sparkles"></i><div><strong>Több, Mint Egy Honlap: Digitális Élmény:</strong><p>A célunk nem csak az, hogy legyen egy weboldalad. A célunk, hogy legyen egy digitális élményed, ami megragadja a látogatókat, kiemel a versenytársak közül, és büszkén mutatod meg bárkinek.</p></div></li>
            </ul>
            <div class="about-me-image-container">
                <img id="about-us-img" src="${settings.about_image}" alt="Webkoll - Professzionális weboldalkészítés">
            </div>`;
    }

    function populatePortfolio(items) {
        const portfolioGrid = document.getElementById('portfolio-grid');
        if (!portfolioGrid || !items) return;
        portfolioGrid.innerHTML = '';
        items.forEach(item => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            let secondButtonHtml = (item.id === 6)
                ? `<a href="#arajanlat" class="btn-custom">Árajánlatkérés</a>`
                : `<a href="${item.link}" target="_blank" class="btn-custom">Weboldal</a>`;
            
            slide.innerHTML = `
                <div class="portfolio-item">
                    <div class="portfolio-image-container"><img src="${item.image}" alt="${item.title}"></div>
                    <div class="portfolio-content">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <div class="portfolio-buttons">
                            <a href="#" class="btn-custom btn-details" data-project-id="${item.id}">Bővebben</a>
                            ${secondButtonHtml}
                        </div>
                    </div>
                </div>`;
            portfolioGrid.appendChild(slide);
        });
        if (window.swiper) { window.swiper.update(); }
    }

    function populateBlog(posts) {
        const blogPostsContainer = document.getElementById('blog-posts');
        if (!blogPostsContainer || !posts) return;
        blogPostsContainer.innerHTML = '';
        posts.forEach(post => {
            const el = document.createElement('article');
            el.className = 'blog-post';
            el.innerHTML = `<h3>${post.title}</h3><p class="post-meta">Dátum: ${post.date}</p><p>${post.excerpt}</p><a href="#" class="read-more" data-post-id="${post.id}">Elolvasom &rarr;</a>`;
            blogPostsContainer.appendChild(el);
        });
    }

    function populateQuoteFormOptions(options) {
        const quoteSelect = document.getElementById('form-type');
        if (!quoteSelect || !options) return;
        quoteSelect.innerHTML = '';
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            quoteSelect.appendChild(optionEl);
        });
    }

    function populateContactSection(contact) {
        const container = document.getElementById('contact-container');
        if (!container) return;
        container.innerHTML = `
            <h2>Lépjünk kapcsolatba!</h2>
            <div class="section-icon"><i class="fa-solid fa-paper-plane"></i></div>
            <div class="contact-wrapper" id="contact-wrapper-id">
                <div class="contact-info">
                    <img src="${contact.profile_pic}" alt="${contact.name}" class="profile-pic">
                    <h3>${contact.name}</h3>
                    <p class="job-title">${contact.title}</p>
                    <ul>
                        <li><i class="fa-solid fa-envelope"></i> <a href="mailto:${contact.email}">${contact.email}</a></li>
                        <li><i class="fa-solid fa-phone"></i> <a href="tel:${contact.phone.replace(/\s/g, '')}">${contact.phone}</a></li>
                        <li><i class="fa-solid fa-location-dot"></i> ${contact.location}</li>
                    </ul>
                    <div class="social-icons">
                        <a href="${contact.facebook}" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="${contact.instagram}" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                        <a href="${contact.linkedin}" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
                        <a href="${contact.github}" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>
                    </div>
                </div>
                <div class="contact-form-container">
                    <form id="contact-form" action="https://formspree.io/f/xnnzydly" method="POST">
                        <input type="hidden" name="_subject" value="Üzenet a Webkoll.com kapcsolat űrlapról">
                        <div class="form-group"><label for="contact-name">Neved</label><input type="text" id="contact-name" name="Név" required></div>
                        <div class="form-group"><label for="contact-email">E-mail címed</label><input type="email" id="contact-email" name="E-mail" required></div>
                        <div class="form-group"><label for="contact-phone">Telefonszámod</label><input type="tel" id="contact-phone" name="Telefonszám"></div>
                        <div class="form-group"><label for="contact-message">Üzeneted</label><textarea id="contact-message" name="Üzenet" rows="6" required></textarea></div>
                        <button type="submit" class="btn-custom">Üzenet elküldése</button>
                    </form>
                    <div id="contact-form-feedback" class="form-feedback-message"></div>
                </div>
            </div>`;
    }
    
    function populateFooter(contact) {
        const container = document.getElementById('footer-container');
        if (!container) return;
        container.innerHTML = `
        <div class="footer-container container">
            <div class="footer-about">
                <a href="#" class="logo"><img src="images/logo_web.svg" alt="Webkoll Logo"><span>WEBKOLL</span></a>
                <p>Innovatív weboldalak építése, amelyek nem csak jól néznek ki, de eredményeket is hoznak. Építsünk valami maradandót együtt!</p>
            </div>
            <div class="footer-links">
                <h4>Hasznos Linkek</h4>
                <ul>
                    <li><a href="#rolam">Miért Mi?</a></li>
                    <li><a href="#munkak">Munkáink</a></li>
                    <li><a href="#blog">Blog</a></li>
                    <li><a href="#arajanlat">Árajánlatkérés</a></li>
                </ul>
            </div>
            <div class="footer-contact">
                <h4>Kapcsolat</h4>
                <ul>
                    <li><i class="fa-solid fa-envelope"></i> <a href="mailto:${contact.email}">${contact.email}</a></li>
                    <li><i class="fa-solid fa-phone"></i> <a href="tel:${contact.phone.replace(/\s/g, '')}">${contact.phone}</a></li>
                </ul>
                <div class="social-icons">
                     <a href="${contact.facebook}" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                     <a href="${contact.instagram}" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                     <a href="${contact.linkedin}" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
                     <a href="${contact.github}" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; <span id="current-year-footer">${new Date().getFullYear()}</span> Webkoll | Kollár Pál e.v. Minden jog fenntartva.</p>
        </div>
        `;
    }

    // === INICIALIZÁLÓ FÜGGVÉNYEK ===
    // (A korábbi, különálló funkciók itt jönnek)
    // ...

    // === INDÍTÁS ===
    initializePage();
});