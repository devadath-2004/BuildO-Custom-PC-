package com.buildo.service;

import com.buildo.dto.CompatibilityCheckResponse;
import com.buildo.dto.CompatibilityIssue;
import com.buildo.model.Category;
import com.buildo.model.Component;
import com.buildo.repository.ComponentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CompatibilityServiceTest {

    private ComponentRepository componentRepository;
    private CompatibilityService compatibilityService;

    @BeforeEach
    void setUp() {
        componentRepository = Mockito.mock(ComponentRepository.class);
        compatibilityService = new CompatibilityService(componentRepository);
    }

    @Test
    @DisplayName("Compatible Build: AM5 CPU + AM5 Motherboard + DDR5 RAM + 850W PSU")
    void testCompatibleBuild() {
        Component cpu = new Component();
        cpu.setId(1L);
        cpu.setName("AMD Ryzen 7 7800X3D");
        cpu.setCategory(Category.CPU);
        cpu.setSocket("AM5");
        cpu.setTdp(120);
        cpu.setPrice(new BigDecimal("39999"));

        Component mobo = new Component();
        mobo.setId(2L);
        mobo.setName("MSI B650 Tomahawk");
        mobo.setCategory(Category.MOTHERBOARD);
        mobo.setSocket("AM5");
        mobo.setFormFactor("ATX");
        mobo.setMemoryType("DDR5");
        mobo.setMemorySlots(4);
        mobo.setPrice(new BigDecimal("21499"));

        Component ram = new Component();
        ram.setId(3L);
        ram.setName("G.Skill DDR5 32GB");
        ram.setCategory(Category.RAM);
        ram.setMemoryType("DDR5");
        ram.setMemorySlots(2);
        ram.setPrice(new BigDecimal("12499"));

        Component gpu = new Component();
        gpu.setId(4L);
        gpu.setName("RTX 4070 Ti Super");
        gpu.setCategory(Category.GPU);
        gpu.setTdp(285);
        gpu.setLengthMm(307);
        gpu.setPrice(new BigDecimal("79999"));

        Component psu = new Component();
        psu.setId(5L);
        psu.setName("Corsair 850W Gold");
        psu.setCategory(Category.PSU);
        psu.setWattage(850);
        psu.setPrice(new BigDecimal("10999"));

        Component cab = new Component();
        cab.setId(6L);
        cab.setName("Lian Li O11");
        cab.setCategory(Category.CABINET);
        cab.setFormFactor("ATX");
        cab.setSupportedFormFactors("E-ATX,ATX,Micro-ATX,Mini-ITX");
        cab.setLengthMm(455);
        cab.setRadiatorSizeMm(360);
        cab.setPrice(new BigDecimal("14999"));

        Component cool = new Component();
        cool.setId(7L);
        cool.setName("NZXT Kraken 360");
        cool.setCategory(Category.COOLING);
        cool.setCoolerType("AIO_LIQUID");
        cool.setRadiatorSizeMm(360);
        cool.setPrice(new BigDecimal("23499"));

        Component ssd = new Component();
        ssd.setId(8L);
        ssd.setName("Samsung 990 PRO 2TB");
        ssd.setCategory(Category.STORAGE);
        ssd.setPrice(new BigDecimal("16999"));

        List<Component> components = Arrays.asList(cpu, mobo, ram, gpu, psu, cab, cool, ssd);

        CompatibilityCheckResponse response = compatibilityService.evaluate(components);

        assertTrue(response.isCompatible(), "Build should be fully compatible");
        assertTrue(response.isCompleteBuild(), "Build should be recognized as complete");
        assertTrue(response.getTotalEstimatedWattage() > 400, "Estimated power should account for CPU, GPU & system overhead");
        assertTrue(response.getSelectedPsuWattage() >= response.getRecommendedPsuWattage(), "850W PSU should comfortably satisfy requirement");
        assertEquals(0, response.getIssues().stream().filter(i -> i.getSeverity() == CompatibilityIssue.Severity.ERROR).count());
    }

    @Test
    @DisplayName("Incompatible Socket: Intel LGA1700 CPU on AMD AM5 Motherboard")
    void testSocketMismatch() {
        Component intelCpu = new Component();
        intelCpu.setName("Intel Core i7-14700K");
        intelCpu.setCategory(Category.CPU);
        intelCpu.setSocket("LGA1700");
        intelCpu.setTdp(253);

        Component amdMobo = new Component();
        amdMobo.setName("MSI MAG B650 Tomahawk");
        amdMobo.setCategory(Category.MOTHERBOARD);
        amdMobo.setSocket("AM5");
        amdMobo.setFormFactor("ATX");

        CompatibilityCheckResponse response = compatibilityService.evaluate(Arrays.asList(intelCpu, amdMobo));

        assertFalse(response.isCompatible(), "Socket mismatch should cause incompatibility");
        assertTrue(response.getIssues().stream().anyMatch(i -> i.getTitle().contains("Socket Mismatch")));
    }

    @Test
    @DisplayName("Insufficient PSU: High-end GPU with 450W PSU")
    void testInsufficientPsu() {
        Component cpu = new Component();
        cpu.setName("Intel Core i9-14900K");
        cpu.setCategory(Category.CPU);
        cpu.setTdp(253);

        Component gpu = new Component();
        gpu.setName("NVIDIA RTX 4090");
        gpu.setCategory(Category.GPU);
        gpu.setTdp(450);

        Component lowPsu = new Component();
        lowPsu.setName("Budget 450W PSU");
        lowPsu.setCategory(Category.PSU);
        lowPsu.setWattage(450);

        CompatibilityCheckResponse response = compatibilityService.evaluate(Arrays.asList(cpu, gpu, lowPsu));

        assertFalse(response.isCompatible(), "450W PSU cannot power 253W CPU + 450W GPU");
        assertTrue(response.getIssues().stream().anyMatch(i -> i.getTitle().contains("Insufficient Power Supply")));
    }
}
