package com.buildo.dto;

import com.buildo.model.Component;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CompatibilityCheckResponse {
    private boolean isCompatible = true;
    private boolean hasWarnings = false;
    private boolean isCompleteBuild = false;
    private int totalEstimatedWattage = 0;
    private int recommendedPsuWattage = 0;
    private Integer selectedPsuWattage;
    private double wattageUtilizationPercent = 0.0;

    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal taxAmount = BigDecimal.ZERO;
    private BigDecimal totalPrice = BigDecimal.ZERO;

    private List<CompatibilityIssue> issues = new ArrayList<>();
    private List<Component> selectedComponents = new ArrayList<>();

    public CompatibilityCheckResponse() {}

    public boolean isCompatible() { return isCompatible; }
    public void setCompatible(boolean compatible) { isCompatible = compatible; }

    public boolean isHasWarnings() { return hasWarnings; }
    public void setHasWarnings(boolean hasWarnings) { this.hasWarnings = hasWarnings; }

    public boolean isCompleteBuild() { return isCompleteBuild; }
    public void setCompleteBuild(boolean completeBuild) { isCompleteBuild = completeBuild; }

    public int getTotalEstimatedWattage() { return totalEstimatedWattage; }
    public void setTotalEstimatedWattage(int totalEstimatedWattage) { this.totalEstimatedWattage = totalEstimatedWattage; }

    public int getRecommendedPsuWattage() { return recommendedPsuWattage; }
    public void setRecommendedPsuWattage(int recommendedPsuWattage) { this.recommendedPsuWattage = recommendedPsuWattage; }

    public Integer getSelectedPsuWattage() { return selectedPsuWattage; }
    public void setSelectedPsuWattage(Integer selectedPsuWattage) { this.selectedPsuWattage = selectedPsuWattage; }

    public double getWattageUtilizationPercent() { return wattageUtilizationPercent; }
    public void setWattageUtilizationPercent(double wattageUtilizationPercent) { this.wattageUtilizationPercent = wattageUtilizationPercent; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public List<CompatibilityIssue> getIssues() { return issues; }
    public void setIssues(List<CompatibilityIssue> issues) { this.issues = issues; }

    public List<Component> getSelectedComponents() { return selectedComponents; }
    public void setSelectedComponents(List<Component> selectedComponents) { this.selectedComponents = selectedComponents; }
}
