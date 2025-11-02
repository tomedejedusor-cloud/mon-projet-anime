// Fichier : EnvironnementCercle.js
import * as THREE from 'three';

// Exporte la classe pour qu'elle soit importable dans script.js
export class EnvironnementCercle {

    constructor() {
        // Crée un "groupe". C'est le conteneur principal pour cet environnement.
        // C'est ce groupe que nous positionnerons et animerons (scale)
        this.group = new THREE.Group();

        // --- DÉBUT : Code du cercle rouge (déplacé depuis script.js) ---

        // 1. Définir la géométrie (un anneau)
        const circleGeometry = new THREE.RingGeometry(0, 0.3, 10);

        // 2. Définir le matériau (rouge vif)
        const circleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            side: THREE.DoubleSide
        });
        
        // 3. Créer le Mesh (l'objet 3D)
        this.circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
        
        // 4. On l'ajoute à NOTRE groupe, pas à la scène
        this.group.add(this.circleMesh);

        // --- FIN : Code du cercle rouge ---
    }

    /**
     * Cette fonction est appelée à chaque frame (60fps) depuis la boucle animate()
     * de script.js.
     * Le 'deltaTime' est le temps écoulé depuis la dernière frame.
     */
    update(deltaTime) {
        
        // --- GESTION DES ANIMATIONS DÉPENDANT DU TEMPS ---

        // 1. Animation de rotation continue (déplacée depuis script.js)
        if (this.circleMesh) {
            // On utilise deltaTime pour une animation fluide
            // (1.0 = 1 rotation complète par seconde)
            this.circleMesh.rotation.z += 1.0 * deltaTime; 
        }
    }
}