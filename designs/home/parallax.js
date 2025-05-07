document.addEventListener('DOMContentLoaded', () => {
    const parallaxHero = document.querySelector('.parallax-hero');
    const backLayer = document.querySelector('.back-layer');
    const frontLayer = document.querySelector('.front-layer');

    if (parallaxHero) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            
            if (backLayer) {
                backLayer.style.transform = `translateZ(-50px) scale(1.5) translateY(${scrollPosition * 0.3}px)`;
            }
            
            if (frontLayer) {
                frontLayer.style.transform = `translateZ(0) translateY(${scrollPosition * 0.7}px)`;
            }
            
            const heroContent = document.querySelector('.parallax-hero .hero-content');
            if (heroContent) {
                heroContent.style.opacity = 1 - Math.min(1, scrollPosition / (parallaxHero.offsetHeight * 0.6));
            }
        });
    }

    // Animate title lines
    const titleLines = document.querySelectorAll('.title-line');
    titleLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, 300 + index * 300);
    });

    // Animate subtitle
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        setTimeout(() => {
            subtitle.style.opacity = '1';
        }, 1200);
    }
    
    // Intersection Observer for section animations
    const sections = document.querySelectorAll('.intro-section, .featured-songs');
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}); 