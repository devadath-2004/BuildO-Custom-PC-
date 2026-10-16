package com.buildo.service;

import com.buildo.dto.CompatibilityCheckResponse;
import com.buildo.dto.CompatibilityIssue;
import com.buildo.model.Category;
import com.buildo.model.Component;
import com.buildo.repository.ComponentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class CompatibilityService {

    private final ComponentRepository componentRepository;

    public CompatibilityService(ComponentRepository componentRepository) {
        this.componentRepository = componentRepository;
    }

    public CompatibilityCheckResponse checkCompatibility(List<Long> componentIds) {
        List<Component> components = componentRepository.findAllById(componentIds);
        return evaluate(components);
    }

    public CompatibilityCheckResponse evaluate(List<Component> components) {
        CompatibilityCheckResponse response = new CompatibilityCheckResponse();
        response.setSelectedComponents(components);

        Map<Category, Component> map = new EnumMap<>(Category.class);
        BigDecimal subtotal = BigDecimal.ZERO;

        for (Component c : components) {
            map.put(c.getCategory(), c);
            if (c.getPrice() != null) {
                subtotal = subtotal.add(c.getPrice());
            }
        }

        // Pricing with 18% tax
        response.setSubtotal(subtotal);
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        response.setTaxAmount(tax);
        response.setTotalPrice(subtotal.add(tax).setScale(2, RoundingMode.HALF_UP));

        // Completeness check
        boolean complete = map.containsKey(Category.CPU) &&
                map.containsKey(Category.MOTHERBOARD) &&
                map.containsKey(Category.RAM) &&
                map.containsKey(Category.STORAGE) &&
                map.containsKey(Category.PSU) &&
                map.containsKey(Category.CABINET) &&
                map.containsKey(Category.COOLING);
        response.setCompleteBuild(complete);

        List<CompatibilityIssue> issues = new ArrayList<>();

        Component cpu = map.get(Category.CPU);
        Component mobo = map.get(Category.MOTHERBOARD);
        Component ram = map.get(Category.RAM);
        Component gpu = map.get(Category.GPU);
        Component psu = map.get(Category.PSU);
        Component cabinet = map.get(Category.CABINET);
        Component cooling = map.get(Category.COOLING);

        // 1. CPU <-> Motherboard Socket Check
        if (cpu != null && mobo != null) {
            if (cpu.getSocket() != null && mobo.getSocket() != null &&
                    !cpu.getSocket().equalsIgnoreCase(mobo.getSocket())) {
                issues.add(new CompatibilityIssue(
                        CompatibilityIssue.Severity.ERROR,
                        "CPU & Motherboard Socket Mismatch",
                        String.format("The selected CPU (%s) uses socket %s, but the Motherboard (%s) features socket %s.",
                                cpu.getName(), cpu.getSocket(), mobo.getName(), mobo.getSocket()),
                        cpu.getName(),
                        mobo.getName(),
                        String.format("Choose an %s motherboard or select a compatible %s processor.",
                                cpu.getSocket(), mobo.getSocket())
                ));
            }
        }

        // 2. RAM <-> Motherboard Type & Slots Check
        if (ram != null && mobo != null) {
            if (ram.getMemoryType() != null && mobo.getMemoryType() != null &&
                    !ram.getMemoryType().equalsIgnoreCase(mobo.getMemoryType())) {
                issues.add(new CompatibilityIssue(
                        CompatibilityIssue.Severity.ERROR,
                        "Memory Generation Incompatibility",
                        String.format("The selected RAM (%s) is %s, but the Motherboard (%s) only accepts %s memory modules.",
                                ram.getName(), ram.getMemoryType(), mobo.getName(), mobo.getMemoryType()),
                        ram.getName(),
                        mobo.getName(),
                        String.format("Select a %s RAM kit compatible with your motherboard.", mobo.getMemoryType())
                ));
            }

            if (ram.getMemorySlots() != null && mobo.getMemorySlots() != null &&
                    ram.getMemorySlots() > mobo.getMemorySlots()) {
                issues.add(new CompatibilityIssue(
                        CompatibilityIssue.Severity.ERROR,
                        "Insufficient RAM Slots",
                        String.format("Selected RAM kit has %d modules, but the motherboard only has %d RAM slots.",
                                ram.getMemorySlots(), mobo.getMemorySlots()),
                        ram.getName(),
                        mobo.getName(),
                        "Choose a 2-stick memory kit or an ATX motherboard with 4 DIMM slots."
                ));
            }
        }

        // 3. Power Draw Calculation and PSU Validation
        int cpuTdp = (cpu != null && cpu.getTdp() != null) ? cpu.getTdp() : 65;
        int gpuTdp = (gpu != null && gpu.getTdp() != null) ? gpu.getTdp() : 30; // Integrated/minimal graphics if no discrete GPU
        int coolingOverhead = (cooling != null && "AIO_LIQUID".equalsIgnoreCase(cooling.getCoolerType())) ? 25 : 10;
        int systemBaseOverhead = 75; // Motherboard chipset, RAM, NVMe SSDs, case fans

        int totalEstimatedWattage = cpuTdp + gpuTdp + coolingOverhead + systemBaseOverhead;
        int recommendedPsuWattage = (int) Math.ceil(totalEstimatedWattage * 1.25); // 25% safety overhead
        response.setTotalEstimatedWattage(totalEstimatedWattage);
        response.setRecommendedPsuWattage(recommendedPsuWattage);

        if (psu != null && psu.getWattage() != null) {
            int psuWatts = psu.getWattage();
            response.setSelectedPsuWattage(psuWatts);
            double utilization = Math.min(100.0, ((double) totalEstimatedWattage / psuWatts) * 100.0);
            response.setWattageUtilizationPercent(Math.round(utilization * 10.0) / 10.0);

            if (psuWatts < totalEstimatedWattage) {
                issues.add(new CompatibilityIssue(
                        CompatibilityIssue.Severity.ERROR,
                        "Critically Insufficient Power Supply",
                        String.format("Estimated system power draw is %dW, but the selected PSU (%s) is only rated for %dW. The PC will shut down or fail to POST.",
                                totalEstimatedWattage, psu.getName(), psuWatts),
                        psu.getName(),
                        "Entire System",
                        String.format("Upgrade to at least a %dW rated power supply.", recommendedPsuWattage)
                ));
            } else if (psuWatts < recommendedPsuWattage) {
                issues.add(new CompatibilityIssue(
                        CompatibilityIssue.Severity.WARNING,
                        "Low PSU Safety Headroom",
                        String.format("Estimated draw (%dW) is %.0f%% of your %dW PSU. High transient GPU power spikes can cause unexpected restarts under peak load.",
                                totalEstimatedWattage, utilization, psuWatts),
                        psu.getName(),
                        gpu != null ? gpu.getName() : "System Load",
                        String.format("For optimal 80+ efficiency and reliability, a %dW+ PSU is recommended.", recommendedPsuWattage)
                ));
            }
        }

        // 4. Cabinet <-> Motherboard Form Factor Check
        if (cabinet != null && mobo != null) {
            String supportedFactors = cabinet.getSupportedFormFactors();
            String moboFactor = mobo.getFormFactor();
            if (supportedFactors != null && moboFactor != null) {
                List<String> allowed = Arrays.asList(supportedFactors.toLowerCase().split("\\s*,\\s*"));
                if (!allowed.contains(moboFactor.toLowerCase())) {
                    issues.add(new CompatibilityIssue(
                            CompatibilityIssue.Severity.ERROR,
                            "Case & Motherboard Form Factor Conflict",
                            String.format("The case (%s) supports [%s], but the motherboard (%s) is %s and will not physically mount in this case.",
                                    cabinet.getName(), supportedFactors, mobo.getName(), moboFactor),
                            cabinet.getName(),
                            mobo.getName(),
                            "Select a mid-tower/full-tower cabinet that supports " + moboFactor + " motherboards."
                    ));
                }
            }
        }

        // 5. GPU Clearance in Cabinet
        if (cabinet != null && gpu != null) {
            if (cabinet.getLengthMm() != null && gpu.getLengthMm() != null &&
                    gpu.getLengthMm() > cabinet.getLengthMm()) {
                issues.add(new CompatibilityIssue(
                        CompatibilityIssue.Severity.ERROR,
                        "GPU Clearance Exceeded",
                        String.format("Graphics card length is %dmm, but the cabinet only supports GPUs up to %dmm.",
                                gpu.getLengthMm(), cabinet.getLengthMm()),
                        gpu.getName(),
                        cabinet.getName(),
                        "Select a more spacious cabinet or a compact dual-fan graphics card."
                ));
            }
        }

        // 6. Cooling Clearance in Cabinet
        if (cabinet != null && cooling != null) {
            if ("AIO_LIQUID".equalsIgnoreCase(cooling.getCoolerType())) {
                if (cabinet.getRadiatorSizeMm() != null && cooling.getRadiatorSizeMm() != null &&
                        cooling.getRadiatorSizeMm() > cabinet.getRadiatorSizeMm()) {
                    issues.add(new CompatibilityIssue(
                            CompatibilityIssue.Severity.ERROR,
                            "Liquid Cooling Radiator Does Not Fit",
                            String.format("AIO cooler has a %dmm radiator, but the cabinet max radiator support is %dmm.",
                                    cooling.getRadiatorSizeMm(), cabinet.getRadiatorSizeMm()),
                            cooling.getName(),
                            cabinet.getName(),
                            String.format("Choose a %dmm liquid cooler or a case with %dmm radiator support.",
                                    cabinet.getRadiatorSizeMm(), cooling.getRadiatorSizeMm())
                    ));
                }
            } else if ("AIR".equalsIgnoreCase(cooling.getCoolerType())) {
                if (cabinet.getCoolerHeightMm() != null && cooling.getCoolerHeightMm() != null &&
                        cooling.getCoolerHeightMm() > cabinet.getCoolerHeightMm()) {
                    issues.add(new CompatibilityIssue(
                            CompatibilityIssue.Severity.ERROR,
                            "Air Cooler Too Tall for Case",
                            String.format("CPU cooler height is %dmm, exceeding the cabinet side panel clearance of %dmm.",
                                    cooling.getCoolerHeightMm(), cabinet.getCoolerHeightMm()),
                            cooling.getName(),
                            cabinet.getName(),
                            "Choose a lower-profile air cooler or a wider chassis."
                    ));
                }
            }
        }

        boolean hasErrors = issues.stream().anyMatch(i -> i.getSeverity() == CompatibilityIssue.Severity.ERROR);
        boolean hasWarns = issues.stream().anyMatch(i -> i.getSeverity() == CompatibilityIssue.Severity.WARNING);

        response.setCompatible(!hasErrors);
        response.setHasWarnings(hasWarns);
        response.setIssues(issues);

        return response;
    }
}
