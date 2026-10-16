package com.buildo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "components")
public class Component {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    private String brand;
    private String model;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 1000)
    private String description;

    // Compatibility Attributes
    private String socket;                // CPU & MOTHERBOARD (e.g., LGA1700, AM5)
    private String formFactor;            // MOTHERBOARD & CABINET (e.g., ATX, Micro-ATX, Mini-ITX)
    private String supportedFormFactors;   // CABINET supported boards (e.g., "ATX,Micro-ATX,Mini-ITX")
    private String memoryType;            // RAM & MOTHERBOARD (e.g., DDR5, DDR4)
    private Integer memorySlots;          // MOTHERBOARD slots available / RAM module count
    private Integer memorySpeedMhz;       // RAM frequency
    private Integer wattage;              // PSU rated capacity in Watts
    private Integer tdp;                  // CPU & GPU power draw / TDP in Watts
    private String efficiencyRating;      // PSU rating (e.g., "80+ Gold")
    private Integer lengthMm;             // GPU length / Cabinet max GPU clearance
    private Integer coolerHeightMm;       // Air cooler height / Cabinet max clearance
    private Integer radiatorSizeMm;       // AIO Liquid radiator (e.g., 240, 360)
    private String coolerType;            // COOLING: "AIR" or "AIO_LIQUID"
    
    private Boolean inStock = true;

    public Component() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSocket() { return socket; }
    public void setSocket(String socket) { this.socket = socket; }

    public String getFormFactor() { return formFactor; }
    public void setFormFactor(String formFactor) { this.formFactor = formFactor; }

    public String getSupportedFormFactors() { return supportedFormFactors; }
    public void setSupportedFormFactors(String supportedFormFactors) { this.supportedFormFactors = supportedFormFactors; }

    public String getMemoryType() { return memoryType; }
    public void setMemoryType(String memoryType) { this.memoryType = memoryType; }

    public Integer getMemorySlots() { return memorySlots; }
    public void setMemorySlots(Integer memorySlots) { this.memorySlots = memorySlots; }

    public Integer getMemorySpeedMhz() { return memorySpeedMhz; }
    public void setMemorySpeedMhz(Integer memorySpeedMhz) { this.memorySpeedMhz = memorySpeedMhz; }

    public Integer getWattage() { return wattage; }
    public void setWattage(Integer wattage) { this.wattage = wattage; }

    public Integer getTdp() { return tdp; }
    public void setTdp(Integer tdp) { this.tdp = tdp; }

    public String getEfficiencyRating() { return efficiencyRating; }
    public void setEfficiencyRating(String efficiencyRating) { this.efficiencyRating = efficiencyRating; }

    public Integer getLengthMm() { return lengthMm; }
    public void setLengthMm(Integer lengthMm) { this.lengthMm = lengthMm; }

    public Integer getCoolerHeightMm() { return coolerHeightMm; }
    public void setCoolerHeightMm(Integer coolerHeightMm) { this.coolerHeightMm = coolerHeightMm; }

    public Integer getRadiatorSizeMm() { return radiatorSizeMm; }
    public void setRadiatorSizeMm(Integer radiatorSizeMm) { this.radiatorSizeMm = radiatorSizeMm; }

    public String getCoolerType() { return coolerType; }
    public void setCoolerType(String coolerType) { this.coolerType = coolerType; }

    public Boolean getInStock() { return inStock; }
    public void setInStock(Boolean inStock) { this.inStock = inStock; }
}
