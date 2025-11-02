/* =================================== */
/* SCRIPT DU DOSSIER 2 (Scène 3D)     */
/* =================================== */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import { EnvironnementCercle } from './EnvironnementCercle.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

let isIntroAnimationPlaying = false;

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

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
cssContainer.style.zIndex = '0'; // Derrière le loader (200) mais devant le canvas (-1)
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
//let environnementCercle = null;
let mixer = null;
let hoverAction, exposedAction;
let hudObject = null;

loader.load(
    'drone.glb', // Assurez-vous que ce fichier est au même endroit
    (gltf) => {
        javelinModel = gltf.scene;
        
        // console.log("Structure complète du modèle (cherchez les 'Bone') :");
        // javelinModel.traverse((object) => {
        //     console.log(`- Nom: ${object.name}, Type: ${object.type}`);
        // });
        // console.log('Animations disponibles :', gltf.animations.map(clip => clip.name));

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


        // ---  ÉCOUTER LE SIGNAL DU LOADER ---
        // Nous attendons que le loader ait fini sa transition (le fondu)
        // pour attacher le HUD au modèle.
        document.addEventListener('loaderFinished', () => {
            console.log("Signal 'loaderFinished' reçu. Attachement du HUD au modèle.");
            isIntroAnimationPlaying = true; // Verrouille le scroll

            // 1. Définir l'état de départ
            const zoomStartValue = 1000;
            const zoomEndValue = 77;
            
            // SUPPRIMÉ : 'hoverAction.weight' est maintenant géré par l'animation
            // if (hoverAction) hoverAction.weight = 1; 
            if (exposedAction) exposedAction.weight = 0;
            
            // On crée un objet "proxy" pour qu'anime.js puisse l'animer
            let cameraProxy = { 
                z: zoomStartValue,
                hoverWeight: 0 // <-- AJOUT de la propriété proxy
            };
            
            // On place la caméra à la position de départ
            camera.position.z = zoomStartValue;

            // 2. Lancer l'animation
            anime({
                targets: cameraProxy, // Cible notre objet proxy
                
                // Animation 1: Zoom de la caméra (inchangée)
                z: zoomEndValue,
                duration: 6000,
                easing: 'easeInOutCubic',
                
                // Animation 2: Poids du Hover (MODIFIÉ)
                // On utilise des keyframes pour l'animation du poids
                hoverWeight: [
                    { value: 1, duration: 3000, easing: 'easeInQuad' }, // 0s -> 3s : 0 à 1
                    { value: 0, duration: 3000, easing: 'easeOutQuad' } // 3s -> 6s : 1 à 0
                ],
                
                // À chaque "frame" de l'animation...
                update: function() {
                    // ...on met à jour la vraie position de la caméra
                    camera.position.z = cameraProxy.z;
                    
                    // ...on met à jour le poids de l'animation hover (MODIFIÉ)
                    if (hoverAction) {
                        hoverAction.weight = cameraProxy.hoverWeight;
                    }
                },
                
                // Quand l'animation est terminée...
                complete: function() {
                    // SUPPRIMÉ : Le poids est déjà à 0 grâce aux keyframes
                    // if (hoverAction) hoverAction.weight = 0; 
                    isIntroAnimationPlaying = false; // Libère le verrou
                    window.scrollTo(0, 0); 
                    // 2. Réactiver le scroll pour l'utilisateur
                    document.body.style.overflow = 'auto';
                    updateModelOnScroll(); // Force la synchro avec le scroll
                }
            });



        const nomDeLaPiece = 'camera_jnt56_56';
        const pieceMobile = javelinModel.getObjectByName(nomDeLaPiece);
        const hudElement = document.querySelector('.animation-container');

        if (pieceMobile && hudElement) {
                // On cible l'élément qui a été "glitché" par loader.js
                const spinnerWrapper = hudElement.querySelector('.spinner-wrapper');
                if (spinnerWrapper) {
                    console.log("Réinitialisation du style du spinnerWrapper pour la 3D.");
                    // On force le retour à la visibilité
                    spinnerWrapper.style.opacity = '1';
                    spinnerWrapper.style.filter = 'none';
                    spinnerWrapper.style.clipPath = 'none';
                }

                // On "libère" le HUD de son centrage 2D
                // pour que le moteur 3D prenne le contrôle.
                hudElement.style.position = 'absolute';
                hudElement.style.top = '0px';      // Annule 50%
                hudElement.style.left = '0px';     // Annule 50%
                hudElement.style.transform = ''; // Annule translate(-50%, -50%)

                // 1. On crée un objet 3D CSS qui enveloppe notre <div>
                hudObject = new CSS3DObject(hudElement);

                // 2. On le positionne là où était le cercle rouge
                hudObject.position.set(0, 0, 1.14);
                hudObject.rotation.x = 0;
                
                // 3. On le réduit drastiquement (car 600px est énorme en 3D)
                // C'EST LA PARTIE LA PLUS IMPORTANTE :
                // Il faut trouver le bon "scale" pour que 600px
                // corresponde à la taille voulue dans la scène 3D.
                // Commencez avec 0.002 et ajustez.
                const scale = 0.001; 
                hudObject.scale.set(scale, scale, scale);

                // 4. On l'ajoute à la pièce mobile (la caméra)
                pieceMobile.add(hudObject);
                
                // 5. On ajoute l'objet à la scène CSS
                // Note : L'objet est dans la scène WebGL (via pieceMobile)
                // mais son *rendu* se fait via la scène CSS.
                // (Mise à jour : l'objet 3D doit être ajouté à la *pièce mobile*
                // qui elle-même est dans la *scène WebGL*. 
                // Le cssRenderer utilise la *même* caméra pour tout aligner.)
                
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
const NB_ZONES = 7;
const configScroll = calculerSeuils(NB_ZONES);
const seuil_Etape1_fin = configScroll.seuils[0]; 
const seuil_Etape2_fin = configScroll.seuils[1]; 
const seuil_Etape3_fin = configScroll.seuils[2]; 
const seuil_Etape4_fin = configScroll.seuils[3]; 
const seuil_Etape5_fin = configScroll.seuils[4]; 

const zoomInitial = 77;
const zoomFinal = 300;
const positionY_Initial = -12;
const positionY_Final = -60.0;
const positionX_Initial = -12;
const positionX_Final = 10.0;
const rotationX_Initial = 0;
const rotationX_Final = Math.PI*2;
const rotationY_Initial = 0;
const rotationY_Final = Math.PI*4;

const seuilAnimation = 0.21;

function updateModelOnScroll() {
if (isIntroAnimationPlaying) return; // bloquer le scroll au début

    if (!javelinModel) {
        return;
    }

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - windowHeight);
    
    if (!mixer || !hoverAction || !exposedAction) {
        return;
    }

    if (scrollPercent <= seuil_Etape1_fin) {
        // --- ÉTAPE 1 : ZOOM (Z1 -> Z2) ---
        const etape1_Percent = scrollPercent / seuil_Etape1_fin;
        camera.position.z = zoomInitial + (zoomFinal - zoomInitial) * etape1_Percent;
        javelinModel.position.y = positionY_Initial;
        javelinModel.rotation.x = rotationX_Initial;
        javelinModel.rotation.y = rotationY_Initial;
        hoverAction.weight = 0;
        exposedAction.weight = 0;
    } else if (scrollPercent <= seuil_Etape2_fin) {
        // --- ÉTAPE 2 : DÉPLACEMENT Y (Z2 -> Z3) ---
        const etape2_Percent = (scrollPercent - seuil_Etape1_fin) / (seuil_Etape2_fin - seuil_Etape1_fin);
        camera.position.z = zoomFinal;
        javelinModel.position.y = positionY_Initial + (positionY_Final - positionY_Initial) * etape2_Percent;
        javelinModel.rotation.x = rotationX_Initial;
        javelinModel.rotation.y = rotationY_Initial;
        hoverAction.weight = 0;
        exposedAction.weight = 0;
    } else if (scrollPercent <= seuil_Etape3_fin) {
        // --- ÉTAPE 3 : ROTATION X (Z3 -> Z4) ---
        const etape3_Percent = (scrollPercent - seuil_Etape2_fin) / (seuil_Etape3_fin - seuil_Etape2_fin);
        camera.position.z = zoomFinal;
        javelinModel.position.y = positionY_Final;
        javelinModel.rotation.x = rotationX_Initial + (rotationX_Final - rotationX_Initial) * etape3_Percent;
        javelinModel.rotation.y = rotationY_Initial + (rotationY_Final - rotationY_Initial) * etape3_Percent;
        hoverAction.weight = 0;
        exposedAction.weight = 0;
    } else if (scrollPercent <= seuil_Etape4_fin) {
        // --- ÉTAPE 4 : ANIMATION "HOVER" (Z4 -> Z5) ---
        const etape4_Percent = (scrollPercent - seuil_Etape3_fin) / (seuil_Etape4_fin - seuil_Etape3_fin);
        camera.position.z = zoomFinal;
        javelinModel.position.y = positionY_Final;
        javelinModel.rotation.x = rotationX_Final;
        javelinModel.rotation.y = rotationY_Final;
        hoverAction.weight = etape4_Percent;
        exposedAction.weight = 0;
    } else if (scrollPercent <= seuil_Etape5_fin) {
        // --- ÉTAPE 5 : ANIMATION "HOVER" (Z5 -> Z6) ---
        const etape5_Percent = (scrollPercent - seuil_Etape4_fin) / (seuil_Etape5_fin - seuil_Etape4_fin);
        camera.position.z = zoomFinal;
        hoverAction.weight = 1-etape5_Percent;
        exposedAction.weight = 0;
    } else {
        // --- ÉTAPE 6 : ANIMATION "EXPOSED VIEW" (Z6 -> Z7) ---
        const etape6_Percent = (scrollPercent - seuil_Etape5_fin) / (1.0 - seuil_Etape5_fin);
        camera.position.z = zoomFinal;
        javelinModel.position.y = positionY_Final;
        javelinModel.rotation.x = rotationX_Final;
        javelinModel.rotation.y = rotationY_Final;
        hoverAction.weight = 0;
        exposedAction.weight = etape6_Percent;
    }
}
window.addEventListener('scroll', updateModelOnScroll);


/* * ÉTAPE 6 : BOUCLE D'ANIMATION (MODIFIÉE) */
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    
    if (mixer) {
        mixer.update(deltaTime);
    }
    
    if (hudObject && javelinModel && !isIntroAnimationPlaying) {
        // On normalise la rotation Y (qui va de 0 à 4*PI)
        // pour la ramener dans un tour (0 à 2*PI)
        let modelYRotation = javelinModel.rotation.y % (Math.PI * 2);
        
        // Gère les rotations négatives si ça arrive
        if (modelYRotation < 0) {
            modelYRotation += (Math.PI * 2);
        }

        // Si la rotation est "de dos" (entre 90° et 270°)
        // Math.PI / 2 = 90°
        // (Math.PI * 3) / 2 = 270°
        if (modelYRotation > ((Math.PI / 2) && modelYRotation < (Math.PI * 3) / 2) || (modelYRotation < -(Math.PI / 2) && modelYRotation > -(Math.PI * 3) / 2)) {
            hudObject.element.style.visibility = 'hidden';
        } else {
            hudObject.element.style.visibility = 'visible';
        }
    }


    // Rendu 1 (WebGL)
    renderer.render(scene, camera);
    
    // Rendu 2 (CSS)
    // Le cssRenderer utilise la *même* scène et la *même* caméra
    // pour que les positions 3D correspondent.
    if (cssRenderer) {
        cssRenderer.render(scene, camera);
    }
}
animate();

/* * ÉTAPE 7 : GESTION DU REDIMENSIONNEMENT (MODIFIÉE) */
window.addEventListener('resize', () => {
    // Rendu 1 (WebGL)
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Rendu 2 (CSS)
    if (cssRenderer) {
        cssRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Caméra
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});