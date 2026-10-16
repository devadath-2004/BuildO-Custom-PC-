# BuildO: A Custom PC Configuration and Recommendation System with Integrated Payment and Billing

BuildO is a full-stack e-commerce and computer engineering web platform that allows users to hand-pick PC components with real-time hardware compatibility validation and dynamic power estimation, or choose from workload-optimized curated presets. It includes Razorpay Standard Checkout, server-side payment verification, signed payment webhooks, PDF invoices, order tracking, and an administrator portal.

---

## 🚀 Quick Start & Access URLs

- **Integrated Application URL**: [http://localhost:8080/](http://localhost:8080/)
- **Vite Frontend Dev URL**: [http://localhost:5173/](http://localhost:5173/)
- **Embedded Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (default JDBC URL: `jdbc:h2:file:./data/buildodb`, User: `sa`, Password: empty)

### 👤 Demo Credentials

| Role | Username / Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | `alex@example.com` or `customer` | `customer123` | Build custom rigs, browse presets, checkout, pay, download PDF invoices, track orders |
| **Administrator** | `admin@buildo.pc` or `admin` | `admin123` | Full access: manage components catalog, manage presets, view all customer orders, update delivery status |

---

## 🛠️ Architecture & Technology Stack

```
BuildO Project Root (.)
├── backend/                              # Spring Boot 3.3.3 + Java 21 Application
│   ├── pom.xml                           # Maven dependencies (JPA, Security, JJWT, OpenPDF, Razorpay, H2/MySQL)
│   ├── src/main/java/com/buildo/
│   │   ├── config/DataInitializer.java   # Seeds 60+ hardware parts, 7 presets, demo accounts
│   │   ├── controller/                   # REST controllers (Auth, Catalog, Presets, Configurator, Orders, Payment, Invoices, Admin)
│   │   ├── dto/                          # Request/Response data transfer objects
│   │   ├── model/                        # JPA Entities (User, Component, Preset, Order, OrderItem, Invoice)
│   │   ├── repository/                   # Spring Data JPA repositories
│   │   ├── security/                     # Spring Security 6 & JWT Token Filter
│   │   └── service/
│   │       ├── CompatibilityService.java # Core hardware compatibility & wattage rules engine
│   │       ├── InvoicePdfService.java    # OpenPDF vector tax invoice generator
│   │       ├── OrderService.java         # Order calculations & status updates
│   │       └── PaymentService.java       # Razorpay orders, signature verification, webhooks
│   └── src/main/resources/
│       ├── application.properties        # Default profile: H2 in MySQL compatibility mode
│       └── application-mysql.properties  # Standalone MySQL 8/9 configuration
└── frontend/                             # React 18 + Vite 5 + Tailwind CSS SPA
    ├── package.json                      # React, Lucide icons, Tailwind
    ├── vite.config.js                    # Reverse proxy to backend on /api
    └── src/
        ├── api/client.js                 # Unified API client with JWT bearer handling
        ├── components/
        │   ├── CompatibilityHUD.jsx      # Live socket badge, PSU power meter, conflict alerts
        │   ├── ComponentSelectorModal.jsx# Component drawer with compatibility badges & search
        │   ├── PaymentGatewayModal.jsx   # Personal UPI QR and Razorpay Checkout
        │   └── InvoiceView.jsx           # High quality tax invoice with PDF download & print
        ├── context/AppContext.jsx        # Global state (Cart, CustomBuild, User, Notifications)
        └── pages/
            ├── HomePage.jsx              # Landing page, dual-path overview, features
            ├── ConfiguratorPage.jsx      # 8-slot custom builder with sticky pricing sidebar
            ├── PresetsPage.jsx           # Curated recommendations (Gaming, Studio, Video, Office)
            ├── CartPage.jsx              # Cart review, quantity, promo coupon codes
            ├── CheckoutPage.jsx          # Shipping address & payment trigger
            ├── OrdersPage.jsx            # Order history with real-time status progress timeline
            └── AdminPage.jsx             # Catalog inventory manager & order status fulfillment
```

---

## ⚡ Key Modules Implemented

1. **User Authentication Module (8.1)**:
   - Secure JWT token-based authentication.
   - Dual-role permissions: `ROLE_CUSTOMER` and `ROLE_ADMIN`.
   - 1-click demo login buttons in modal for instant testing.

2. **Custom PC Configuration Module (8.2)**:
   - 8 distinct component categories: CPU, Motherboard, RAM, Storage, GPU, PSU, Cabinet, Cooling.
   - Dynamic add, replace, and remove capabilities.

3. **Preset Recommendation Module (8.3)**:
   - Curated builds for Gaming, Studio/3D, Video Editing, and Office.
   - "Customize Preset" button seamlessly loads preset parts into the Custom Configurator as a baseline.

4. **Hardware Compatibility Engine (8.4)**:
   - CPU <-> Motherboard socket matching (e.g. LGA1700 vs AM5).
   - RAM generation matching (DDR5 vs DDR4) and DIMM slot count checks.
   - Power budget estimation: CPU TDP + GPU TDP + Cooling overhead + 75W base overhead, with 25% recommended PSU headroom check.
   - Cabinet form factor check (verifies case mounts the motherboard format, e.g. ATX vs Micro-ATX).
   - Cooling radiator & air cooler physical clearance verification.

5. **Price Calculation Module (8.5)**:
   - Dynamic running subtotal, itemized line totals, 18% GST calculation, and promo coupon discounts (`BUILDO10`, `PCBUILDER`).

6. **Cart & Order Module (8.6)**:
   - Preserves custom builds and presets with itemized breakdowns.
   - Checkout form capturing shipping name, email, phone, and street address.

7. **Payment Gateway Module (8.7)**:
   - Razorpay Standard Checkout handles available methods such as UPI, cards, net banking, and wallets.
   - The backend creates a Razorpay order from its own calculated order total, verifies the checkout signature, and confirms captured payment status.
   - Signed `payment.captured` and `payment.failed` webhooks reconcile payment state if the customer leaves checkout.

8. **Billing & PDF Invoice Module (8.8)**:
   - Generates official tax invoices with unique `INV-XXXXXX` numbers.
   - Uses OpenPDF library to output clean, vector PDF documents (`GET /api/invoices/{orderId}/download`).

9. **Order Tracking & History Module (8.9)**:
   - Visual 4-stage fulfillment progress bar: `Confirmed` -> `Processing (Assembly & Benchmarking)` -> `Shipped` -> `Delivered`.
   - Lookup orders by customer email or order reference.

10. **Admin Management Module (8.10)**:
    - Real-time revenue, total orders, and catalog statistics.
    - Full CRUD for hardware components.
    - One-click fulfillment status updater that advances customer orders through assembly and shipping stages.

---

## Installation and Setup

### Prerequisites

- JDK 21
- Maven 3.9 or later
- Node.js 20 or later with npm
- A Razorpay account with Test Mode API keys
- Docker Desktop only if using the Docker option below

### 1. Configure Razorpay Test Mode

Create Test Mode API keys in the Razorpay Dashboard, then set the values in the terminal that will run the backend:

```powershell
$env:RAZORPAY_KEY_ID = "rzp_test_your_key_id"
$env:RAZORPAY_KEY_SECRET = "your_test_key_secret"
$env:RAZORPAY_WEBHOOK_SECRET = "your_webhook_secret"
$env:BUILDO_JWT_SECRET = "replace-with-a-random-secret-at-least-32-characters-long"
```

Keep the Key Secret and webhook secret on the server. Never commit real credentials.

The project defaults to the ₹1 verification flow. BuildO creates a ₹1 Razorpay **test-mode** payment, verifies it on the server, requests a full refund, and leaves the BuildO order unpaid without creating an invoice. This mode refuses live Razorpay keys. Test mode simulates payments and does not debit or return real money. Set `RAZORPAY_VERIFICATION_MODE=false` only when intentionally switching to full-order checkout.

When configured, the checkout offers **Show personal UPI QR · ₹1** using `VITE_UPI_ID` and `VITE_UPI_PAYEE_NAME`. The QR is generated locally from a UPI payment link; it does not use Razorpay or require extra Razorpay keys. Scanning transfers real money directly to that UPI account. BuildO cannot automatically detect or refund this direct payment, so verify and refund it manually in your UPI app; the BuildO order stays unpaid. The separate Razorpay Standard Checkout test flow remains available for simulated gateway testing. Razorpay documents simulated UPI test payments using `success@razorpay` and `failure@razorpay`; test mode does not debit real money. See [Razorpay's test-mode payment guidance](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/gravity-forms/integration-steps/) and [NPCI's UPI QR payment fields](https://www.npci.org.in/PDF/npci/upi/circular/2017/Circular18_BankCompliances_to_enbaleUPIMerchantecosystem_0.pdf).

### Personal UPI QR configuration

Copy `frontend/.env.example` to `frontend/.env.local`, then set your own `VITE_UPI_ID` and `VITE_UPI_PAYEE_NAME`. The QR option is hidden until both values are configured. `.env.local` is ignored by Git, so receiver details stay out of commits. For Docker Compose, set the same `VITE_` values in the root `.env` file before building the frontend image.

In **Command Prompt**, use `set "RAZORPAY_VERIFICATION_MODE=true"`. In **PowerShell**, use `$env:RAZORPAY_VERIFICATION_MODE = "true"`.

### Configure account verification email

The sign-up flow sends a six-digit code through SMTP. Without sender credentials, it now returns a clear configuration error instead of claiming the email was sent. For Gmail, use your Gmail address and a Google App Password; do not use your normal account password.

Set these values in the same terminal window that starts the backend, replacing the sample values with your own:

**PowerShell:**

```powershell
$env:SPRING_MAIL_HOST = "smtp.gmail.com"
$env:SPRING_MAIL_PORT = "587"
$env:SPRING_MAIL_USERNAME = "your_email@gmail.com"
$env:SPRING_MAIL_PASSWORD = "your_16_character_app_password"
$env:SPRING_MAIL_FROM = "your_email@gmail.com"
```

**Command Prompt (cmd.exe):**

```bat
set "SPRING_MAIL_HOST=smtp.gmail.com"
set "SPRING_MAIL_PORT=587"
set "SPRING_MAIL_USERNAME=your_email@gmail.com"
set "SPRING_MAIL_PASSWORD=your_16_character_app_password"
set "SPRING_MAIL_FROM=your_email@gmail.com"
```

After setting them, start the backend in that same terminal using the commands in the next section. If you run with Docker Compose, put the SMTP values in the root `.env` file instead. `BUILDO_OTP_DEVELOPMENT_FALLBACK=true` is an optional local-only mode that skips SMTP and displays the OTP in the app; keep it `false` when testing actual email delivery. Restart the backend after changing environment variables.

For a safer PowerShell setup that keeps the app password out of command history and project files, stop any backend already using port 8080, open PowerShell, and run:

```powershell
Set-Location ".\backend"
.\run-with-email-otp.ps1
```

The script asks for the SMTP host, port, sender email, and app password (the password prompt is hidden), then starts the backend with email OTP enabled. Gmail requires a Google App Password, which requires 2-Step Verification on the account. See [Google's App Password help](https://support.google.com/mail/answer/185833?hl=en).

### 2. Install and start the backend

In the same terminal where you set the mail values, go to the backend folder and start Spring Boot. Maven downloads the Java dependencies, including the Razorpay Java SDK declared in `backend/pom.xml`.

**PowerShell:**

```powershell
Set-Location ".\backend"
$env:BUILDO_JWT_SECRET = "$([guid]::NewGuid())$([guid]::NewGuid())"
mvn spring-boot:run
```

**Command Prompt (cmd.exe):**

```bat
cd /d ".\backend"
set "BUILDO_JWT_SECRET=replace-with-a-unique-random-secret-at-least-32-characters-long"
mvn spring-boot:run
```

The API starts at `http://localhost:8080`. JWT signing uses the random secret set in that terminal. Keep it private and stable for as long as you want existing login tokens to remain valid.

### 3. Install and start the frontend

Open a second PowerShell window:

```powershell
Set-Location ".\frontend"
npm ci
npm run dev
```

Open `http://localhost:5173`, sign in, add a build to your cart, and continue to checkout. The frontend loads Razorpay Checkout from Razorpay's hosted script, so there is no Razorpay npm package to install.

### 4. Configure webhooks

For deployed use, configure a Razorpay webhook URL ending in `/api/payment/razorpay/webhook` and subscribe to `payment.captured` and `payment.failed`. Copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET`. A local Razorpay webhook needs a publicly reachable HTTPS URL, such as a development tunnel; checkout signature and payment status are verified by the backend even without a webhook during local testing.

Enable automatic payment capture in the Razorpay Dashboard. BuildO marks an order paid and creates its invoice only after Razorpay reports the payment as captured.

### Docker option

From the project root, copy `.env.example` to `.env`, replace the sample values with your Razorpay Test Mode credentials, and run:

```powershell
Copy-Item .env.example .env
# Edit .env and set POSTGRES_PASSWORD and BUILDO_JWT_SECRET before running.
# Add Razorpay and SMTP credentials only if you want those features enabled.
docker compose up --build
```

Open `http://localhost` for the containerized frontend. The frontend and backend need no additional Razorpay package installation.
