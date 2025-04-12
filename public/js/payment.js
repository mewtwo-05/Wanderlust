
const stripe = stripe('YOUR_STRIPE_PUBLISHABLE_KEY');

async function handlePayment(amount) {
  try {
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    
    const { clientSecret } = await response.json();
    
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement('card'),
        billing_details: {
          email: document.getElementById('email').value,
        },
      },
    });
    
    if (result.error) {
      console.error(result.error);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        // Handle successful payment
        window.location.href = '/booking-success';
      }
    }
  } catch (error) {
    console.error('Payment failed:', error);
  }
}
