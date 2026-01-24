document.addEventListener('DOMContentLoaded', () => {
    // 1. IndexedDB Initialisation
    let db;
    const request = indexedDB.open("KarlDB", 1);
    request.onupgradeneeded = e => e.target.result.createObjectStore("orders", {keyPath: "id", autoIncrement: true});
    request.onsuccess = e => db = e.target.result;

    // 2. Transition Loading -> Form après 3 secondes
    setTimeout(() => {
        document.getElementById('loading-view').style.opacity = '0';
        document.getElementById('sloganText').classList.add('move-left');
        document.getElementById('form-view').classList.add('active-slide');
    }, 3000);

    const form = document.getElementById('orderForm');
    const termsModal = new bootstrap.Modal(document.getElementById('termsModal'));

    form.onsubmit = (e) => {
        e.preventDefault();
        termsModal.show();
    };

    document.getElementById('btnAccept').onclick = async () => {
        termsModal.hide();
        const data = {
            nom: document.getElementById('nom').value,
            email: document.getElementById('email').value,
            panier: document.getElementById('panier').value,
            prix: document.getElementById('prix').value
        };

        // Envoi au serveur
        const res = await fetch('/api/submit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if(res.ok) {
            alert("Commande validée avec succès !");
            window.location.href = "about:blank"; // Ferme ou redirige
        } else {
            alert("Erreur, veuillez reprendre.");
            db.transaction("orders", "readwrite").objectStore("orders").clear();
            location.reload();
        }
    };
});
