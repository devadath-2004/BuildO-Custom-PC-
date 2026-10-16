package com.buildo.controller;

import com.buildo.dto.UpdateOrderStatusRequest;
import com.buildo.model.*;
import com.buildo.repository.ComponentRepository;
import com.buildo.repository.OrderRepository;
import com.buildo.repository.PresetRepository;
import com.buildo.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final ComponentRepository componentRepository;
    private final PresetRepository presetRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public AdminController(ComponentRepository componentRepository,
                           PresetRepository presetRepository,
                           OrderRepository orderRepository,
                           OrderService orderService) {
        this.componentRepository = componentRepository;
        this.presetRepository = presetRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    // Component Management
    @PostMapping("/components")
    public ResponseEntity<Component> createComponent(@RequestBody Component component) {
        return ResponseEntity.ok(componentRepository.save(component));
    }

    @PutMapping("/components/{id}")
    public ResponseEntity<Component> updateComponent(@PathVariable Long id, @RequestBody Component updated) {
        return componentRepository.findById(id)
                .map(comp -> {
                    comp.setName(updated.getName());
                    comp.setCategory(updated.getCategory());
                    comp.setBrand(updated.getBrand());
                    comp.setModel(updated.getModel());
                    comp.setPrice(updated.getPrice());
                    comp.setImageUrl(updated.getImageUrl());
                    comp.setDescription(updated.getDescription());
                    comp.setSocket(updated.getSocket());
                    comp.setFormFactor(updated.getFormFactor());
                    comp.setSupportedFormFactors(updated.getSupportedFormFactors());
                    comp.setMemoryType(updated.getMemoryType());
                    comp.setMemorySlots(updated.getMemorySlots());
                    comp.setMemorySpeedMhz(updated.getMemorySpeedMhz());
                    comp.setWattage(updated.getWattage());
                    comp.setTdp(updated.getTdp());
                    comp.setEfficiencyRating(updated.getEfficiencyRating());
                    comp.setLengthMm(updated.getLengthMm());
                    comp.setCoolerHeightMm(updated.getCoolerHeightMm());
                    comp.setRadiatorSizeMm(updated.getRadiatorSizeMm());
                    comp.setCoolerType(updated.getCoolerType());
                    comp.setInStock(updated.getInStock());
                    return ResponseEntity.ok(componentRepository.save(comp));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/components/{id}")
    public ResponseEntity<?> deleteComponent(@PathVariable Long id) {
        if (!componentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        componentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Component deleted successfully"));
    }

    // Preset Management
    @PostMapping("/presets")
    public ResponseEntity<Preset> createPreset(@RequestBody Preset preset) {
        return ResponseEntity.ok(presetRepository.save(preset));
    }

    @PutMapping("/presets/{id}")
    public ResponseEntity<Preset> updatePreset(@PathVariable Long id, @RequestBody Preset updated) {
        return presetRepository.findById(id)
                .map(p -> {
                    p.setName(updated.getName());
                    p.setCategory(updated.getCategory());
                    p.setDescription(updated.getDescription());
                    p.setTargetResolutionOrUse(updated.getTargetResolutionOrUse());
                    p.setBasePrice(updated.getBasePrice());
                    p.setDiscountPercent(updated.getDiscountPercent());
                    p.setImageUrl(updated.getImageUrl());
                    if (updated.getComponents() != null) {
                        p.setComponents(updated.getComponents());
                    }
                    return ResponseEntity.ok(presetRepository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/presets/{id}")
    public ResponseEntity<?> deletePreset(@PathVariable Long id) {
        if (!presetRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        presetRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Preset deleted successfully"));
    }

    // Orders and Tracking Progression
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateOrderStatusRequest request) {
        Order updated = orderService.updateOrderStatus(id, request.getStatus(), request.getTrackingNumber());
        return ResponseEntity.ok(updated);
    }

    // Admin Dashboard Statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        List<Order> orders = orderRepository.findAll();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        Map<OrderStatus, Long> statusCounts = new EnumMap<>(OrderStatus.class);

        for (OrderStatus st : OrderStatus.values()) {
            statusCounts.put(st, 0L);
        }

        for (Order order : orders) {
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                totalRevenue = totalRevenue.add(order.getFinalAmount());
            }
            statusCounts.put(order.getStatus(), statusCounts.getOrDefault(order.getStatus(), 0L) + 1);
        }

        long totalComponents = componentRepository.count();
        long totalPresets = presetRepository.count();

        return ResponseEntity.ok(Map.of(
                "totalRevenue", totalRevenue,
                "totalOrders", orders.size(),
                "statusBreakdown", statusCounts,
                "totalComponents", totalComponents,
                "totalPresets", totalPresets
        ));
    }
}
