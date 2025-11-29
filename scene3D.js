/* =================================== */
/* SCRIPT DU DOSSIER 2 (Scène 3D)     */
/* OPTIMISÉ (Scroll & Resize)        */
/* =================================== */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

let isIntroAnimationPlaying = false;
let hudNeedsReset = false;

/**
 * Calcule les seuils de fin pour un nombre de zones donné.
 */
function calculerSeuils(nombreDeZones) {
    const nombreDEtapes = nombreDeZones - 1;
    if (nombreDEtapes <= 0) {
        return { nombreDEtapes: 0, seuils: [] };
    }
    const tailleEtape = 1.0 / nombreDEtapes;
    const seuils = [];
    for (let i = 1; i < nombreDEtapes; i++) {
        const seuil = tailleEtape * i;
        seuils.push(Number(seuil.toFixed(2)));
    }
    return {
        nombreDEtapes: nombreDEtapes,
        seuils: seuils 
    };
}












































/* * ÉTAPE 2 : CONFIGURATION DE BASE */
const canvas = document.getElementById('scene-3d');
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 77;

// const renderer = new THREE.WebGLRenderer({
//     canvas: canvas,
//     alpha: true,
//     antialias: true
// });
// renderer.setSize(window.innerWidth, window.innerHeight);

// const pixelRatio = window.innerWidth < 768 ? 1 : Math.min(window.devicePixelRatio, 1.5);
// renderer.setPixelRatio(pixelRatio);
// const isMobile = window.innerWidth < 768;
// renderer.antialias = !isMobile;


/* ========================================= */
/* OPTIMISATION 1 : QUALITÉ DU RENDU         */
/* ========================================= */

// Détection mobile un peu plus large (tablettes incluses)
const isMobile = window.innerWidth < 1024; 

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    // Désactiver l'antialias sur mobile gagne énormément de FPS
    antialias: !isMobile, 
    // Indique au navigateur de privilégier la performance
    powerPreference: "high-performance",
    // Désactive le buffer de profondeur logarithmique si non nécessaire (gagne un peu de perf)
    logarithmicDepthBuffer: false 
});

renderer.setSize(window.innerWidth, window.innerHeight);

// BRIDAGE DU PIXEL RATIO
// On limite à 1.5 sur PC (suffisant visuellement) et 1 sur mobile.
// Au-delà de 1.5 ou 2, la différence est invisible mais le calcul explose.
const targetPixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5);
renderer.setPixelRatio(targetPixelRatio);





// --- Rendu 2 : CSS3D (Pour le HUD HTML) ---
let cssRenderer;
let cssScene;
// On crée un conteneur pour le rendu CSS qui se superposera au canvas
const cssContainer = document.createElement('div');
cssContainer.style.position = 'fixed';
cssContainer.style.top = '0';
cssContainer.style.left = '0';
cssContainer.style.width = '100%';
cssContainer.style.height = '100%';
cssContainer.style.zIndex = '2'; // Derrière le loader (200) mais devant le canvas (-1)
cssContainer.style.pointerEvents = 'none'; // Laisse passer les clics
document.body.appendChild(cssContainer);
cssScene = new THREE.Scene();
cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssContainer.appendChild(cssRenderer.domElement);
// --- FIN ---

/* * ÉTAPE 3 : LUMIÈRES */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/* * ÉTAPE 4 : CHARGER LE MODÈLE .GLB */
const loader = new GLTFLoader();
let javelinModel = null;
let mixer = null;
let hoverAction, exposedAction;
let hudObject = null;

