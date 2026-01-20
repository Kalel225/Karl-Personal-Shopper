const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Connexion MongoDB (Assure-toi que MongoDB tourne sur ton Pop!_OS)
mongoose.connect('mongodb://localhost:27017/karlShopper')
    .then(() => console.log("Connecté à MongoDB"))
    .catch(err => console.log(err));

// Modèle de donnée
const Order = mongoose.model('Order', new mongoose.Schema({
    email: String, nom: String, telephone: String, lieu: String, panier: String, prix: String,
    status: { type: String, default: 'Traitement' },
    remarque: { type: String, default: '' },
    date: { type: Date, default: Date.now }
}));

// Configuration Email (À remplir avec tes accès)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'TON_EMAIL@gmail.com', pass: 'TON_MOT_DE_PASSE_APPLICATION' }
});

// Route : Envoi commande client
app.post('/api/submit', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();

        const doc = new PDFDocument();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers);
            await transporter.sendMail({
                from: 'Karl Personal Shopper',
                to: 'admin@karlshopper.com',
                subject: `Nouvelle Commande - ${order.nom}`,
                attachments: [{ filename: `Commande_${order.nom}.pdf`, content: pdfBuffer }]
            });
            res.json({ success: true });
        });
        doc.text(`COMMANDE DE : ${order.nom}\nArticles : ${order.panier}\nTotal : ${order.prix}`);
        doc.end();
    } catch (e) { res.status(500).json({ success: false }); }
});

// Routes : Dashboard Admin
app.get('/api/orders', async (req, res) => res.json(await Order.find().sort({date: -1})));
app.put('/api/orders/:id', async (req, res) => {
    await Order.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
});

app.listen(3000, () => console.log("Serveur lancé sur http://localhost:3000"));
