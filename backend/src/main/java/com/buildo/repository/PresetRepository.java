package com.buildo.repository;

import com.buildo.model.Preset;
import com.buildo.model.PresetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PresetRepository extends JpaRepository<Preset, Long> {
    List<Preset> findByCategory(PresetCategory category);
    List<Preset> findByNameContainingIgnoreCase(String name);
}
