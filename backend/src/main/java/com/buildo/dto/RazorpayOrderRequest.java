package com.buildo.dto;

import jakarta.validation.constraints.NotNull;

public class RazorpayOrderRequest {
    @NotNull
    private Long buildoOrderId;

    public Long getBuildoOrderId() { return buildoOrderId; }
    public void setBuildoOrderId(Long buildoOrderId) { this.buildoOrderId = buildoOrderId; }
}
