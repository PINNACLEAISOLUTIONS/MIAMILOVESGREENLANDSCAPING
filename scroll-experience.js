/**
 * Miami Loves Green - Scroll-Driven Storytelling Experience
 */

class ScrollStorytelling {
    constructor() {
        this.sections = document.querySelectorAll('.content-section');
        this.revealElements = document.querySelectorAll('.reveal');
        this.hero = document.querySelector('.hero');
        this.heroText = document.querySelector('.hero-3d-text');
        this.lightbox = document.getElementById('lightbox');

        this.init();
    }

    init() {
        // Init reveal on scroll
        this.initIntersectionObserver();

        // Init parallax effects
        window.addEventListener('scroll', () => {
            this.handleParallax();
        });

        // Init Lightbox
        this.initLightbox();

        // Initial check
        this.handleParallax();
    }

    initIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');

                    // Staggered reveals for children
                    const staggerChildren = entry.target.querySelectorAll('.stagger-item:not(.active)');
                    if (staggerChildren.length > 0) {
                        staggerChildren.forEach((child, index) => {
                            setTimeout(() => {
                                child.classList.add('active');
                            }, index * 120);
                        });
                    }

                    // Specific observation for containers vs items
                    if (staggerChildren.length === 0) {
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, options);

        this.revealElements.forEach(el => observer.observe(el));
    }

    handleParallax() {
        const scrollY = window.scrollY;

        // Hero Parallax & Fade
        if (this.hero && this.heroText) {
            const heroRect = this.hero.getBoundingClientRect();
            if (heroRect.bottom > 0) {
                const speed = 0.4;
                const yOffset = scrollY * speed;
                this.heroText.style.transform = `translateY(${yOffset}px)`;
                this.heroText.style.opacity = Math.max(0, 1 - (scrollY / 1000));
            }
        }

        // Service Card 3D Depth on Desktop
        if (window.innerWidth > 1024) {
            document.querySelectorAll('.service-card').forEach(card => {
                const rect = card.getBoundingClientRect();
                const viewportCenter = window.innerHeight / 2;
                const cardCenter = rect.top + rect.height / 2;
                const distance = (cardCenter - viewportCenter) / window.innerHeight;

                const rotateX = distance * 15; // Rotate based on vertical position
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) translateY(${distance * -20}px)`;
            });
        }

        // Progress Scroll Bar
        const progressBar = document.getElementById('scroll-progress');
        if (progressBar) {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollY / totalHeight) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    initLightbox() {
        if (!this.lightbox) return;

        const lightboxImg = this.lightbox.querySelector('img');
        const closeBtn = this.lightbox.querySelector('.lightbox-close');

        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                const fullImgUrl = item.getAttribute('data-full');
                if (fullImgUrl) {
                    lightboxImg.src = fullImgUrl;
                    this.lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Close logic
        const close = () => {
            this.lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { lightboxImg.src = ''; }, 400);
        };

        closeBtn.addEventListener('click', close);
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightbox.classList.contains('active')) close();
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add Scroll Progress Bar element
    if (!document.getElementById('scroll-progress')) {
        const progress = document.createElement('div');
        progress.id = 'scroll-progress';
        progress.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            background: linear-gradient(to right, #4CAF50, #FFA726);
            z-index: 100003;
            width: 0%;
            transition: width 0.1s linear;
        `;
        document.body.appendChild(progress);
    }

    new ScrollStorytelling();
});
