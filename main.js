/* =================================== */
/* LOGIQUE DE LA PAGE PRINCIPALE       */
/* (Fichier: main.js)                  */
/* =================================== */

// Attend que toute la page soit chargée
document.addEventListener("DOMContentLoaded", function() {

    /* =================================== */
    /* 0. PRÉCHARGEMENT DES VIDÉOS (NOUVEAU) */
    /* =================================== */
    function preloadTacticalVideos() {
        console.log("Démarrage du préchargement des vidéos tactiques...");
        const videoCards = document.querySelectorAll('.hud-card[data-type="video"]');
        
        // Détection mobile pour éviter de tuer le forfait data
        // Si tu as bien compressé tes vidéos (< 2Mo), tu peux enlever cette condition
        const isMobile = window.innerWidth < 768; 
        
        videoCards.forEach(card => {
            const videoUrl = card.dataset.src;
            
            if (videoUrl) {
                // On utilise 'fetch' pour récupérer le fichier complet
                fetch(videoUrl)
                    .then(response => response.blob()) // On le transforme en "Blob" (objet binaire)
                    .then(videoBlob => {
                        // On crée une URL locale (ex: blob:http://monsite/1234-5678...)
                        const objectUrl = URL.createObjectURL(videoBlob);
                        
                        // MAGIE : On remplace l'URL distante par l'URL locale en mémoire
                        // Quand l'utilisateur cliquera, ce sera INSTANTANÉ.
                        card.dataset.src = objectUrl;
                        
                        console.log(`Vidéo préchargée en mémoire : ${videoUrl}`);
                    })
                    .catch(err => console.error("Erreur préchargement vidéo", err));
            }
        });
    }

    // On lance le préchargement tout de suite, pendant que le loader tourne
    preloadTacticalVideos();




    // 1. Cherche TOUS les panneaux cliquables
    const clickablePanels = document.querySelectorAll('.panel-2d--clickable');
    const clickableCircleImages = document.querySelectorAll('.neon-circle-image--clickable');
    const allClickableElements = [...clickablePanels, ...clickableCircleImages];



    // 2. Ajoute un écouteur d'événement à chacun
    allClickableElements.forEach(element => { // Ancien: clickablePanels.forEach(panel => {
        
        element.addEventListener('click', () => { // Ancien: panel.addEventListener('click', () => {
            const url = element.dataset.href; // Ancien: const url = panel.dataset.href;
            
            if (url) {
                console.log(`Ouverture de : ${url}`);
                window.open(url, '_blank');
            }
        });
    }); 

});


    /* =================================== */
    /* LOGIQUE HUD / TACTICAL SCREEN       */
    /* =================================== */
    
    const hudCards = document.querySelectorAll('.hud-card');
    const screenWrapper = document.getElementById('tactical-wrapper');
    const contentLayer = document.getElementById('tactical-content-layer'); // NOUVEAU
    
    const screenImg = document.getElementById('screen-img');
    const screenVideo = document.getElementById('screen-video');
    const screenTitle = document.getElementById('screen-title');
    const screenDesc = document.getElementById('screen-desc');
    const screenLink = document.getElementById('screen-link');

    function triggerGlitch() {
        if(contentLayer) {
            contentLayer.classList.remove('glitch-anim');
            void contentLayer.offsetWidth; 
            contentLayer.classList.add('glitch-anim');
        }
    }

    // Fonction pour fermer l'écran tactique (revenir au mode 3D)
    function closeTacticalScreen() {
        if(screenWrapper) screenWrapper.classList.remove('active-mode'); // Pour le CSS
        if(contentLayer) contentLayer.style.display = 'none';
        if(screenVideo) screenVideo.pause();
        
        // On désactive toutes les cartes
        hudCards.forEach(c => c.classList.remove('active'));
    }

    // Fonction pour ouvrir l'écran tactique (Mode Projet)
    function openTacticalScreen() {
        if(screenWrapper) screenWrapper.classList.add('active-mode');
        if(contentLayer) contentLayer.style.display = 'block';
    }

    if (hudCards.length > 0) {
        // État initial : On s'assure que c'est fermé (donc 3D visible)
        closeTacticalScreen();

        hudCards.forEach(card => {
            card.addEventListener('click', () => {
                
                // CAS 1 : Clic sur carte déjà active -> On ferme (retour 3D)
                if (card.classList.contains('active')) {
                    closeTacticalScreen();
                    return; 
                }

                // CAS 2 : Nouvelle carte -> On ouvre le contenu
                hudCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                // On affiche le layer de contenu
                openTacticalScreen();

                // Récupère les infos
                const type = card.dataset.type; 
                const src = card.dataset.src;
                const title = card.dataset.title;
                const desc = card.dataset.desc;
                const linkUrl = card.dataset.link;

                triggerGlitch();

                setTimeout(() => {
                    if(screenTitle) screenTitle.innerText = title;
                    if(screenDesc) screenDesc.innerHTML = desc;

                    if(screenLink) {
                        if (linkUrl) {
                            screenLink.style.display = 'inline-block';
                            screenLink.href = linkUrl;
                        } else {
                            screenLink.style.display = 'none'; // Cache le bouton si pas de rapport
                        }
                    }

                    if (type === 'video') {
                        if(screenImg) screenImg.style.display = 'none';
                        if(screenVideo) {
                            screenVideo.style.display = 'block';
                            screenVideo.src = src;
                            screenVideo.play();
                        }
                    } else {
                        if(screenVideo) {
                            screenVideo.pause();
                            screenVideo.style.display = 'none';
                        }
                        if(screenImg) {
                            screenImg.style.display = 'block';
                            screenImg.src = src;
                        }
                    }
                }, 100);
            });
        });
    }

    /* =================================== */
    /* LOGIQUE INTERNSHIP LOGS (ACCORDÉON) */
    /* =================================== */

    const expandButtons = document.querySelectorAll('.cyber-btn-expand');

    expandButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const targetPanel = document.getElementById(targetId);

            if (targetPanel) {
                // Toggle la classe "open"
                targetPanel.classList.toggle('open');

                // Change le texte du bouton pour le feedback
                const textSpan = btn.querySelector('.btn-text');
                if (targetPanel.classList.contains('open')) {
                    if(textSpan) textSpan.innerText = "CLOSE";
                    btn.style.borderColor = "#fff";
                } else {
                    // Remet le texte d'origine (un peu simplifié ici)
                    if(textSpan) textSpan.innerText = targetId === 'log-2' ? "ACCESS_REPORT_DATA" : "ACCESS_REPORT";
                    btn.style.borderColor = ""; // Reset couleur
                }
            }
        });
    });

    /* =================================== */
    /* LOGIQUE CERTIFICATIONS (TERMINAL)   */
    /* =================================== */
    
    const certTrigger = document.getElementById('cert-trigger');
    const certLinks = document.getElementById('cert-links');
    const certHead = document.querySelector('.cert-terminal-head');
    const statusText = document.querySelector('.term-status');
    const btnText = document.querySelector('.cert-trigger-btn .btn-text');

    if (certTrigger && certLinks) {
        certTrigger.addEventListener('click', () => {
            // 1. Bascule la classe "open" sur le conteneur de liens
            certLinks.classList.toggle('open');
            
            // 2. Change le style du header (Bordure active)
            certHead.classList.toggle('unlocked');

            // 3. Met à jour le texte selon l'état
            if (certLinks.classList.contains('open')) {
                statusText.innerText = "OPENED";
                btnText.innerText = "HIDE";
                certTrigger.style.borderColor = "var(--neon-red)";
                certTrigger.style.color = "var(--neon-red)";
            } else {
                statusText.innerText = "CLOSED";
                btnText.innerText = "CERTIFICATES_LIST";
                certTrigger.style.borderColor = "";
                certTrigger.style.color = "";
            }
        });
    }


    /* =================================== */
    /* NETTOYAGE FORCÉ LORS DE LA NAV      */
    /* =================================== */
    
    const navLinks = document.querySelectorAll('#main-nav a');
    const loaderElement = document.querySelector('.loader');
    const textContainer = document.querySelector('.text-container'); // Cible spécifique

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // 1. On cache brutalement le conteneur de texte qui gêne
            if (textContainer) {
                textContainer.style.display = 'none';
                textContainer.style.opacity = '0';
            }

            // 2. On s'assure que le loader entier disparaisse peu après (si ce n'est pas déjà fait)
            if (loaderElement) {
                // On laisse un tout petit délai pour une transition douce si souhaité, 
                // ou on met 'none' direct pour être sûr.
                loaderElement.style.display = 'none';
            }

            // 3. On s'assure que le scroll est bien libre
            document.body.style.overflow = 'auto';
        });




    /* =================================== */
    /* LOGIQUE SKILLS MODAL                */
    /* =================================== */

    const skillCards = document.querySelectorAll('.skill-card');
    const modalOverlay = document.getElementById('skill-modal-overlay');
    const closeModalBtn = document.getElementById('close-skill-modal');
    
    // Éléments internes de la modale à mettre à jour
    const mTitle = document.getElementById('modal-title');
    const mDesc = document.getElementById('modal-desc');
    const mImg = document.getElementById('modal-img');
    const mLink = document.getElementById('modal-link');
    const mLinkContainer = document.querySelector('.modal-footer'); // Le conteneur du lien

    // 1. Fonction pour ouvrir la modale
    function openSkillModal(card) {
        // Récupération des données depuis les attributs HTML
        // CORRECTION ICI : 'card' au lieu de 'cars'
        const title = card.getAttribute('data-title');
        const desc = card.getAttribute('data-desc');
        const project = card.getAttribute('data-project');
        const link = card.getAttribute('data-link');
        
        // Récupération de l'image (c'est l'enfant <img> de .skill-icon-wrapper)
        // On cherche l'image à l'intérieur de la carte cliquée
        const imgIconTag = card.querySelector('img');
        const imgIconSrc = imgIconTag ? imgIconTag.src : '';

        // Injection des données dans la modale
        if(mTitle) mTitle.innerText = title;
        if(mDesc) mDesc.innerHTML = desc; // innerHTML permet de mettre des <br> si besoin
        if(mImg) mImg.src = imgIconSrc;
        
        // Gestion du lien "Linked Project"
        if (project && project.trim() !== "") {
            // Si on a un nom de projet
            if(mLink) {
                mLink.innerText = project;
                mLink.href = link || "#"; // Lien par défaut si vide
                
                // Si le lien est vide ou #, on le rend non cliquable visuellement
                if(!link || link === '#') {
                    mLink.style.pointerEvents = 'none';
                    mLink.style.opacity = '0.5';
                    mLink.style.textDecoration = 'none';
                } else {
                    mLink.style.pointerEvents = 'auto';
                    mLink.style.opacity = '1';
                    mLink.style.textDecoration = 'underline';
                }
            }
            if(mLinkContainer) mLinkContainer.style.display = 'flex'; // Affiche le footer
        } else {
            // Pas de projet lié
            if(mLinkContainer) mLinkContainer.style.display = 'none'; // Cache le footer
        }

        // Affichage
        if(modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Empêche le scroll derrière
        }
    }

    // 2. Fonction pour fermer
    function closeSkillModal() {
        if(modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = 'auto'; // Réactive le scroll
        }
    }

    // 3. Attachement des événements
    skillCards.forEach(card => {
        card.addEventListener('click', () => openSkillModal(card));
    });

    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', closeSkillModal);
    }

    // Fermer en cliquant en dehors de la carte (sur le fond sombre)
    if(modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeSkillModal();
            }
        });
    }

    // Fermer avec la touche Echap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeSkillModal();
        }
    });













    /* =================================== */
    /* LOGIQUE SKILLS (NEURAL GRID)        */
    /* =================================== */

    // const neuralNodes = document.querySelectorAll('.neural-node');

    // if (neuralNodes.length > 0) {
    //     const observerOptions = {
    //         threshold: 0.1 
    //     };

    //     const nodesObserver = new IntersectionObserver((entries, observer) => {
    //         entries.forEach((entry, index) => {
    //             if (entry.isIntersecting) {
    //                 setTimeout(() => {
    //                     entry.target.style.opacity = "1";
    //                     entry.target.style.transform = "translateY(0)";
    //                 }, index * 100); 

    //                 observer.unobserve(entry.target);
    //             }
    //         });
    //     }, observerOptions);

    //     neuralNodes.forEach(node => {
    //         node.style.opacity = "0";
    //         node.style.transform = "translateY(20px)";
    //         node.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            
    //         nodesObserver.observe(node);
    //     });
    // }


    /* =================================== */
    /* LOGIQUE D'APPARITION UNIFIÉE        */
    /* (Skills, Tools, Domains, Refs...)   */
    /* =================================== */

    // 1. Liste de tous les éléments à animer
    const animatedElements = document.querySelectorAll(
        '.neural-node, ' +          // Section Skills (Grid)
        '.mission-file, ' +         // section stages
        '.cert-node-container, ' +  // Section Certifications (Le gros bloc)
        '.skill-card, ' +           // Section Tools (Les cartes rectangulaires)
        '.domain-card, ' +          // Section Domains (Les cartes carrées dorées)
        '.ref-card, ' +             // Section References (Les avis)
        '.contact-terminal'         // Section Contact (Le terminal final)
    );

    if (animatedElements.length > 0) {
        const observerOptions = {
            threshold: 0.3 // Déclenche dès que 10% de l'élément est visible
        };

        const elementsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Petit délai en cascade (stagger effect)
                    // L'index ici correspond aux éléments qui entrent *en même temps* dans l'écran
                    setTimeout(() => {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, index * 200); // 150ms de délai entre chaque carte pour bien voir l'effet

                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            // État initial (Invisible + Décalé vers le bas)
            el.style.opacity = "0";
            el.style.transform = "translateY(30px)"; // Un peu plus bas pour un effet plus marqué
            
            // Transition fluide
            // cubic-bezier pour un effet plus "organique" et moins robotique
            el.style.transition = "opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            
            elementsObserver.observe(el);
        });
    }















    /* Optimisation : Pause vidéo intelligente */
    const bgVideo = document.getElementById('bg-video-z1');
    const zone1 = document.getElementById('zone-1'); // Le conteneur de la vidéo

    if (bgVideo && zone1) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Si la zone 1 n'est plus visible (ratio 0), on pause
                if (!entry.isIntersecting) {
                    bgVideo.pause();
                    // Optionnel : on peut réduire la charge 3D ici aussi si besoin
                } else {
                    // Si on revient dessus, on relance
                    bgVideo.play().catch(e => console.log("Lecture auto bloquée par le navigateur"));
                }
            });
        }, { 
            threshold: 0 // Se déclenche quand il ne reste que 10% de la vidéo visible
        });

        videoObserver.observe(zone1);
    }



















    /* =================================== */
    /* EFFET JOYSTICK (3D TILT) - CONTACT  */
    /* =================================== */
    
    const terminalPanel = document.querySelector('.contact-terminal');

    if (terminalPanel) {
        // Configuration de l'intensité du mouvement
        const maxRotation = 5; // Degrés maximum de rotation (10 est subtil et classe)
        
        // 1. Quand la souris bouge SUR le panneau
        terminalPanel.addEventListener('mousemove', (e) => {
            const rect = terminalPanel.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            // Calcul de la position de la souris par rapport au centre (de -1 à 1)
            // 0 = centre, -1 = gauche/haut, 1 = droite/bas
            const mouseX = (e.clientX - rect.left) / width - 0.5;
            const mouseY = (e.clientY - rect.top) / height - 0.5;

            // Calcul de la rotation inversée pour l'effet "Joystick"
            // Si je vais à droite (mouseX > 0), je tourne sur l'axe Y vers la droite
            // Si je vais en bas (mouseY > 0), je tourne sur l'axe X vers le bas (négatif pour "tirer")
            const rotateY = mouseX * maxRotation * 2; // *2 pour amplifier un peu
            const rotateX = mouseY * maxRotation * -2; // Négatif pour que ça suive la souris naturellement

            // Application du style en temps réel (sans délai)
            // On ajoute 'perspective' pour l'effet 3D
            terminalPanel.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                scale(1.02)
            `;
        });

        // 2. Quand la souris QUITTE le panneau (Retour ressort)
        terminalPanel.addEventListener('mouseleave', () => {
            // On remet à zéro
            terminalPanel.style.transform = `
                perspective(1000px) 
                rotateX(0deg) 
                rotateY(0deg) 
                scale(1)
            `;
        });

        // 3. Gestion de la fluidité (Transition)
        // On veut que ça soit instantané quand on bouge (pas de lag)
        // Mais que ça revienne doucement quand on sort (effet ressort)
        terminalPanel.addEventListener('mouseenter', () => {
            terminalPanel.style.transition = 'none'; // Pas de délai à l'entrée
        });

        terminalPanel.addEventListener('mouseleave', () => {
            terminalPanel.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'; // Effet élastique à la sortie
        });
    }




    





    /* =================================== */
    /* AUTO-LOOP : RETOUR EN HAUT (INFINITE) */
    /* =================================== */
    
    let isScrollingUp = false;

    window.addEventListener('scroll', () => {
        // Calcul pour savoir si on est en bas de page
        // (Hauteur fenêtre + Scroll actuel) >= Hauteur totale du document - petite marge
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 5) {
            
            // Empêche de déclencher l'événement plusieurs fois d'affilée
            if (!isScrollingUp) {
                isScrollingUp = true;
                
                console.log("Fin de page atteinte. Retour à la base.");
                
                // On attend une demi-seconde pour que l'utilisateur voie le bas
                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth' // Le scroll sera fluide (animation)
                    });
                    
                    // On libère le verrou après l'animation (disons 2 secondes)
                    setTimeout(() => { isScrollingUp = false; }, 2000);
                }, 500);
            }
        }
    });

});
