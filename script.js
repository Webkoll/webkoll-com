document.addEventListener('DOMContentLoaded', function() {

    // === GLOBÁLIS VÁLTOZÓK ===
    let portfolioData = [];
    let blogData = [];

    // === FŐ INICIALIZÁLÓ FÜGGVÉNY (CMS-HEZ ÍRVA) ===
    async function initializePage() {
        try {
            // A Netlify CMS a tartalmakat egy rejtett API-n keresztül teszi elérhetővé.
            // Ezek a hivatkozások a Netlify build folyamata során válnak élővé.
            // A tartalom Markdown formátumban érkezik, amit a Showdown könyvtárral alakítunk HTML-lé.
            const [settings, portfolio, blog] = await Promise.all([
                fetch('/_data/settings.json').then(res => res.json()),
                fetch('/admin/portfolio.json').then(res => res.json()), // A Netlify generálja ezt
                fetch('/admin/blog.json').then(res => res.json())       // A Netlify generálja ezt
            ]);
            
            portfolioData = portfolio;
            blogData = blog;

            // Tartalmak megjelenítése
            populatePortfolio(portfolioData);
            populateBlog(blogData);
            populateAboutSection(settings);
            populateQuoteFormOptions(settings.quote_options);
            populateContactSection(settings.contact);
            populateFooter(settings.contact);

        } catch (error) {
            console.error("Hiba a dinamikus tartalom betöltésekor:", error);
            // Itt lehetne egy hibaüzenetet megjeleníteni a felhasználónak
        }

        // Egyéb funkciók inicializálása
        initializeSwiper();
        initializeModal();
        initializeMobileMenu();
        initializeForms();
        createCanvasAnimation('hero-canvas');
        updateFooterYear();
    }

    // === TARTALOM MEGJELENÍTŐ FÜGGVÉNYEK ===
    function populatePortfolio(items) {
        const portfolioGrid = document.getElementById('portfolio-grid');
        if (!portfolioGrid || !items) return;
        portfolioGrid.innerHTML = '';
        items.forEach(item => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            let secondButtonHtml = (item.id === 6) // Az 'id' helyett jobb lenne egy egyedi 'slug' vagy 'special_action' mező
                ? `<a href="#arajanlat" class="btn-custom">Árajánlatkérés</a>`
                : `<a href="${item.link}" target="_blank" class="btn-custom">Weboldal</a>`;
            slide.innerHTML = `
                <div class="portfolio-item">
                    <div class="portfolio-image-container"><img src="${item.image}" alt="${item.title}"></div>
                    <div class="portfolio-content">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <div class="portfolio-buttons">
                            <a href="#" class="btn-custom btn-details" data-project-slug="${item.slug}">Bővebben</a>
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
            // A dátum formázása
            const postDate = new Date(post.date);
            const formattedDate = `${postDate.getFullYear()}. ${postDate.toLocaleString('hu-HU', { month: 'long' })} ${postDate.getDate()}.`;
            el.innerHTML = `<h3>${post.title}</h3><p class="post-meta">Dátum: ${formattedDate}</p><p>${post.excerpt}</p><a href="#" class="read-more" data-post-slug="${post.slug}">Elolvasom &rarr;</a>`;
            blogPostsContainer.appendChild(el);
        });
    }

    function populateAboutSection(settings) {
        const imgElement = document.getElementById('about-us-img');
        if (imgElement && settings.about_image) {
            imgElement.src = settings.about_image;
        }
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

    function populateContactSection(contact) { /* ... Változatlan ... */ }
    function populateFooter(contact) { /* ... Változatlan ... */ }


    // === VIZUÁLIS ELEMEK ÉS INTERAKCIÓK ===
    class Particle { /*...*/ }
    function createCanvasAnimation(canvasId, options = {}) { /*...*/ }

    function initializeSwiper() { /* ... Változatlan ... */ }
    function initializeMobileMenu() { /* ... Változatlan ... */ }
    function initializeForms() { /* ... Változatlan ... */ }
    function updateFooterYear() { /* ... Változatlan ... */ }
    
    function initializeModal() {
        const modal = document.getElementById('portfolio-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const closeModalBtn = document.querySelector('.modal-close');
        if (!modal || !modalTitle || !modalBody || !closeModalBtn) return;

        // A Showdown könyvtár betöltése a Markdown -> HTML konverzióhoz
        const converter = new showdown.Converter();

        async function openModal(slug, type) {
            let item;
            if (type === 'portfolio') {
                item = portfolioData.find(p => p.slug === slug);
            } else {
                item = blogData.find(p => p.slug === slug);
            }

            if (!item) return;

            modalTitle.textContent = item.title;
            modalBody.innerHTML = '<p>Tartalom betöltése...</p>';
            modal.classList.add('active');
            
            // A CMS a 'body' mezőben tárolja a Markdown tartalmat
            if (!item.body) {
                modalBody.innerHTML = '<p>Nincs elérhető részletes leírás.</p>';
                return;
            }
            
            // A Markdown szöveget HTML-lé alakítjuk
            const htmlContent = converter.makeHtml(item.body);
            modalBody.innerHTML = htmlContent;
        }

        function closeModal() { modal.classList.remove('active'); modalBody.innerHTML = ''; }
        
        document.addEventListener('click', function(e) {
            const detailsButton = e.target.closest('.btn-details');
            if (detailsButton) { e.preventDefault(); const slug = detailsButton.dataset.projectSlug; if (slug) openModal(slug, 'portfolio'); }
            
            const readMoreLink = e.target.closest('.read-more');
            if (readMoreLink) { e.preventDefault(); const slug = readMoreLink.dataset.postSlug; if (slug) openModal(slug, 'blog'); }
            
            if (e.target.closest('#modal-body a[href="#arajanlat"]')) { closeModal(); }
        });

        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
    }

    // === INDÍTÁS ===
    // A Showdown.js script dinamikus betöltése
    const showdownScript = document.createElement('script');
    showdownScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js';
    document.head.appendChild(showdownScript);
    
    showdownScript.onload = () => {
        initializePage();
    };

});