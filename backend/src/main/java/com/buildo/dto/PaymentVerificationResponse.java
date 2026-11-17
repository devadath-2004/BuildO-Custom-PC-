package com.buildo.dto;

import java.math.BigDecimal;

public class PaymentVerificationResponse {
    private final Long orderId;
    private final String orderNumber;
    private final String paymentStatus;
    private final String invoiceNumber;
    private final BigDecimal finalAmount;
    private final String message;
    private final boolean verificationReceiptEmailSent;
    private final boolean demoPayment;

    public PaymentVerificationResponse(Long orderId, String orderNumber, String paymentStatus,
                                       String invoiceNumber, BigDecimal finalAmount, String message,
                                       boolean verificationReceiptEmailSent, boolean demoPayment) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.paymentStatus = paymentStatus;
        this.invoiceNumber = invoiceNumber;
        this.finalAmount = finalAmount;
        this.message = message;
        this.verificationReceiptEmailSent = verificationReceiptEmailSent;
        this.demoPayment = demoPayment;
    }

    public Long getOrderId() { return orderId; }
    public String getOrderNumber() { return orderNumber; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public BigDecimal getFinalAmount() { return finalAmount; }
    public String getMessage() { return message; }
    public boolean isVerificationReceiptEmailSent() { return verificationReceiptEmailSent; }
    public boolean isDemoPayment() { return demoPayment; }
}
