function shouldRunBootLoader() {
    let seen = false;
    try {
        seen = sessionStorage.getItem('bootSeen') === '1';
    } catch (err) {
        seen = false;
    }

    let navType = 'navigate';
    const navEntry = performance.getEntriesByType?.('navigation')?.[0];
    if (navEntry?.type) {
        navType = navEntry.type;
    } else if (performance.navigation) {
        navType = performance.navigation.type === 1 ? 'reload' : 'navigate';
    }

    return navType === 'reload' || !seen;
}

function initBootLoader() {
    const loader = document.getElementById('boot-loader');
    if (!loader) return;

    const body = document.body;
    const runLoader = shouldRunBootLoader();

    if (!runLoader) {
        loader.remove();
        if (body) body.classList.remove('boot-active');
        return;
    }

    try {
        sessionStorage.setItem('bootSeen', '1');
    } catch (err) {
        /* ignore */
    }
    const log = document.getElementById('boot-log');
    const bar = document.getElementById('boot-progress-bar');
    const grid = document.getElementById('boot-grid');
    const canvas = document.getElementById('matrix-canvas');
    const codeBox = document.getElementById('boot-code');
    const welcome = document.getElementById('boot-welcome');
    const popup = document.getElementById('boot-popup');
    let finished = false;
    let codeTimer;

    if (body) body.classList.add('boot-active');

    const codeLines = [
        'const boot = async () => {',
        '  await connect("gpu://pipeline");',
        '  const shaders = await compile(glsl);',
        '  mountUI(shaders.viewport);',
        '  hydrateState(cache.readAll());',
        '  await link("/api/profile");',
        '  render();',
        '};',
        'boot().then(() => log("ready"));',
        'stream("/logs").pipe(display);'
    ];

    const steps = [
        { text: 'Initializing core modules', duration: 420 },
        { text: 'Loading assets and shaders', duration: 460 },
        { text: 'Mounting UI pipeline', duration: 520 },
        { text: 'Establishing secure channels', duration: 520 },
        { text: 'Compiling interface layers', duration: 520 },
        { text: 'Syncing local preferences', duration: 520 },
        { text: 'Launching experience', duration: 580 }
    ];

    buildGrid();
    startMatrix();
    startCodeStream();
    runSequence();

    loader.addEventListener('click', finish, { once: true });
    window.addEventListener('keydown', finish, { once: true });
    setTimeout(finish, 9000);

    function buildGrid() {
        if (!grid) return;
        grid.innerHTML = '';
        const size = 26;
        const cols = Math.ceil(window.innerWidth / size);
        const rows = Math.ceil(window.innerHeight / size);
        const total = cols * rows;
        for (let i = 0; i < total; i++) {
            const cell = document.createElement('span');
            cell.style.setProperty('--delay', `${Math.random() * 0.9}s`);
            grid.appendChild(cell);
        }
    }

    function startMatrix() {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const letters = '01{}[]<>/\\|=+-';
        let width;
        let height;
        let fontSize = 16;
        let columns;
        let drops;

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            columns = Math.floor(width / fontSize);
            drops = new Array(columns).fill(1);
        };

        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            if (finished) return;
            ctx.fillStyle = 'rgba(3, 7, 18, 0.12)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
            ctx.font = `${fontSize}px "Space Grotesk", monospace`;

            for (let i = 0; i < columns; i++) {
                const char = letters.charAt(Math.floor(Math.random() * letters.length));
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            requestAnimationFrame(draw);
        };

        requestAnimationFrame(draw);
    }

    function startCodeStream() {
        if (!codeBox) return;
        let cursor = 0;
        const buffer = [];
        const pushLine = () => {
            if (finished) return;
            buffer.push(codeLines[cursor % codeLines.length]);
            if (buffer.length > 9) buffer.shift();
            codeBox.textContent = buffer.join('\n');
            cursor++;
        };
        pushLine();
        codeTimer = setInterval(pushLine, 260);
    }

    function addLine(text) {
        if (!log) return;
        const lines = log.querySelectorAll('.boot-line');
        lines.forEach(line => line.classList.remove('active'));
        const entry = document.createElement('div');
        entry.className = 'boot-line active';
        entry.textContent = `>> ${text}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    function runSequence() {
        let index = 0;
        const next = () => {
            if (finished) return;
            const step = steps[index];
            addLine(step.text);
            if (bar) {
                const pct = Math.round(((index + 1) / steps.length) * 100);
                bar.style.width = `${pct}%`;
            }
            index++;
            if (index < steps.length) {
                setTimeout(next, step.duration);
            } else {
                setTimeout(finish, 500);
            }
        };

        next();
    }

    function revealGrid() {
        if (!grid) return;
        grid.querySelectorAll('span').forEach(cell => cell.classList.add('reveal'));
    }

    function finish() {
        if (finished) return;
        finished = true;
        if (codeTimer) clearInterval(codeTimer);
        if (welcome) welcome.classList.add('show');
        if (popup) {
            popup.classList.add('show');
            setTimeout(() => popup.classList.remove('show'), 1500);
        }
        setTimeout(revealGrid, 500);
        setTimeout(() => loader.classList.add('hidden'), 1600);
        setTimeout(() => {
            loader.remove();
            if (body) body.classList.remove('boot-active');
        }, 2500);
    }
}

// Keep viewport-dependent sizing consistent on short screens and narrow widths
function syncViewportUnit() {
    const root = document.documentElement;
    const body = document.body;
    if (!root || !body) return;

    root.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    root.style.setProperty('--vw', `${window.innerWidth * 0.01}px`);

    const isShortViewport = window.innerHeight < 880 && window.innerWidth >= 768;
    const isCompactWidth = window.innerWidth < 1200 && window.innerWidth >= 768;

    body.classList.toggle('vh-short', isShortViewport);
    body.classList.toggle('vw-compact', isCompactWidth);
}

document.addEventListener('DOMContentLoaded', () => {
    syncViewportUnit();
    window.addEventListener('resize', syncViewportUnit);
    window.addEventListener('orientationchange', syncViewportUnit);

    initBootLoader();

    const text = "Christian";
    const typingElement = document.getElementById('typewriter');
    let index = 0;

    function type() {
        if (index < text.length) {
            typingElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 150); // Adjust typing speed here (milliseconds)
        }
    }

    // Start typing after a small delay
    setTimeout(type, 500);

    // Number Counter Animation
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                
                // Lower inc to slow and higher to slow
                const inc = target / speed;

                if (count < target) {
                    // Add inc to count and output in counter
                    counter.innerText = Math.ceil(count + inc);
                    // Call function every ms
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    // Intersection Observer to trigger animation when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target); // Only run once
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.space-y-6'); // Target the container of stats
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Education Section Scroll Animation (compact scaling instead of disabling)
    const educationSection = document.getElementById('education');
    const educationCards = document.querySelectorAll('.education-card');
    let educationScrollAttached = false;
    let educationMultiplier = 1;

    const onEducationScroll = () => {
        const sectionRect = educationSection.getBoundingClientRect();
        const sectionHeight = educationSection.offsetHeight;
        const windowHeight = window.innerHeight;

        const endOffset = sectionHeight - windowHeight;
        let scrollDistance = -sectionRect.top;
        let progress = scrollDistance / (endOffset * 0.8);
        progress = Math.max(0, Math.min(1, progress));

        educationCards.forEach(card => {
            const x = card.getAttribute('data-x');
            const y = card.getAttribute('data-y');
            const r = card.getAttribute('data-r');

            card.style.opacity = Math.min(1, progress * 2);
            card.style.transform = `
                translate(calc(${x} * ${progress * educationMultiplier}), calc(${y} * ${progress * educationMultiplier}))
                rotate(calc(${r}deg * ${progress * educationMultiplier}))
                scale(${0.5 + (0.5 * progress)})
            `;
        });
    };

    const attachEducationScroll = () => {
        if (educationScrollAttached) return;
        window.addEventListener('scroll', onEducationScroll);
        window.addEventListener('resize', onEducationScroll);
        educationScrollAttached = true;
        onEducationScroll();
    };

    const updateEducationMode = () => {
        const compact = window.innerWidth <= 1024 || window.innerHeight <= 700;
        educationMultiplier = compact ? 0.55 : 1;
        if (!educationScrollAttached) attachEducationScroll();
        onEducationScroll();
    };

    if (educationSection && educationCards.length > 0) {
        updateEducationMode();
        window.addEventListener('resize', updateEducationMode);
        window.addEventListener('orientationchange', updateEducationMode);
    }

    // Timeline Animation
    const timelineContainer = document.getElementById('timeline-container');
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineProgress = document.getElementById('timeline-progress');

    if (timelineContainer && timelineItems.length > 0) {
        // Intersection Observer for Fade In
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('opacity-0', 'translate-y-10');
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2, rootMargin: "0px 0px -100px 0px" });

        timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });

        // Scroll Progress Bar
        window.addEventListener('scroll', () => {
            const containerRect = timelineContainer.getBoundingClientRect();
            const containerTop = containerRect.top;
            const containerHeight = containerRect.height;
            const windowHeight = window.innerHeight;

            // Calculate progress based on how much of the container has been scrolled past the center of the viewport
            // Start when container top hits center of viewport
            const startPoint = windowHeight / 2;
            
            // Calculate distance from top of container to the "active" point (center of screen)
            let scrollPos = startPoint - containerTop;
            
            // Clamp between 0 and container height
            let progressHeight = Math.max(0, Math.min(containerHeight, scrollPos));
            
            // Update height
            if (timelineProgress) {
                timelineProgress.style.height = `${progressHeight}px`;
            }
        });
    }

    // Skills Sticky Scrollytelling
    const skillsScrolly = document.getElementById('skills-scrolly');
    const steps = document.querySelectorAll('.step-content, [data-step="intro"]');
    const visuals = {
        intro: document.getElementById('visual-intro'),
        frontend: document.getElementById('visual-frontend'),
        programming: document.getElementById('visual-programming'),
        uiux: document.getElementById('visual-uiux'),
        creative: document.getElementById('visual-creative')
    };

    // Store original code content for typing animation
    const codeContent = {
        frontend: document.getElementById('code-frontend-content') ? document.getElementById('code-frontend-content').innerHTML : '',
        programming: document.getElementById('code-programming-content') ? document.getElementById('code-programming-content').innerHTML : ''
    };

    // Progress Bar Animation
    const progressBars = document.querySelectorAll('.skill-progress');
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-width');
                bar.style.width = width;
                progressObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => progressObserver.observe(bar));

    if (skillsScrolly && steps.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-40% 0px -40% 0px', // Trigger when element is in the middle 20% of screen
            threshold: 0
        };

        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stepId = entry.target.getAttribute('data-step');
                    
                    // Hide all visuals
                    Object.values(visuals).forEach(el => {
                        if (el) {
                            el.style.opacity = '0';
                            el.style.transform = 'translateY(20px) scale(0.95)';
                            el.style.pointerEvents = 'none';
                            
                            // Reset animations when hidden
                            if (el.id === 'visual-creative') {
                                const playhead = document.getElementById('creative-playhead');
                                if (playhead) playhead.style.left = '0%';
                            }
                            if (el.id === 'visual-uiux') {
                                const cursor = document.getElementById('uiux-cursor');
                                if (cursor) {
                                    cursor.style.transform = 'translate(0, 0)';
                                    cursor.style.opacity = '0';
                                }
                                // Reset elements
                                for(let i=1; i<=5; i++) {
                                    const item = document.getElementById(`uiux-el-${i}`);
                                    if(item) {
                                        item.style.opacity = '0';
                                        item.style.transform = 'scale(0.8)';
                                    }
                                }
                            }
                        }
                    });

                    // Show active visual
                    const activeVisual = visuals[stepId];
                    if (activeVisual) {
                        activeVisual.style.opacity = '1';
                        activeVisual.style.transform = 'translateY(0) scale(1)';
                        activeVisual.style.pointerEvents = 'auto';

                        // Trigger Animations
                        if (stepId === 'frontend' || stepId === 'programming') {
                            const contentId = stepId === 'frontend' ? 'code-frontend-content' : 'code-programming-content';
                            const container = document.getElementById(contentId);
                            if (container) {
                                // Reset opacity for lines
                                Array.from(container.children).forEach(child => {
                                    child.style.opacity = '0';
                                    child.style.transform = 'translateX(-10px)';
                                    child.style.transition = 'none';
                                });
                                
                                // Animate lines one by one
                                Array.from(container.children).forEach((child, index) => {
                                    setTimeout(() => {
                                        child.style.transition = 'all 0.3s ease';
                                        child.style.opacity = '1';
                                        child.style.transform = 'translateX(0)';
                                    }, 100 + (index * 100)); // 100ms delay per line
                                });
                            }
                        }

                        if (stepId === 'uiux') {
                            const cursor = document.getElementById('uiux-cursor');
                            if (cursor) {
                                setTimeout(() => {
                                    cursor.style.opacity = '1';
                                    cursor.style.transform = 'translate(-50px, -50px)';
                                }, 500);
                            }
                            // Animate elements sequentially
                            for(let i=1; i<=5; i++) {
                                const item = document.getElementById(`uiux-el-${i}`);
                                if(item) {
                                    setTimeout(() => {
                                        item.style.opacity = '1';
                                        item.style.transform = 'scale(1)';
                                    }, 800 + (i * 200));
                                }
                            }
                        }

                        if (stepId === 'creative') {
                            const playhead = document.getElementById('creative-playhead');
                            if (playhead) {
                                setTimeout(() => {
                                    playhead.style.left = '95%'; // Stop at 95% to stay visible
                                }, 500);
                            }
                        }
                    }
                }
            });
        }, observerOptions);

        steps.forEach(step => stepObserver.observe(step));
    }

    // Mobile Visual Animations
    const mobileVisuals = document.querySelectorAll('.mobile-visual-animate');
    if (mobileVisuals.length > 0) {
        const mobileObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const id = element.id;

                    // Frontend & Programming Typing Animation
                    if (id === 'code-frontend-content-mobile' || id === 'code-programming-content-mobile') {
                        // Reset opacity for lines
                        Array.from(element.children).forEach(child => {
                            child.style.opacity = '0';
                            child.style.transform = 'translateX(-10px)';
                            child.style.transition = 'none';
                        });
                        
                        // Animate lines one by one
                        Array.from(element.children).forEach((child, index) => {
                            setTimeout(() => {
                                child.style.transition = 'all 0.3s ease';
                                child.style.opacity = '1';
                                child.style.transform = 'translateX(0)';
                            }, 100 + (index * 100));
                        });
                    }

                    // UI/UX Animation
                    if (element.closest('#visual-uiux-mobile') || element.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector('#uiux-cursor-mobile')) {
                         // This is tricky to target generically, let's target specific IDs inside
                    }
                    
                    // Since we are observing the container, let's trigger children animations
                    if (element.querySelector('#uiux-cursor-mobile')) {
                        const cursor = element.querySelector('#uiux-cursor-mobile');
                        setTimeout(() => {
                            cursor.style.opacity = '1';
                            cursor.style.transform = 'translate(-50px, -50px)';
                        }, 500);

                        for(let i=1; i<=5; i++) {
                            const item = document.getElementById(`uiux-el-${i}-mobile`);
                            if(item) {
                                setTimeout(() => {
                                    item.style.opacity = '1';
                                    item.style.transform = 'scale(1)';
                                }, 800 + (i * 200));
                            }
                        }
                    }

                    // Creative Animation
                    if (element.querySelector('#creative-playhead-mobile')) {
                        const playhead = element.querySelector('#creative-playhead-mobile');
                        setTimeout(() => {
                            playhead.style.left = '95%';
                        }, 500);
                    }

                    mobileObserver.unobserve(element);
                }
            });
        }, { threshold: 0.5 });

        mobileVisuals.forEach(visual => mobileObserver.observe(visual));
    }
});

// Horizontal Scroll Project Section
function initHorizontalScroll() {
    const section = document.getElementById('horizontal-scroll-section');
    const track = document.getElementById('horizontal-scroll-track');
    const dots = document.querySelectorAll('#scroll-progress-dots div');

    if (!section || !track) return;

    function onScroll() {
        const sectionRect = section.getBoundingClientRect();
        const sectionTop = sectionRect.top;
        const sectionHeight = sectionRect.height;
        const windowHeight = window.innerHeight;

        // Calculate progress
        const scrollDistance = sectionHeight - windowHeight;
        let scrollTop = -sectionTop;
        
        if (scrollTop < 0) scrollTop = 0;
        if (scrollTop > scrollDistance) scrollTop = scrollDistance;
        
        const progress = scrollTop / scrollDistance;
        
        // Calculate translation
        const trackWidth = track.scrollWidth;
        const windowWidth = window.innerWidth;
        
        if (trackWidth <= windowWidth) return;
        
        const maxTranslate = trackWidth - windowWidth + (windowWidth * 0.1); // +10% padding
        const translateX = maxTranslate * progress;
        
        track.style.transform = `translateX(-${translateX}px)`;

        // Update Dots
        if (dots.length > 0) {
            const totalCards = dots.length;
            // Map progress (0-1) to index (0-4)
            // We want the index to change as we scroll past each "section" of the scroll
            const activeIndex = Math.min(totalCards - 1, Math.floor(progress * totalCards));
            
            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.classList.remove('bg-white/20', 'w-2', 'h-2');
                    dot.classList.add('bg-white', 'w-8', 'h-2', 'rounded-full'); // Active state: wider pill
                } else {
                    dot.classList.add('bg-white/20', 'w-2', 'h-2');
                    dot.classList.remove('bg-white', 'w-8', 'rounded-full');
                    dot.classList.add('rounded-full'); // Ensure rounded-full is always there
                }
            });
        }
    }

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);
    // Initial call
    onScroll();
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initHorizontalScroll();
        initBlogScroll();
        loadBlogPost();
    });
} else {
    initHorizontalScroll();
    initBlogScroll();
    loadBlogPost();
}

// Blog Data
const blogPosts = [
    {
        id: 1,
        category: "DESIGN PHILOSOPHY",
        title: "The Art of Minimalist Web Design: Less is More",
        subtitle: "How Simplicity Enhances User Experience",
        content: `
            <p>Minimalist web design isn’t just a trend—it’s a philosophy. In today’s fast-paced digital world, users appreciate clarity, speed, and elegance. By focusing on essential elements, minimizing clutter, and emphasizing whitespace, designers can guide visitors effortlessly through a website’s content.</p>
            <p>From my experience, a minimalist approach isn’t about removing features—it’s about prioritizing what truly matters. Every button, color, and font choice should serve a purpose. A clean interface not only improves navigation but also builds trust and professionalism.</p>
            <p>As a developer and designer, I combine aesthetic simplicity with functional efficiency, ensuring websites aren’t just beautiful but intuitive. The result? Visitors stay longer, engage more, and your message shines.</p>
        `,
        image: "Asset/Projects/1..jpeg" // Placeholder or specific blog image
    },
    {
        id: 2,
        category: "DEVELOPMENT PROCESS",
        title: "Bridging Creativity and Code: How I Build Interactive Websites",
        subtitle: "From Concept to Clickable Reality",
        content: `
            <p>A great website isn’t just about looks—it’s about interactivity and responsiveness. Users expect smooth transitions, engaging animations, and seamless navigation. As a web developer, I love transforming creative ideas into functional, interactive experiences.</p>
            <p>Using tools like HTML, CSS, JavaScript, and modern frameworks, I create websites that are not only visually appealing but also responsive across all devices. For me, design and development go hand in hand: design inspires code, and code brings design to life.</p>
            <p>Whether it’s a portfolio site, a business landing page, or an e-commerce platform, my goal is to craft a digital space where users feel connected, engaged, and delighted.</p>
        `,
        image: "Asset/Projects/2.jpeg"
    },
    {
        id: 3,
        category: "INDUSTRY INSIGHTS",
        title: "Future-Proofing Your Website: Why Modern Web Development Matters",
        subtitle: "Building Websites That Stand the Test of Time",
        content: `
            <p>The web is constantly evolving, and so are user expectations. A website built today needs to adapt to tomorrow’s trends—from faster load times and mobile-first layouts to accessibility and SEO-friendly structures.</p>
            <p>I focus on creating websites with scalable code, responsive design, and modular components. This approach ensures updates are easier, performance remains high, and the site stays relevant as technologies change.</p>
            <p>Future-proofing is not just technical—it’s also about user experience and visual consistency. By combining smart development practices with thoughtful design, I help businesses and individuals create a lasting digital presence that grows with their goals.</p>
        `,
        image: "Asset/Projects/3.jpeg"
    }
];

// Load Blog Post Logic
function loadBlogPost() {
    const blogContent = document.getElementById('blog-content');
    if (!blogContent) return; // Not on blog post page

    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    
    const post = blogPosts.find(p => p.id === id);

    if (post) {
        document.getElementById('blog-category').innerText = post.category;
        document.getElementById('blog-title').innerText = post.title;
        document.getElementById('blog-subtitle').innerText = post.subtitle;
        document.getElementById('blog-body').innerHTML = post.content;
        
        // Calculate Read Time
        const text = post.content.replace(/<[^>]*>/g, '');
        const wordCount = text.split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 200); // 200 words per minute
        const readTimeElement = document.getElementById('read-time');
        if(readTimeElement) readTimeElement.innerText = `${readTime} min read`;

        // Fade in animation
        setTimeout(() => {
            blogContent.classList.remove('opacity-0', 'translate-y-10');
        }, 100);
    } else {
        document.getElementById('blog-title').innerText = "Article Not Found";
        document.getElementById('blog-subtitle').innerText = "The article you are looking for does not exist.";
        blogContent.classList.remove('opacity-0', 'translate-y-10');
    }
}

// Horizontal Scroll Blog Section
function initBlogScroll() {
    const section = document.getElementById('blog-scroll-section');
    const track = document.getElementById('blog-scroll-track');
    const dots = document.querySelectorAll('#blog-progress-dots div');

    if (!section || !track) return;

    function onScroll() {
        const sectionRect = section.getBoundingClientRect();
        const sectionTop = sectionRect.top;
        const sectionHeight = sectionRect.height;
        const windowHeight = window.innerHeight;

        // Calculate progress
        const scrollDistance = sectionHeight - windowHeight;
        let scrollTop = -sectionTop;
        
        if (scrollTop < 0) scrollTop = 0;
        if (scrollTop > scrollDistance) scrollTop = scrollDistance;
        
        const progress = scrollTop / scrollDistance;
        
        // Calculate translation
        const trackWidth = track.scrollWidth;
        const windowWidth = window.innerWidth;
        
        if (trackWidth <= windowWidth) return;
        
        const maxTranslate = trackWidth - windowWidth + (windowWidth * 0.1); // +10% padding
        const translateX = maxTranslate * progress;
        
        track.style.transform = `translateX(-${translateX}px)`;

        // Update Dots
        if (dots.length > 0) {
            const totalCards = dots.length;
            const activeIndex = Math.min(totalCards - 1, Math.floor(progress * totalCards));
            
            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.classList.remove('bg-white/20', 'w-2', 'h-2');
                    dot.classList.add('bg-white', 'w-8', 'h-2', 'rounded-full');
                } else {
                    dot.classList.add('bg-white/20', 'w-2', 'h-2');
                    dot.classList.remove('bg-white', 'w-8', 'rounded-full');
                    dot.classList.add('rounded-full');
                }
            });
        }
    }

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);
    onScroll();
}

document.addEventListener('DOMContentLoaded', () => {
    // Navbar active state (desktop & mobile)
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = Array.from(document.querySelectorAll('section[id], main#home'));

    const footer = document.getElementById('contact');

    const setActiveLink = (id) => {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
                link.classList.add('nav-active');
            } else {
                link.classList.remove('nav-active');
            }
        });
    };

    if (navLinks.length && sections.length) {
        // Default to home on load
        setActiveLink('home');

        // Update on click immediately
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const href = link.getAttribute('href') || '';
                if (href.startsWith('#')) setActiveLink(href.slice(1));
            });
        });

        // Scroll-based highlighting (fallback and sticky-friendly)
        const updateActiveOnScroll = () => {
            const viewportTrigger = window.innerHeight * 0.28;
            let current = 'home';

            // If footer is in view, clear highlights
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                if (footerRect.top <= viewportTrigger && footerRect.bottom >= 0) {
                    setActiveLink('');
                    return;
                }
            }

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= viewportTrigger && rect.bottom >= viewportTrigger) {
                    current = section.id;
                }
            });

            // Group philosophy/education under About for nav highlighting
            const aboutGroup = ['about', 'philosophy', 'education', 'education-timeline'];
            const idForNav = aboutGroup.includes(current) ? 'about' : current;

            setActiveLink(idForNav);
        };

        window.addEventListener('scroll', updateActiveOnScroll);
        window.addEventListener('resize', updateActiveOnScroll);
        updateActiveOnScroll();
    }

    // Cookie Consent
    initCookieConsent();

    // Hide ConvAI widget on key sections
    initConvaiVisibility();

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        body.classList.remove('bg-brand-dark', 'text-white');
        if (themeToggle) themeToggle.checked = true;
        if (themeToggleMobile) themeToggleMobile.checked = true;
    } else {
        body.classList.remove('light-mode');
    }

    // Function to handle theme change
    const handleThemeChange = (isLight) => {
        if (isLight) {
            // Light Mode
            body.classList.add('light-mode');
            body.classList.remove('bg-brand-dark', 'text-white');
            localStorage.setItem('theme', 'light');
        } else {
            // Dark Mode
            body.classList.remove('light-mode');
            body.classList.add('bg-brand-dark', 'text-white');
            localStorage.setItem('theme', 'dark');
        }
        // Sync both toggles
        if (themeToggle) themeToggle.checked = isLight;
        if (themeToggleMobile) themeToggleMobile.checked = isLight;
    };

    // Desktop theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            handleThemeChange(themeToggle.checked);
        });
    }

    // Mobile theme toggle
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('change', () => {
            handleThemeChange(themeToggleMobile.checked);
        });
    }

    // Simple, elegant scroll reveal for key sections (excluding Skills and Education)
    initSimpleScrollReveal();
});

function initSimpleScrollReveal() {
    const revealSelector = [
        '#about .grid > div',
        '#experience .grid > div',
        '#philosophy .grid > div',
        '#horizontal-scroll-track > div',
        '#blog-scroll-track > div',
        '#playground .relative.group.rounded-3xl',
        '#contact-letter .relative.group.rounded-3xl',
        'footer#contact .text-center.mb-24',
        'footer#contact .grid',
        'footer#contact .h-px',
        'footer#contact .flex.flex-col.sm\\:flex-row'
    ].join(',');

    const targets = Array.from(document.querySelectorAll(revealSelector)).filter((el) => {
        return !el.closest('#skills-scrolly, #education, #education-timeline');
    });

    if (!targets.length) return;

    const sectionCounts = new Map();
    targets.forEach((el) => {
        const bucket = el.closest('section, footer') || el.parentElement;
        const count = sectionCounts.get(bucket) || 0;
        el.classList.add('scroll-reveal-elegant');
        el.style.setProperty('--reveal-delay', `${Math.min(count * 70, 280)}ms`);
        sectionCounts.set(bucket, count + 1);
    });

    if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -10% 0px'
    });

    targets.forEach((el) => revealObserver.observe(el));
}

function initCookieConsent() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    const acceptBtn = banner.querySelector('[data-cookie-accept]');
    const declineBtn = banner.querySelector('[data-cookie-decline]');
    const storageKey = 'cookieConsent';

    const closeBanner = (decision) => {
        localStorage.setItem(storageKey, decision);
        banner.classList.add('hide');
        setTimeout(() => banner.remove(), 400);
    };

    const stored = localStorage.getItem(storageKey);
    if (!stored) {
        requestAnimationFrame(() => banner.classList.add('show'));
    }

    acceptBtn?.addEventListener('click', () => closeBanner('accepted'));
    declineBtn?.addEventListener('click', () => closeBanner('declined'));
}

function initConvaiVisibility() {
    const widget = document.getElementById('convai-widget');
    if (!widget || !('IntersectionObserver' in window)) return;

    const targets = [
        document.getElementById('home'),
        document.getElementById('tech-carousel'),
        document.querySelector('footer')
    ].filter(Boolean);

    if (!targets.length) return;

    const visible = new Set();
    const update = () => widget.classList.toggle('convai-hidden', visible.size > 0);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visible.add(entry.target);
            } else {
                visible.delete(entry.target);
            }
        });
        update();
    }, { threshold: 0.2 });

    targets.forEach(el => observer.observe(el));
    update();
}

