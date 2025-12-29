// 15-Color Palette 
const themes = [
    { bg: "#000000", font: "#ffffff" },
    { bg: "#051a1c", font: "#c3ebf1" },
    { bg: "#182938", font: "#b7d4f5" },
    { bg: "#2e3248", font: "#cfbcec" },
    { bg: "#543c59", font: "#ffb1b1" },
    { bg: "#773a35", font: "#f2c3a4" },
    { bg: "#9d4433", font: "#f3d8b8" },
    { bg: "#e94f0e", font: "#f3e6cf" },
    { bg: "#ffd2b4", font: "#e94f0e" },
    { bg: "#f3e6cf", font: "#774e34" },
    { bg: "#d5d1b7", font: "#514e38" },
    { bg: "#d1dacb", font: "#3b4236" },
    { bg: "#d5e3de", font: "#263631" },
    { bg: "#deebee", font: "#1e282a" },
    { bg: "#f2fbfd", font: "#12191a" },
    { bg: "#ffffff", font: "#000000" }
];

// Scroll Animation Observer
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    if (section.id !== 'intro') {
        observer.observe(section);
    }
});

// Intro tab switching functionality
const tabs = document.querySelectorAll('.intro-tab');
const textContent = document.querySelector('.text-content');
let currentIndex = 0;
let isAnimating = false;
let autoPlayInterval;

function switchToTab(index) {
    if (isAnimating || index === currentIndex) return;
    isAnimating = true;
    tabs.forEach(t => t.classList.remove('active'));
    tabs[index].classList.add('active');
    const newText = tabs[index].dataset.text;
    const direction = index < currentIndex ? 'left' : 'right';
    textContent.classList.remove('text-slide-left', 'text-slide-right', 'text-slide-out-left', 'text-slide-out-right');
    textContent.classList.add(direction === 'left' ? 'text-slide-out-right' : 'text-slide-out-left');
    setTimeout(() => {
        textContent.textContent = newText;
        textContent.classList.remove('text-slide-out-left', 'text-slide-out-right');
        textContent.classList.add(direction === 'left' ? 'text-slide-left' : 'text-slide-right');
        setTimeout(() => { isAnimating = false; }, 350);
    }, 350);
    currentIndex = index;
}

function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % tabs.length;
        switchToTab(nextIndex);
    }, 5000);
}

function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
}

tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        switchToTab(index);
        resetAutoPlay();
    });
});

startAutoPlay();

// Star Slider Logic
const starContainer = document.querySelector('.star-slider-container');
const starButton = document.getElementById('starButton');
const sliderTrack = document.getElementById('sliderTrack');

// Generate dots
themes.forEach((theme, index) => {
    const dot = document.createElement('div');
    dot.className = 'color-dot';
    dot.style.backgroundColor = theme.bg;
    dot.dataset.index = index;
    
    dot.addEventListener('click', () => {
        applyThemeFromPosition(getTranslateYForDot(index));
    });
    
    sliderTrack.appendChild(dot);
});

let isDragging = false;
let startY = 0;
let startTranslateY = 0;
let lastSelectedThemeIndex = 0;
let lastTranslateY = 0;

const starHalfHeight = starButton.offsetHeight / 2;

function getTranslateY() {
    const style = window.getComputedStyle(starButton);
    const matrix = new DOMMatrixReadOnly(style.transform);
    return matrix.m42 * -1;
}

function getTranslateYForDot(index) {
    const dots = document.querySelectorAll('.color-dot');
    if (dots.length === 0) return 0;
    const targetDot = dots[index];
    
    const trackHeight = 350;
    const dotCenterYFromTop = targetDot.offsetTop + targetDot.offsetHeight / 2;
    const starHalfHeight = starButton.offsetHeight / 2;
    
    const distanceToDotCenterFromBottom = trackHeight - dotCenterYFromTop;
    
    return distanceToDotCenterFromBottom - starHalfHeight;
}