loader.load(
     'ref/drone.glb', // Assurez-vous que ce fichier est au même endroit
    (gltf) => {
        javelinModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(javelinModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        javelinModel.scale.multiplyScalar(3.0 / maxDim);
        javelinModel.position.sub(center);
        javelinModel.position.set(0, -12, 0); 
        javelinModel.rotation.y = 0;
        javelinModel.rotation.z = 0; 
        scene.add(javelinModel);

        // --- NOUVELLE FONCTION D'ATTACHEMENT DU HUD ---
        // On crée une fonction interne pour éviter de dupliquer le code
        const attachHUD = () => {
            const nomDeLaPiece = 'camera_jnt56_56'; // Vérifie bien ce nom dans Blender !
            const pieceMobile = javelinModel.getObjectByName(nomDeLaPiece);
            const hudElement = document.querySelector('.animation-container');

            // On vérifie si ce n'est pas déjà attaché
            if (pieceMobile && hudElement && !hudObject) {
                console.log("Attachement du HUD au modèle 3D...");
                hudElement.style.position = 'absolute';
                hudElement.style.top = '0px';      
                hudElement.style.left = '0px';     
                hudElement.style.transform = 'none'; 

                hudObject = new CSS3DObject(hudElement);
                hudObject.position.set(0, 0, 1.14); // Ajuste Z si ça traverse le drone
                hudObject.rotation.x = 0;
                hudObject.scale.set(0.001, 0.001, 0.001);

                pieceMobile.add(hudObject);
                
                // Force l'affichage si on était en mode "Skip"
                const spinnerWrapper = hudElement.querySelector('.spinner-wrapper');
                if (spinnerWrapper) {
                    spinnerWrapper.style.opacity = '1';
                    spinnerWrapper.style.filter = 'none';
                    spinnerWrapper.style.clipPath = 'none';
                }
            }
        };

        // --- GESTION DU SKIP INTRO (SI LE MODÈLE ARRIVE APRÈS LE LOADER) ---
        if (window.skipIntroAnimation) {
            console.log("Modèle chargé APRÈS le signal Skip. Application immédiate.");
            // 1. Position finale caméra (Pas de zoom intro)
            camera.position.z = 77; 
            
            // 2. Attacher le HUD tout de suite
            attachHUD();
            
            // 3. Synchroniser avec le scroll (car on est déjà à #projects)
            onScroll(); 
        }

        // --- ECOUTEUR D'ÉVÉNEMENT (SI LE MODÈLE ARRIVE AVANT LE LOADER) ---
        document.addEventListener('loaderFinished', () => {
            // Si on skip, on gère juste le HUD et la caméra instantanée
            if (window.skipIntroAnimation) {
                camera.position.z = 77;
                attachHUD();
                onScroll();
            } else {
                // Animation d'intro normale (Zoom 1000 -> 77)
                isIntroAnimationPlaying = true;
                attachHUD(); // On attache le HUD avant l'anim
                
                let cameraProxy = { z: 1000, hoverWeight: 0 };
                camera.position.z = 1000;
                
                // ... (Ton code anime.js existant pour l'intro) ...
                anime({
                    targets: cameraProxy, 
                    z: 77,
                    duration: 6000,
                    easing: 'easeInOutCubic',
                    // ... (reste des propriétés update/complete) ...
                    update: function() {
                        camera.position.z = cameraProxy.z;
                        // ...
                    },
                    complete: function() {
                        isIntroAnimationPlaying = false;
                        // ...
                    }
                });
            }
        });






        const bgVideo = document.getElementById('bg-video-z1')
        // ---  ÉCOUTER LE SIGNAL DU LOADER ---
        document.addEventListener('loaderFinished', () => {
            console.log("Signal 'loaderFinished' reçu. Attachement du HUD au modèle.");
            isIntroAnimationPlaying = true; // Verrouille le scroll

            // 1. Définir l'état de départ
            const zoomStartValue = 1000;
            const zoomEndValue = 77;
            
            if (exposedAction) exposedAction.weight = 0;
            
            let cameraProxy = { 
                z: zoomStartValue,
                hoverWeight: 0
            };
            
            camera.position.z = zoomStartValue;
            if (bgVideo) {
                bgVideo.play();
            }

            // 2. VÉRIFIER LE DRAPEAU "SKIP"
            if (window.skipIntroAnimation === true) {
                
                console.log("Skip-flag détecté. Saut de l'animation d'intro.");
                
                // On met tout à l'état final instantanément
                camera.position.z = zoomEndValue; // 77
                if (hoverAction) hoverAction.weight = 0;

                // On exécute manuellement le contenu du 'complete'
                isIntroAnimationPlaying = false; 
                window.scrollTo(0, 0); 
                document.body.style.overflow = 'auto';
                document.documentElement.style.overflow = 'auto';
                // Force la synchro avec le scroll (en appelant directement la fonction de mise à jour)
                updateModelOnScroll(0); 
                
            } else {
            
                // 3. Lancer l'animation (comportement normal)
                console.log("Pas de skip-flag. Lancement de l'animation d'intro.");
                anime({
                    targets: cameraProxy, 
                    
                    z: zoomEndValue,
                    duration: 6000,
                    easing: 'easeInOutCubic',
                    
                    hoverWeight: [
                        { value: 1, duration: 3000, easing: 'easeInQuad' }, // 0s -> 3s : 0 à 1
                        { value: 0, duration: 3000, easing: 'easeOutQuad' } // 3s -> 6s : 1 à 0
                    ],
                    
                    update: function() {
                        camera.position.z = cameraProxy.z;
                        if (hoverAction) {
                            hoverAction.weight = cameraProxy.hoverWeight;
                        }
                    },
                    
                    complete: function() {
                        isIntroAnimationPlaying = false; // Libère le verrou
                        window.scrollTo(0, 0); 
                        document.body.style.overflow = 'auto';
                        document.documentElement.style.overflow = 'auto';
                        updateModelOnScroll(0); // Force la synchro avec le scroll

                        // Logique pour cacher le bouton "Next"
                        const nextButton = document.querySelector('.btn-next-loader');
                        if (nextButton) {
                            nextButton.classList.add('is-hidden');
                            setTimeout(() => {
                                nextButton.style.display = 'none';
                            }, 400); 
                        }
                    }
                });
            
            } // --- FIN DU 'else' ---

        const nomDeLaPiece = 'camera_jnt56_56';
        const pieceMobile = javelinModel.getObjectByName(nomDeLaPiece);
        const hudElement = document.querySelector('.animation-container');

        if (pieceMobile && hudElement) {
                hudElement.style.position = 'absolute';
                hudElement.style.top = '0px';      
                hudElement.style.left = '0px';     
                hudElement.style.transform = 'none'; 

                hudObject = new CSS3DObject(hudElement);

                hudObject.position.set(0, 0, 1.14);
                hudObject.rotation.x = 0;
                
                const scale = 0.001; 
                hudObject.scale.set(scale, scale, scale);

                pieceMobile.add(hudObject);

                const spinnerWrapper = hudElement.querySelector('.spinner-wrapper');
                if (spinnerWrapper) {
                    // console.log("Réinitialisation du style (POST-ATTACH).");
                    // spinnerWrapper.style.opacity = '1';
                    // spinnerWrapper.style.filter = 'none';
                    // spinnerWrapper.style.clipPath = 'none';
                    hudNeedsReset = true;
                    console.log("HUD attaché. Levée du drapeau pour la réinitialisation des styles.");
                }
                
            } else {
                console.error("Impossible d'attacher le HUD. Pièce mobile ou élément introuvable.");
            }
        });

        // --- BLOC ANIMATION MIXER ---
        mixer = new THREE.AnimationMixer(javelinModel);
        const hoverClip = THREE.AnimationClip.findByName(gltf.animations, 'hover');
        const exposedClip = THREE.AnimationClip.findByName(gltf.animations, 'exploded_view');

         if (hoverClip) {
            hoverAction = mixer.clipAction(hoverClip);
            hoverAction.play();
            hoverAction.weight = 0;
        } else {
            console.error("Animation 'hover' non trouvée !");
        }
        if (exposedClip) {
            exposedAction = mixer.clipAction(exposedClip);
            exposedAction.play();
            exposedAction.weight = 0;
        } else {
             console.error("Animation 'exploded_view' non trouvée !");
        }
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% chargé (Modèle 3D)');
    },
    (error) => {
        console.error('Erreur lors du chargement du modèle 3D', error);
    }
);

/* * ÉTAPE 5 : L'ANIMATION AU SCROLL */
const NB_ZONES = 13;
const configScroll = calculerSeuils(NB_ZONES);
const seuil_Etape1_fin = configScroll.seuils[0]; 
const seuil_Etape2_fin = configScroll.seuils[1]; 
const seuil_Etape3_fin = configScroll.seuils[2]; 
const seuil_Etape4_fin = configScroll.seuils[3]; 
const seuil_Etape5_fin = configScroll.seuils[4]; 
const seuil_Etape6_fin = configScroll.seuils[5]; 
const seuil_Etape7_fin = configScroll.seuils[6];
const seuil_Etape8_fin = configScroll.seuils[7]; 
const seuil_Etape9_fin = configScroll.seuils[8]; 
const seuil_Etape10_fin = configScroll.seuils[9]; 
const seuil_Etape11_fin = configScroll.seuils[10]; 

const zoomInitial = 77;
const zoomFinal = 300;
const positionY_Initial = -12;
const positionY_Final = -60.0;
const totalZoomDistance = zoomFinal - zoomInitial;
const zoomStep = totalZoomDistance / 3;

const rotationX_Initial = 0;
const rotationX_Final = Math.PI*2;
const rotationY_Initial = 0;
const rotationY_Final = Math.PI*4;
const seuilAnimation = 0.21;
const unlockThreshold = 0.020; // Un point JUSTE AVANT le snap

// --- OPTIMISATION : Cache des éléments DOM ---
const htmlEl = document.documentElement;
const loaderText = document.querySelector('.text-container');
const loaderEl = document.querySelector('.loader');

/**
 * La fonction qui met à jour le modèle 3D.
 * Elle reçoit scrollPercent en argument et n'est appelée
 * que lorsque c'est nécessaire (via requestAnimationFrame).
 */
function updateModelOnScroll(scrollPercent) {
    if (isIntroAnimationPlaying) return; 

    if (!javelinModel || !mixer || !hoverAction || !exposedAction) {
        return;
    }
    
    if (scrollPercent <= seuil_Etape1_fin) {
        // --- ÉTAPE 1 : ZOOM (Z1 -> Z2) ---
        javelinModel.visible = true;
        const etape1_Percent = scrollPercent / seuil_Etape1_fin;
        loaderText.style.opacity = 1 - etape1_Percent;

        if (scrollPercent >= unlockThreshold) {
            htmlEl.style.scrollSnapType = 'none';
            if (loaderText) loaderText.style.display ='none'; // caché les boutons
            if (loaderEl){
                loaderEl.style.pointerEvents = 'none';// on cache le loader pour débloquer les clics.
                loaderEl.style.display = 'none'
            } 
                
        } else {
            htmlEl.style.scrollSnapType = 'y mandatory';
            if (loaderText) loaderText.style.display ='block';
            if (loaderEl) {
                loaderEl.style.pointerEvents = 'auto';
                loaderEl.style.display = 'block';
            }
        }

        camera.position.z = zoomInitial + (zoomStep * etape1_Percent);
        javelinModel.position.y = positionY_Initial;
        javelinModel.rotation.x = rotationX_Initial;
        javelinModel.rotation.y = rotationY_Initial;
        hoverAction.weight = 0;
        exposedAction.weight = 0;

        
    } else if (scrollPercent <= seuil_Etape2_fin) {
        // --- ÉTAPE 2 : DÉPLACEMENT Y (Z2 -> Z3) ---
        const etape2_Percent = (scrollPercent - seuil_Etape1_fin) / (seuil_Etape2_fin - seuil_Etape1_fin);
        camera.position.z = (zoomInitial + zoomStep) + (zoomStep * etape2_Percent);
        javelinModel.position.y = positionY_Initial;
        javelinModel.rotation.x = rotationX_Initial;
        javelinModel.rotation.y = rotationY_Initial;
        hoverAction.weight = 0;
        exposedAction.weight = 0;
        loaderText.style.display = 'none';


    } else if (scrollPercent <= seuil_Etape3_fin) {
        // --- ÉTAPE 3 : ROTATION X (Z3 -> Z4) ---
        const etape3_Percent = (scrollPercent - seuil_Etape2_fin) / (seuil_Etape3_fin - seuil_Etape2_fin);
        camera.position.z = (zoomInitial + zoomStep * 2) + (zoomStep * etape3_Percent);
        javelinModel.position.y = positionY_Initial;
        javelinModel.rotation.x = rotationX_Initial;
        javelinModel.rotation.y = rotationY_Initial;
        hoverAction.weight = 0;
        exposedAction.weight = 0;
        loaderText.style.display = 'none';

        
    } else if (scrollPercent <= seuil_Etape4_fin) {
        // --- ÉTAPE 4 : ANIMATION "HOVER" (Z4 -> Z5) ---
        const etape4_Percent = (scrollPercent - seuil_Etape3_fin) / (seuil_Etape4_fin - seuil_Etape3_fin);
        camera.position.z = zoomFinal;
        javelinModel.position.y = positionY_Initial + (positionY_Final - positionY_Initial) * etape4_Percent;
        javelinModel.rotation.x = rotationX_Initial;
        javelinModel.rotation.y = rotationY_Initial;
        hoverAction.weight = 0;
        exposedAction.weight = 0;
        loaderText.style.display = 'none';


    } else if (scrollPercent <= seuil_Etape5_fin) {
        // --- ÉTAPE 5 : ANIMATION "HOVER" (Z5 -> Z6) ---
        const etape5_Percent = (scrollPercent - seuil_Etape4_fin) / (seuil_Etape5_fin - seuil_Etape4_fin);        
        camera.position.z = zoomFinal;
        javelinModel.position.y = positionY_Final;
        javelinModel.rotation.x = rotationX_Initial + (rotationX_Final/2 - rotationX_Initial) * etape5_Percent;
        javelinModel.rotation.y = rotationY_Initial + (rotationY_Final/2 - rotationY_Initial) * etape5_Percent;
        hoverAction.weight = 0;
        exposedAction.weight = 0;
        loaderText.style.display = 'none';


    } else if (scrollPercent <= seuil_Etape6_fin){
        // --- ÉTAPE 6 : ANIMATION "EXPOSED VIEW" (Z6 -> Z7) ---
        const etape6_Percent = (scrollPercent - seuil_Etape5_fin) / (seuil_Etape6_fin - seuil_Etape5_fin);
        camera.position.z = zoomFinal;
        javelinModel.position.y = positionY_Final;
        javelinModel.rotation.x = rotationX_Initial + (rotationX_Final - rotationX_Initial) * etape6_Percent;
        javelinModel.rotation.y = rotationY_Initial + (rotationY_Final - rotationY_Initial) * etape6_Percent;
        // javelinModel.rotation.x = rotationX_Final;
        // javelinModel.rotation.y = rotationY_Final;
        hoverAction.weight = 0;
        exposedAction.weight = 0;
        loaderText.style.display = 'none';


    } else if (scrollPercent <= seuil_Etape7_fin){
        // --- ÉTAPE 7 : ... (Z7 -> Z8) ---
        const etape7_Percent = (scrollPercent - seuil_Etape6_fin) / (seuil_Etape7_fin - seuil_Etape6_fin);
        camera.position.z = zoomFinal;
        javelinModel.rotation.x = rotationX_Final;
        javelinModel.rotation.y = rotationY_Final;
        hoverAction.weight = etape7_Percent;
        exposedAction.weight = 0;
        loaderText.style.display = 'none';


    }else if(scrollPercent <= seuil_Etape8_fin){
        // --- ÉTAPE 8 : ... (Z8 -> Z9) ---
        const etape8_Percent = (scrollPercent - seuil_Etape7_fin) / (seuil_Etape8_fin - seuil_Etape7_fin);
        camera.position.z = zoomFinal;
        javelinModel.position.y = positionY_Final;
        javelinModel.rotation.x = rotationX_Final;
        javelinModel.rotation.y = rotationY_Final;
        hoverAction.weight = 1-etape8_Percent;
        exposedAction.weight = 0;
        loaderText.style.display = 'none';


    }else if(scrollPercent <= seuil_Etape9_fin){
        // --- ÉTAPE 9 : ... (Z9 -> Z10) ---
        const etape9_Percent = (scrollPercent - seuil_Etape8_fin) / (seuil_Etape9_fin - seuil_Etape8_fin);
        hoverAction.weight = 0;
        camera.position.z = zoomFinal;
        javelinModel.position.y = positionY_Final;
        exposedAction.weight = etape9_Percent;
        loaderText.style.display = 'none';


    }else if(scrollPercent <= seuil_Etape10_fin){
        // --- ÉTAPE 10 : ... (Z10 -> Z11) ---
        const etape10_Percent = (scrollPercent - seuil_Etape9_fin) / (seuil_Etape10_fin - seuil_Etape9_fin);
        hoverAction.weight = 0;
        camera.position.z = zoomFinal;
        javelinModel.position.y = positionY_Final;
        exposedAction.weight = 1-etape10_Percent;
        loaderText.style.display = 'none';


    }else if(scrollPercent <= seuil_Etape11_fin){
        // --- ÉTAPE 11 : ... (Z11 -> Z12) ---
        const etape11_Percent = (scrollPercent - seuil_Etape10_fin) / (seuil_Etape11_fin - seuil_Etape10_fin);
        hoverAction.weight = 0;
        exposedAction.weight = 0;
        javelinModel.position.y = positionY_Final;
        camera.position.z = zoomFinal;
        loaderText.style.display = 'none';
    }else{
        // --- ÉTAPE 12 : ... (Z12 -> Z13) ---
        const etape12_Percent = (scrollPercent - seuil_Etape11_fin) / (1.0 - seuil_Etape11_fin);
        hoverAction.weight = 0;
        exposedAction.weight = 0;
        javelinModel.position.y = 300;
        camera.position.z = zoomFinal;
        loaderText.style.display = 'none';
    }
}

// --- OPTIMISATION : Gestion du scroll avec requestAnimationFrame ---
let lastKnownScrollPercent = 0;
let ticking = false;

function onScroll() {
    const scrollTop = window.scrollY;
    // Utilisation de htmlEl (élément mis en cache)
    const docHeight = htmlEl.scrollHeight; 
    const windowHeight = window.innerHeight;
    
    // Gère la division par zéro si docHeight === windowHeight
    lastKnownScrollPercent = (docHeight - windowHeight > 0) 
        ? scrollTop / (docHeight - windowHeight)
        : 0;

    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateModelOnScroll(lastKnownScrollPercent);
            ticking = false;
        });
        ticking = true;
    }
}
window.addEventListener('scroll', onScroll);
// FORCE LE DRONE À RÉAPPARAÎTRE APRÈS LA TÉLÉPORTATION
window.addEventListener('scroll', () => {
    if (window.scrollY < 10 && javelinModel) {
        javelinModel.visible = true;
        // On force la mise à jour visuelle pour éviter le clignotement
        updateModelOnScroll(0);
    }
});
// --- FIN OPTIMISATION SCROLL ---


