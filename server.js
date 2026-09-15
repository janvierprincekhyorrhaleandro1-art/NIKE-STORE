require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const SITE_URL = process.env.SITE_URL || 'http://localhost:5500';

// ROUT POU KREYE YON PEMAN NAN NOWPAYMENTS
app.post('/api/create-payment', async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Montan an pa valid' });
        }

        const response = await fetch('https://api.nowpayments.io/v1/invoice', {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                price_amount: Number(amount),
                price_currency: 'usd',
                order_id: orderId || `order_${Date.now()}`,
                order_description: 'Kòmand sou Findora',
                success_url: `${SITE_URL}/catalog.html`,
                cancel_url: `${SITE_URL}/cart.html`
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erè NOWPayments:', data);
            return res.status(500).json({ error: data.message || 'Erè NOWPayments' });
        }

        // data.invoice_url se paj peman an kote kliyan chwazi crypto li epi voye kòb la
        res.json({ invoice_url: data.invoice_url });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erè sèvè' });
    }
});

// ROUT POU NOWPAYMENTS KONFIME PEMAN AN (IPN WEBHOOK) - OPSYONÈL MEN RECOMANDE
app.post('/api/payment-webhook', (req, res) => {
    // Isit ou ka verifye siyati a (HMAC-SHA512 ak IPN_SECRET ou)
    // epi mete kòmand kliyan an "peye" nan sistèm ou lè status === 'finished'
    console.log('Notifikasyon NOWPayments resevwa:', req.body);
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sèvè peman ap kouri sou pò ${PORT}`);
});