function applyThemeFromPosition(translateY) {
    const dots = document.querySelectorAll('.color-dot');
    if (dots.length === 0) return;

    const trackHeight = 350;
    let closestDotIndex = 0;
    let minDistance = Infinity;

    dots.forEach((dot, index) => {
        const dotCenterYFromTop = dot.offsetTop + dot.offsetHeight / 2;
        const distanceToDotCenterFromBottom = trackHeight - dotCenterYFromTop;
        
        const targetTranslateY = distanceToDotCenterFromBottom - starHalfHeight;
        
        const distance = Math.abs(translateY - targetTranslateY);

        if (distance < minDistance) {
            minDistance = distance;
            closestDotIndex = index;
        }
    });

    const theme = themes[closestDotIndex];
    document.documentElement.style.setProperty('--bg-color', theme.bg);
    document.documentElement.style.setProperty('--text-color', theme.font);
    
    lastSelectedThemeIndex = closestDotIndex;
    
    const targetDot = dots[closestDotIndex];
    const dotCenterYFromTop = targetDot.offsetTop + targetDot.offsetHeight / 2;
    const distanceToDotCenterFromBottom = trackHeight - dotCenterYFromTop;
    const finalTranslateY = distanceToDotCenterFromBottom - starHalfHeight;
    
    starButton.style.transform = `translateY(-${finalTranslateY}px)`;
    lastTranslateY = finalTranslateY;
}

function onDrag(e) {
    if (!isDragging) return;
    
    const deltaY = startY - e.clientY;
    let newTranslateY = startTranslateY + deltaY;
    
    newTranslateY = Math.max(starButton.minTranslateY, Math.min(starButton.maxTranslateY, newTranslateY));
    
    starButton.style.transform = `translateY(-${newTranslateY}px)`;
    lastTranslateY = newTranslateY;
}

function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    starButton.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    applyThemeFromPosition(lastTranslateY);
    
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
}

starButton.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    starButton.style.transition = 'none';
    startY = e.clientY;
    startTranslateY = lastTranslateY;
    
    const dots = document.querySelectorAll('.color-dot');
    if (dots.length === 0) return;
    
    const trackHeight = 350;
    const firstDot = dots[0];
    const lastDot = dots[dots.length - 1];
    
    const firstDotCenterYFromTop = firstDot.offsetTop + firstDot.offsetHeight / 2;
    const maxTranslateY = trackHeight - firstDotCenterYFromTop - starHalfHeight;
    
    const lastDotCenterYFromTop = lastDot.offsetTop + lastDot.offsetHeight / 2;
    const minTranslateY = trackHeight - lastDotCenterYFromTop - starHalfHeight;
    
    starButton.minTranslateY = minTranslateY;
    starButton.maxTranslateY = maxTranslateY;
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
});


sliderTrack.addEventListener('click', (e) => {
    if (!isDragging && (e.target === sliderTrack || e.target.classList.contains('slider-track'))) {
        const trackRect = sliderTrack.getBoundingClientRect();
        const clickYFromBottom = trackRect.bottom - e.clientY;
        
        const targetTranslateY = clickYFromBottom - starHalfHeight;
        
        applyThemeFromPosition(targetTranslateY);
    }
});

starContainer.addEventListener('mouseenter', () => {
    starButton.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    starButton.style.transform = `translateY(-${lastTranslateY}px)`;
});

starContainer.addEventListener('mouseleave', () => {
    starButton.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    starButton.style.transform = 'translateY(0)';
});

window.addEventListener('load', () => {
    sliderTrack.style.height = '350px';
    sliderTrack.style.opacity = '1';
    sliderTrack.style.visibility = 'visible';
    
    requestAnimationFrame(() => {
        const dots = document.querySelectorAll('.color-dot');
        if (dots.length > 0) {
            const firstDot = dots[0];
            const dotCenterYFromTop = firstDot.offsetTop + firstDot.offsetHeight / 2;
            const trackHeight = 350;
            const distanceToDotCenterFromBottom = trackHeight - dotCenterYFromTop;
            const initialTranslateY = distanceToDotCenterFromBottom - starHalfHeight;
            
            const theme = themes[0];
            document.documentElement.style.setProperty('--bg-color', theme.bg);
            document.documentElement.style.setProperty('--text-color', theme.font);
        }
        
        sliderTrack.style.height = '';
        sliderTrack.style.opacity = '';
        sliderTrack.style.visibility = '';
    });
});

// Navigation active state on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Smooth scroll
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// Email copy
const emailCopy = document.querySelector('.email-copy');
if (emailCopy) {
    emailCopy.addEventListener('click', (e) => {
        e.preventDefault();
        const email = emailCopy.dataset.email;
        navigator.clipboard.writeText(email).then(() => {
            const originalText = emailCopy.querySelector('span').textContent;
            emailCopy.querySelector('span').textContent = 'Copied!';
            setTimeout(() => { emailCopy.querySelector('span').textContent = originalText; }, 2000);
        });
    });
}