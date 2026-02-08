const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connectDB() {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
    }
    return client.db("karl_db").collection("orders");
}

// 1. Récupérer toutes les commandes
app.get('/api/orders', async (req, res) => {
    const col = await connectDB();
    const orders = await col.find({}).sort({ date: -1 }).toArray();
    res.json(orders);
});

// 2. Créer une commande
app.post('/api/orders', async (req, res) => {
    const col = await connectDB();
    const newOrder = {
        ...req.body,
        date: new Date(),
        status: "En Traitement" // Statut par défaut
    };
    await col.insertOne(newOrder);
    res.json({ success: true });
});

// 3. Supprimer une commande
app.delete('/api/orders/:id', async (req, res) => {
    const col = await connectDB();
    await col.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
});

module.exports = app;