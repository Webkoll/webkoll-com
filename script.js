document.addEventListener('DOMContentLoaded', function() {

    // === ÁLTALÁNOS PONT-VONAL ANIMÁCIÓS LOGIKA ===
    class Particle {
        constructor(x, y, dX, dY, size) { this.x = x; this.y = y; this.directionX = dX; this.directionY = dY; this.size = size; }
        draw(ctx) { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); ctx.fillStyle = '#A5C943'; ctx.fill(); }
        update(canvas) { if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX; if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY; this.x += this.directionX; this.y += this.directionY; }
    }
    function createCanvasAnimation(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId); if (!canvas) return;
        const ctx = canvas.getContext('2d'); let particlesArray = []; let animationFrameId;
        const settings = { particleDensity: 12000, ...options };
        const mouse = { x: null, y: null, radius: 0 };
        function updateMouseRadius() { mouse.radius = (canvas.height / 80) * (canvas.width / 80); }
        const resizeObserver = new ResizeObserver(() => { cancelAnimationFrame(animationFrameId); canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; updateMouseRadius(); init(); animate(); });
        resizeObserver.observe(canvas);
        function init() { particlesArray = []; let numberOfParticles = (canvas.width * canvas.height) / settings.particleDensity; for (let i = 0; i < numberOfParticles; i++) { let size = (Math.random() * 4) + 1; let x = (Math.random() * (canvas.width - size * 2)) + size * 2; let y = (Math.random() * (canvas.height - size * 2)) + size * 2; let dX = (Math.random() * 0.8) - 0.4; let dY = (Math.random() * 0.8) - 0.4; particlesArray.push(new Particle(x, y, dX, dY, size)); } }
        function connect() { for (let a = 0; a < particlesArray.length; a++) { for (let b = a; b < particlesArray.length; b++) { let distance = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2); if (distance < (canvas.width / 7) * (canvas.height / 7)) { let opacityValue = 1 - (distance / 15000); ctx.beginPath(); let mouseDistance = mouse.x ? ((particlesArray[a].x - mouse.x) ** 2) + ((particlesArray[a].y - mouse.y) ** 2) : -1; if (mouseDistance !== -1 && mouseDistance < mouse.radius) { ctx.strokeStyle = `rgba(165, 201, 67, ${opacityValue})`; ctx.lineWidth = 2.5; ctx.shadowBlur = 1; ctx.shadowColor = 'rgba(77, 232, 29, 1)'; } else { ctx.strokeStyle = `rgba(106, 159, 57, ${opacityValue})`; ctx.lineWidth = 0.5; ctx.shadowBlur = 1; } ctx.moveTo(particlesArray[a].x, particlesArray[a].y); ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke(); ctx.shadowBlur = 0; } } } }
        function animate() { animationFrameId = requestAnimationFrame(animate); ctx.clearRect(0, 0, canvas.width, canvas.height); particlesArray.forEach(p => { p.update(canvas); p.draw(ctx); }); connect(); }
        canvas.addEventListener('mousemove', (event) => { const rect = canvas.getBoundingClientRect(); mouse.x = event.clientX - rect.left; mouse.y = event.clientY - rect.top; });
        canvas.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
        init(); animate();
    }
    createCanvasAnimation('hero-canvas');
    // === END OF ANIMÁCIÓK ===
    
    let portfolioData = [];
    let blogData = [];

    // === ÚJ, DINAMIKUS TARTALOMBETÖLTŐ RÉSZ ===
    async function initializeSite() {
        try {
            const [contentResponse, settingsResponse] = await Promise.all([
                fetch('/api/content.json?v=' + new Date().getTime()),
                fetch('/_data/settings.json?v=' + new Date().getTime())
            ]);

            if (!contentResponse.ok) throw new Error(`Hiba a tartalom betöltésekor: /api/content.json`);
            const content = await contentResponse.json();
            portfolioData = content.portfolio;
            blogData = content.blog;

            if (!settingsResponse.ok) throw new Error(`Hiba a beállítások betöltésekor: /_data/settings.json`);
            const settings = await settingsResponse.json();

            populatePortfolio(portfolioData);
            populateBlog(blogData);
            populateSettings(settings);

        } catch (error) {
            console.error("Hiba az oldal inicializálásakor: ", error);
        }
    }

    function populatePortfolio(data) {
        const portfolioGrid = document.getElementById('portfolio-grid');
        if (!portfolioGrid) return;

        portfolioGrid.innerHTML = '';
        data.forEach(item => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            let secondButtonHtml = (item.title === "Az Ön következő oldala?")
                ? `<a href="#arajanlat" class="btn-custom">Árajánlatkérés</a>`
                : `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn-custom">Weboldal</a>`;
            
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

        if (window.swiper) {
            window.swiper.update();
        }
    }

    function populateBlog(data) {
        const blogPosts = document.getElementById('blog-posts');
        if (!blogPosts) return;

        blogPosts.innerHTML = '';
        data.forEach(post => {
            const el = document.createElement('article');
            el.className = 'blog-post';
            el.innerHTML = `
                <h3>${post.title}</h3>
                <p class="post-meta">Dátum: ${post.date}</p>
                <p>${post.excerpt}</p>
                <a href="#" class="read-more" data-post-id="${post.id}">Elolvasom &rarr;</a>`;
            blogPosts.appendChild(el);
        });
    }

    function populateSettings(settings) {
        // "Miért mi?" szekció képe
        const aboutImage = document.getElementById('about-me-image');
        if (aboutImage && settings.about_image) {
            aboutImage.src = settings.about_image;
        }

        // Kapcsolat szekció
        const contact = settings.contact || {};
        document.getElementById('contact-profile-pic').src = contact.profile_pic || 'images/mackócsalád.webp';
        document.getElementById('contact-name').textContent = contact.name || 'Kollár Pál';
        document.getElementById('contact-job-title').textContent = contact.title || 'Webfejlesztő';
        document.getElementById('contact-email').href = `mailto:${contact.email || ''}`;
        document.getElementById('contact-email').textContent = contact.email || '';
        document.getElementById('contact-phone').href = `tel:${(contact.phone || '').replace(/\s/g, '')}`;
        document.getElementById('contact-phone').textContent = contact.phone || '';
        document.getElementById('contact-location').textContent = contact.location || '';
        document.getElementById('contact-facebook').href = contact.facebook || '#';
        document.getElementById('contact-instagram').href = contact.instagram || '#';
        document.getElementById('contact-linkedin').href = contact.linkedin || '#';
        document.getElementById('contact-github').href = contact.github || '#';

        // Lábléc kapcsolat
        document.getElementById('footer-contact-email').href = `mailto:${contact.email || ''}`;
        document.getElementById('footer-contact-email').textContent = contact.email || '';
        document.getElementById('footer-contact-phone').href = `tel:${(contact.phone || '').replace(/\s/g, '')}`;
        document.getElementById('footer-contact-phone').textContent = contact.phone || '';
        document.getElementById('footer-facebook').href = contact.facebook || '#';
        document.getElementById('footer-instagram').href = contact.instagram || '#';
        document.getElementById('footer-linkedin').href = contact.linkedin || '#';
        document.getElementById('footer-github').href = contact.github || '#';
        document.getElementById('footer-owner').textContent = `${contact.name || 'Kollár Pál'} e.v.`;

        // Árajánlatkérő űrlap opciói
        const quoteTypeSelect = document.getElementById('form-type');
        if (quoteTypeSelect && settings.quote_options) {
            quoteTypeSelect.innerHTML = '';
            settings.quote_options.forEach(option => {
                const optEl = document.createElement('option');
                optEl.value = option;
                optEl.textContent = option;
                quoteTypeSelect.appendChild(optEl);
            });
        }
    }

    initializeSite();
    // === END OF DINAMIKUS TARTALOM ===

    // === MUNKÁIM SLIDESHOW INICIALIZÁLÁSA ===
    const swiper = new Swiper('.portfolio-swiper', {
        slidesPerView: 1, spaceBetween: 30, loop: true, speed: 800,
        effect: 'slide', grabCursor: true,
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        breakpoints: { 768: { slidesPerView: 2, spaceBetween: 20 }, 1024: { slidesPerView: 3, spaceBetween: 30 } }
    });
    const swiperContainer = document.querySelector('.portfolio-swiper');
    if (swiperContainer) {
        let isThrottled = false;
        swiperContainer.addEventListener('wheel', (event) => {
            event.preventDefault();
            if (isThrottled) return;
            isThrottled = true;
            if (event.deltaY > 0) { swiper.slideNext(); } else { swiper.slidePrev(); }
            setTimeout(() => { isThrottled = false; }, 800);
        }, { passive: false });
    }
    // === END OF MUNKÁIM SLIDESHOW ===

    // === MODAL ABLAK LOGIKÁJA (FRISSÍTVE) ===
    const modal = document.getElementById('portfolio-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.querySelector('.modal-close');

    function openModal(item) {
    modalTitle.textContent = item.title;
    let modalHtml = '';

    // Videó hozzáadása, ha van megadva URL
    if (item.video_url) {
        modalHtml += `<video autoplay muted loop playsinline src="${item.video_url}" style="max-width: 100%; border-radius: 8px; margin-bottom: 1rem;"></video>`;
    }

    // Markdown tartalom hozzáadása
    if (item.body && typeof marked !== 'undefined') {
        modalHtml += marked.parse(item.body);
    } else if (item.body) {
        modalHtml += item.body.replace(/\n/g, '<br>'); // Fallback
    } else {
        modalHtml += '<p>Nincs elérhető részletes leírás.</p>';
    }

    modalBody.innerHTML = modalHtml;
    modal.classList.add('active');
}

    function closeModal() { modal.classList.remove('active'); modalBody.innerHTML = ''; }

    document.addEventListener('click', function(e) {
        const detailsButton = e.target.closest('.btn-details');
        if (detailsButton) {
            e.preventDefault();
            const projectId = detailsButton.dataset.projectId;
            const project = portfolioData.find(p => p.id === projectId);
            if (project) openModal(project);
        }
        const readMoreLink = e.target.closest('.read-more');
        if (readMoreLink) {
            e.preventDefault();
            const postId = readMoreLink.dataset.postId;
            const post = blogData.find(p => p.id === postId);
            if (post) openModal(post);
        }
        if (e.target.closest('#modal-body a[href="#arajanlat"]')) {
            closeModal();
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
    // === END OF MODAL LOGIKA ===

    // === MOBILMENÜ LOGIKÁJA ===
    const hamburgerTrigger = document.querySelector('.hamburger-trigger');
    const hamburgerBars = document.querySelector('.hamburger-bars');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburgerTrigger && navMenu) {
        hamburgerTrigger.addEventListener('click', () => { hamburgerBars.classList.toggle('active'); navMenu.classList.toggle('active'); });
        navMenu.querySelectorAll('a').forEach(link => { link.addEventListener('click', () => { hamburgerBars.classList.remove('active'); navMenu.classList.remove('active'); }); });
    }
    // === END OF MOBILMENÜ LOGIKA ===

    // === ŰRLAPOK KEZELÉSE ===
    function handleFormSubmit(form, feedbackElement) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Automatikus _replyto beállítása a Formspree számára
            const emailInput = form.querySelector('input[name="email"]');
            const replyToInput = form.querySelector('input[name="_replyto"]');
            if(emailInput && replyToInput) {
                replyToInput.value = emailInput.value;
            }

            const formData = new FormData(form);
            const action = form.getAttribute('action');
            feedbackElement.style.display = 'block';
            feedbackElement.innerHTML = '<h3>Küldés folyamatban...</h3>';
            form.style.display = 'none';

            fetch(action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } })
                .then(response => {
                    if (response.ok) {
                        feedbackElement.innerHTML = '<h3>Köszönjük!</h3><p>Az üzenetedet sikeresen megkaptuk. Hamarosan felvesszük veled a kapcsolatot.</p>';
                    } else {
                        response.json().then(data => {
                             if (Object.hasOwn(data, 'errors')) {
                                feedbackElement.innerHTML = `<h3>Hiba történt.</h3><p>${data["errors"].map(error => error["message"]).join(", ")}</p>`;
                             } else {
                                feedbackElement.innerHTML = '<h3>Hiba történt.</h3><p>Kérlek, próbáld újra később, vagy írj nekünk közvetlenül.</p>';
                             }
                        })
                    }
                })
                .catch(error => {
                    feedbackElement.innerHTML = '<h3>Hálózati hiba.</h3><p>Ellenőrizd az internetkapcsolatodat és próbáld újra.</p>';
                });
        });
    }

    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        const quoteFormFeedback = document.getElementById('form-feedback');
        handleFormSubmit(quoteForm, quoteFormFeedback);
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const contactFormFeedback = document.getElementById('contact-form-feedback');
        handleFormSubmit(contactForm, contactFormFeedback);
    }
    // === END OF ŰRLAPOK KEZELÉSE ===

    // === LÁBLÉC ÉV FRISSÍTÉSE ===
    const yearSpanFooter = document.getElementById('current-year-footer');
    if(yearSpanFooter) yearSpanFooter.textContent = new Date().getFullYear();
    // === END OF LÁBLÉC ÉV FRISSÍTÉSE ===
});