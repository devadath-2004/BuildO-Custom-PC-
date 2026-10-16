package com.buildo.controller;

import com.buildo.model.Preset;
import com.buildo.model.PresetCategory;
import com.buildo.repository.PresetRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presets")
@CrossOrigin(origins = "*")
public class PresetController {

    private final PresetRepository presetRepository;

    public PresetController(PresetRepository presetRepository) {
        this.presetRepository = presetRepository;
    }

    @GetMapping
    public ResponseEntity<List<Preset>> getAllPresets() {
        return ResponseEntity.ok(presetRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Preset> getPresetById(@PathVariable Long id) {
        return presetRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Preset>> getPresetsByCategory(@PathVariable PresetCategory category) {
        return ResponseEntity.ok(presetRepository.findByCategory(category));
    }
}
