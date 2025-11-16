/* ========================================== */
/* TACTICAL MAP (Mer & Montagne de points)    */
/* Fichier : tacticalMap.js                   */
/* ========================================== */

// import * as THREE from 'three';

// export function initTacticalMap() {
//     const canvas = document.getElementById('tactical-map-canvas');
//     if (!canvas) return;

//     // 1. Configuration de la scène
//     const scene = new THREE.Scene();
//     // Fond noir légèrement bleuté pour se fondre avec l'UI
//     scene.background = new THREE.Color(0x000508); 
//     // Brouillard pour lisser la profondeur
//     scene.fog = new THREE.FogExp2(0x000508, 0.02); 

//     const container = canvas.parentElement;
//     const width = container.clientWidth;
//     const height = container.clientHeight;

//     const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
//     camera.position.set(0, 10, 40); // Position surélevée
//     camera.lookAt(0, 0, 0);

//     const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
//     renderer.setSize(width, height);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

import * as THREE from 'three';

export function initTacticalMap() {
    const canvas = document.getElementById('tactical-map-canvas');
    if (!canvas) return;

    // SÉCURITÉ : Vérifier si un renderer existe déjà sur ce canvas pour éviter les doublons
    // (Bien que rare avec un rechargement complet de page, c'est une bonne pratique)
    
    // 1. Configuration de la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000508); 
    scene.fog = new THREE.FogExp2(0x000508, 0.02); 

    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 10, 40); 
    camera.lookAt(0, 0, 0);

    let renderer;

    try {
        // TENTATIVE DE CRÉATION SÉCURISÉE DU RENDERER
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            alpha: true, 
            antialias: true,
            powerPreference: "default", // "high-performance" peut bloquer plus vite
            failIfMajorPerformanceCaveat: true
        });
    } catch (e) {
        console.error("Erreur fatale WebGL (Tactical Map) :", e);
        // Si ça plante, on arrête la fonction ici pour ne pas bloquer le reste du site
        canvas.style.display = 'none'; // Cache le canvas cassé
        return; 
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // GESTION DE LA PERTE DE CONTEXTE (Pour éviter le crash total)
    canvas.addEventListener('webglcontextlost', function(event) {
        event.preventDefault();
        console.log('TacticalMap: Contexte WebGL perdu. Arrêt de l\'animation.');
        // Ici on pourrait annuler l'animation frame si on avait stocké l'ID
    }, false);






    // 2. Création des points (Grille)
    const particlesCount = 6000; // Nombre de points
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const originalY = []; // Pour stocker la hauteur de base (animation)

    const colorBlue = new THREE.Color('#00f3ff'); // Cyan
    const colorGold = new THREE.Color('#cda47d'); // Or

    const widthGrid = 80;
    const depthGrid = 80;
    const spacing = 1.5;

    let i = 0;
    for (let x = -widthGrid / 2; x < widthGrid / 2; x++) {
        for (let z = -depthGrid / 2; z < depthGrid / 2; z++) {
            // On saute quelques points aléatoirement pour un effet "organique"
            if (Math.random() > 0.8) continue; 

            const posX = x * spacing;
            const posZ = z * spacing;
            
            // Calcul de l'élévation (Mathématiques simples pour Montagne vs Mer)
            // Si Z est loin (négatif), on monte (Montagne)
            // Si Z est proche (positif), on est plat (Mer)
            
            let posY = 0;
            let isMountain = false;

            // Création de la montagne au fond (z < -20)
            if (posZ < -10) {
                // Formule de "bruit" simulée avec sin/cos
                const noise = Math.sin(posX * 0.1) * Math.cos(posZ * 0.1) * 4 
                            + Math.sin(posX * 0.3) * Math.sin(posZ * 0.3) * 2;
                
                // On élève progressivement vers le fond
                const elevationFactor = Math.abs(posZ + 10) / 3; 
                if (noise > 0) {
                    posY = noise * elevationFactor * 0.5;
                    isMountain = true;
                }
            }

            positions.push(posX, posY, posZ);
            originalY.push(posY); // Stocke la hauteur initiale

            // Couleur
            if (isMountain || posY > 2) {
                colors.push(colorGold.r, colorGold.g, colorGold.b);
            } else {
                colors.push(colorBlue.r, colorBlue.g, colorBlue.b);
            }
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const pointsMesh = new THREE.Points(geometry, material);
    scene.add(pointsMesh);

    // 3. Animation
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const time = clock.getElapsedTime();
        const positionsAttribute = geometry.attributes.position;
        const count = positionsAttribute.count;

        // Animation de la "Mer" uniquement
        for (let i = 0; i < count; i++) {
            const x = positionsAttribute.getX(i);
            const z = positionsAttribute.getZ(i);
            const yBase = originalY[i]; // Hauteur originale

            // Si c'est la partie "Mer" (hauteur basse)
            if (yBase < 2 && z > -10) {
                // Onde sinusoïdale
                const wave = Math.sin(x * 0.3 + time) * Math.cos(z * 0.2 + time) * 0.5;
                positionsAttribute.setY(i, yBase + wave);
            }
        }
        positionsAttribute.needsUpdate = true;

        // Légère rotation de la scène pour le dynamisme
        pointsMesh.rotation.y = Math.sin(time * 0.1) * 0.05;

        renderer.render(scene, camera);
    }

    animate();

    // 4. Gestion du resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
}