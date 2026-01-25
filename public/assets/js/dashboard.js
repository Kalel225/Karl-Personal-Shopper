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

async function fetchOrders() {
    try {
        const response = await fetch('/api/orders'); // Récupère depuis MongoDB
        let orders = await response.json();
        
        // Tri : Plus récent en haut
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        renderTable(orders);
    } catch (error) {
        console.error("Erreur chargement", error);
    }
}

function renderTable(orders) {
    const list = document.getElementById('ordersList');
    list.innerHTML = '';

    orders.forEach((order, index) => {
        // Génération ID format "PS-2026-01-21-00045"
        const dateObj = new Date(order.date);
        const dateStr = dateObj.toISOString().split('T')[0]; // 2026-01-21
        const pseudoID = `PS-${dateStr}-${(1000 + index).toString()}`; // Faux ID séquentiel pour l'affichage

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="order-id">${pseudoID}</span></td>
            
            <td>
                <strong>${order.nom}</strong><br>
                <small class="text-white-50"><i class="bi bi-telephone"></i> ${order.telephone}</small>
            </td>
            
            <td>
                <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${order.panier}
                </div>
                <small class="text-info"><i class="bi bi-geo-alt"></i> ${order.lieu}</small>
            </td>
            
            <td>
                <div class="d-flex flex-column">
                    <span>Total: <strong>${order.prix} XOF</strong></span>
                    <small class="text-success">Versé: ${order.montant_verse}</small>
                    <small class="text-warning">Reste: ${order.montant_restant}</small>
                </div>
            </td>
            
            <td>${dateObj.toLocaleDateString()}</td>
            
            <td>
                <select onchange="updateStatus('${order._id}', this)" 
                        class="status-select" 
                        style="background-color: ${getStatusColor(order.status)}; color: #10153c;">
                    <option value="Traitement" ${order.status === 'Traitement' ? 'selected' : ''}>Traitement</option>
                    <option value="Livré" ${order.status === 'Livré' ? 'selected' : ''}>Livré</option>
                    <option value="Non Livré" ${order.status === 'Non Livré' ? 'selected' : ''}>Non Livré</option>
                    <option value="Retourné" ${order.status === 'Retourné' ? 'selected' : ''}>Retourné</option>
                </select>
            </td>
            
            <td>
                <button onclick="downloadPDF('${order._id}')" class="btn btn-sm btn-outline-light rounded-circle">
                    <i class="bi bi-download"></i>
                </button>
            </td>
        `;
        list.appendChild(tr);
    });
}

function getStatusColor(status) {
    switch(status) {
        case 'Livré': return '#96e676'; // Vert
        case 'Non Livré': return '#ff8a80'; // Rouge
        case 'Retourné': return '#ffcc80'; // Orange
        default: return '#e8d856'; // Jaune (Traitement)
    }
}

async function updateStatus(id, selectElement) {
    const newStatus = selectElement.value;
    // Change la couleur immédiatement
    selectElement.style.backgroundColor = getStatusColor(newStatus);
    
    // Envoi au serveur
    await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
}

function downloadPDF(id) {
    window.open(`/api/download-pdf/${id}`, '_blank');
}
