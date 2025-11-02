/* =================================== */
/* SCRIPT DU DOSSIER 1 (Loader)      */
/* =================================== */

// Fonctions :
function generateInnerBars() {
    const svg = document.querySelector('.spinner');
    if (!svg) return;
    const innerBarsGroup = svg.querySelector('.inner-bars');
    if (!innerBarsGroup) return;

    const centerX = 50;
    const centerY = 50;
    const outerRadius = 42; 
    const innerRadius = 40; 
    const numBars = 150;
    const angleIncrement = 360 / numBars;

    for (let i = 0; i < numBars; i++) {
        const angle = i * angleIncrement;
        const rad = angle * Math.PI / 180;

        const x1 = centerX + outerRadius * Math.cos(rad);
        const y1 = centerY + outerRadius * Math.sin(rad);
        const x2 = centerX + innerRadius * Math.cos(rad);
        const y2 = centerY + innerRadius * Math.sin(rad);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        innerBarsGroup.appendChild(line);
    }
}

function triggerLocalFlash() {
    anime.set('.loader', { backgroundColor: '#111' });
    anime.remove('.loader'); 
    anime({
        targets: '.loader',
        backgroundColor: '#000',
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function triggerGlobalFade() {
    anime({
        targets: '.loader',
        backgroundColor: ['#000000', '#1a1a1a'],
        duration: 1500,
        easing: 'easeInOutQuad'
    });
}

    const lineGrid = document.querySelector('.line-grid');
    const dotPath = document.querySelector('#dot-path');

    const NUM_LINES = 100;
    const NUM_PATH_POINTS = 30;

    const functionNames = [
        'sine', 'pulse', 'center', 'linear', 'square', 'inverse',
        'exponential', 'step', 'osc_exp', 'flat_exp', 
        'maltese_cross', 'fleur_de_lis'
    ];
    let currentFunctionIndex = 0;

    function generateLines() {
        // Vérifie si lineGrid existe avant de continuer
        if (!lineGrid) return; 
        
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < NUM_LINES; i++) {
            const y = (100 / NUM_LINES) * (i + 0.5);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('x2', '100');
            line.setAttribute('y1', y);
            line.setAttribute('y2', y);
            line.classList.add('grid-line');
            line.dataset.baseY = y; 
            fragment.appendChild(line);
        }
        lineGrid.appendChild(fragment);
    }
    
    function getShapeValues(type, numValues) {
        const values = [];
        const T = numValues - 1; 

        for (let i = 0; i < numValues; i++) {
            let val = 0;
            const x = i / T; 
            
            switch (type) {
                case 'sine':
                    val = (Math.sin(x * Math.PI * 2) + 1) / 2;
                    break;
                case 'pulse':
                    let dist = Math.abs(x - 0.5) * 2;
                    val = 1 - Math.pow(dist, 3);
                    break;
                case 'center':
                    let distEq = Math.abs(x - 0.5) * 2;
                    val = Math.pow(distEq, 0.5);
                    break;
                case 'linear':
                    val = x;
                    break;
                case 'square':
                    val = (x < 0.33 || x > 0.66) ? 0.2 : 0.8;
                    break;
                case 'inverse':
                    val = 1 - x;
                    break;
                case 'exponential':
                    val = Math.pow(x, 3);
                    break;
                case 'step':
                    if (x < 0.25) val = 0.2;
                    else if (x < 0.5) val = 0.4;
                    else if (x < 0.75) val = 0.6;
                    else val = 0.8;
                    break;
                case 'osc_exp':
                    const amplitude = Math.pow(x, 2) * 0.5;
                    const oscillation = Math.sin(x * Math.PI * 8);
                    val = 0.5 + (amplitude * oscillation);
                    break;
                case 'flat_exp':
                    if (x < 0.5) {
                        val = 0.1;
                    } else {
                        const x_prime = (x - 0.5) * 2; 
                        val = 0.1 + (Math.pow(x_prime, 3) * 0.9); 
                    }
                    break;
                case 'maltese_cross':
                    const dist2 = Math.abs(x - 0.5);
                    if (dist2 < 0.2) { 
                        val = 1.0 - (dist2 / 0.2) * 0.6;
                    } else if (dist2 < 0.3) { 
                        const x_prime_indent = (dist2 - 0.2) / 0.1;
                        val = 0.4 + x_prime_indent * 0.4;
                    } else { 
                        const x_prime_outer = (dist2 - 0.3) / 0.2;
                        val = 0.8 - x_prime_outer * 0.8;
                    }
                    break;
                case 'fleur_de_lis':
                    if (x < 0.1) {
                        val = (x / 0.1) * 0.5;
                    } else if (x < 0.35) {
                        const x_p1 = (x - 0.1) / 0.25;
                        val = 0.5 + Math.sin(x_p1 * Math.PI) * 0.3;
                    } else if (x < 0.5) {
                        const x_p2 = (x - 0.35) / 0.15;
                        val = 0.5 - x_p2 * 0.3;
                    } else if (x < 0.65) {
                        const x_p3 = (x - 0.5) / 0.15;
                        val = 0.2 + x_p3 * 0.8;
                    } else if (x < 0.75) {
                        const x_p4 = (x - 0.65) / 0.1;
                        val = 1.0 - x_p4 * 0.7;
                    } else if (x < 0.9) {
                        val = 0.3;
                    } else {
                        const x_p5 = (x - 0.9) / 0.1;
                        val = 0.3 - x_p5 * 0.3;
                    }
                    break;
            }
            values.push(val);
        }
        return values;
    }

    function getPathData(functionType) {
        // S'assure que dotPath existe
        if (!dotPath) return "M 0,50 L 100,50"; 
        
        const values = getShapeValues(functionType, NUM_PATH_POINTS);
        const pathData = [];
        
        for (let i = 0; i < values.length; i++) {
            const x = (100 / (NUM_PATH_POINTS - 1)) * i;
            const y = 20 + (values[i] * 60); 
            const command = (i === 0) ? 'M' : 'L';
            pathData.push(`${command} ${x.toFixed(2)},${y.toFixed(2)}`);
        }
        return pathData.join(' ');
    }

    function runAnimationCycle() {
        // S'assure que les cibles existent
        if (!document.querySelector('.grid-line') || !document.querySelector('#dot-path')) return;

        const funcType = functionNames[currentFunctionIndex];
        
        const lineValues = getShapeValues(funcType, NUM_LINES);
        const pathD = getPathData(funcType);

        anime({
            targets: '.grid-line',
            scaleX: (line, i) => lineValues[i],
            delay: anime.stagger(5),
            duration: 1200,
            easing: 'easeInOutSine'
        });
        
        anime({
            targets: '#dot-path',
            d: pathD,
            duration: 1200,
            easing: 'easeInOutSine',
            complete: runAnimationCycle 
        });

        currentFunctionIndex = (currentFunctionIndex + 1) % functionNames.length;
    }

    function startDotsAnimation() {
        generateLines(); 
        runAnimationCycle(); 
    }























































// Attend que le DOM soit chargé pour exécuter le script
document.addEventListener("DOMContentLoaded", function() {
    document.body.style.overflow = 'hidden';

    generateInnerBars();

    // Crée une nouvelle timeline Anime.js
    const loaderTimeline = anime.timeline({
        easing: 'easeOutExpo',
    });

    // Étape 2 : Dessine le cercle rouge intérieur (.inner-bars)
    loaderTimeline.add({
        targets: '.inner-bars line',
        opacity: [0, 1],
        duration: 400,
        delay: anime.stagger(10),
        offset: '-=600'
    });

    // Étape 2bis : Fait apparaître les 8 segments de couleur
    loaderTimeline.add({
        targets: '.segment',
        opacity: [0, 1],
        duration: 500,  
        delay: () => anime.random(0, 800), 
        offset: '-=400',
        begin: triggerLocalFlash,
        complete: triggerGlobalFade
    });


    // Étape 3 : Fait apparaître le disque central
    loaderTimeline.add({
        targets: '.central-disk',
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 700,
        offset: '-=900'
    });

    // Étape 4 : Fait apparaître le texte principal
    loaderTimeline.add({
        targets: '.loader-text',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 700,
        offset: '-=600'
    });

    // NOUVEAU (Étape 4bis) : Fait apparaître le sous-texte
    loaderTimeline.add({
        targets: '.loader-subtext',
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 700,
        offset: '-=500'
    });

    // Étape 5 (Bonus) : Rotation en boucle
    loaderTimeline.finished.then(() => {
        
        // 1. Rotation en boucle (inchangé)
        anime({
            targets: '.spinner',
            rotate: 360,
            duration: 20000,
            easing: 'linear',
            loop: true
        });

        anime({
            targets: '.inner-bars',
            rotate: -720,
            duration: 20000,
            easing: 'linear',
            loop: true
        });



        setTimeout(() => {
            
            // 1. Cacher les anciens éléments
            const disk = document.querySelector('.central-disk');
            if (disk) disk.style.display = 'none';
            const dots = document.querySelector('.dot-grid-container');
            if (dots) dots.style.display = 'none'; // On cache les points (non utilisés)

            // 2. Afficher le scope
            const scope = document.querySelector('.scope-container');
            if(scope) {
                scope.style.display = 'block';
                scope.style.opacity = 1;
                // S'assure qu'il est bien centré et à la bonne taille
                scope.style.transform = 'translate(-50%, -50%) scale(1)'; 
            }

            // 3. Lancer l'animation du scope (LA PARTIE MANQUANTE)
            startDotsAnimation();
            
        }, 1000); // 1 seconde de délai


        /* --- ANIMATION DE SOUS-TITRE (Effet Machine à écrire) --- */
        // ... (votre code typeEffect reste ici, inchangé)
        const subtexts = [
            "I'm an engineer student",
            "I'm a developer",
            "A Creative Developer<br>based in France"
        ];
        let subtextIndex = 0;
        const subtextTarget = document.querySelector('.loader-subtext');
        const typeSpeed = 100;
        const deleteSpeed = 50;
        const pauseEnd = 2000;
        const pauseStart = 500;
        let charIndex = 0;
        let isDeleting = false;

        function typeEffect() {
            // ... (votre fonction typeEffect reste ici, inchangée)
            if (!subtextTarget) return; 
            const currentString = subtexts[subtextIndex];
            if (isDeleting) {
                subtextTarget.innerHTML = currentString.substring(0, charIndex - 1) + '<span class="text-cursor"></span>';
                charIndex--;
                if (charIndex === 0) {
                    isDeleting = false;
                    subtextIndex = (subtextIndex + 1) % subtexts.length;
                    setTimeout(typeEffect, pauseStart);
                } else {
                    setTimeout(typeEffect, deleteSpeed);
                }
            }  else {
                subtextTarget.innerHTML = currentString.substring(0, charIndex + 1) + '<span class="text-cursor"></span>';
                charIndex++;
                if (charIndex === currentString.length) {
                    isDeleting = true;
                    setTimeout(typeEffect, pauseEnd);
                } else {
                    setTimeout(typeEffect, typeSpeed);
                }
            }
        }
        setTimeout(typeEffect, 2500);
        /* --- FIN DE L'ANIMATION DE SOUS-TITRE --- */


        /* * ===========================================
         * !! BLOC MODIFIÉ !!
         * Transition finale : Glitch (2s) PUIS fondu 3D
         * ===========================================
         */
        
        // MODIFICATION 2 : Le second timeout (8s)
        // Ce bloc lance l'effet de "glitch/zapping"
        setTimeout(() => {
            
            const loader = document.querySelector('.loader');
            const nav = document.getElementById('main-nav');
            // On cible le texte ET l'animation
            const targetsToGlitch = ['.spinner-wrapper', '.text-container'];

            // Animation de "Zapping" (dure 2 secondes)
            const glitchTimeline = anime.timeline({
                duration: 2000, // Durée totale de 2s
                easing: 'steps(4)', // Effet "cassé", non-fluide
            });

            glitchTimeline.add({
                targets: targetsToGlitch,
                
                // Keyframes pour l'opacité (clignotement)
                opacity: [
                    { value: 1, duration: 200 },
                    { value: 0.3, duration: 100 },
                    { value: 0.8, duration: 200 },
                    { value: 0.1, duration: 100 },
                    { value: 1, duration: 300 },
                    { value: 0, duration: 1100 } // Fondu final
                ],
                
                // Keyframes pour le "blur" (effet glitch)
                filter: [
                    { value: 'blur(0px)', duration: 200 },
                    { value: 'blur(4px)', duration: 100 },
                    { value: 'blur(0px)', duration: 200 },
                    { value: 'blur(2px)', duration: 100 },
                    { value: 'blur(0px)', duration: 300 },
                    { value: 'blur(10px)', duration: 1100 } // Flou final
                ],

                // Keyframes pour clip-path (effet zapping/déchirure)
                // 'inset(top right bottom left)'
                clipPath: [
                    { value: 'inset(0% 0% 0% 0%)', duration: 200 },
                    { value: 'inset(20% 0% 60% 0%)', duration: 100 }, // Déchirure
                    { value: 'inset(0% 0% 0% 0%)', duration: 200 },
                    { value: 'inset(50% 0% 30% 0%)', duration: 100 }, // Déchirure
                    { value: 'inset(0% 0% 0% 0%)', duration: 300 },
                    { value: 'inset(50% 50% 50% 50%)', duration: 1100 } // Extinction TV
                ],
            });

            // À LA FIN des 2 secondes de glitch...
            glitchTimeline.finished.then(() => {
                
                // 1. Lancer la scène 3D (via l'événement)
                console.log("Glitch terminé. Lancement de la scène 3D.");
                document.dispatchEvent(new CustomEvent('loaderFinished'));

                // 2. Lancer le fondu du FOND du loader
                anime({
                    targets: loader,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    duration: 2000,
                    easing: 'easeInOutQuad'
                });

                // 3. Lancer l'apparition de la NAV
                anime({
                    targets: nav,
                    opacity: [0, 1],
                    duration: 1000,
                    easing: 'easeInOutQuad'
                });

                // 4. Cacher le texte pour de bon
                const textEl = document.querySelector('.text-container');
                if (textEl) textEl.style.display = 'none';

                // NOTE: On ne cache PAS le '.spinner-wrapper'.
                // Il est déjà invisible (opacity: 0, clip-path: inset(50%...))
                // et scene3D.js en a besoin pour l'attacher au drone.
            });

        }, 8000); // 8 secondes de délai avant de lancer le glitch de 2s

    }); // Fin de loaderTimeline.finished

    
});






//         /* * ===========================================
//          * Logique de transition après 6 secondes
//          * ===========================================
//          */
//         setTimeout(() => {
            
//             // On crée une nouvelle timeline pour la transition
//             const transitionTimeline = anime.timeline({
//                 easing: 'easeInOutQuad',
//             });

//             // Fait disparaître le disque rouge en le réduisant
//             transitionTimeline.add({
//                 targets: '.central-disk',
//                 scale: 0,
//                 opacity: 0,
//                 duration: 300
//             });
            
//             // ---- AJOUT 1 : Préparer le scope ----
//             const scope = document.querySelector('.scope-container');
//             if(scope) {
//                 scope.style.display = 'block'; // Le rendre visible
//             }

//             // ---- AJOUT 2 : Animer l'apparition du scope ----
//             transitionTimeline.add({
//                 targets: scope,
//                 opacity: [0, 1],
//                 transform: [
//                     'translate(-50%, -50%) scale(0)', // État de départ
//                     'translate(-50%, -50%) scale(1)'  // État d'arrivée
//                 ],
//                 duration: 800,
//                 easing: 'linear',
//                 offset: '<' // Démarrer en même temps que les points
//             });

//             // ---- AJOUT 3 : Lancer l'animation du scope ----
//             startDotsAnimation();
            
//         }, 1000); // 1 seconde

        
//         /* --- ANIMATION DE SOUS-TITRE (Effet Machine à écrire) --- */
//         const subtexts = [
//             "I'm an engineer student",
//             "I'm a developer",
//             "A Creative Developer<br>based in France"
//         ];
//         let subtextIndex = 0;
//         const subtextTarget = document.querySelector('.loader-subtext');
//         const typeSpeed = 100;
//         const deleteSpeed = 50;
//         const pauseEnd = 2000;
//         const pauseStart = 500;
//         let charIndex = 0;
//         let isDeleting = false;

//         function typeEffect() {
//             if (!subtextTarget) return; 
//             const currentString = subtexts[subtextIndex];
//             if (isDeleting) {
//                 subtextTarget.innerHTML = currentString.substring(0, charIndex - 1) + '<span class="text-cursor"></span>';
//                 charIndex--;
//                 if (charIndex === 0) {
//                     isDeleting = false;
//                     subtextIndex = (subtextIndex + 1) % subtexts.length;
//                     setTimeout(typeEffect, pauseStart);
//                 } else {
//                     setTimeout(typeEffect, deleteSpeed);
//                 }
//             }  else {
//                 subtextTarget.innerHTML = currentString.substring(0, charIndex + 1) + '<span class="text-cursor"></span>';
//                 charIndex++;
//                 if (charIndex === currentString.length) {
//                     isDeleting = true;
//                     setTimeout(typeEffect, pauseEnd);
//                 } else {
//                     setTimeout(typeEffect, typeSpeed);
//                 }
//             }
//         }
//         setTimeout(typeEffect, 2500);
//         /* --- FIN DE L'ANIMATION DE SOUS-TITRE --- */




//         setTimeout(() => {
            
//             const loader = document.querySelector('.loader');
//             const nav = document.getElementById('main-nav');

//             // 1. Animer la disparition du FOND UNIQUEMENT
//             // En passant le fond à transparent, on révèle 
//             // le canvas 3D (z-index: -1) qui est derrière.
//             anime({
//                 targets: loader,
//                 backgroundColor: 'rgba(0, 0, 0, 0)', // Cible : fond transparent
//                 duration: 2000, // Durée plus longue pour un fondu doux
//                 easing: 'easeInOutQuad'
//             });

//             // 2. Animer l'apparition de la barre de navigation
//             anime({
//                 targets: nav,
//                 opacity: [0, 1],
//                 duration: 1000,
//                 easing: 'easeInOutQuad'
//             });
            
//             // IMPORTANT : On ne cache plus le loader !
//             // loader.style.display = 'none'; <-- SUPPRIMÉ
            
//             // L'animation du scope est déjà lancée par le timeout précédent.
//             // On envoie un signal pour dire à scene3D.js de prendre le contrôle du HUD
//             document.dispatchEvent(new CustomEvent('loaderFinished'));

//         }, 8000); // 8 secondes

//     }); // Fin de loaderTimeline.finished

    
// });