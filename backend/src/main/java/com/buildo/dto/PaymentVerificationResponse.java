package com.buildo.dto;

import java.math.BigDecimal;

public class PaymentVerificationResponse {
    private final Long orderId;
    private final String orderNumber;
    private final String paymentStatus;
    private final String invoiceNumber;
    private final BigDecimal finalAmount;
    private final String message;

    public PaymentVerificationResponse(Long orderId, String orderNumber, String paymentStatus,
                                       String invoiceNumber, BigDecimal finalAmount, String message) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.paymentStatus = paymentStatus;
        this.invoiceNumber = invoiceNumber;
        this.finalAmount = finalAmount;
        this.message = message;
    }

    public Long getOrderId() { return orderId; }
    public String getOrderNumber() { return orderNumber; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public BigDecimal getFinalAmount() { return finalAmount; }
    public String getMessage() { return message; }
}
