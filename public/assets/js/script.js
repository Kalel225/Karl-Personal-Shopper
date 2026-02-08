console.log("Script chargé ✅"); // Pour vérifier que le JS se lance

// Variables globales
const form = document.getElementById('orderForm');
const modalEl = document.getElementById('policyModal');
const confirmBtn = document.getElementById('confirmPolicyBtn');
let finalData = {}; // On stocke les données ici en format simple

// 1. Calcul automatique ( inchangé )
function updateCalcul() {
    const prix = parseFloat(document.getElementById('prix').value) || 0;
    const verse = parseFloat(document.getElementById('montant_verse').value) || 0;
    document.getElementById('montant_restant').value = prix - verse;
}
document.getElementById('prix').addEventListener('input', updateCalcul);
document.getElementById('montant_verse').addEventListener('input', updateCalcul);

// 2. Quand on soumet le formulaire
form.addEventListener('submit', function(e) {
    e.preventDefault(); // On bloque le rechargement
    console.log("Formulaire soumis, ouverture modal...");

    // On capture TOUTES les données maintenant
    const formData = new FormData(form);
    
    // On convertit FormData en objet JSON simple pour éviter les erreurs d'envoi
    finalData = Object.fromEntries(formData.entries());
    // On force l'ajout du montant restant (souvent ignoré car readonly)
    finalData.montant_restant = document.getElementById('montant_restant').value;
    
    // Ajout de la date et statut par défaut
    finalData.date = new Date();
    finalData.status = "En Traitement";

    // Ouvrir la modal Bootstrap
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
});

// 3. Quand on clique sur CONFIRMER dans la modal
confirmBtn.addEventListener('click', async function() {
    console.log("Clic sur Confirmer détecté !");
    
    // Désactiver le bouton pour éviter double clic
    confirmBtn.disabled = true;
    confirmBtn.innerText = "Envoi en cours...";

    try {
        console.log("Envoi des données vers /api/orders...", finalData);
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData)
        });

        console.log("Réponse du serveur :", response.status);

        if (response.ok) {
            // A. Fermer la modal
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();

            // B. Afficher le Popup Succès
            const successPopup = document.getElementById('successPopup');
            successPopup.style.display = 'block';

            // C. Attendre et Recharger
            setTimeout(() => {
                window.location.reload(); // C'est ça qui réinitialise le formulaire
            }, 2000);

        } else {
            throw new Error("Erreur serveur " + response.status);
        }

    } catch (error) {
        console.error("ERREUR CRITIQUE :", error);
        alert("Erreur technique : " + error.message);
        confirmBtn.disabled = false;
        confirmBtn.innerText = "J'ai lu et je comprends";
    }
});