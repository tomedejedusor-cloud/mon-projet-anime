/* =================================== */
/* SCRIPT DU DOSSIER 1 (Loader)      */
/* =================================== */

// 1. On dit au navigateur de NE PAS restaurer le scroll
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
// 2. On force manuellement le scroll à 0,0 (en haut)
// à chaque chargement du script.
window.scrollTo(0, 0);



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

    // Variable de contrôle globale (à ajouter juste avant la fonction)
    let isDotsAnimationRunning = true; 

    function runAnimationCycle() {
        // S'assure que les cibles existent
        if (!document.querySelector('.grid-line') || !document.querySelector('#dot-path')) return;
        
        // --- CORRECTIF : Si on a demandé l'arrêt, on ne relance pas la boucle ---
        if (!isDotsAnimationRunning) return; 

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
            complete: () => {
                // Vérification supplémentaire avant de relancer
                if (isDotsAnimationRunning) runAnimationCycle();
            }
        });

        currentFunctionIndex = (currentFunctionIndex + 1) % functionNames.length;
    }

    function startDotsAnimation() {
        if (lineGrid) lineGrid.innerHTML = '';
        generateLines(); 
        runAnimationCycle(); 
    }

// Attend que le DOM soit chargé pour exécuter le script
document.addEventListener("DOMContentLoaded", function() {

    // --- 1. DÉCLARATION DES VARIABLES GLOBALES ---
    let transitionTimeout; 
    let glitchTimeline; 
    const targetsToGlitch = ['.spinner-wrapper'];

    // --- CORRECTION IMPORTANTE ICI ---
    // On génère les éléments graphiques (barres, lignes) AVANT de vérifier le skip
    // Sinon, en mode skip, ils n'existent pas !
    generateInnerBars(); 
    generateLines();

    // --- 2. DÉTECTION DU MODE "SKIP" ---
    const urlParams = new URLSearchParams(window.location.search);
    const skipIntro = urlParams.get('skip') === 'true';

    if (skipIntro) {
        console.log("Mode Skip activé : Retour vers #Projects.");

        // A. RENDRE LE LOADER TRANSPARENT (Mais conteneur présent pour le HUD)
        const loader = document.querySelector('.loader');
        if(loader) {
            loader.style.backgroundColor = 'rgba(0,0,0,0)'; // Fond invisible
            loader.style.pointerEvents = 'none'; 
        }

        // B. CACHER LE TEXTE D'INTRO ET BOUTONS (Correction stricte)
        const introTextContainer = document.querySelector('.text-container');
        const loaderButtons = document.querySelector('.loader-buttons-container');
        const nextBtn = document.querySelector('.btn-next-loader');
        const loaderText = document.querySelector('.loader-text');
        const loaderSub = document.querySelector('.loader-subtext');

        // On force le masquage immédiat
        if (introTextContainer) introTextContainer.style.display = 'none';
        if (loaderButtons) loaderButtons.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (loaderText) loaderText.style.display = 'none';
        if (loaderSub) loaderSub.style.display = 'none';

        // C. FORCER L'AFFICHAGE DU HUD (Graphiques, Cercles, Barres)
        // On force l'opacité à 1 car l'animation d'intro ne le fera pas
        document.querySelectorAll('.segment').forEach(el => el.style.opacity = '1');
        document.querySelectorAll('.inner-bars line').forEach(el => el.style.opacity = '1');
        const txtCont = document.querySelector('.text-container');
        if(txtCont) txtCont.style.opacity = '1'; // Force l'affichage du fond
        const path = document.querySelector('.path');
        if(path) path.style.opacity = '1';
        
        const scope = document.querySelector('.scope-container');
        if (scope) {
            scope.style.display = 'block';
            scope.style.opacity = '1';
            scope.style.transform = 'translate(-50%, -50%) scale(1)';
            // On lance l'animation douce des points
             setTimeout(() => {
                 try { runAnimationCycle(); } catch(e){}
             }, 100);
        }

        // D. NAVIGATION ET SCROLL
        const nav = document.getElementById('main-nav');
        if(nav) nav.style.opacity = '1';

        // On scroll vers projects immédiatement
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'auto' });
        }

        // On signale à scene3D.js que l'intro est finie
        window.skipIntroAnimation = true;
        document.dispatchEvent(new CustomEvent('loaderFinished'));

        return; // STOP LE SCRIPT ICI
    } else {
        // ... (Le reste du code "else" original pour l'intro normale) ...
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }

    //generateInnerBars();


    // --- CORRECTION RADICALE : NETTOYAGE CSS FORCÉ ---
    const nextButton = document.querySelector('.btn-next-loader');
    
    function triggerInstantTransition(e) {
        if(e) e.preventDefault();
        
        clearTimeout(transitionTimeout);
        if (glitchTimeline) glitchTimeline.pause();

        // 1. Cacher le bouton immédiatement
        if(nextButton) nextButton.style.display = 'none';

        // 2. ARRÊT LOGIQUE
        isDotsAnimationRunning = false; // Coupe la boucle JS
        if(typeof loaderTimeline !== 'undefined') loaderTimeline.pause();
        
        // 3. ARRÊT ANIME.JS (Nettoyage de toutes les cibles potentielles)
        anime.remove('.spinner');
        anime.remove('.inner-bars');
        anime.remove('.inner-bars line');
        anime.remove('.segment');
        anime.remove('.grid-line'); 
        anime.remove('#dot-path');
        anime.remove('.spinner-wrapper'); // Arrête le glitch

        // 4. NETTOYAGE CSS BRUTAL (C'est ici que le bug du glitch se règle)
        const spinnerWrapper = document.querySelector('.spinner-wrapper');
        if(spinnerWrapper) {
            // On supprime TOUS les styles inline ajoutés par l'animation (clip-path, filter, transform...)
            spinnerWrapper.setAttribute('style', ''); 
            
            // On réapplique uniquement ce qui est nécessaire pour la visibilité
            spinnerWrapper.style.opacity = '1';
            spinnerWrapper.style.display = 'flex'; // Important si le CSS l'avait caché
            // On force explicitement à 'none' pour être sûr
            spinnerWrapper.style.filter = 'none';
            spinnerWrapper.style.clipPath = 'none';
            spinnerWrapper.style.transform = 'none';
        }

        // 5. GESTION DE L'ÉTAT VISUEL (Nettoyage grille superposée)
        const disk = document.querySelector('.central-disk');
        if (disk) disk.style.display = 'none';

        const scope = document.querySelector('.scope-container');
        if (scope) {
            scope.style.display = 'block';
            scope.style.opacity = '1';
            scope.style.transform = 'translate(-50%, -50%) scale(1)';
            
            // On vide la grille existante pour éviter les doublons/superpositions
            const lineGrid = document.querySelector('.line-grid');
            if(lineGrid) lineGrid.innerHTML = ''; 

            // On redémarre proprement après un court délai (pour laisser le DOM respirer)
            setTimeout(() => {
                isDotsAnimationRunning = true; 
                generateLines(); // Régénère une grille propre
                runAnimationCycle(); // Relance l'animation calme
            }, 50);
        }

        // 6. FORCER LES ÉLÉMENTS STATIQUES VISIBLES
        document.querySelectorAll('.segment').forEach(el => el.style.opacity = '1');
        document.querySelectorAll('.inner-bars line').forEach(el => el.style.opacity = '1');
        const path = document.querySelector('.path');
        if(path) path.style.opacity = '1';

        // 7. AFFICHER TEXTE & BOUTONS
        const mainContainer = document.querySelector('.text-container');
        if(mainContainer) mainContainer.style.opacity = '1';
        const textElements = ['.loader-text', '.loader-subtext', '.loader-buttons-container'];
        textElements.forEach(selector => {
            const el = document.querySelector(selector);
            if(el) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.style.display = 'block';
            }
        });

        // 8. TRANSITION VERS LA SCÈNE 3D
        window.skipIntroAnimation = true; 
        document.dispatchEvent(new CustomEvent('loaderFinished'));

        // Fondu final du fond noir
        anime({
            targets: '.loader',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            duration: 800,
            easing: 'easeInOutQuad',
            complete: () => {
                // document.body.style.overflow = 'auto'; 
                // document.documentElement.style.overflow = 'auto';

                // Animation décorative de fond (Rotation infinie)
                anime({
                    targets: '.spinner',
                    rotate: '+=360deg',
                    duration: 20000,
                    easing: 'linear',
                    loop: true
                });
                anime({
                    targets: '.inner-bars',
                    rotate: '-=720deg',
                    duration: 20000,
                    easing: 'linear',
                    loop: true
                });
            }
        });

        // Affichage Nav
        anime({
            targets: '#main-nav',
            opacity: 1,
            duration: 800
        });
    }

    // Attache l'événement
    if (nextButton) {
        nextButton.addEventListener('click', triggerInstantTransition);
    }

    // 2. SI SKIP ACTIF : On affiche juste le bouton NEXT et le texte statique
    if (skipIntro) {
        // On cache le spinner animé
        const spinner = document.querySelector('.spinner-wrapper');
        if(spinner) spinner.style.display = 'none';

        // On affiche le texte et les boutons immédiatement
        const elementsToShow = [
            '.loader-text', 
            '.loader-subtext', 
            '.loader-buttons-container', 
            '.btn-next-loader'
        ];
        
        elementsToShow.forEach(el => {
            const domEl = document.querySelector(el);
            if(domEl) {
                domEl.style.opacity = 1;
                domEl.style.transform = 'translateY(0)';
            }
        });

        // On s'assure que le bouton Next est visible (il a peut-être une classe is-hidden)
        const nextBtn = document.querySelector('.btn-next-loader');
        if(nextBtn) {
            nextBtn.style.opacity = 1;
            nextBtn.style.display = 'block';
            nextBtn.classList.remove('is-hidden');
            
            // IMPORTANT : On attache l'événement de clic pour lancer la transition 3D
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // On lance la transition finale (définie plus bas dans votre code original)
                // Note: Assurez-vous que la fonction startFinalTransition est accessible ou répliquée ici
                // Pour faire simple, on simule le clic qui déclenche la suite :
                document.dispatchEvent(new CustomEvent('loaderFinished')); // Lance la 3D
                
                // Cache le loader
                anime({
                    targets: '.loader',
                    opacity: 0,
                    duration: 500,
                    easing: 'easeInOutQuad',
                    complete: () => {
                         document.querySelector('.loader').style.display = 'none';
                         // Si on voulait aller à #projects, on le force ici
                         if(window.location.hash === '#projects') {
                             const projectsSection = document.getElementById('projects');
                             if(projectsSection) projectsSection.scrollIntoView();
                         }
                    }
                });
                
                // Affiche la nav
                anime({
                    targets: '#main-nav',
                    opacity: 1,
                    duration: 500
                });
            });
        }

        // On arrête là pour ne pas lancer la Timeline
        return; 
    }


    // Crée une nouvelle timeline Anime.js
    const loaderTimeline = anime.timeline({
        easing: 'easeOutExpo',
    });

    loaderTimeline.add({
        targets: '.btn-next-loader',
        opacity: [0, 1],
        duration: 500, 
        offset: '-=600' // Commence 400ms avant la fin de l'anim précédente (donc quasi immédiat)
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

    //----------------------------------------------------------------------
    // -----------Étape 4 : Fait apparaître le texte principal--------------
    //---------------------------------------------------------------------

    loaderTimeline.add({
        targets: '.text-container',
        opacity: [0, 1],
        duration: 500,
        easing: 'linear',
        offset: '-=800' // Se lance un peu avant le texte pour l'accueillir
    });

    loaderTimeline.add({
        targets: '.loader-text',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 700,
        offset: '-=600'
    });

    loaderTimeline.add({
        targets: '.loader-subtext',
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 700,
        offset: '-=500'
    });

    loaderTimeline.add({
        targets: '.loader-buttons-container',
        opacity: [0, 1],
        translateY: [10, 0], // Même animation que le sous-texte
        duration: 700,
        offset: '-=400' // On le fait démarrer 100ms après le sous-titre
    });



    //------------------------------------------------------------------------

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
        // ... (votre code typeEffect reste ici, inchangé) à la ligne : <br>
        const subtexts = [
            "I'm an engineer student",
            "I'm a developer",
            "A Creative Developer",
            "I study mechatronics <br> and robotics",
            "I work on embedded AI", 
            "Neural Networks and <br> Machine Learning",
            "Image processing is brilliant",
            "Like programmation ... ",
            "I love Java Script",
            "I am a hard worker",
            "I am an enthusiastic <br> programmer", 
            "Otherwise, <br> I have hobbies",
            "A robotics club <br> and sports"
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
        
        let transitionStarted = false; // Drapeau pour éviter double clic/timeout

        // 1. On déplace toute la logique de transition dans une fonction
        function startFinalTransition(instant = false) { 
            // Sécurité pour ne pas lancer la transition deux fois
            if (transitionStarted) return; 
            transitionStarted = true;
            clearTimeout(transitionTimeout); 

            // Arrête les animations en boucle pour économiser les ressources
            anime.remove('.spinner');
            anime.remove('.inner-bars');
            
            // Cache le bouton "Next"
            const nextBtn = document.querySelector('.btn-next-loader');
            if (nextBtn) nextBtn.style.display = 'none';
            
            // Cible les éléments de transition
            const loader = document.querySelector('.loader');
            const nav = document.getElementById('main-nav');

            // Fonction finale (ce qui se passe après le glitch, ou instantanément)
            const runFinalSteps = () => {
                // MODIFICATION : Si 'instant', on lève le drapeau
                if (instant) {
                    console.log("Skip-flag positionné pour scene3D.");
                    window.skipIntroAnimation = true; 
                }

                console.log("Glitch terminé ou skippé. Lancement de la scène 3D.");
                document.dispatchEvent(new CustomEvent('loaderFinished'));

                // document.body.style.overflow = 'auto';
                // document.documentElement.style.overflow = 'auto';

                anime({
                    targets: loader,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    duration: instant ? 500 : 2000, // Fondu plus rapide si "skip"
                    easing: 'easeInOutQuad'
                });

                anime({
                    targets: nav,
                    opacity: [0, 1],
                    duration: instant ? 500 : 1000,
                    easing: 'easeInOutQuad'
                });
            };

            // 2. Condition pour skipper le glitch
            if (instant) {
                console.log("Skip-to-scene. Lancement instantané.");
                
                // On met le wrapper en état "fini" (invisible)
                const glitchTarget = document.querySelector('.spinner-wrapper');
                if (glitchTarget) {
                     glitchTarget.style.opacity = 0;
                     glitchTarget.style.filter = 'blur(10px)';
                     glitchTarget.style.clipPath = 'inset(50% 50% 50% 50%)';
                }

                // On exécute la fin
                runFinalSteps();

            } else {
                glitchTimeline = anime.timeline({
                    duration: 2000,
                    easing: 'steps(4)',
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
                    clipPath: [
                        { value: 'inset(0% 0% 0% 0%)', duration: 200 },
                        { value: 'inset(20% 0% 60% 0%)', duration: 100 }, 
                        { value: 'inset(0% 0% 0% 0%)', duration: 200 },
                        { value: 'inset(50% 0% 30% 0%)', duration: 100 },
                        { value: 'inset(0% 0% 0% 0%)', duration: 300 },
                        { value: 'inset(50% 50% 50% 50%)', duration: 1100 }
                    ],
                });

                // À la fin du glitch, exécute la fin
                glitchTimeline.finished.then(() => {
                    
                    const wrapper = document.querySelector('.spinner-wrapper');
                    if (wrapper) {
                        // 1. On verrouille l'invisibilité manuellement
                        wrapper.style.setProperty('opacity', '0', 'important');
                    }

                    // 2. "Hack" du Timeout : On attend 50ms pour être SÛR que 
                    // le navigateur a bien pris en compte l'opacité 0
                    // AVANT de retirer le contrôle d'Anime.js (qui cause le flash).
                    setTimeout(() => {
                        console.log("Glitch terminé. Nettoyage sécurisé.");
                        anime.remove(targetsToGlitch);
                        runFinalSteps();
                    }, 50);
                });
            }
        } // --- Fin de la fonction startFinalTransition ---


        // 2. Lancer le timeout auto (appelle avec 'false')
        transitionTimeout = setTimeout(() => startFinalTransition(false), 8000); 

    }); // Fin de loaderTimeline.finished
});