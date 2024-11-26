//Import required libraries
// const express = require("express");
// const cors = require("cors");
// const stripe = require("stripe")("sk_test_51QF2SLF9QtEYmFjuCamSLPtVkyPtscNSr0hyGb3kqkMJ3OiCqwTt1sFEnuqAbW3ZTczOIeGRjAjlqNbOl1bQpC8T006TIPvm15"); // Replace with your secret key
// const admin = require("firebase-admin");
// const serviceAccount = require("/Users/arshiasalehi/my-app/src/DB/server.js");

// // Initialize Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// const db = admin.firestore();
// const app = express();
// app.use(express.json());
// app.use(cors());

// // Create a Stripe Checkout session
// app.post("/create-checkout-session", async (req, res) => {
//     const { amount, clientId } = req.body; // You send the amount and clientId from the frontend

//     // Create a new Checkout session
//     const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         line_items: [
//             {
//                 price_data: {
//                     currency: 'usd', // Replace with your currency
//                     product_data: {
//                         name: 'Wallet Top-Up',
//                     },
//                     unit_amount: amount * 100, // Amount in cents
//                 },
//                 quantity: 1,
//             },
//         ],
//         mode: 'payment',
//         success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: `${process.env.FRONTEND_URL}/cancel`,
//         metadata: { clientId }, // Store client ID for later reference
//     });

//     res.json({ id: session.id });
// });

// // Stripe Webhook to listen to payment status
// app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//         event = stripe.webhooks.constructEvent(req.body, sig, "whsec_YOUR_WEBHOOK_SECRET"); // Replace with your webhook secret
//     } catch (err) {
//         console.error("Webhook error:", err.message);
//         return res.status(400).send(`Webhook error: ${err.message}`);
//     }

//     // Handle successful payment intent
//     if (event.type === "payment_intent.succeeded") {
//         const paymentIntent = event.data.object;
//         const clientId = paymentIntent.metadata.clientId; // Retrieve the clientId from metadata
//         const amount = paymentIntent.amount_received / 100; // Convert amount to dollars

//         // Update the client’s wallet in Firestore
//         const clientRef = db.collection("clients").doc(clientId); // Assuming clients collection
//         const clientDoc = await clientRef.get();

//         if (clientDoc.exists) {
//             const currentWallet = clientDoc.data().wallet || 0;
//             await clientRef.update({ wallet: currentWallet + amount });

//             // Record the transaction in Firestore
//             const transactionRef = db.collection("transactions").doc();
//             await transactionRef.set({
//                 clientId,
//                 amount,
//                 paymentIntentId: paymentIntent.id,
//                 timestamp: admin.firestore.FieldValue.serverTimestamp(),
//                 status: "succeeded",
//             });
//         }
//     }

//     res.json({ received: true });
// });

// // Start the server
// const port = process.env.PORT || 4242;
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")("sk_test_51QF2SLF9QtEYmFjuCamSLPtVkyPtscNSr0hyGb3kqkMJ3OiCqwTt1sFEnuqAbW3ZTczOIeGRjAjlqNbOl1bQpC8T006TIPvm15"); // Replace with your Stripe Secret Key
const admin = require("firebase-admin");
const app = express();

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Replace if you’re using a custom path for Firebase credentials
    databaseURL: "https://coachmate-cd46e-default-rtdb.firebaseio.com" // Replace with your Firebase database URL
});
const db = admin.firestore();

// Middleware
app.use(cors());
app.use(express.json());

// Route to handle payment and create a record
app.post("/create-payment-intent", async (req, res) => {
    try {
        const { amount, userId } = req.body; // Assume userId is passed to associate payment with a user

        // Create a payment intent with the specified amount
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "usd",
            payment_method_types: ["card"], // Specify the payment methods you want (e.g., "card")
            automatic_payment_methods: { enabled: true },
        });
        console.log("Payment intent created:", paymentIntent);

        // Record the payment in Firebase
        const paymentRecord = {
            amount,
            userId,
            paymentIntentId: paymentIntent.id,
            currency: "usd",
            status: "created",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        console.log("Payment record:", paymentRecord);

        // Save the record in a collection, e.g., "payments"
        await db.collection("payments").add(paymentRecord);
        console.log("Payment record saved in Firebase:", paymentRecord);
        // Send the client secret to the frontend
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));