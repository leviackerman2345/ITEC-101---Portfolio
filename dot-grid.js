class DotGrid {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.options = {
            dotSize: 2,
            gap: 20,
            baseColor: '#172554', // Darker blue
            activeColor: '#7DD3FC', // highlight-1
            proximity: 150,
            speedTrigger: 100,
            shockRadius: 250,
            shockStrength: 5,
            maxSpeed: 5000,
            resistance: 750,
            returnDuration: 1.5,
            ...options
        };

        this.dots = [];
        this.pointer = { x: 0, y: 0, vx: 0, vy: 0, speed: 0, lastTime: 0, lastX: 0, lastY: 0 };
        this.rafId = null;

        this.init();
    }

    hexToRgb(hex) {
        const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (!m) return { r: 0, g: 0, b: 0 };
        return {
            r: parseInt(m[1], 16),
            g: parseInt(m[2], 16),
            b: parseInt(m[3], 16)
        };
    }

    init() {
        this.baseRgb = this.hexToRgb(this.options.baseColor);
        this.activeRgb = this.hexToRgb(this.options.activeColor);
        
        this.buildGrid();
        
        window.addEventListener('resize', () => this.buildGrid());
        window.addEventListener('mousemove', (e) => this.onMove(e), { passive: true });
        window.addEventListener('click', (e) => this.onClick(e));
        
        this.animate();
    }

    buildGrid() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        
        this.ctx.scale(dpr, dpr);

        const { dotSize, gap } = this.options;
        const cols = Math.floor((rect.width + gap) / (dotSize + gap));
        const rows = Math.floor((rect.height + gap) / (dotSize + gap));
        const cell = dotSize + gap;

        const gridW = cell * cols - gap;
        const gridH = cell * rows - gap;
        
        const startX = (rect.width - gridW) / 2 + dotSize / 2;
        const startY = (rect.height - gridH) / 2 + dotSize / 2;

        this.dots = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.dots.push({
                    cx: startX + x * cell,
                    cy: startY + y * cell,
                    xOffset: 0,
                    yOffset: 0,
                    _inertiaApplied: false
                });
            }
        }
    }

    onMove(e) {
        const now = performance.now();
        const dt = this.pointer.lastTime ? now - this.pointer.lastTime : 16;
        
        const dx = e.clientX - this.pointer.lastX;
        const dy = e.clientY - this.pointer.lastY;
        
        let vx = (dx / dt) * 1000;
        let vy = (dy / dt) * 1000;
        let speed = Math.hypot(vx, vy);
        
        if (speed > this.options.maxSpeed) {
            const scale = this.options.maxSpeed / speed;
            vx *= scale;
            vy *= scale;
            speed = this.options.maxSpeed;
        }

        this.pointer.lastTime = now;
        this.pointer.lastX = e.clientX;
        this.pointer.lastY = e.clientY;
        this.pointer.vx = vx;
        this.pointer.vy = vy;
        this.pointer.speed = speed;

        const rect = this.canvas.getBoundingClientRect();
        this.pointer.x = e.clientX - rect.left;
        this.pointer.y = e.clientY - rect.top;

        this.dots.forEach(dot => {
            const dist = Math.hypot(dot.cx - this.pointer.x, dot.cy - this.pointer.y);
            
            if (speed > this.options.speedTrigger && dist < this.options.proximity && !dot._inertiaApplied) {
                dot._inertiaApplied = true;
                gsap.killTweensOf(dot);
                
                const pushX = dot.cx - this.pointer.x + vx * 0.005;
                const pushY = dot.cy - this.pointer.y + vy * 0.005;
                
                // Simulate inertia throw
                gsap.to(dot, {
                    xOffset: pushX,
                    yOffset: pushY,
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => {
                        gsap.to(dot, {
                            xOffset: 0,
                            yOffset: 0,
                            duration: this.options.returnDuration,
                            ease: "elastic.out(1, 0.75)",
                            onComplete: () => {
                                dot._inertiaApplied = false;
                            }
                        });
                    }
                });
            }
        });
    }

    onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        this.dots.forEach(dot => {
            const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
            if (dist < this.options.shockRadius && !dot._inertiaApplied) {
                dot._inertiaApplied = true;
                gsap.killTweensOf(dot);
                
                const falloff = Math.max(0, 1 - dist / this.options.shockRadius);
                const pushX = (dot.cx - cx) * this.options.shockStrength * falloff;
                const pushY = (dot.cy - cy) * this.options.shockStrength * falloff;

                gsap.to(dot, {
                    xOffset: pushX,
                    yOffset: pushY,
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => {
                        gsap.to(dot, {
                            xOffset: 0,
                            yOffset: 0,
                            duration: this.options.returnDuration,
                            ease: "elastic.out(1, 0.75)",
                            onComplete: () => {
                                dot._inertiaApplied = false;
                            }
                        });
                    }
                });
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const proxSq = this.options.proximity * this.options.proximity;

        this.dots.forEach(dot => {
            const ox = dot.cx + dot.xOffset;
            const oy = dot.cy + dot.yOffset;
            
            const dx = dot.cx - this.pointer.x;
            const dy = dot.cy - this.pointer.y;
            const dsq = dx * dx + dy * dy;

            let r = this.baseRgb.r;
            let g = this.baseRgb.g;
            let b = this.baseRgb.b;

            if (dsq <= proxSq) {
                const dist = Math.sqrt(dsq);
                const t = 1 - dist / this.options.proximity;
                r = Math.round(this.baseRgb.r + (this.activeRgb.r - this.baseRgb.r) * t);
                g = Math.round(this.baseRgb.g + (this.activeRgb.g - this.baseRgb.g) * t);
                b = Math.round(this.baseRgb.b + (this.activeRgb.b - this.baseRgb.b) * t);
            }

            this.ctx.fillStyle = `rgb(${r},${g},${b})`;
            this.ctx.beginPath();
            this.ctx.arc(ox, oy, this.options.dotSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.rafId = requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const educationSection = document.getElementById('education-bg');
    if (educationSection) {
        new DotGrid('education-bg', {
            dotSize: 2,
            gap: 20,
            baseColor: '#172554', // Darker blue
            activeColor: '#7DD3FC' // highlight-1
        });
    }
});
