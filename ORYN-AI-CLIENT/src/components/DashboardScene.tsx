import { useRef, useEffect } from 'react';
import * as THREE from 'three';

/* ─── Config ─────────────────────────────────────────────────── */
const NODE_COUNT   = 58;
const SPREAD       = 8.5;
const CONNECT_DIST = 3.0;

export default function DashboardScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const W = mount.clientWidth  || window.innerWidth;
    const H = mount.clientHeight || window.innerHeight;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    /* ── Scene & Camera ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.z = 14;

    /* ── Nodes ── */
    interface Node {
      pos: THREE.Vector3;
      speed: number;
      phase: number;
    }
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * SPREAD * 2,
        (Math.random() - 0.5) * SPREAD,
        (Math.random() - 0.5) * SPREAD * 1.4,
      ),
      speed: 0.003 + Math.random() * 0.007,
      phase: Math.random() * Math.PI * 2,
    }));

    /* ── Edge list ── */
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].pos.distanceTo(nodes[j].pos) < CONNECT_DIST) {
          edges.push([i, j]);
        }
      }
    }

    /* ── Node point cloud ── */
    const palette = [
      new THREE.Color('#00f0ff'),  // cyan
      new THREE.Color('#0088ff'),  // accent
      new THREE.Color('#8a2be2'),  // violet
      new THREE.Color('#00ffaa'),  // success
    ];

    const ptPositions = new Float32Array(nodes.length * 3);
    const ptColors    = new Float32Array(nodes.length * 3);
    const ptSizes     = new Float32Array(nodes.length);

    nodes.forEach((n, i) => {
      ptPositions[i * 3]     = n.pos.x;
      ptPositions[i * 3 + 1] = n.pos.y;
      ptPositions[i * 3 + 2] = n.pos.z;
      const c = palette[i % palette.length];
      ptColors[i * 3]     = c.r;
      ptColors[i * 3 + 1] = c.g;
      ptColors[i * 3 + 2] = c.b;
      ptSizes[i] = 0.08 + Math.random() * 0.06;
    });

    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPositions, 3));
    ptGeo.setAttribute('color',    new THREE.BufferAttribute(ptColors, 3));

    const ptMat = new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pointCloud = new THREE.Points(ptGeo, ptMat);
    scene.add(pointCloud);

    /* ── Edge lines ── */
    const lnPositions = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      lnPositions[i * 6]     = nodes[a].pos.x;
      lnPositions[i * 6 + 1] = nodes[a].pos.y;
      lnPositions[i * 6 + 2] = nodes[a].pos.z;
      lnPositions[i * 6 + 3] = nodes[b].pos.x;
      lnPositions[i * 6 + 4] = nodes[b].pos.y;
      lnPositions[i * 6 + 5] = nodes[b].pos.z;
    });

    const lnGeo = new THREE.BufferGeometry();
    lnGeo.setAttribute('position', new THREE.BufferAttribute(lnPositions, 3));

    const lnMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#00d4ff'),
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(lnGeo, lnMat);
    scene.add(lines);

    /* ── Group to rotate both together ── */
    const group = new THREE.Group();
    group.add(pointCloud);
    group.add(lines);
    scene.add(group);

    /* ── Animate ── */
    let rafId: number;
    const clock = new THREE.Clock();

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      /* Slow rotation */
      group.rotation.y = t * 0.04;
      group.rotation.x = Math.sin(t * 0.012) * 0.14;

      /* Node float drift */
      const pBuf = ptGeo.attributes.position.array as Float32Array;
      const lBuf = lnGeo.attributes.position.array as Float32Array;

      nodes.forEach((n, i) => {
        const drift = Math.sin(t * n.speed + n.phase) * 0.11;
        const ny = n.pos.y + drift;
        pBuf[i * 3 + 1] = ny;

        edges.forEach(([a, b], ei) => {
          if (a === i) lBuf[ei * 6 + 1] = ny;
          if (b === i) lBuf[ei * 6 + 4] = ny;
        });
      });

      ptGeo.attributes.position.needsUpdate = true;
      lnGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    /* ── Resize handler ── */
    function onResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.dispose();
      ptGeo.dispose();
      ptMat.dispose();
      lnGeo.dispose();
      lnMat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.72,
      }}
    />
  );
}
