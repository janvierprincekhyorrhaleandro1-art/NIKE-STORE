require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// KONFIGIRASYON CORS OPTIMIZE POU VERCEL AK LÒT FRONTEND
app.use(cors({
    origin: '*', // Aksepte demann ki soti nan nenpòt ki orijin (Vercel, Localhost, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    credentials: true
}));

// JERE PREFLIGHT REQUESTS (OPTIONS) POU EVITE BLOKAJ CORS
app.options('*', cors());

const MCC_SECRET = process.env.MCC_SECRET;
const MCC_WEBHOOK_SECRET = process.env.MCC_WEBHOOK_SECRET;
const SITE_URL = process.env.SITE_URL || 'https://hive-online.vercel.app';
const DOMAIN = process.env.DOMAIN || 'hive-online.vercel.app';

// MIDDLEWARE POU LOG REKÈT YO
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`\n--- [${new Date().toISOString()}] NOUVO REKÈT: ${req.method} ${req.path} ---`);
    }
    next();
});

// 1. KREYE PEMAN MONCASHCONNECT
app.use('/api/create-payment', express.json());
app.post('/api/create-payment', async (req, res) => {
    try {
        const { amount, referenceId } = req.body;

        console.log('📦 Payload ki rive sou sèvè a:', { amount, referenceId });

        if (!amount || Number(amount) <= 0) {
            console.warn('⚠️ Erè Validation: Montan an pa valid:', amount);
            return res.status(400).json({ error: 'Montan an pa valid' });
        }

        if (!MCC_SECRET || !DOMAIN) {
            console.error('❌ ERÈ GRAVE: ENV Variables (MCC_SECRET oswa DOMAIN) pa konfigire nan Render!');
            return res.status(500).json({ error: 'Konfigirasyon sèvè enkonplè (ENV missing)' });
        }

        const payload = {
            amount: Math.round(Number(amount)),
            referenceId: referenceId || `order_${Date.now()}`,
            returnUrl: `${SITE_URL}/cart.html`
        };

        console.log('🚀 N ap voye rekèt bay MonCashConnect API...');
        const response = await fetch('https://api.moncashconnect.com/v1/pay-create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MCC_SECRET}`,
                'Origin': `https://${DOMAIN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        console.log(`📥 Repons MCC (Status HTTP: ${response.status}):`, rawText);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseErr) {
            console.error('❌ Repons MCC a se pa yon JSON valid!');
            return res.status(500).json({ error: 'Repons MonCashConnect pa nan fòma JSON' });
        }

        // 👇 METE KÒD LA EGZAKTEMAN LA A (ANVAN IF !RESPONSE.OK A) 👇
        if (!response.ok) {
            console.error('❌ ERÈ NAN REKÈT PEMAN AN:');
            console.error('1. status:', response.status);
            console.error('2. rawText:', rawText);
            console.error('3. details:', data);

            return res.status(response.status).json({
                error: data.message || data.error || 'Erè MonCashConnect',
                mccDetails: data
            });
        }

        console.log('✅ Peman kreye avèk siksè! PaymentURL:', data.paymentUrl);
        res.json({ paymentUrl: data.paymentUrl });

    } catch (err) {
        console.error('💥 ERÈ SÈVÈ CATCH:', err.stack || err);
        res.status(500).json({ error: 'Erè sèvè teknik', details: err.message });
    }
});

// 2. WEBHOOK MONCASHCONNECT (Konfirmasyon peman)
app.post('/api/payment-webhook', express.raw({ type: 'application/json' }), (req, res) => {
    try {
        const rawBody = req.body;
        const signature = req.headers['x-mcc-signature'];

        console.log('🔔 Webhook Resevwa:', { signature });

        if (!MCC_WEBHOOK_SECRET) {
            console.error('❌ MCC_WEBHOOK_SECRET pa konfigire nan Render!');
            return res.status(500).json({ error: 'Webhook secret missing' });
        }

        const expected = 'sha256=' + crypto
            .createHmac('sha256', MCC_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        if (signature !== expected) {
            console.error('❌ Siyati webhook pa valid!');
            return res.status(401).json({ error: 'Siyati pa valid' });
        }

        const event = JSON.parse(rawBody);
        console.log(`🎉 PEMAN SIKSÈ: ${event.event} — Ref: ${event.reference} — Montan: ${event.amount} HTG`);

        res.sendStatus(200);
    } catch (err) {
        console.error('💥 Erè anndan Webhook:', err);
        res.status(500).json({ error: 'Erè nan tretman Webhook la' });
    }
});

// PÒ SÈVÈ A
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Sèvè MonCashConnect ap kouri sou pò ${PORT}`);
});