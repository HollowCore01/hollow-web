// ==========================================
// ПРЕЛОАДЕР
// ==========================================
(function initPreloader() {
    const preloader = document.getElementById('preloader');
    const fill = document.getElementById('preloader-fill');
    const percent = document.getElementById('preloader-percent');

    if (!preloader) return;

    document.body.classList.add('is-loading');

    let progress = 0;
    let targetProgress = 0;
    let done = false;

    const fakeTick = setInterval(() => {
        if (done) return;
        targetProgress = Math.min(targetProgress + Math.random() * 12, 90);
    }, 120);

    function renderProgress() {
        progress += (targetProgress - progress) * 0.12;
        if (progress > 99.5 && !done) progress = Math.min(progress, 90);
        if (done) progress = Math.min(progress + 2, 100);

        fill.style.width = `${progress.toFixed(1)}%`;
        percent.textContent = `${Math.round(progress)}%`;

        if (progress < 100) {
            requestAnimationFrame(renderProgress);
        }
    }
    requestAnimationFrame(renderProgress);

    function finishPreloader() {
        if (done) return;
        done = true;
        clearInterval(fakeTick);
        targetProgress = 100;

        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.classList.remove('is-loading');

            setTimeout(() => {
                if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
            }, 700);
        }, 400);
    }

    if (document.readyState === 'complete') {
        finishPreloader();
    } else {
        window.addEventListener('load', finishPreloader);
        setTimeout(finishPreloader, 5000);
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 0. ПЛАВНЫЙ СКРОЛЛ (Lenis)
    // ==========================================
    let lenis = null;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            autoRaf: true,
            duration: 1.0,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            anchors: true,
            stopInertiaOnNavigate: true,
        });
    }

    // ==========================================
    // 1. «МАГНИТНЫЕ» БУКВЫ
    // ==========================================
    function splitTextIntoChars(el) {
        const originalHTML = el.innerHTML;
        el.innerHTML = '';

        const lines = originalHTML.split(/<br\s*\/?>/i);

        lines.forEach((line, lineIndex) => {
            const words = line.trim().split(' ');

            words.forEach((word, wordIndex) => {
                for (let i = 0; i < word.length; i++) {
                    const span = document.createElement('span');
                    span.className = 'split-char';
                    span.textContent = word[i];

                    const angle = Math.random() * Math.PI * 2;
                    const distance = 80 + Math.random() * 120;
                    const tx = Math.cos(angle) * distance;
                    const ty = Math.sin(angle) * distance;
                    const rot = (Math.random() - 0.5) * 120;
                    const sc = 0.4 + Math.random() * 0.6;

                    span.style.setProperty('--tx', `${tx.toFixed(1)}px`);
                    span.style.setProperty('--ty', `${ty.toFixed(1)}px`);
                    span.style.setProperty('--rot', `${rot.toFixed(1)}deg`);
                    span.style.setProperty('--sc', sc.toFixed(2));

                    el.appendChild(span);
                }
                if (wordIndex < words.length - 1) {
                    const space = document.createElement('span');
                    space.className = 'split-space';
                    space.innerHTML = '&nbsp;';
                    el.appendChild(space);
                }
            });

            if (lineIndex < lines.length - 1) {
                const br = document.createElement('span');
                br.className = 'split-br';
                el.appendChild(br);
            }
        });
    }

    function showSplit(el, baseDelay = 0.03) {
        const chars = el.querySelectorAll('.split-char');
        chars.forEach((char, i) => {
            char.style.transitionDelay = `${i * baseDelay}s`;
        });
        el.classList.remove('split-hidden');
        requestAnimationFrame(() => {
            el.classList.add('split-visible');
        });
    }

    function hideSplit(el) {
        const chars = el.querySelectorAll('.split-char');
        chars.forEach((char, i) => {
            char.style.transitionDelay = `${i * 0.015}s`;
        });
        el.classList.remove('split-visible');
        el.classList.add('split-hidden');
    }

    // ==========================================
    // 2. HERO-ЗАГОЛОВОК
    // ==========================================
    const heroTitle = document.getElementById('typewriter');
    if (heroTitle) {
        splitTextIntoChars(heroTitle);
        setTimeout(() => showSplit(heroTitle, 0.04), 300);

        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    showSplit(heroTitle, 0.04);
                } else {
                    hideSplit(heroTitle);
                }
            });
        }, { threshold: 0.2 });

        heroObserver.observe(heroTitle);
    }

    // ==========================================
    // 3. ЗАГОЛОВКИ СЕКЦИЙ + BIG-LINK
    // ==========================================
    const splitTargets = document.querySelectorAll('.section-title[data-split-text], .big-link[data-split-text]');

    splitTargets.forEach(el => splitTextIntoChars(el));

    if (splitTargets.length) {
        const splitObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    showSplit(entry.target, 0.03);
                } else {
                    hideSplit(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -10% 0px'
        });

        splitTargets.forEach(el => splitObserver.observe(el));
    }

    // ==========================================
    // 4. ПРОСТОЙ REVEAL (без переворота)
    // ==========================================
    const reveals = document.querySelectorAll('.reveal');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => revealObserver.observe(el));

    // ==========================================
    // 4.5. FAQ-АККОРДЕОН
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');

    if (faqItems.length) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (!question) return;

            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                faqItems.forEach(other => {
                    if (other !== item && other.classList.contains('active')) {
                        other.classList.remove('active');
                        const otherBtn = other.querySelector('.faq-question');
                        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    }
                });

                if (isActive) {
                    item.classList.remove('active');
                    question.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('active');
                    question.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // ==========================================
    // 5. ОТПРАВКА ФОРМЫ
    // ==========================================
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    const submitBtn = document.querySelector('.submit-btn');
    const successBlock = document.getElementById('success-message');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;
            status.textContent = '';
            status.className = 'form-status';

            const formData = {
                name: document.getElementById('name').value,
                contact: document.getElementById('contact').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch("http://127.0.0.1:5000/api/requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) throw new Error("Ошибка сервера");

                form.reset(); 
                Array.from(form.children).forEach(child => child.style.display = 'none');
                successBlock.style.display = 'flex';
                
                setTimeout(() => {
                    successBlock.style.display = 'none';
                    Array.from(form.children).forEach(child => child.style.display = '');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 5000);

            } catch (error) {
                console.error(error);
                status.textContent = "Ошибка! База данных недоступна.";
                status.className = 'form-status err';
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // 6. Кнопка "Наверх"
    // ==========================================
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            if (lenis) {
                lenis.scrollTo(0, { duration: 1.0 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // ==========================================
    // 7. ЛЕТЯЩАЯ СЕТЬ НА ГЛАВНОМ ЭКРАНЕ (Particles.js)
    // ==========================================
    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#ffffff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.5, "random": false, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
                "size": { "value": 3, "random": true, "anim": { "enable": true, "speed": 2, "size_min": 0.1, "sync": false } },
                "line_linked": { "enable": true, "distance": 150, "color": "#4f46e5", "opacity": 0.4, "width": 1 },
                "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": true, "mode": "push" },
                    "resize": true
                },
                "modes": {
                    "grab": { "distance": 200, "line_linked": { "opacity": 1 } },
                    "push": { "particles_nb": 4 }
                }
            },
            "retina_detect": true
        });
    }

    // ==========================================
    // 8. ЭЛЕКТРИЧЕСКИЙ ШАР (В секции Услуги)
    // ==========================================
    const servicesContainer = document.getElementById('services-canvas-container');
    if (servicesContainer && typeof THREE !== 'undefined') {
        const scene2 = new THREE.Scene();
        const camera2 = new THREE.PerspectiveCamera(45, servicesContainer.clientWidth / servicesContainer.clientHeight, 0.1, 1000);
        camera2.position.z = 4;

        const renderer2 = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer2.setSize(servicesContainer.clientWidth, servicesContainer.clientHeight);
        renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        servicesContainer.appendChild(renderer2.domElement);

        const geometry2 = new THREE.IcosahedronGeometry(1.6, 1);
        const edges = new THREE.EdgesGeometry(geometry2);
        const material2 = new THREE.LineBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.9, linewidth: 2 });
        const electricSphere = new THREE.LineSegments(edges, material2);
        scene2.add(electricSphere);

        const glowMat = new THREE.MeshBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.05 });
        const glowSphere = new THREE.Mesh(geometry2, glowMat);
        scene2.add(glowSphere);

        electricSphere.scale.set(0, 0, 0);
        glowSphere.scale.set(0, 0, 0);
        electricSphere.rotation.set(Math.PI, 0, 0);

        let appearProgress = 0;
        let targetProgress = 0;
        let glowFlash = 0;

        function easeOutBack(t) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        }

        function animate2() {
            requestAnimationFrame(animate2);

            appearProgress += (targetProgress - appearProgress) * 0.05;
            const eased = easeOutBack(appearProgress);

            const scale = Math.max(0, eased);
            electricSphere.scale.set(scale, scale, scale);
            glowSphere.scale.set(scale, scale, scale);

            electricSphere.rotation.x += 0.002 + appearProgress * 0.005;
            electricSphere.rotation.y += 0.005 + appearProgress * 0.008;
            glowSphere.rotation.x += 0.002;
            glowSphere.rotation.y += 0.005;

            const breathe = 1 + Math.sin(Date.now() * 0.0015) * 0.03 * appearProgress;
            electricSphere.scale.set(scale * breathe, scale * breathe, scale * breathe);

            if (targetProgress > 0.5 && glowFlash < 1) glowFlash += 0.02;
            const flashBoost = Math.sin(glowFlash * Math.PI) * 0.5;

            material2.opacity = Math.min(1, 0.9 * appearProgress + flashBoost * 0.3);
            glowMat.opacity = Math.min(1, 0.05 * appearProgress + flashBoost * 0.15);

            renderer2.render(scene2, camera2);
        }
        animate2();

        const servicesSection = document.getElementById('services');
        if (servicesSection) {
            const servicesObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    targetProgress = entry.isIntersecting ? 1 : 0;
                    if (entry.isIntersecting) glowFlash = 0;
                });
            }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
            servicesObserver.observe(servicesSection);
        }

        window.addEventListener('resize', () => {
            if (servicesContainer.clientWidth > 0) {
                camera2.aspect = servicesContainer.clientWidth / servicesContainer.clientHeight;
                camera2.updateProjectionMatrix();
                renderer2.setSize(servicesContainer.clientWidth, servicesContainer.clientHeight);
            }
        });
    }

    // ==========================================
    // 9. БЕЛЫЙ КУБ (В секции О себе)
    // ==========================================
    const aboutContainer = document.getElementById('about-canvas-container');
    if (aboutContainer && typeof THREE !== 'undefined') {
        const scene3 = new THREE.Scene();
        const camera3 = new THREE.PerspectiveCamera(45, aboutContainer.clientWidth / aboutContainer.clientHeight, 0.1, 1000);
        camera3.position.z = 4;

        const renderer3 = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer3.setSize(aboutContainer.clientWidth, aboutContainer.clientHeight);
        renderer3.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        aboutContainer.appendChild(renderer3.domElement);

        const geometry3 = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        const material3 = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.6 });
        const cube = new THREE.Mesh(geometry3, material3);
        scene3.add(cube);

        cube.scale.set(0, 0, 0);
        cube.rotation.set(Math.PI / 2, Math.PI / 2, 0);

        let cubeProgress = 0;
        let cubeTarget = 0;
        let cubeFlash = 0;

        function easeOutBack2(t) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        }

        function animate3() {
            requestAnimationFrame(animate3);

            cubeProgress += (cubeTarget - cubeProgress) * 0.05;
            const eased = easeOutBack2(cubeProgress);

            const s = Math.max(0, eased);
            cube.scale.set(s, s, s);

            cube.rotation.x += 0.003 + cubeProgress * 0.004;
            cube.rotation.y += 0.005 + cubeProgress * 0.006;

            if (cubeTarget > 0.5 && cubeFlash < 1) cubeFlash += 0.02;
            const flashBoost = Math.sin(cubeFlash * Math.PI) * 0.3;

            material3.opacity = Math.min(1, 0.6 * cubeProgress + flashBoost);

            renderer3.render(scene3, camera3);
        }
        animate3();

        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            const aboutObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    cubeTarget = entry.isIntersecting ? 1 : 0;
                    if (entry.isIntersecting) cubeFlash = 0;
                });
            }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
            aboutObserver.observe(aboutSection);
        }

        window.addEventListener('resize', () => {
            if (aboutContainer.clientWidth > 0) {
                camera3.aspect = aboutContainer.clientWidth / aboutContainer.clientHeight;
                camera3.updateProjectionMatrix();
                renderer3.setSize(aboutContainer.clientWidth, aboutContainer.clientHeight);
            }
        });
    }

    // ==========================================
    // 10. ЛЕТЯЩАЯ СЕТЬ В ФУТЕРЕ (Particles.js)
    // ==========================================
    if (typeof particlesJS !== 'undefined') {
        particlesJS("footer-particles-js", {
            "particles": {
                "number": { 
                    "value": 60, 
                    "density": { "enable": true, "value_area": 800 } 
                },
                "color": { "value": "#4f46e5" }, 
                "shape": { "type": "circle" },
                "opacity": { 
                    "value": 0.5, 
                    "random": true,
                    "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } 
                },
                "size": { 
                    "value": 3, 
                    "random": true,
                    "anim": { "enable": true, "speed": 2, "size_min": 0.1, "sync": false } 
                },
                "line_linked": { 
                    "enable": true, 
                    "distance": 150, 
                    "color": "#ffffff", 
                    "opacity": 0.2, 
                    "width": 1 
                },
                "move": { 
                    "enable": true, 
                    "speed": 1.5, 
                    "direction": "none", 
                    "random": false, 
                    "straight": false, 
                    "out_mode": "out", 
                    "bounce": false 
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": true, "mode": "push" },
                    "resize": true
                },
                "modes": {
                    "grab": { "distance": 200, "line_linked": { "opacity": 0.5 } },
                    "push": { "particles_nb": 4 }
                }
            },
            "retina_detect": true
        });
    }

    // ==========================================
    // 11. ТУННЕЛЬ ИЗ ЛИНИЙ (hero-секция)
    // ==========================================
    const tunnelContainer = document.getElementById('tunnel-canvas');
    if (tunnelContainer && typeof THREE !== 'undefined') {
        const isMobile = window.innerWidth < 768;

        const sceneT = new THREE.Scene();
        const cameraT = new THREE.PerspectiveCamera(
            70,
            tunnelContainer.clientWidth / tunnelContainer.clientHeight,
            0.1,
            1000
        );
        cameraT.position.z = 0;

        const rendererT = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        rendererT.setSize(tunnelContainer.clientWidth, tunnelContainer.clientHeight);
        rendererT.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        tunnelContainer.appendChild(rendererT.domElement);

        const RING_COUNT = isMobile ? 20 : 40;
        const RING_RADIUS = 4;
        const RING_SPACING = 3;
        const TUNNEL_DEPTH = RING_COUNT * RING_SPACING;
        const SEGMENTS = isMobile ? 24 : 48;
        const SPEED = isMobile ? 0.035 : 0.045;

        const rings = [];
        const ringMaterial = new THREE.LineBasicMaterial({
            color: 0x4f46e5,
            transparent: true,
            opacity: 0.6
        });

        for (let i = 0; i < RING_COUNT; i++) {
            const points = [];
            for (let j = 0; j <= SEGMENTS; j++) {
                const angle = (j / SEGMENTS) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * RING_RADIUS,
                    Math.sin(angle) * RING_RADIUS,
                    0
                ));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const ring = new THREE.Line(geometry, ringMaterial);
            ring.position.z = -i * RING_SPACING;
            sceneT.add(ring);
            rings.push(ring);
        }

        const ribCount = isMobile ? 6 : 12;
        const ribMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.08
        });
        for (let r = 0; r < ribCount; r++) {
            const angle = (r / ribCount) * Math.PI * 2;
            const x = Math.cos(angle) * RING_RADIUS;
            const y = Math.sin(angle) * RING_RADIUS;
            const geo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, y, 0),
                new THREE.Vector3(x, y, -TUNNEL_DEPTH)
            ]);
            const rib = new THREE.Line(geo, ribMaterial);
            sceneT.add(rib);
        }

        let paused = false;
        document.addEventListener('visibilitychange', () => {
            paused = document.hidden;
        });

        function animateTunnel() {
            requestAnimationFrame(animateTunnel);
            if (paused) return;

            for (let i = 0; i < rings.length; i++) {
                const ring = rings[i];
                ring.position.z += SPEED;

                if (ring.position.z > 2) {
                    ring.position.z -= TUNNEL_DEPTH;
                }
            }

            rendererT.render(sceneT, cameraT);
        }
        animateTunnel();

        window.addEventListener('resize', () => {
            if (tunnelContainer.clientWidth > 0) {
                cameraT.aspect = tunnelContainer.clientWidth / tunnelContainer.clientHeight;
                cameraT.updateProjectionMatrix();
                rendererT.setSize(tunnelContainer.clientWidth, tunnelContainer.clientHeight);
            }
        });
    }
});