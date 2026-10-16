package com.buildo.controller;

import com.buildo.model.Category;
import com.buildo.model.Component;
import com.buildo.repository.ComponentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/components")
@CrossOrigin(origins = "*")
public class ComponentController {

    private final ComponentRepository componentRepository;

    public ComponentController(ComponentRepository componentRepository) {
        this.componentRepository = componentRepository;
    }

    @GetMapping
    public ResponseEntity<List<Component>> getAllComponents() {
        return ResponseEntity.ok(componentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Component> getComponentById(@PathVariable Long id) {
        return componentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Component>> getComponentsByCategory(@PathVariable Category category) {
        return ResponseEntity.ok(componentRepository.findByCategory(category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Component>> searchComponents(@RequestParam("q") String query) {
        return ResponseEntity.ok(componentRepository.searchComponents(query));
    }
}