/* * ÉTAPE 6 : BOUCLE D'ANIMATION */
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    
    if (mixer) {
        mixer.update(deltaTime);
    }

    if (hudNeedsReset) {
        // Le drapeau est levé, on réinitialise les styles.
        // À ce stade, le CSS3DRenderer a pris le contrôle
        // de la position, donc il n'y aura pas de flash à (0,0).
        const spinnerWrapper = document.querySelector('.spinner-wrapper');
        if (spinnerWrapper) {
            console.log("animate() : Réinitialisation des styles du spinnerWrapper.");
            spinnerWrapper.style.opacity = '1';
            spinnerWrapper.style.filter = 'none';
            spinnerWrapper.style.clipPath = 'none';
        }
        // On baisse le drapeau pour ne le faire qu'une fois
        hudNeedsReset = false;
    }
    
    if (hudObject && javelinModel && !isIntroAnimationPlaying) {
        let modelYRotation = javelinModel.rotation.y % (Math.PI * 2);
        
        if (modelYRotation < 0) {
            modelYRotation += (Math.PI * 2);
        }

        // Si la rotation est "de dos" (entre 90° et 270°)
        if (modelYRotation > (Math.PI / 2) && modelYRotation < (Math.PI * 3) / 2) {
            hudObject.element.style.visibility = 'hidden';
        } else {
            hudObject.element.style.visibility = 'visible';
        }
    }

    // Rendu 1 (WebGL)
    renderer.render(scene, camera);
    
    // Rendu 2 (CSS)
    if (cssRenderer) {
        cssRenderer.render(scene, camera);
    }
}
animate();

/* * ÉTAPE 7 : GESTION DU REDIMENSIONNEMENT (OPTIMISÉE) */
// --- OPTIMISATION : "Debounce" du resize ---
let resizeTimeout;
window.addEventListener('resize', () => {
    // Annule le timeout précédent
    clearTimeout(resizeTimeout);
    
    // Définit un nouveau timeout
    resizeTimeout = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Rendu 1 (WebGL)
        renderer.setSize(width, height);
        
        // Rendu 2 (CSS)
        if (cssRenderer) {
            cssRenderer.setSize(width, height);
        }
        
        // Caméra
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        // Met à jour le scroll au cas où la hauteur de page changerait
        onScroll();

    }, 150); // Attend 150ms après la *fin* du resize
});
// --- FIN OPTIMISATION RESIZE ---


