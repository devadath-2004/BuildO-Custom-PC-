package com.buildo.service;

import com.buildo.dto.PaymentVerificationResponse;
import com.buildo.dto.RazorpayOrderResponse;
import com.buildo.dto.RazorpayVerificationRequest;
import com.buildo.model.*;
import com.buildo.repository.InvoiceRepository;
import com.buildo.repository.OrderRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class PaymentService {

    private static final long VERIFICATION_AMOUNT_PAISE = 100L;

    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;

    @Value("${razorpay.verification-mode:false}")
    private boolean verificationMode;

    private volatile RazorpayClient razorpayClient;

    public PaymentService(OrderRepository orderRepository,
                          InvoiceRepository invoiceRepository,
                          OrderService orderService,
                          ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
        this.orderService = orderService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RazorpayOrderResponse createRazorpayOrder(Long buildoOrderId, String username, boolean admin) {
        Order order = orderService.getOrderByIdForUser(buildoOrderId, username, admin)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order is already paid.");
        }
        if (order.getFinalAmount() == null || order.getFinalAmount().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order total must be greater than zero.");
        }
        if (order.getPaymentStatus() == PaymentStatus.FAILED) {
            order.setPaymentStatus(PaymentStatus.PENDING);
            orderRepository.save(order);
        }

        long amountPaise;
        try {
            amountPaise = order.getFinalAmount().movePointRight(2).longValueExact();
        } catch (ArithmeticException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order total is not a valid INR amount.");
        }

        if (verificationMode) {
            return createVerificationRazorpayOrder(order);
        }

        String externalOrderId = order.getRazorpayOrderId();
        if (externalOrderId == null || externalOrderId.isBlank()) {
            JSONObject request = new JSONObject();
            request.put("amount", amountPaise);
            request.put("currency", "INR");
            request.put("receipt", order.getOrderNumber());
            request.put("notes", new JSONObject().put("buildo_order_id", order.getId()));

            try {
                com.razorpay.Order razorpayOrder = client().orders.create(request);
                externalOrderId = safeString(razorpayOrder.get("id"));
                if (externalOrderId.isBlank() || "null".equals(externalOrderId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                            "Razorpay did not return an order ID.");
                }
                order.setRazorpayOrderId(externalOrderId);
                orderRepository.save(order);
            } catch (RazorpayException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Could not create a Razorpay order. Please retry.", ex);
            }
        }

        return new RazorpayOrderResponse(
                order.getId(), keyId, externalOrderId, amountPaise, "INR",
                order.getCustomerName(), order.getCustomerEmail(), order.getCustomerPhone(), false);
    }

    public boolean isVerificationMode() {
        if (verificationMode) {
            requireTestKeyForVerification();
        }
        return verificationMode;
    }

    private RazorpayOrderResponse createVerificationRazorpayOrder(Order order) {
        requireTestKeyForVerification();

        String externalOrderId = order.getRazorpayVerificationOrderId();
        String refundStatus = order.getRazorpayVerificationRefundStatus();
        if ("REFUND_FAILED".equals(refundStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A previous ₹1 verification payment still needs its refund. Retry its verification before starting another one.");
        }

        if (externalOrderId == null || externalOrderId.isBlank()
                || "REFUND_INITIATED".equals(refundStatus)) {
            JSONObject request = new JSONObject();
            request.put("amount", 100);
            request.put("currency", "INR");
            request.put("receipt", "V-" + order.getId() + "-" + System.currentTimeMillis());
            request.put("notes", new JSONObject()
                    .put("buildo_order_id", order.getId())
                    .put("purpose", "razorpay_verification"));

            try {
                com.razorpay.Order razorpayOrder = client().orders.create(request);
                externalOrderId = safeString(razorpayOrder.get("id"));
                if (externalOrderId.isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                            "Razorpay did not return a verification order ID.");
                }
                order.setRazorpayVerificationOrderId(externalOrderId);
                order.setRazorpayVerificationPaymentId(null);
                order.setRazorpayVerificationRefundId(null);
                order.setRazorpayVerificationRefundStatus(null);
                orderRepository.save(order);
            } catch (RazorpayException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Could not create the ₹1 Razorpay verification order. Please retry.", ex);
            }
        }

        return new RazorpayOrderResponse(
                order.getId(), keyId, externalOrderId, 100, "INR",
                order.getCustomerName(), order.getCustomerEmail(), order.getCustomerPhone(), true);
    }

    private void requireTestKeyForVerification() {
        if (keyId == null || !keyId.startsWith("rzp_test_")
                || keySecret == null || keySecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "₹1 verification mode requires a configured Razorpay test key ID (rzp_test_...) and test secret. No live-key payment was started.");
        }
    }

    @Transactional
    public PaymentVerificationResponse verifyPayment(RazorpayVerificationRequest request,
                                                       String username, boolean admin) {
        Order order = orderService.getOrderByIdForUser(request.getBuildoOrderId(), username, admin)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));
        boolean verificationPayment = verificationMode
                && order.getRazorpayVerificationOrderId() != null
                && !order.getRazorpayVerificationOrderId().isBlank();
        String storedRazorpayOrderId = verificationPayment
                ? order.getRazorpayVerificationOrderId()
                : order.getRazorpayOrderId();
        if (storedRazorpayOrderId == null || storedRazorpayOrderId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Razorpay order is linked to this order.");
        }

        JSONObject attributes = new JSONObject();
        // Always use the order ID stored on the server as the signature source.
        attributes.put("razorpay_order_id", storedRazorpayOrderId);
        attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
        attributes.put("razorpay_signature", request.getRazorpaySignature());
        try {
            if (!Utils.verifyPaymentSignature(attributes, keySecret)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Razorpay signature verification failed.");
            }

            Payment payment = client().payments.fetch(request.getRazorpayPaymentId());
            String paymentId = safeString(payment.get("id"));
            String paymentOrderId = safeString(payment.get("order_id"));
            if (!storedRazorpayOrderId.equals(paymentOrderId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "The payment does not belong to this BuildO order.");
            }

            long expectedAmount = verificationPayment
                    ? 100L
                    : order.getFinalAmount().movePointRight(2).longValueExact();
            Object amountValue = payment.get("amount");
            if (!(amountValue instanceof Number) || ((Number) amountValue).longValue() != expectedAmount) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "The verified payment amount does not match the order total.");
            }
            if (!"INR".equalsIgnoreCase(safeString(payment.get("currency")))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment currency must be INR.");
            }

            if (verificationPayment) {
                return verifyAndRefundTestPayment(order, payment, paymentId, expectedAmount);
            }

            String gatewayStatus = safeString(payment.get("status"));
            PaymentMethod paymentMethod = mapPaymentMethod(safeString(payment.get("method")));

            if ("captured".equalsIgnoreCase(gatewayStatus)) {
                markPaid(order, paymentId, paymentMethod);
            } else if ("failed".equalsIgnoreCase(gatewayStatus)) {
                if (order.getPaymentStatus() != PaymentStatus.PAID) {
                    order.setPaymentStatus(PaymentStatus.FAILED);
                    order.setTransactionId(paymentId);
                    orderRepository.save(order);
                }
            } else if (order.getPaymentStatus() == PaymentStatus.FAILED) {
                order.setPaymentStatus(PaymentStatus.PENDING);
                order.setTransactionId(paymentId);
                orderRepository.save(order);
            }

            String invoiceNumber = invoiceRepository.findByOrderId(order.getId())
                    .map(Invoice::getInvoiceNumber).orElse(null);
            String message = order.getPaymentStatus() == PaymentStatus.PAID
                    ? "Payment captured and verified."
                    : "Payment is being confirmed. This page will update when Razorpay confirms capture.";
            return new PaymentVerificationResponse(
                    order.getId(), order.getOrderNumber(), order.getPaymentStatus().name(),
                    invoiceNumber, order.getFinalAmount(), message);
        } catch (RazorpayException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Could not verify the Razorpay payment.", ex);
        }
    }

    private PaymentVerificationResponse verifyAndRefundTestPayment(Order order, Payment payment,
                                                                    String paymentId, long amountPaise)
            throws RazorpayException {
        if (paymentId.equals(order.getRazorpayVerificationPaymentId())
                && "REFUND_INITIATED".equals(order.getRazorpayVerificationRefundStatus())) {
            return verificationResponse(order, "VERIFICATION_REFUND_INITIATED",
                    "Razorpay verification is complete. The ₹1 refund has already been requested; the BuildO order remains unpaid.");
        }

        String paymentStatus = safeString(payment.get("status"));
        if ("authorized".equalsIgnoreCase(paymentStatus)) {
            try {
                payment = client().payments.capture(paymentId,
                        new JSONObject().put("amount", amountPaise));
                paymentStatus = safeString(payment.get("status"));
            } catch (RazorpayException ex) {
                order.setRazorpayVerificationPaymentId(paymentId);
                order.setRazorpayVerificationRefundStatus("CAPTURE_FAILED");
                orderRepository.save(order);
                return verificationResponse(order, "VERIFICATION_CAPTURE_FAILED",
                        "Razorpay authorized the ₹1 test payment, but capture did not complete. Retry the status check before starting another payment.");
            }
        }

        if (!"captured".equalsIgnoreCase(paymentStatus)
                && !"refunded".equalsIgnoreCase(paymentStatus)) {
            if ("failed".equalsIgnoreCase(paymentStatus)) {
                return verificationResponse(order, "FAILED",
                        "Razorpay did not complete the ₹1 test payment. You can try again.");
            }
            return verificationResponse(order, "PENDING",
                    "Razorpay is still confirming the ₹1 test payment. Check again in a moment.");
        }

        Object amountRefundedValue = payment.get("amount_refunded");
        long amountRefunded = amountRefundedValue instanceof Number number
                ? number.longValue() : 0L;
        if (amountRefunded >= amountPaise) {
            order.setRazorpayVerificationPaymentId(paymentId);
            order.setRazorpayVerificationRefundStatus("REFUND_INITIATED");
            orderRepository.save(order);
            return verificationResponse(order, "VERIFICATION_REFUND_INITIATED",
                    "Razorpay verified the ₹1 test payment and reports it as fully refunded. The BuildO order remains unpaid.");
        }

        try {
            JSONObject refundRequest = new JSONObject()
                    .put("amount", amountPaise)
                    .put("notes", new JSONObject()
                            .put("buildo_order_id", order.getId())
                            .put("purpose", "razorpay_verification"));
            com.razorpay.Refund refund = client().payments.refund(paymentId, refundRequest);
            String refundId = safeString(refund.get("id"));
            if (refundId.isBlank()) {
                order.setRazorpayVerificationPaymentId(paymentId);
                order.setRazorpayVerificationRefundStatus("REFUND_FAILED");
                orderRepository.save(order);
                return verificationResponse(order, "VERIFICATION_REFUND_FAILED",
                        "The ₹1 payment was verified, but Razorpay did not return a refund ID. Keep this window open and retry the status check; do not start another payment.");
            }

            order.setRazorpayVerificationPaymentId(paymentId);
            order.setRazorpayVerificationRefundId(refundId);
            order.setRazorpayVerificationRefundStatus("REFUND_INITIATED");
            orderRepository.save(order);
            return verificationResponse(order, "VERIFICATION_REFUND_INITIATED",
                    "Razorpay verified the ₹1 test payment and accepted a full refund request (" + refundId + "). The BuildO order remains unpaid.");
        } catch (RazorpayException ex) {
            order.setRazorpayVerificationPaymentId(paymentId);
            order.setRazorpayVerificationRefundStatus("REFUND_FAILED");
            orderRepository.save(order);
            return verificationResponse(order, "VERIFICATION_REFUND_FAILED",
                    "The ₹1 payment was verified, but Razorpay could not start its refund. Keep this window open and retry the status check; do not start another payment.");
        }
    }

    private PaymentVerificationResponse verificationResponse(Order order, String status, String message) {
        return new PaymentVerificationResponse(
                order.getId(), order.getOrderNumber(), status, null, order.getFinalAmount(), message);
    }

    @Transactional
    public void processWebhook(byte[] rawBody, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Razorpay webhook secret is not configured.");
        }
        if (!isValidWebhookSignature(rawBody, signature)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Razorpay webhook signature.");
        }

        try {
            JsonNode root = objectMapper.readTree(rawBody);
            String event = root.path("event").asText("");
            JsonNode payment = root.path("payload").path("payment").path("entity");
            if (payment.isMissingNode()) {
                return;
            }

            String razorpayOrderId = payment.path("order_id").asText("");
            if (razorpayOrderId.isBlank()) {
                return;
            }
            Optional<Order> orderOpt = orderRepository.findByRazorpayOrderId(razorpayOrderId);
            if (orderOpt.isEmpty()) {
                return;
            }

            Order order = orderOpt.get();
            if ("payment.captured".equals(event)) {
                long amount = payment.path("amount").asLong(-1);
                long expectedAmount = order.getFinalAmount().movePointRight(2).longValueExact();
                String currency = payment.path("currency").asText("");
                if (amount != expectedAmount || !"INR".equalsIgnoreCase(currency)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Webhook payment amount or currency does not match the BuildO order.");
                }
                markPaid(order, payment.path("id").asText(""),
                        mapPaymentMethod(payment.path("method").asText("")));
            } else if ("payment.failed".equals(event) && order.getPaymentStatus() != PaymentStatus.PAID) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                order.setTransactionId(payment.path("id").asText(""));
                orderRepository.save(order);
            }
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Could not process the Razorpay webhook.", ex);
        }
    }

    private void markPaid(Order order, String paymentId, PaymentMethod paymentMethod) {
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            if (order.getTransactionId() != null && !order.getTransactionId().equals(paymentId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "A different Razorpay payment is already recorded for this order.");
            }
            return;
        }

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setTransactionId(paymentId);
        if (paymentMethod != null) {
            order.setPaymentMethod(paymentMethod);
        }
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        Invoice invoice = invoiceRepository.findByOrderId(order.getId())
                .orElseGet(() -> new Invoice(order,
                        "INV-" + order.getOrderNumber().replace("BO-", "")));
        invoice.setTransactionId(paymentId);
        invoice.setPaymentMethod(order.getPaymentMethod());
        invoiceRepository.save(invoice);
    }

    private PaymentMethod mapPaymentMethod(String method) {
        return switch (method.toLowerCase()) {
            case "upi" -> PaymentMethod.UPI;
            case "card" -> PaymentMethod.CARD;
            case "netbanking" -> PaymentMethod.NET_BANKING;
            case "wallet" -> PaymentMethod.WALLET;
            default -> null;
        };
    }

    private String safeString(Object value) {
        return value == null ? "" : value.toString();
    }

    private boolean isValidWebhookSignature(byte[] rawBody, String signature) {
        if (signature == null || signature.isBlank()) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = mac.doFinal(rawBody);
            byte[] supplied = HexFormat.of().parseHex(signature.trim());
            return MessageDigest.isEqual(expected, supplied);
        } catch (Exception ex) {
            return false;
        }
    }

    private RazorpayClient client() {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
        }
        if (razorpayClient == null) {
            synchronized (this) {
                if (razorpayClient == null) {
                    try {
                        razorpayClient = new RazorpayClient(keyId, keySecret);
                    } catch (RazorpayException ex) {
                        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                                "Could not initialize Razorpay.", ex);
                    }
                }
            }
        }
        return razorpayClient;
    }

}
