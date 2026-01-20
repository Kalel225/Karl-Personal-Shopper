document.addEventListener('DOMContentLoaded', () => {
    // 1. Charger les commandes dès l'ouverture de la page
    fetchOrders();

    // 2. Fonction principale pour récupérer les données du serveur
    async function fetchOrders() {
        try {
            const response = await fetch('/api/orders');
            const orders = await response.json();
            renderOrders(orders);
        } catch (error) {
            console.error("Erreur lors de la récupération des commandes:", error);
            document.getElementById('ordersList').innerHTML = 
                '<tr><td colspan="7" class="text-center text-danger">Erreur de connexion au serveur.</td></tr>';
        }
    }

    // 3. Fonction pour afficher les commandes dans le tableau HTML
    function renderOrders(orders) {
        const list = document.getElementById('ordersList');
        list.innerHTML = ''; // On vide le tableau avant de le remplir

        if (orders.length === 0) {
            list.innerHTML = '<tr><td colspan="7" class="text-center">Aucune commande pour le moment.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const tr = document.createElement('tr');
            tr.className = "border-bottom border-secondary align-middle";
            
            // On définit la couleur du texte selon le statut
            const statusClass = getStatusClass(order.status);

            tr.innerHTML = `
                <td class="py-3">${new Date(order.date).toLocaleDateString()}</td>
                <td>
                    <strong>${order.nom}</strong><br>
                    <small class="text-info">${order.telephone}</small>
                </td>
                <td><small>${order.panier}</small></td>
                <td><span class="badge bg-light text-dark">${order.prix}</span></td>
                <td>
                    <select class="form-select form-select-sm bg-dark text-white border-secondary" 
                            onchange="updateOrderStatus('${order._id}', this.value)">
                        <option value="Traitement" ${order.status === 'Traitement' ? 'selected' : ''}>Traitement</option>
                        <option value="Livré" ${order.status === 'Livré' ? 'selected' : ''}>Livré</option>
                        <option value="Non livré" ${order.status === 'Non livré' ? 'selected' : ''}>Non livré</option>
                        <option value="Retourné" ${order.status === 'Retourné' ? 'selected' : ''}>Retourné</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm bg-transparent text-white border-secondary" 
                           value="${order.remarque || ''}" 
                           placeholder="Ajouter une note..."
                           onblur="updateOrderRemarque('${order._id}', this.value)">
                </td>
                <td>
                    <button onclick="downloadPDF('${order._id}')" class="btn btn-sm btn-outline-info">
                        📥 PDF
                    </button>
                </td>
            `;
            list.appendChild(tr);
        });
    }

    // 4. Utilitaires pour le style
    function getStatusClass(status) {
        switch (status) {
            case 'Livré': return 'text-success';
            case 'Non livré': return 'text-danger';
            case 'Retourné': return 'text-warning';
            default: return 'text-info';
        }
    }
});

// --- FONCTIONS GLOBALES (Appelées par les attributs onchange/onblur/onclick) ---

// Mettre à jour le statut dans la base de données
async function updateOrderStatus(id, newStatus) {
    await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    console.log(`Statut mis à jour : ${newStatus}`);
}

// Mettre à jour la remarque/raison du retour
async function updateOrderRemarque(id, text) {
    await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarque: text })
    });
    console.log(`Remarque mise à jour : ${text}`);
}

// Déclencher le téléchargement du PDF généré par le serveur
function downloadPDF(id) {
    window.open(`/api/download-pdf/${id}`, '_blank');
}
