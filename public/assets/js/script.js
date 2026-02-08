let pendingData = null; // Variable pour garder les infos en mémoire

// 1. Calcul automatique du Reste à payer
const prix = document.getElementById('prix');
const verse = document.getElementById('montant_verse');
const restant = document.getElementById('montant_restant');

function calcul() {
    const p = parseFloat(prix.value) || 0;
    const v = parseFloat(verse.value) || 0;
    restant.value = p - v;
}
prix.addEventListener('input', calcul);
verse.addEventListener('input', calcul);

// 2. Interception du formulaire -> Ouvre la Modal
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // On capture les données du formulaire
    const formData = new FormData(this);
    // Ajout manuel du montant restant car les champs disabled ne sont pas envoyés
    formData.append('montant_restant', restant.value);
    
    pendingData = formData; // On sauvegarde
    
    // Ouvre la modal
    const modal = new bootstrap.Modal(document.getElementById('policyModal'));
    modal.show();
});

// 3. Clic sur "J'ai lu et je comprends" -> Envoi BDD
document.getElementById('confirmPolicyBtn').addEventListener('click', async function() {
    
    // Fermer la modal
    const modalEl = document.getElementById('policyModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();

    // Envoyer au serveur
    try {
        // Note: Ici on simule l'envoi JSON pour Vercel (plus simple sans Multer)
        const dataObj = Object.fromEntries(pendingData.entries());
        
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObj)
        });

        if (response.ok) {
            // Affiche le Popup Succès
            document.getElementById('successPopup').style.display = 'block';
            
            // Attend 3 secondes et recharge
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } else {
            alert("Erreur lors de l'enregistrement.");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur de connexion.");
    }
});