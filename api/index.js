const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const cors = require('cors');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB Atlas via la variable d'environnement
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connecté à MongoDB Atlas"))
  .catch(err => console.error("Erreur de connexion Atlas:", err));

// Modèle de Données
const OrderSchema = new mongoose.Schema({
    nom: String,
    telephone: String,
    lieu: String,
    panier: String,
    prix: Number,
    montant_verse: Number,
    montant_restant: Number,
    email: String,
    status: { type: String, default: 'Traitement' },
    date: { type: Date, default: Date.now }
});
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// Configurer le transporteur d'email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- ROUTES ---

// 1. Soumettre une commande
app.post('/api/submit-order', upload.array('captures'), async (req, res) => {
    try {
        const data = req.body;
        
        // Sauvegarde MongoDB
        const newOrder = new Order({
            ...data,
            prix: parseFloat(data.prix),
            montant_verse: parseFloat(data.montant_verse),
            montant_restant: parseFloat(data.montant_restant)
        });
        const savedOrder = await newOrder.save();

        // Email au Client (Politique)
        const mailClient = {
            from: `"Karl.&" <${process.env.EMAIL_USER}>`,
            to: data.email,
            subject: 'Confirmation de commande & Politique - Karl.&',
            html: `<h3>Bonjour ${data.nom},</h3>
                   <p>Votre commande a été enregistrée avec succès.</p>
                   <p><b>Détails du paiement :</b><br>
                   Total : ${data.prix} XOF<br>
                   Versé : ${data.montant_verse} XOF<br>
                   Reste à payer : ${data.montant_restant} XOF</p>
                   <p>Veuillez trouver nos conditions de vente en pièce jointe (ou dans la politique affichée sur le site).</p>`
        };
        await transporter.sendMail(mailClient);

        // Génération du PDF pour l'Admin (Karl)
        const doc = new PDFDocument();
        let chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(chunks);
            
            // Email à l'Admin avec le PDF
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL,
                subject: `NOUVELLE COMMANDE - ${data.nom}`,
                text: `Une nouvelle commande a été passée par ${data.nom}.`,
                attachments: [{ filename: `commande_${savedOrder._id}.pdf`, content: pdfBuffer }]
            });
        });

        doc.fontSize(20).text('FICHE DE COMMANDE KARL.&', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Client : ${data.nom}`);
        doc.text(`Téléphone : ${data.telephone}`);
        doc.text(`Lieu : ${data.lieu}`);
        doc.text(`Articles : ${data.panier}`);
        doc.moveDown();
        doc.text(`PRIX TOTAL : ${data.prix} XOF`);
        doc.text(`MONTANT VERSÉ : ${data.montant_verse} XOF`);
        doc.text(`RESTE A PAYER : ${data.montant_restant} XOF`, { underline: true });
        doc.end();

        res.status(201).json({ success: true, id: savedOrder._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors du traitement" });
    }
});

// 2. Récupérer toutes les commandes (Dashboard)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).send(error);
    }
});

// 3. Mettre à jour le statut
app.put('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.json({ success: true });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = app;
