let translations = {};
let lastScrollY = window.scrollY;
let ticking = false;

// 1. Carregar as traduções
async function loadTranslations() {
    try {
        const response = await fetch('translations.json');
        translations = await response.json();
        
        const savedLang = localStorage.getItem('userLanguage');
        // Padrão sempre em português 'pt' (garante indexação no Google em PT-BR)
        changeLanguage(savedLang || 'pt');
    } catch (error) {
        console.error("Erro ao carregar traduções:", error);
        document.body.classList.remove('lang-loading');
    }
}

// 2. Trocar o idioma
function changeLanguage(lang) {
    const normalized = lang.startsWith('pt') ? 'pt' : 'en';
    if (!translations[normalized]) return;

    localStorage.setItem('userLanguage', normalized);
    document.documentElement.lang = normalized;

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const text = translations[normalized][key];
        if (text) {
            element.innerHTML = text; // Permite HTML nas traduções
        }
    });

    const flagImg = document.getElementById('current-flag');
    if (flagImg) {
        flagImg.src = normalized === 'pt' 
            ? "https://twemoji.maxcdn.com/v/latest/svg/1f1e7-1f1f7.svg" 
            : "https://twemoji.maxcdn.com/v/latest/svg/1f1fa-1f1f8.svg";
    }

    document.querySelectorAll('.lang-dropdown li').forEach(li => {
        if (li.dataset.lang === normalized) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });

    document.body.classList.remove('lang-loading');
}

// 3. Inicializar Dropdown (Otimizado para Touch)
function initLangDropdown() {
    const selector = document.querySelector('.lang-selector');
    if (!selector) return;

    const selected = selector.querySelector('.lang-selected');

    if (selected) {
        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            selector.classList.toggle('open');
        });
    }

    selector.querySelectorAll('.lang-dropdown li').forEach(li => {
        li.addEventListener('click', () => {
            changeLanguage(li.dataset.lang);
            selector.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!selector.contains(e.target)) selector.classList.remove('open');
    });
}

// 4. Controlar Header Sticky (Suave no Mobile)
function updateHeaderScroll() {
    const currentScrollY = window.scrollY;
    const body = document.body;
    const threshold = 80;

    if (currentScrollY > threshold) {
        body.classList.add('scrolled');
        
        if (Math.abs(currentScrollY - lastScrollY) < 10) {
            ticking = false;
            return;
        }

        if (currentScrollY < lastScrollY) {
            body.classList.add('show-header');
        } else {
            body.classList.remove('show-header');
        }
    } else {
        body.classList.remove('scrolled', 'show-header');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateHeaderScroll);
        ticking = true;
    }
}, { passive: true });

// 5. Menu Mobile
function initMobileMenu() {
    const topNav = document.querySelector('.top-nav');
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    if (!topNav || !toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        topNav.classList.toggle('nav-open');
    });

    topNav.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            topNav.classList.remove('nav-open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!topNav.contains(e.target)) {
            topNav.classList.remove('nav-open');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTranslations();
    initLangDropdown();
    initMobileMenu();
});