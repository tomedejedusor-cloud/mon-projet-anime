/* =================================== */
/* LOGIQUE DE LA PAGE PRINCIPALE       */
/* (Fichier: main.js)                  */
/* =================================== */

// Attend que toute la page soit chargée
document.addEventListener("DOMContentLoaded", function() {

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

                triggerGlitch();

                setTimeout(() => {
                    if(screenTitle) screenTitle.innerText = title;
                    if(screenDesc) screenDesc.innerHTML = desc;

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
                    if(textSpan) textSpan.innerText = "CLOSE_THE_ACCESS";
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



