document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CALCUL AUTOMATIQUE ---
    const prixInput = document.getElementById('prix');
    const verseInput = document.getElementById('montant_verse');
    const restantInput = document.getElementById('montant_restant');

    function calculerRestant() {
        const prix = parseFloat(prixInput.value) || 0;
        const verse = parseFloat(verseInput.value) || 0;
        const restant = prix - verse;
        restantInput.value = restant > 0 ? restant : 0;
    }

    prixInput.addEventListener('input', calculerRestant);
    verseInput.addEventListener('input', calculerRestant);

    // --- 2. GESTION FICHIERS (Compteur) ---
    const fileInput = document.getElementById('captures');
    fileInput.addEventListener('change', () => {
        const count = fileInput.files.length;
        document.getElementById('file-count').textContent = count > 0 ? `${count} fichier(s) sélectionné(s)` : '';
    });

    // --- 3. SOUMISSION & POPUP ---
    const form = document.getElementById('orderForm');
    const policyModal = new bootstrap.Modal(document.getElementById('policyModal'));
    const closePolicyBtn = document.getElementById('closePolicyBtn');
    let orderDataCache = null; // Pour stocker les données temporairement

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Récupérer les données
        const formData = new FormData();
        const emailClient = document.getElementById('email').value;
        formData.append('email', emailClient);
        formData.append('nom', document.getElementById('nom').value);
        formData.append('telephone', document.getElementById('telephone').value);
        formData.append('lieu', document.getElementById('lieu').value);
        formData.append('panier', document.getElementById('panier').value);
        formData.append('prix', prixInput.value);
        formData.append('montant_verse', verseInput.value);
        formData.append('montant_restant', restantInput.value);
        
        for (let file of fileInput.files) {
            formData.append('captures', file);
        }

        orderDataCache = formData; // Stocker pour l'envoi

        // 2. Afficher le Popup Politique
        policyModal.show();
    });

    // --- 4. ACTION A LA FERMETURE DU POPUP ---
    // C'est ici que l'envoi réel se fait, comme demandé ("une fois le pop up fermé")
    document.getElementById('policyModal').addEventListener('hidden.bs.modal', async () => {
        if (!orderDataCache) return;

        // Afficher un petit indicateur de chargement si tu veux
        // alert("Envoi de la commande et du mail de politique...");

        try {
            // Envoi au serveur (MongoDB + Email Client + Email Admin)
            const response = await fetch('/api/submit-order', {
                method: 'POST',
                body: orderDataCache
            });

            if (response.ok) {
                // Sauvegarde IndexedDB (Backup local)
                saveToIndexedDB(orderDataCache);
                
                alert("Commande validée ! Un email contenant la politique vous a été envoyé.");
                window.location.reload(); // Ou redirection
            } else {
                alert("Erreur lors de l'envoi. Veuillez réessayer.");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur de connexion.");
        }
    });

    // --- 5. IndexedDB Helper ---
    function saveToIndexedDB(formData) {
        const request = indexedDB.open("KarlDB", 1);
        request.onupgradeneeded = e => {
            e.target.result.createObjectStore("orders", { keyPath: "id", autoIncrement: true });
        };
        request.onsuccess = e => {
            const db = e.target.result;
            // On convertit FormData en objet simple pour IDB
            const dataObj = {};
            formData.forEach((value, key) => dataObj[key] = value);
            dataObj.date = new Date().toISOString();
            
            db.transaction("orders", "readwrite").objectStore("orders").add(dataObj);
        };
    }
});
