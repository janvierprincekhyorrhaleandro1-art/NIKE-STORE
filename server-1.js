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

// KREYE PEMAN MCC
app.use('/api/create-payment', express.json());
app.post('/api/create-payment', async (req, res) => {
    try {
        const { amount, referenceId } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Montan an pa valid' });
        }

        const response = await fetch('https://api.moncashconnect.com/v1/pay-create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MCC_SECRET}`,
                'Origin': `https://${DOMAIN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: Math.round(Number(amount)),
                referenceId: referenceId || `order_${Date.now()}`,
                returnUrl: `${SITE_URL}/cart.html`
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erè MCC:', data);
            return res.status(500).json({ error: data.message || 'Erè MonCashConnect' });
        }

        res.json({ paymentUrl: data.paymentUrl });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erè sèvè' });
    }
});

// WEBHOOK MCC (konfirmasyon peman)
app.post('/api/payment-webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const rawBody = req.body;
    const signature = req.headers['x-mcc-signature'];

    const expected = 'sha256=' + crypto
        .createHmac('sha256', MCC_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

    if (signature !== expected) {
        console.error('Siyati webhook pa valid!');
        return res.status(401).json({ error: 'Siyati pa valid' });
    }

    const event = JSON.parse(rawBody);
    console.log(`Peman ${event.event} — ref: ${event.reference} — ${event.amount} HTG`);

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sèvè MCC ap kouri sou pò ${PORT}`);
});
