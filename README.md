Here is the flow we will build. It's designed to be highly secure, as the user's credit card details will never touch our server.

User Action (Frontend): A user has a PENDING appointment and clicks a "Pay Now" button.

Request Payment Intent (Frontend -> Backend): The frontend sends the appointmentId to our NestJS backend (e.g., POST /payments/create-intent).

Create Payment Intent (Backend -> Stripe): Our backend receives the request, calculates the amount, and tells Stripe to create a payment session. Stripe returns a special, temporary key called a client_secret.

Return Client Secret (Backend -> Frontend): Our backend sends this client_secret back to the frontend.

Render Payment Form (Frontend): The frontend uses the client_secret with the Stripe.js library to render a secure, pre-built payment form (Stripe Elements).

User Pays (Frontend -> Stripe): The user enters their card details into the Stripe form. Stripe.js securely sends this information directly to Stripe's servers to confirm the payment.

Payment Confirmation (Stripe -> Backend): Stripe processes the payment and sends a Webhook (an automated notification) to a special endpoint on our backend to inform us if the payment was successful or failed.

Update Database (Backend): Our backend receives this secure webhook, verifies it came from Stripe, and then updates the appointment's status in our database to CONFIRMED.
