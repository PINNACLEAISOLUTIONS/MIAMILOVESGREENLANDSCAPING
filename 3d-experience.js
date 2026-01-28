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

        // Background particles / "Garden Dust"
        const geometry = new THREE.BufferGeometry();
        const count = 1500;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const colorPalette = [
            new THREE.Color('#4CAF50'), // Primary Green
            new THREE.Color('#8BC34A'), // Light Green
            new THREE.Color('#FFA726'), // Accent Gold
            new THREE.Color('#FFFFFF')  // White light
        ];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 0.05 + 0.01;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);

        this.camera.position.z = 5;

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.animate();
    }

    onMouseMove(e) {
        this.targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        this.targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
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

        // Animate particles
        this.points.rotation.y += 0.001;
        this.points.rotation.x += 0.0005;

        // Subtle wobble/float
        const time = Date.now() * 0.0005;
        this.points.position.x = Math.sin(time) * 0.1 + (this.mouse.x * 0.2);
        this.points.position.y = Math.cos(time) * 0.1 + (this.mouse.y * 0.2);

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
