require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());

const MCC_SECRET = process.env.MCC_SECRET;
const MCC_WEBHOOK_SECRET = process.env.MCC_WEBHOOK_SECRET;
const SITE_URL = process.env.SITE_URL || 'http://localhost:5500';
const DOMAIN = process.env.DOMAIN;

// MIDDLEWARE POU VÈRIFYE ENV VARIABLES LÈ SÈVÈ A TAPE AP/CALL
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`\n--- [${new Date().toISOString()}] NOUVO REKÈT: ${req.method} ${req.path} ---`);
    }
    next();
});

// KREYE PEMAN MCC
app.use('/api/create-payment', express.json());
app.post('/api/create-payment', async (req, res) => {
    try {
        const { amount, referenceId } = req.body;

        console.log('📦 Payload ki rive sou sèvè a:', { amount, referenceId });

        if (!amount || Number(amount) <= 0) {
            console.warn('⚠️ Erè Validation: Montan an pa valid:', amount);
            return res.status(400).json({ error: 'Montan an pa valid' });
        }

        // Tcheke si Env Variables yo egziste
        if (!MCC_SECRET || !DOMAIN) {
            console.error('❌ ERÈ GRAVE: ENV Variables (MCC_SECRET oswa DOMAIN) pa konfigire nan Render!');
            console.log('MCC_SECRET Present:', !!MCC_SECRET);
            console.log('DOMAIN Present:', !!DOMAIN, `(Valè: "${DOMAIN}")`);
            return res.status(500).json({ error: 'Konfigirasyon sèvè enkonplè (ENV missing)' });
        }

        const payload = {
            amount: Math.round(Number(amount)),
            referenceId: referenceId || `order_${Date.now()}`,
            returnUrl: `${SITE_URL}/cart.html`
        };

        console.log('🚀 N ap voye rekèt bay MonCashConnect API...');
        console.log('URL: https://api.moncashconnect.com/v1/pay-create');
        console.log('Headers Sent:', {
            'Authorization': `Bearer ${MCC_SECRET ? MCC_SECRET.substring(0, 8) + '...' : 'UNDEFINED'}`,
            'Origin': `https://${DOMAIN}`,
            'Content-Type': 'application/json'
        });
        console.log('Body Sent:', JSON.stringify(payload));

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
        console.log(`📥 Repons MCC (Status HTTP: ${response.status} ${response.statusText}):`);
        console.log('Raw Response Body:', rawText);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseErr) {
            console.error('❌ Repons MCC a se pa yon JSON valid!');
            return res.status(500).json({ error: 'Repons MonCashConnect pa nan fòma JSON' });
        }

        if (!response.ok) {
            console.error('❌ MCC Reponn ak yon ERÈ HTTP:', response.status);
            console.error('Detay Erè MCC:', data);
            return res.status(response.status).json({
                error: data.message || data.error || 'Erè MonCashConnect',
                mccDetails: data
            });
        }

        console.log('✅ Peman kreye avèk siksè! PaymentURL:', data.paymentUrl);
        res.json({ paymentUrl: data.paymentUrl });

    } catch (err) {
        console.error('💥 ERÈ SEVÈ CATCH (Crash/Network):', err.stack || err);
        res.status(500).json({ error: 'Erè sèvè baray teknik', details: err.message });
    }
});

// WEBHOOK MCC (konfirmasyon peman)
app.post('/api/payment-webhook', express.raw({ type: 'application/json' }), (req, res) => {
    try {
        const rawBody = req.body;
        const signature = req.headers['x-mcc-signature'];

        console.log('🔔 Webhook Reçus:', { signature, rawBodyLength: rawBody ? rawBody.length : 0 });

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
            console.log('Siyati resevwa:', signature);
            console.log('Siyati ki t ap tann lan:', expected);
            return res.status(401).json({ error: 'Siyati pa valid' });
        }

        const event = JSON.parse(rawBody);
        console.log(`🎉 PEMAN SIKSÈ: ${event.event} — ref: ${event.reference} — ${event.amount} HTG`);

        res.sendStatus(200);
    } catch (err) {
        console.error('💥 Erè anndan Webhook:', err);
        res.status(500).json({ error: 'Webhook processing error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Sèvè MCC ap kouri sou pò ${PORT}`);
});