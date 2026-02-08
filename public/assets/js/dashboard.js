document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();

    // Fonction de copie du lien
    window.copyLink = function() {
        const copyText = document.getElementById("shareLink");
        copyText.select();
        document.execCommand("copy");
        alert("Lien copié !"); // Tu pourras remplacer ça par une petite notif stylée plus tard
    }
});

async function loadOrders() {
    try {
        const res = await fetch('/api/orders');
        const orders = await res.json();
        const tbody = document.getElementById('ordersTableBody');
        tbody.innerHTML = '';

        orders.forEach(order => {
            const tr = document.createElement('tr');
            // État par défaut "Traitement"
            const status = order.status || '<span class="badge bg-warning text-dark">En Traitement</span>';
            
            tr.innerHTML = `
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>${order.nom}</td>
                <td>${order.panier}</td>
                <td>${order.prix}</td>
                <td>${order.montant_verse}</td>
                <td class="fw-bold text-danger">${order.montant_restant}</td>
                <td>${status}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="alert('PDF Généré!')">📄 PDF</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order._id}')">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erreur chargement", error);
    }
}

async function deleteOrder(id) {
    if(confirm("⚠️ Confirmer la suppression définitive ?")) {
        await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        loadOrders(); // Recharge le tableau
    }
}

// Charger au démarrage
loadOrders();