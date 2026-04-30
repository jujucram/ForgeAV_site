document.addEventListener('DOMContentLoaded', function() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
        }));
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                        target.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                        });
                }
        });
});

window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
                navbar.style.background = 'rgba(15, 15, 15, 0.98)';
        } else {
                navbar.style.background = 'rgba(15, 15, 15, 0.95)';
        }
});

async function fetchGitHubStats() {
        try {
                const repoResponse = await fetch('https://api.github.com/repos/jujucram/forge-av');
                const repoData = await repoResponse.json();
                
                const languagesResponse = await fetch('https://api.github.com/repos/jujucram/forge-av/languages');
                const languagesData = await languagesResponse.json();
                
                const totalBytes = Object.values(languagesData).reduce((sum, bytes) => sum + bytes, 0);
                
                const shellPercentage = Math.round((languagesData.Shell || 0) / totalBytes * 100);
                const assemblyPercentage = Math.round((languagesData.Assembly || 0) / totalBytes * 100);
                const cPercentage = Math.round((languagesData.C || 0) / totalBytes * 100);
                
                const stats = document.querySelectorAll('.stat-number');
                stats[0].setAttribute('data-target', shellPercentage);
                stats[1].setAttribute('data-target', assemblyPercentage);
                stats[2].setAttribute('data-target', cPercentage);
                stats[3].setAttribute('data-target', repoData.stargazers_count);
                
        } catch (error) {
                console.error('Error fetching GitHub stats:', error);
        }
}

function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        let animating = false;
        
        counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                const current = parseInt(counter.textContent);
                
                if (current < target) {
                        animating = true;
                        const increment = Math.max(1, target / 50);
                        const newValue = Math.min(current + Math.ceil(increment), target);
                        counter.textContent = newValue;
                }
        });
        
        if (animating) {
                requestAnimationFrame(() => {
                        setTimeout(animateCounters, 50);
                });
        }
}

const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
                if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        
                        if (entry.target.classList.contains('stats') && !entry.target.dataset.animated) {
                                entry.target.dataset.animated = 'true';
                                fetchGitHubStats().then(() => {
                                        setTimeout(animateCounters, 500);
                                });
                        }
                }
        });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
        const elementsToAnimate = document.querySelectorAll('.about-card, .feature-card, .contact-link, .stats');
        
        elementsToAnimate.forEach(el => {
                if (!el.classList.contains('stats')) {
                        el.style.opacity = '0';
                        el.style.transform = 'translateY(30px)';
                        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                }
                observer.observe(el);
        });
});

function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
                if (i < text.length) {
                        element.innerHTML += text.charAt(i);
                        i++;
                        setTimeout(type, speed);
                }
        }
        
        type();
}

document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.3);
                        transform: scale(0);
                        animation: ripple 0.6s linear;
                        pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => {
                        ripple.remove();
                }, 600);
        });
});

const style = document.createElement('style');
style.textContent = `
        @keyframes ripple {
                to {
                        transform: scale(4);
                        opacity: 0;
                }
        }
`;
document.head.appendChild(style);

function detectTheme() {
        const hour = new Date().getHours();
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (isDarkMode || hour < 6 || hour > 20) {
                document.body.classList.add('dark-theme');
        }
}

function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                        if (entry.isIntersecting) {
                                const img = entry.target;
                                img.src = img.dataset.src;
                                img.classList.remove('lazy');
                                imageObserver.unobserve(img);
                        }
                });
        });
        
        images.forEach(img => imageObserver.observe(img));
}

function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
                const later = () => {
                        timeout = null;
                        if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
        };
}

const optimizedScrollHandler = debounce(() => {
        const scrolled = window.pageYOffset;
        
        const navbar = document.querySelector('.navbar');
        if (scrolled > 50) {
                navbar.style.background = 'rgba(15, 15, 15, 0.98)';
        } else {
                navbar.style.background = 'rgba(15, 15, 15, 0.95)';
        }
        
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);

let konamiCode = [];
const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
];

document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        
        if (konamiCode.length > konamiSequence.length) {
                konamiCode.shift();
        }
        
        if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
                document.body.style.filter = 'hue-rotate(180deg)';
                setTimeout(() => {
                        document.body.style.filter = 'none';
                }, 3000);
                
                const message = document.createElement('div');
                message.textContent = '🎮 Hollow Knight would be proud! 🎮';
                message.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: linear-gradient(135deg, #3F5EFB 0%, #5619B3 100%);
                        color: white;
                        padding: 1rem 2rem;
                        border-radius: 10px;
                        font-weight: bold;
                        z-index: 10000;
                        animation: fadeInUp 0.5s ease;
                `;
                
                document.body.appendChild(message);
                
                setTimeout(() => {
                        message.remove();
                }, 3000);
                
                konamiCode = [];
        }
});

document.addEventListener('DOMContentLoaded', () => {
        detectTheme();
        lazyLoadImages();
        
        const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-description, .hero-buttons');
        heroElements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = `opacity 0.8s ease ${index * 0.2}s, transform 0.8s ease ${index * 0.2}s`;
                
                setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                }, 500 + (index * 200));
        });
});

if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
                // navigator.serviceWorker.register('/sw.js')
                //     .then((registration) => {
                //         console.log('SW registered: ', registration);
                //     })
                //     .catch((registrationError) => {
                //         console.log('SW registration failed: ', registrationError);
                //     });
        });
}