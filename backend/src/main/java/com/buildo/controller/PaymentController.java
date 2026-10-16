package com.buildo.controller;

import com.buildo.dto.PaymentVerificationResponse;
import com.buildo.dto.RazorpayOrderRequest;
import com.buildo.dto.RazorpayOrderResponse;
import com.buildo.dto.RazorpayVerificationRequest;
import com.buildo.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/razorpay/config")
    public ResponseEntity<Map<String, Boolean>> getRazorpayConfig() {
        return ResponseEntity.ok(Map.of(
                "verificationMode", paymentService.isVerificationMode()));
    }

    @PostMapping("/razorpay/orders")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(
            @Valid @RequestBody RazorpayOrderRequest request,
            Authentication authentication) {
        RazorpayOrderResponse response = paymentService.createRazorpayOrder(
                request.getBuildoOrderId(),
                authentication.getName(),
                isAdmin(authentication));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(
            @Valid @RequestBody RazorpayVerificationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(paymentService.verifyPayment(
                request, authentication.getName(), isAdmin(authentication)));
    }

    @PostMapping(value = "/razorpay/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> receiveWebhook(
            @RequestBody byte[] rawBody,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        paymentService.processWebhook(rawBody, signature);
        return ResponseEntity.ok().build();
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
