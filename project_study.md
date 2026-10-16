# BuildO Project Notes

BuildO is a React 18 and Vite single-page application backed by a Spring Boot 3.3.3 / Java 21 REST API.

## Main areas

- frontend/src/pages contains the landing, configurator, preset, cart, checkout, orders, and admin pages.
- frontend/src/api/client.js adds the JWT and calls the API under /api.
- frontend/src/context/AppContext.jsx owns the signed-in user, cart, custom build, and page navigation state.
- backend/src/main/java/com/buildo/controller contains the API controllers.
- backend/src/main/java/com/buildo/service contains compatibility, order, payment, and invoice logic.
- backend/src/main/java/com/buildo/config/DataInitializer.java seeds demo users, components, presets, and a sample order/invoice.

## Payment flow

1. An authenticated customer creates a BuildO order. The backend prices items from its component catalog.
2. The backend creates and stores a Razorpay order ID, using the BuildO order amount in INR paise.
3. The frontend opens Razorpay Standard Checkout with the returned public Key ID and Razorpay order ID.
4. The backend verifies the checkout signature and fetches the payment status before marking the BuildO order paid.
5. The signed webhook at POST /api/payment/razorpay/webhook reconciles captured, paid, and failed events.
6. A PDF invoice is available only after payment is recorded as paid.

Razorpay credentials are environment variables: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_WEBHOOK_SECRET. Do not commit real values. Docker Compose reads them from the root .env file.

## Data and access notes

- The default local profile uses file-backed H2 at ./data/buildodb.
- Docker Compose uses PostgreSQL; the backend has a PostgreSQL runtime driver.
- Catalog and configurator reads are public. Order, payment, and invoice routes require JWT authentication; the Razorpay webhook is publicly reachable but validates the Razorpay HMAC signature.
- Demo login accounts are listed in README.md.
