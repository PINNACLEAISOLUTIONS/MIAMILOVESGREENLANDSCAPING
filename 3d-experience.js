/**
 * Miami Loves Green - 3D Experience
 */

class Footer3DExperience {
    constructor() {
        this.container = document.querySelector('.footer-visual');
        if (!this.container) return;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'footer-3d-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';
        this.container.style.position = 'relative';
        this.container.prepend(this.canvas);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.offsetWidth / this.container.offsetHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const geometry = new THREE.BufferGeometry();
        const count = 1200;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const colorPalette = [
            new THREE.Color('#4CAF50'),
            new THREE.Color('#FFA726'),
            new THREE.Color('#ffffff'),
            new THREE.Color('#8BC34A')
        ];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
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
        if (!this.container) return;
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.03;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.03;

        this.points.rotation.y += 0.001;
        this.points.rotation.x += 0.0005;

        const time = Date.now() * 0.0005;
        this.points.position.x = Math.sin(time * 0.3) * 0.1 + (this.mouse.x * 0.1);
        this.points.position.y = Math.cos(time * 0.3) * 0.1 + (this.mouse.y * 0.1);

        this.renderer.render(this.scene, this.camera);
    }
}

/**
 * Service 3D Viewer Application
 */
class Service3DViewer {
    constructor() {
        this.modal = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.mesh = null;
        this.animationId = null;
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };

        this.initEventListeners();
    }

    initEventListeners() {
        document.querySelectorAll('.view-3d-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceCard = e.currentTarget.closest('.service-card');
                const imageArea = serviceCard.querySelector('.service-image-area');
                const title = serviceCard.querySelector('h3').innerText;
                const imageUrl = imageArea.style.backgroundImage.slice(5, -2);
                this.openModal(title, imageUrl);
            });
        });
    }

    createModalStructure() {
        const modal = document.createElement('div');
        modal.id = 'service-3d-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
            z-index: 100000; display: flex; flex-direction: column;
            justify-content: center; align-items: center; opacity: 0;
            transition: opacity 0.5s ease;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            position: absolute; top: 30px; left: 0; width: 100%;
            text-align: center; color: white;
        `;
        header.innerHTML = `
            <h2 id="modal-title" style="font-family: 'Playfair Display', serif; font-size: 2.5rem; color: #8BC34A; margin-bottom: 5px;"></h2>
            <p style="font-family: 'Outfit', sans-serif; color: #ccc;">Interactive 3D Snapshot - Drag to Rotate</p>
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute; top: 30px; right: 40px; background: none;
            border: none; color: white; font-size: 3rem; cursor: pointer;
            line-height: 1; z-index: 100001;
        `;
        closeBtn.addEventListener('click', () => this.closeModal());

        const canvasContainer = document.createElement('div');
        canvasContainer.id = 'modal-3d-canvas-container';
        canvasContainer.style.cssText = 'width: 80%; height: 60%; cursor: grab;';

        modal.appendChild(header);
        modal.appendChild(closeBtn);
        modal.appendChild(canvasContainer);
        document.body.appendChild(modal);

        this.modal = modal;

        // Interaction events
        canvasContainer.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseup', () => this.onMouseUp());

        // Touch events
        canvasContainer.addEventListener('touchstart', (e) => this.onMouseDown(e.touches[0]));
        window.addEventListener('touchmove', (e) => this.onMouseMove(e.touches[0]));
        window.addEventListener('touchend', () => this.onMouseUp());
    }

    openModal(title, imageUrl) {
        if (!this.modal) this.createModalStructure();

        document.getElementById('modal-title').innerText = title;
        this.modal.style.display = 'flex';
        setTimeout(() => this.modal.style.opacity = '1', 10);
        document.body.style.overflow = 'hidden';

        this.setupThreeJS(imageUrl);
    }

    setupThreeJS(imageUrl) {
        const container = document.getElementById('modal-3d-canvas-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        this.camera.position.z = 8;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);

        const texture = new THREE.TextureLoader().load(imageUrl);
        const geometry = new THREE.BoxGeometry(4, 2.5, 0.5);

        // Multi-material to put image on front and back
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0x123012 }), // right
            new THREE.MeshBasicMaterial({ color: 0x123012 }), // left
            new THREE.MeshBasicMaterial({ color: 0x123012 }), // top
            new THREE.MeshBasicMaterial({ color: 0x123012 }), // bottom
            new THREE.MeshBasicMaterial({ map: texture }),    // front
            new THREE.MeshBasicMaterial({ color: 0x123012 })  // back
        ];

        this.mesh = new THREE.Mesh(geometry, materials);
        this.scene.add(this.mesh);

        // Add glow
        const glowGeo = new THREE.BoxGeometry(4.2, 2.7, 0.4);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x4CAF50,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        this.mesh.add(glow);

        this.animate();
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    onMouseMove(e) {
        if (!this.isDragging || !this.mesh) return;

        const deltaMove = {
            x: e.clientX - this.previousMousePosition.x,
            y: e.clientY - this.previousMousePosition.y
        };

        this.mesh.rotation.y += deltaMove.x * 0.005;
        this.mesh.rotation.x += deltaMove.y * 0.005;

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    onMouseUp() {
        this.isDragging = false;
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.style.opacity = '0';
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (this.animationId) cancelAnimationFrame(this.animationId);
            const container = document.getElementById('modal-3d-canvas-container');
            if (container) container.innerHTML = '';
            this.renderer = null;
            this.scene = null;
            this.camera = null;
            this.mesh = null;
        }, 500);
    }

    animate() {
        if (!this.renderer) return;
        this.animationId = requestAnimationFrame(() => this.animate());

        if (!this.isDragging && this.mesh) {
            this.mesh.rotation.y += 0.005;
            this.mesh.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when ready
if (typeof THREE !== 'undefined') {
    new Footer3DExperience();
    new Service3DViewer();
} else {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
        new Footer3DExperience();
        new Service3DViewer();
    };
    document.head.appendChild(script);
}

