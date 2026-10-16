package com.buildo.dto;

public class RazorpayOrderResponse {
    private final Long buildoOrderId;
    private final String keyId;
    private final String razorpayOrderId;
    private final long amount;
    private final String currency;
    private final boolean verificationMode;
    private final String customerName;
    private final String customerEmail;
    private final String customerPhone;

    public RazorpayOrderResponse(Long buildoOrderId, String keyId, String razorpayOrderId,
                                 long amount, String currency, String customerName,
                                 String customerEmail, String customerPhone,
                                 boolean verificationMode) {
        this.buildoOrderId = buildoOrderId;
        this.keyId = keyId;
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.currency = currency;
        this.verificationMode = verificationMode;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
    }

    public Long getBuildoOrderId() { return buildoOrderId; }
    public String getKeyId() { return keyId; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public long getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public boolean isVerificationMode() { return verificationMode; }
    public String getCustomerName() { return customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
}
