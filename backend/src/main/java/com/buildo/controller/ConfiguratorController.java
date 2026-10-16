package com.buildo.controller;

import com.buildo.dto.CompatibilityCheckRequest;
import com.buildo.dto.CompatibilityCheckResponse;
import com.buildo.model.Category;
import com.buildo.model.Component;
import com.buildo.repository.ComponentRepository;
import com.buildo.service.CompatibilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/configurator")
@CrossOrigin(origins = "*")
public class ConfiguratorController {

    private final CompatibilityService compatibilityService;
    private final ComponentRepository componentRepository;

    public ConfiguratorController(CompatibilityService compatibilityService,
                                  ComponentRepository componentRepository) {
        this.compatibilityService = compatibilityService;
        this.componentRepository = componentRepository;
    }

    @PostMapping("/check")
    public ResponseEntity<CompatibilityCheckResponse> checkCompatibility(@RequestBody CompatibilityCheckRequest request) {
        List<Long> ids = request.getAllIds();
        CompatibilityCheckResponse response = compatibilityService.checkCompatibility(ids);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/compatible-options")
    public ResponseEntity<List<Component>> getCompatibleOptions(
            @RequestParam("targetCategory") Category targetCategory,
            @RequestParam(value = "cpuId", required = false) Long cpuId,
            @RequestParam(value = "motherboardId", required = false) Long motherboardId) {

        List<Component> candidates = componentRepository.findByCategory(targetCategory);

        if (targetCategory == Category.MOTHERBOARD && cpuId != null) {
            Component cpu = componentRepository.findById(cpuId).orElse(null);
            if (cpu != null && cpu.getSocket() != null) {
                candidates = candidates.stream()
                        .filter(m -> cpu.getSocket().equalsIgnoreCase(m.getSocket()))
                        .collect(Collectors.toList());
            }
        } else if (targetCategory == Category.CPU && motherboardId != null) {
            Component mobo = componentRepository.findById(motherboardId).orElse(null);
            if (mobo != null && mobo.getSocket() != null) {
                candidates = candidates.stream()
                        .filter(c -> mobo.getSocket().equalsIgnoreCase(c.getSocket()))
                        .collect(Collectors.toList());
            }
        } else if (targetCategory == Category.RAM && motherboardId != null) {
            Component mobo = componentRepository.findById(motherboardId).orElse(null);
            if (mobo != null && mobo.getMemoryType() != null) {
                candidates = candidates.stream()
                        .filter(r -> mobo.getMemoryType().equalsIgnoreCase(r.getMemoryType()))
                        .collect(Collectors.toList());
            }
        }

        return ResponseEntity.ok(candidates);
    }
}
