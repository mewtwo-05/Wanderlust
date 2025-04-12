const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'inr',
      payment_method_types: ['card'],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/payment', async (req, res) => {
    try {
      const { amount, token } = req.body;
      const charge = await stripe.charges.create({
        amount: amount,
        currency: 'usd',
        source: token.id,
        description: 'Payment for goods and services'
      });
      res.json({ message: 'Payment successful', charge });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Payment failed' });
    }
  });
  

module.exports = router;