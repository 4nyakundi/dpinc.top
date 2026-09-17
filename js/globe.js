/**
 * DATA PORT - Interactive 3D Holographic Globe
 * Powered by Three.js & D3 Geo projection
 * Features: Land dot cloud, graticule lines, glowing atmosphere,
 * pulsating Mombasa HQ beacon, international data arcs, mouse drag & scroll parallax.
 */

class DataPortGlobe {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.options = Object.assign({
      speed: 1.5,
      dotSize: 0.015,
      dotDensity: 7,
      scale: 1.2,
      baseRadius: 1.8,
      markers: [
        { lat: -4.0435, lng: 39.6682, label: "Mombasa HQ", isHQ: true }, // Mombasa
        { lat: -1.2921, lng: 36.8219, label: "Nairobi Hub" },
        { lat: 25.2048, lng: 55.2708, label: "Dubai Data Center" },
        { lat: 51.5074, lng: -0.1278, label: "London Gateway" },
        { lat: 1.3521, lng: 103.8198, label: "Singapore Exchange" },
        { lat: 40.7128, lng: -74.0060, label: "New York Server" }
      ]
    }, options);

    this.init();
  }

  init() {
    // Scene & Camera
    this.scene = new THREE.Scene();
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 5.2);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Master Globe Group
    this.globeGroup = new THREE.Group();
    // Default angle facing Africa / Indian Ocean
    this.globeGroup.rotation.y = 1.2;
    this.globeGroup.rotation.x = 0.25;
    this.scene.add(this.globeGroup);

    this.targetRotationY = 1.2;
    this.targetRotationX = 0.25;
    this.currentRotationY = 1.2;
    this.currentRotationX = 0.25;
    this.velocityY = 0;
    this.velocityX = 0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Build layers
    this.createAtmosphereGlow();
    this.createGraticules();
    this.createInnerOcean();
    this.createLandDots();
    this.createMarkersAndArcs();

    // Bind Interaction Events
    this.bindEvents();
    this.animate();
  }

  getThemeColors() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    return {
      dotColor: isLight ? 0x72aa00 : 0x8ace00,
      dotColorSecondary: isLight ? 0x9333ea : 0xa855f7,
      glowColor: isLight ? 0x72aa00 : 0x8ace00,
      gridColor: isLight ? 0xcbd5e1 : 0x1e293b,
      oceanColor: isLight ? 0xf1f5f9 : 0x050508,
      oceanOpacity: isLight ? 0.3 : 0.7,
      hqColor: 0x8ace00,
      arcColor: isLight ? 0x9333ea : 0xa855f7
    };
  }

  createInnerOcean() {
    const radius = this.options.baseRadius;
    const colors = this.getThemeColors();
    const oceanGeo = new THREE.SphereGeometry(radius * 0.99, 64, 64);
    this.oceanMat = new THREE.MeshBasicMaterial({
      color: colors.oceanColor,
      transparent: true,
      opacity: colors.oceanOpacity
    });
    this.oceanMesh = new THREE.Mesh(oceanGeo, this.oceanMat);
    this.globeGroup.add(this.oceanMesh);
  }

  createAtmosphereGlow() {
    const radius = this.options.baseRadius;
    // Outer atmospheric ring
    const ringGeo = new THREE.RingGeometry(radius * 1.02, radius * 1.25, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x8ace00,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    this.atmosphereRing = new THREE.Mesh(ringGeo, ringMat);
    this.atmosphereRing.rotation.x = Math.PI / 2;
    this.globeGroup.add(this.atmosphereRing);
  }

  createGraticules() {
    const radius = this.options.baseRadius;
    this.graticuleGroup = new THREE.Group();
    const colors = this.getThemeColors();

    const lineMat = new THREE.LineBasicMaterial({
      color: colors.gridColor,
      transparent: true,
      opacity: 0.25
    });

    // Latitudes
    for (let lat = -60; lat <= 60; lat += 30) {
      const points = [];
      const latRad = (lat * Math.PI) / 180;
      const r = radius * Math.cos(latRad);
      const y = radius * Math.sin(latRad);
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      this.graticuleGroup.add(new THREE.Line(geo, lineMat));
    }

    // Longitudes
    for (let lng = 0; lng < 360; lng += 45) {
      const points = [];
      const lngRad = (lng * Math.PI) / 180;
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        const x = radius * Math.sin(theta) * Math.cos(lngRad);
        const y = radius * Math.cos(theta);
        const z = radius * Math.sin(theta) * Math.sin(lngRad);
        points.push(new THREE.Vector3(x, y, z));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      this.graticuleGroup.add(new THREE.Line(geo, lineMat));
    }

    this.globeGroup.add(this.graticuleGroup);
  }

  latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  async createLandDots() {
    const radius = this.options.baseRadius;
    const colors = this.getThemeColors();

    try {
      const res = await fetch("https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/50m/physical/ne_50m_land.json");
      if (!res.ok) throw new Error("Could not load land geojson");
      const geoData = await res.json();
      this.buildDotsFromGeoJson(geoData, radius, colors);
    } catch (err) {
      console.warn("Falling back to procedural algorithmic continent matrix", err);
      this.buildProceduralContinentMatrix(radius, colors);
    }
  }

  buildDotsFromGeoJson(geoData, radius, colors) {
    const bitmapW = 1024;
    const bitmapH = 512;
    const canvas = document.createElement("canvas");
    canvas.width = bitmapW;
    canvas.height = bitmapH;
    const ctx = canvas.getContext("2d");
    if (!ctx || !window.d3) {
      this.buildProceduralContinentMatrix(radius, colors);
      return;
    }

    const projection = d3.geoEquirectangular().fitSize([bitmapW, bitmapH], { type: "Sphere" });
    const path = d3.geoPath().projection(projection).context(ctx);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, bitmapW, bitmapH);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    geoData.features.forEach(f => path(f));
    ctx.fill();

    const imgData = ctx.getImageData(0, 0, bitmapW, bitmapH).data;
    const isLand = (lng, lat) => {
      const x = Math.round(((lng + 180) / 360) * bitmapW) % bitmapW;
      const y = Math.round(((90 - lat) / 180) * bitmapH);
      const idx = (Math.max(0, Math.min(bitmapH - 1, y)) * bitmapW + x) * 4;
      return imgData[idx] > 120;
    };

    const dotCoords = [];
    const step = 2.4;
    for (let lat = -85; lat <= 85; lat += step) {
      const cosLat = Math.cos((Math.abs(lat) * Math.PI) / 180);
      const lngStep = cosLat > 0.05 ? step / cosLat : 360;
      for (let lng = -180; lng < 180; lng += lngStep) {
        if (isLand(lng, lat)) {
          dotCoords.push({ lat, lng });
        }
      }
    }

    this.renderInstancedDotMesh(dotCoords, radius, colors);
  }

  buildProceduralContinentMatrix(radius, colors) {
    const dotCoords = [];
    // Major landmass centers
    const centers = [
      { lat: 0, lng: 25, r: 35 },     // Africa
      { lat: 50, lng: 15, r: 25 },    // Europe
      { lat: 35, lng: 90, r: 45 },    // Asia
      { lat: 40, lng: -100, r: 35 },  // North America
      { lat: -15, lng: -60, r: 30 },  // South America
      { lat: -25, lng: 135, r: 25 }   // Australia
    ];

    for (let lat = -80; lat <= 80; lat += 3) {
      for (let lng = -180; lng < 180; lng += 4) {
        let inside = false;
        for (const c of centers) {
          const d = Math.hypot(lat - c.lat, lng - c.lng);
          if (d < c.r + (Math.sin(lat * 0.2) * 5)) {
            inside = true;
            break;
          }
        }
        if (inside) dotCoords.push({ lat, lng });
      }
    }

    this.renderInstancedDotMesh(dotCoords, radius, colors);
  }

  renderInstancedDotMesh(coords, radius, colors) {
    const dotGeo = new THREE.SphereGeometry(this.options.dotSize, 5, 5);
    const dotMat = new THREE.MeshBasicMaterial({
      color: colors.dotColor,
      transparent: true,
      opacity: 0.95
    });

    const instancedMesh = new THREE.InstancedMesh(dotGeo, dotMat, coords.length);
    const dummy = new THREE.Object3D();

    coords.forEach((coord, i) => {
      const pos = this.latLngToVector3(coord.lat, coord.lng, radius);
      dummy.position.copy(pos);
      // Slight random scale for organic holographic vibe
      const s = 0.8 + Math.random() * 0.4;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    this.dotMesh = instancedMesh;
    this.globeGroup.add(instancedMesh);
  }

  createMarkersAndArcs() {
    const radius = this.options.baseRadius;
    const colors = this.getThemeColors();
    this.markerGroup = new THREE.Group();

    const hq = this.options.markers.find(m => m.isHQ) || this.options.markers[0];
    const hqPos = this.latLngToVector3(hq.lat, hq.lng, radius);

    // Mombasa HQ Pulsing Beacon
    const hqGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const hqMat = new THREE.MeshBasicMaterial({ color: colors.hqColor });
    const hqMesh = new THREE.Mesh(hqGeo, hqMat);
    hqMesh.position.copy(hqPos);
    this.markerGroup.add(hqMesh);

    // Pulsing Rings on HQ
    this.pulseRings = [];
    for (let r = 0; r < 2; r++) {
      const pGeo = new THREE.RingGeometry(0.05, 0.07, 32);
      const pMat = new THREE.MeshBasicMaterial({
        color: colors.hqColor,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(pGeo, pMat);
      ring.position.copy(hqPos);
      ring.lookAt(0, 0, 0);
      ring.userData = { phase: r * Math.PI };
      this.markerGroup.add(ring);
      this.pulseRings.push(ring);
    }

    // Other Markers & Data Arcs from Mombasa
    this.options.markers.forEach(marker => {
      if (marker.isHQ) return;
      const targetPos = this.latLngToVector3(marker.lat, marker.lng, radius);

      // Node Marker
      const mGeo = new THREE.SphereGeometry(0.025, 12, 12);
      const mMat = new THREE.MeshBasicMaterial({ color: colors.dotColorSecondary });
      const mMesh = new THREE.Mesh(mGeo, mMat);
      mMesh.position.copy(targetPos);
      this.markerGroup.add(mMesh);

      // Arched 3D connection curve
      this.createDataArc(hqPos, targetPos, radius, colors.arcColor);
    });

    this.globeGroup.add(this.markerGroup);
  }

  createDataArc(posA, posB, radius, color) {
    const distance = posA.distanceTo(posB);
    const mid = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
    const altitude = radius + (distance * 0.35);
    mid.normalize().multiplyScalar(altitude);

    const curve = new THREE.QuadraticBezierCurve3(posA, mid, posB);
    const points = curve.getPoints(40);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

    const curveMat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      linewidth: 2
    });

    const line = new THREE.Line(curveGeo, curveMat);
    this.markerGroup.add(line);
  }

  bindEvents() {
    const canvas = this.renderer.domElement;

    // Drag rotation
    canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;

      this.targetRotationY += dx * 0.005;
      this.targetRotationX += dy * 0.005;
      // Clamp vertical pitch
      this.targetRotationX = Math.max(-0.8, Math.min(0.8, this.targetRotationX));

      this.velocityY = dx * 0.0003;
      this.velocityX = dy * 0.0003;

      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    // Touch Support
    canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;

      this.targetRotationY += dx * 0.005;
      this.targetRotationX += dy * 0.005;
      this.targetRotationX = Math.max(-0.8, Math.min(0.8, this.targetRotationX));

      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener("touchend", () => {
      this.isDragging = false;
    });

    // Scroll Parallax Integration
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = maxScroll > 0 ? scrollY / maxScroll : 0;

      // Rotate slightly with page scroll
      this.targetRotationY = 1.2 + (scrollRatio * Math.PI * 1.5);
      this.camera.position.y = (scrollRatio * 0.4) - 0.2;
    }, { passive: true });

    // Resize
    window.addEventListener("resize", () => {
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // Theme Switch Observer
    const observer = new MutationObserver(() => {
      this.updateColorsOnThemeChange();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  updateColorsOnThemeChange() {
    const colors = this.getThemeColors();
    if (this.oceanMat) {
      this.oceanMat.color.setHex(colors.oceanColor);
      this.oceanMat.opacity = colors.oceanOpacity;
    }
    if (this.dotMesh && this.dotMesh.material) {
      this.dotMesh.material.color.setHex(colors.dotColor);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Auto spin when not dragging
    if (!this.isDragging) {
      this.targetRotationY += 0.0018 * this.options.speed;
      this.targetRotationY += this.velocityY;
      this.targetRotationX += this.velocityX;
      this.velocityY *= 0.95;
      this.velocityX *= 0.95;
    }

    // Smooth Lerp
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.06;
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.06;

    this.globeGroup.rotation.y = this.currentRotationY;
    this.globeGroup.rotation.x = this.currentRotationX;

    // Pulse HQ beacon rings
    if (this.pulseRings) {
      const time = performance.now() * 0.003;
      this.pulseRings.forEach(ring => {
        const s = 1 + (Math.sin(time + ring.userData.phase) * 0.4 + 0.4);
        ring.scale.set(s, s, s);
        ring.material.opacity = Math.max(0, 1 - (s - 1) * 1.2);
      });
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global initialization
window.DataPortGlobe = DataPortGlobe;
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("hero-globe-canvas")) {
    window.dataPortGlobeInstance = new DataPortGlobe("hero-globe-canvas");
  }
});
