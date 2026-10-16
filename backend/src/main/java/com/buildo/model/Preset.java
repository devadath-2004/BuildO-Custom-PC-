package com.buildo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "presets")
public class Preset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PresetCategory category;

    @Column(length = 1000)
    private String description;

    private String targetResolutionOrUse;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    private Integer discountPercent = 0;

    @Column(length = 500)
    private String imageUrl;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "preset_components",
        joinColumns = @JoinColumn(name = "preset_id"),
        inverseJoinColumns = @JoinColumn(name = "component_id")
    )
    private List<Component> components = new ArrayList<>();

    public Preset() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public PresetCategory getCategory() { return category; }
    public void setCategory(PresetCategory category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTargetResolutionOrUse() { return targetResolutionOrUse; }
    public void setTargetResolutionOrUse(String targetResolutionOrUse) { this.targetResolutionOrUse = targetResolutionOrUse; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<Component> getComponents() { return components; }
    public void setComponents(List<Component> components) { this.components = components; }

    public BigDecimal getDiscountedPrice() {
        if (discountPercent == null || discountPercent <= 0) {
            return basePrice;
        }
        BigDecimal discountFactor = BigDecimal.valueOf(100 - discountPercent).divide(BigDecimal.valueOf(100));
        return basePrice.multiply(discountFactor);
    }
}
