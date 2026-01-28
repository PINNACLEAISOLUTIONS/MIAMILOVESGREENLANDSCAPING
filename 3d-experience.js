/**
 * Miami Loves Green - 3D Experience
 * High-performance 3D background using Three.js
 */

class Hero3DExperience {
    constructor() {
        this.container = document.querySelector('.hero');
        if (!this.container) return;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'hero-3d-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none'; // Allow interactions with content above
        this.container.prepend(this.canvas);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Background particles / "Ethereal Pollen"
        const geometry = new THREE.BufferGeometry();
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const colorPalette = [
            new THREE.Color('#4CAF50'), // Primary Green
            new THREE.Color('#8BC34A'), // Light Green
            new THREE.Color('#FFA726'), // Accent Gold
            new THREE.Color('#ffffff'), // Sunlight
            new THREE.Color('#C8E6C9')  // Pale Leaf
        ];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 0.08 + 0.02;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.06,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);

        this.camera.position.z = 6;
        this.scrollY = 0;

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        });

        this.animate();
    }

    onMouseMove(e) {
        this.targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        this.targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;

        // Interactive tilt for hero text
        const heroText = document.querySelector('.hero-3d-text');
        if (heroText) {
            const tiltX = (e.clientY / window.innerHeight - 0.5) * 15;
            const tiltY = -(e.clientX / window.innerWidth - 0.5) * 15;
            heroText.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth mouse movement
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        // Animate particles based on mouse and scroll
        this.points.rotation.y += 0.0008;
        this.points.rotation.x += 0.0004;

        // Scroll feedback: drift faster as we scroll down
        const scrollOffset = this.scrollY * 0.001;
        this.points.position.y = -scrollOffset * 2;
        this.points.rotation.z = scrollOffset * 0.5;

        // Subtle float
        const time = Date.now() * 0.0005;
        this.points.position.x = Math.sin(time * 0.5) * 0.15 + (this.mouse.x * 0.3);
        this.points.position.z = Math.cos(time * 0.5) * 0.15;

        // Light shift
        this.points.material.opacity = 0.5 + Math.sin(time) * 0.2;

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when ready
if (typeof THREE !== 'undefined') {
    new Hero3DExperience();
} else {
    // Load Three.js dynamically if not present
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => new Hero3DExperience();
    document.head.appendChild(script);
}
