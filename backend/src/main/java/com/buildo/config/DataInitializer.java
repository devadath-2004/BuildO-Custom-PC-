package com.buildo.config;

import com.buildo.model.*;
import com.buildo.repository.ComponentRepository;
import com.buildo.repository.InvoiceRepository;
import com.buildo.repository.OrderRepository;
import com.buildo.repository.PresetRepository;
import com.buildo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ComponentRepository componentRepository;
    private final PresetRepository presetRepository;
    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ComponentRepository componentRepository,
                           PresetRepository presetRepository,
                           OrderRepository orderRepository,
                           InvoiceRepository invoiceRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.componentRepository = componentRepository;
        this.presetRepository = presetRepository;
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed demo accounts only when missing so later catalog updates stay idempotent.
        User admin = userRepository.findByUsername("admin").orElseGet(() -> {
            User seededAdmin = new User("admin", "admin@buildo.pc", passwordEncoder.encode("admin123"), "BuildO System Admin", Role.ROLE_ADMIN);
            seededAdmin.setPhone("+91 9876543210");
            seededAdmin.setAddress("Tech Park Tower 4, Bangalore, India");
            return userRepository.save(seededAdmin);
        });

        User customer = userRepository.findByUsername("customer").orElseGet(() -> {
            User seededCustomer = new User("customer", "alex@example.com", passwordEncoder.encode("customer123"), "Alex Morgan", Role.ROLE_CUSTOMER);
            seededCustomer.setPhone("+91 9811223344");
            seededCustomer.setAddress("42 Silicon Enclave, Indiranagar, Bangalore");
            return userRepository.save(seededCustomer);
        });

        List<com.buildo.model.Component> comps = new ArrayList<>();

        // ==========================================
        // 2. CPUs (12 Processors across all budgets)
        // ==========================================
        // Budget Tier
        com.buildo.model.Component cpuRyzen5500 = createComp("AMD Ryzen 5 5500", Category.CPU, "AMD", "100-100000457BOX", new BigDecimal("7999"),
                "6 Cores / 12 Threads, 4.2 GHz Boost, 19MB Cache, AM4 Socket, Wraith Stealth Cooler included",
                "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=85",
                "AM4", null, null, null, null, null, null, 65, null, null, null, null, null);

        com.buildo.model.Component cpuI3_14100F = createComp("Intel Core i3-14100F", Category.CPU, "Intel", "BX8071514100F", new BigDecimal("8499"),
                "4 Cores / 8 Threads, up to 4.7 GHz Turbo, LGA1700 Socket, Intel Laminar RM1 Cooler included",
                "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=85",
                "LGA1700", null, null, null, null, null, null, 58, null, null, null, null, null);

        com.buildo.model.Component cpuI5_12400F = createComp("Intel Core i5-12400F", Category.CPU, "Intel", "BX8071512400F", new BigDecimal("10999"),
                "6 Cores / 12 Threads, up to 4.4 GHz Turbo, 18MB Cache, LGA1700 Socket, Best budget gaming value",
                "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=85",
                "LGA1700", null, null, null, null, null, null, 65, null, null, null, null, null);

        com.buildo.model.Component cpuRyzen5600X = createComp("AMD Ryzen 5 5600X", Category.CPU, "AMD", "100-100000065BOX", new BigDecimal("12499"),
                "6 Cores / 12 Threads, 4.6 GHz Boost, 35MB GameCache, AM4 Socket, 65W TDP",
                "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=85",
                "AM4", null, null, null, null, null, null, 65, null, null, null, null, null);

        // Mid-Range Tier
        com.buildo.model.Component cpuI5_14400F = createComp("Intel Core i5-14400F", Category.CPU, "Intel", "BX8071514400F", new BigDecimal("18999"),
                "10 Cores (6P + 4E) / 16 Threads, 4.7 GHz Turbo, 20MB Cache, LGA1700 Socket, 65W TDP",
                "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=85",
                "LGA1700", null, null, null, null, null, null, 65, null, null, null, null, null);

        com.buildo.model.Component cpuRyzen7600X = createComp("AMD Ryzen 5 7600X", Category.CPU, "AMD", "100-100000593WOF", new BigDecimal("20499"),
                "6 Cores / 12 Threads, 5.3 GHz Boost, Zen 4 Architecture, AM5 Socket, 105W TDP",
                "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=85",
                "AM5", null, null, null, null, null, null, 105, null, null, null, null, null);

        com.buildo.model.Component cpuI5_14600K = createComp("Intel Core i5-14600K", Category.CPU, "Intel", "BX8071514600K", new BigDecimal("27499"),
                "14 Cores (6P + 8E) / 20 Threads, up to 5.3 GHz Unlocked, LGA1700 Socket, 125W Base TDP",
                "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=85",
                "LGA1700", null, null, null, null, null, null, 125, null, null, null, null, null);

        // High-End & Flagship Tier
        com.buildo.model.Component cpuRyzen9700X = createComp("AMD Ryzen 7 9700X", Category.CPU, "AMD", "100-100001404WOF", new BigDecimal("35999"),
                "8 Cores / 16 Threads, up to 5.5 GHz Boost, Zen 5 4nm Architecture, AM5 Socket, 65W High Efficiency",
                "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=85",
                "AM5", null, null, null, null, null, null, 65, null, null, null, null, null);

        com.buildo.model.Component cpuI7_14700K = createComp("Intel Core i7-14700K", Category.CPU, "Intel", "BX8071514700K", new BigDecimal("38499"),
                "20 Cores (8P + 12E) / 28 Threads, up to 5.6 GHz Turbo, LGA1700 Socket, 253W Max TDP",
                "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=85",
                "LGA1700", null, null, null, null, null, null, 253, null, null, null, null, null);

        com.buildo.model.Component cpuRyzen7800X3D = createComp("AMD Ryzen 7 7800X3D", Category.CPU, "AMD", "100-100000910WOF", new BigDecimal("39999"),
                "8 Cores / 16 Threads, 104MB 3D V-Cache, Ultimate Gaming Processor on Earth, AM5 Socket, 120W TDP",
                "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=85",
                "AM5", null, null, null, null, null, null, 120, null, null, null, null, null);

        com.buildo.model.Component cpuRyzen7950X = createComp("AMD Ryzen 9 7950X", Category.CPU, "AMD", "100-100000514WOF", new BigDecimal("52499"),
                "16 Cores / 32 Threads, up to 5.7 GHz Boost, 80MB Cache, AM5 Socket, 170W TDP",
                "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=85",
                "AM5", null, null, null, null, null, null, 170, null, null, null, null, null);

        com.buildo.model.Component cpuI9_14900K = createComp("Intel Core i9-14900K", Category.CPU, "Intel", "BX8071514900K", new BigDecimal("54999"),
                "24 Cores (8P + 16E) / 32 Threads, 6.0 GHz Thermal Velocity Boost, LGA1700 Socket, 253W Max TDP",
                "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=85",
                "LGA1700", null, null, null, null, null, null, 253, null, null, null, null, null);

        comps.addAll(Arrays.asList(cpuRyzen5500, cpuI3_14100F, cpuI5_12400F, cpuRyzen5600X,
                cpuI5_14400F, cpuRyzen7600X, cpuI5_14600K, cpuRyzen9700X, cpuI7_14700K, cpuRyzen7800X3D, cpuRyzen7950X, cpuI9_14900K));

        // ==========================================
        // 3. Motherboards (10 Boards across budgets)
        // ==========================================
        // Budget Boards
        com.buildo.model.Component mbGigabyteA520M = createComp("GIGABYTE A520M K V2", Category.MOTHERBOARD, "GIGABYTE", "A520M-K-V2", new BigDecimal("5499"),
                "AMD A520 Chipset, AM4 Socket, Micro-ATX, DDR4 Dual Channel, NVMe PCIe 3.0 M.2",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=85",
                "AM4", "Micro-ATX", null, "DDR4", 2, null, null, null, null, null, null, null, null);

        com.buildo.model.Component mbMsiH610M = createComp("MSI PRO H610M-E DDR4", Category.MOTHERBOARD, "MSI", "PRO-H610M-E-DDR4", new BigDecimal("6299"),
                "Intel H610 Chipset, LGA1700 Socket, Micro-ATX, DDR4, Core Boost, Steel Armor PCIe 4.0",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=85",
                "LGA1700", "Micro-ATX", null, "DDR4", 2, null, null, null, null, null, null, null, null);

        com.buildo.model.Component mbMsiB550M = createComp("MSI B550M PRO-VDH WiFi", Category.MOTHERBOARD, "MSI", "B550M-PRO-VDH-WIFI", new BigDecimal("9899"),
                "AMD B550 Chipset, AM4 Socket, Micro-ATX, DDR4 (4 DIMMs), PCIe 4.0, Built-in WiFi & Bluetooth",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=85",
                "AM4", "Micro-ATX", null, "DDR4", 4, null, null, null, null, null, null, null, null);

        com.buildo.model.Component mbAsrockB650M = createComp("ASRock B650M-HDV/M.2", Category.MOTHERBOARD, "ASRock", "B650M-HDV", new BigDecimal("11499"),
                "AMD B650 Chipset, AM5 Socket, Micro-ATX, DDR5, Blazing M.2 PCIe 5.0, 8+2+1 Power Phase",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=85",
                "AM5", "Micro-ATX", null, "DDR5", 2, null, null, null, null, null, null, null, null);

        // Mid-Range Boards
        com.buildo.model.Component mbAsusB760M = createComp("ASUS Prime B760M-A WiFi", Category.MOTHERBOARD, "ASUS", "PRIME-B760M-A-WIFI", new BigDecimal("14999"),
                "Intel B760 Chipset, LGA1700 Socket, Micro-ATX, DDR5 (4 DIMMs), Dual PCIe 4.0 M.2, WiFi 6",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=85",
                "LGA1700", "Micro-ATX", null, "DDR5", 4, null, null, null, null, null, null, null, null);

        com.buildo.model.Component mbMsiB760Atx = createComp("MSI B760 Gaming Plus WiFi", Category.MOTHERBOARD, "MSI", "B760-GAMING-PLUS-WIFI", new BigDecimal("17499"),
                "Intel B760 Chipset, LGA1700 Socket, Full ATX, DDR5, Extended Heatsink Design, 2.5G LAN & WiFi 6E",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=85",
                "LGA1700", "ATX", null, "DDR5", 4, null, null, null, null, null, null, null, null);

        com.buildo.model.Component mbGigabyteB650 = createComp("GIGABYTE B650 Gaming X AX", Category.MOTHERBOARD, "GIGABYTE", "B650-GAMING-X-AX", new BigDecimal("18999"),
                "AMD B650 Chipset, AM5 Socket, Full ATX, DDR5, PCIe 5.0 M.2, 8+2+2 Digital VRM, AMD EXPO",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=85",
                "AM5", "ATX", null, "DDR5", 4, null, null, null, null, null, null, null, null);

        com.buildo.model.Component mbMsiB650Tomahawk = createComp("MSI MAG B650 Tomahawk WiFi", Category.MOTHERBOARD, "MSI", "MAG-B650-TOMAHAWK", new BigDecimal("21499"),
                "AMD B650 Chipset, AM5 Socket, Full ATX, DDR5, 14+2+1 Duet Rail VRM, Audio Boost 5, WiFi 6E",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=85",
                "AM5", "ATX", null, "DDR5", 4, null, null, null, null, null, null, null, null);

        // High-End Boards
        com.buildo.model.Component mbMsiZ790Tomahawk = createComp("MSI MAG Z790 Tomahawk WiFi", Category.MOTHERBOARD, "MSI", "MAG-Z790-TOMAHAWK", new BigDecimal("26999"),
                "Intel Z790 Chipset, LGA1700 Socket, Full ATX, DDR5, 16+1+1 Mirrored Power Phase, 4x M.2 Slots",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=85",
                "LGA1700", "ATX", null, "DDR5", 4, null, null, null, null, null, null, null, null);

        com.buildo.model.Component mbGigabyteX670E = createComp("GIGABYTE X670E AORUS Master", Category.MOTHERBOARD, "GIGABYTE", "X670E-AORUS-MASTER", new BigDecimal("46999"),
                "Flagship AMD X670E Chipset, AM5 Socket, E-ATX, DDR5, Dual PCIe 5.0, 16+2+2 VRM, Thermal Armor",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=85",
                "AM5", "E-ATX", null, "DDR5", 4, null, null, null, null, null, null, null, null);

        com.buildo.model.Component mbAsusZ790Hero = createComp("ASUS ROG Maximus Z790 Dark Hero", Category.MOTHERBOARD, "ASUS", "ROG-MAX-Z790-DH", new BigDecimal("58999"),
                "Extreme Enthusiast Motherboard, LGA1700, Full ATX, DDR5, Dual Thunderbolt 4, Polymo Lighting, WiFi 7",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=85",
                "LGA1700", "ATX", null, "DDR5", 4, null, null, null, null, null, null, null, null);

        comps.addAll(Arrays.asList(mbGigabyteA520M, mbMsiH610M, mbMsiB550M, mbAsrockB650M,
                mbAsusB760M, mbMsiB760Atx, mbGigabyteB650, mbMsiB650Tomahawk, mbMsiZ790Tomahawk, mbGigabyteX670E, mbAsusZ790Hero));

        // ==========================================
        // 4. Graphics Cards (10 GPUs across budgets)
        // ==========================================
        // Budget GPUs
        com.buildo.model.Component gpuRtx3050 = createComp("ZOTAC Gaming GeForce RTX 3050 6GB", Category.GPU, "ZOTAC", "ZT-A30510E-20L", new BigDecimal("17499"),
                "6GB GDDR6, 96-bit, 70W Low Power (No PCIe cable required), Compact 173mm dual slot",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=85",
                null, null, null, null, null, null, null, 70, null, 173, null, null, null);

        com.buildo.model.Component gpuRx6600 = createComp("ASUS Dual AMD Radeon RX 6600 8GB", Category.GPU, "ASUS", "DUAL-RX6600-8G", new BigDecimal("19999"),
                "8GB GDDR6, 128-bit, 132W TDP, Axial-tech fan design, King of 1080p Ultra 60+ FPS Budget Gaming",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=85",
                null, null, null, null, null, null, null, 132, null, 243, null, null, null);

        com.buildo.model.Component gpuRtx4060 = createComp("MSI GeForce RTX 4060 Ventus 2X 8GB", Category.GPU, "MSI", "RTX-4060-VENTUS-2X", new BigDecimal("28999"),
                "8GB GDDR6, Ada Lovelace, DLSS 3 Frame Generation, AV1 Encoder, 115W Ultra-efficient TDP",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=85",
                null, null, null, null, null, null, null, 115, null, 199, null, null, null);

        // Mid-Range GPUs
        com.buildo.model.Component gpuRtx4060Ti = createComp("GIGABYTE GeForce RTX 4060 Ti Eagle 8GB", Category.GPU, "GIGABYTE", "GV-N406TEAGLE-8GD", new BigDecimal("37999"),
                "8GB GDDR6, WINDFORCE 3X Fans, Screen Cooling, DLSS 3, 160W TDP, 1440p Esports Ready",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=85",
                null, null, null, null, null, null, null, 160, null, 272, null, null, null);

        com.buildo.model.Component gpuRx7700XT = createComp("Sapphire Pulse AMD Radeon RX 7700 XT 12GB", Category.GPU, "Sapphire", "11335-04-20G", new BigDecimal("42999"),
                "12GB GDDR6, 192-bit, RDNA 3, Dual-X Cooling, High native rasterization 1440p gaming, 245W TDP",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=85",
                null, null, null, null, null, null, null, 245, null, 280, null, null, null);

        com.buildo.model.Component gpuRx7800XT = createComp("Sapphire Pure AMD Radeon RX 7800 XT 16GB", Category.GPU, "Sapphire", "11330-03-20G", new BigDecimal("51999"),
                "16GB GDDR6, 256-bit, White Aesthetic, 60 Compute Units, 1440p Ultra Max Settings Champion, 263W TDP",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=85",
                null, null, null, null, null, null, null, 263, null, 320, null, null, null);

        // High-End & Flagship GPUs
        com.buildo.model.Component gpuRtx4070Super = createComp("ZOTAC Gaming GeForce RTX 4070 Super Twin Edge 12GB", Category.GPU, "ZOTAC", "ZT-D40720E-10M", new BigDecimal("59999"),
                "12GB GDDR6X, 7168 CUDA Cores, DLSS 3.5 Ray Reconstruction, IceStorm 2.0, 220W TDP",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=85",
                null, null, null, null, null, null, null, 220, null, 234, null, null, null);

        com.buildo.model.Component gpuRtx4070TiSuper = createComp("ZOTAC Gaming GeForce RTX 4070 Ti Super 16GB", Category.GPU, "ZOTAC", "ZT-D40730D-10P", new BigDecimal("79999"),
                "16GB GDDR6X, 256-bit Bus, 8448 CUDA Cores, 4K Gaming & Heavy 3D Rendering, 285W TDP",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=85",
                null, null, null, null, null, null, null, 285, null, 307, null, null, null);

        com.buildo.model.Component gpuRx7900XTX = createComp("Sapphire Nitro+ AMD Radeon RX 7900 XTX 24GB", Category.GPU, "Sapphire", "11322-01-20G", new BigDecimal("98999"),
                "24GB GDDR6, 384-bit, Vapor-X Chamber, Massive 4K VRAM buffer for AI & 8K Rendering, 355W TDP",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=85",
                null, null, null, null, null, null, null, 355, null, 320, null, null, null);

        com.buildo.model.Component gpuRtx4080Super = createComp("ASUS ROG Strix GeForce RTX 4080 Super 16GB", Category.GPU, "ASUS", "ROG-STRIX-RTX4080S-O16G", new BigDecimal("109999"),
                "16GB GDDR6X, Patented Vented Exoskeleton, Max Contact Heatsink, 4K 144Hz Ray-Tracing, 320W TDP",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=85",
                null, null, null, null, null, null, null, 320, null, 357, null, null, null);

        com.buildo.model.Component gpuRtx4090 = createComp("ASUS TUF Gaming GeForce RTX 4090 24GB", Category.GPU, "ASUS", "TUF-RTX4090-O24G-GAMING", new BigDecimal("179999"),
                "24GB GDDR6X, 16384 CUDA Cores, Unmatched Flagship GPU on Earth for 4K Cyberpunk & LLM AI, 450W TDP",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=85",
                null, null, null, null, null, null, null, 450, null, 348, null, null, null);

        comps.addAll(Arrays.asList(gpuRtx3050, gpuRx6600, gpuRtx4060, gpuRtx4060Ti, gpuRx7700XT,
                gpuRx7800XT, gpuRtx4070Super, gpuRtx4070TiSuper, gpuRx7900XTX, gpuRtx4080Super, gpuRtx4090));

        // ==========================================
        // 5. RAM (8 Kits across budgets)
        // ==========================================
        com.buildo.model.Component ramCrucial8GbDdr4 = createComp("Crucial Basics 8GB DDR4-3200", Category.RAM, "Crucial", "CB8GU3200", new BigDecimal("1699"),
                "8GB (1x8GB) DDR4-3200 CL22, Standard Desktop Memory, Reliable Budget Performance",
                "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=85",
                null, null, null, "DDR4", 1, 3200, null, null, null, null, null, null, null);

        com.buildo.model.Component ramCorsair16GbDdr4 = createComp("Corsair Vengeance LPX 16GB (2x8GB) DDR4-3200", Category.RAM, "Corsair", "CMK16GX4M2B3200C16", new BigDecimal("3499"),
                "16GB Dual Channel Kit, DDR4-3200 CL16, Pure Aluminum Heat Spreader, Intel XMP 2.0",
                "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=85",
                null, null, null, "DDR4", 2, 3200, null, null, null, null, null, null, null);

        com.buildo.model.Component ramGskill32GbDdr4 = createComp("G.Skill Ripjaws V 32GB (2x16GB) DDR4-3600", Category.RAM, "G.Skill", "F4-3600C18D-32GVK", new BigDecimal("6899"),
                "32GB High-Density Kit, DDR4-3600 CL18, Classic Gunmetal Aluminum Heatsink for Heavy Workloads",
                "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=85",
                null, null, null, "DDR4", 2, 3600, null, null, null, null, null, null, null);

        com.buildo.model.Component ramKingston16GbDdr5 = createComp("Kingston Fury Beast 16GB (1x16GB) DDR5-5200", Category.RAM, "Kingston", "KF552C40BB-16", new BigDecimal("4699"),
                "16GB Single Module, DDR5-5200 CL40, Plug N Play Automatic Overclocking, Low-Profile",
                "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=85",
                null, null, null, "DDR5", 1, 5200, null, null, null, null, null, null, null);

        com.buildo.model.Component ramCorsair32GbDdr5 = createComp("Corsair Vengeance 32GB (2x16GB) DDR5-5600", Category.RAM, "Corsair", "CMK32GX5M2B5600C36", new BigDecimal("8999"),
                "32GB Kit, DDR5-5600 CL36, Solid Black Aluminum Heatspreader, iCUE Software Profile Tuning",
                "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=85",
                null, null, null, "DDR5", 2, 5600, null, null, null, null, null, null, null);

        com.buildo.model.Component ramGskill32GbDdr5 = createComp("G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000", Category.RAM, "G.Skill", "F5-6000J3038F16GX2-TZ5NR", new BigDecimal("11999"),
                "32GB Gaming Kit, DDR5-6000 CL30 Low Latency, AMD EXPO & Intel XMP Certified, Sleek RGB Lightbar",
                "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=85",
                null, null, null, "DDR5", 2, 6000, null, null, null, null, null, null, null);

        com.buildo.model.Component ramGskill64GbDdr5 = createComp("G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5-6400", Category.RAM, "G.Skill", "F5-6400J3239G32GX2-TZ5RK", new BigDecimal("22999"),
                "64GB High Capacity Kit, DDR5-6400 CL32, Ideal for 4K DaVinci Resolve Timeline Grading & 3D Simulations",
                "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=85",
                null, null, null, "DDR5", 2, 6400, null, null, null, null, null, null, null);

        com.buildo.model.Component ramCorsair64GbDdr5 = createComp("Corsair Dominator Titanium 64GB (2x32GB) DDR5-6000", Category.RAM, "Corsair", "CMP64GX5M2B6000C30", new BigDecimal("24999"),
                "64GB Enthusiast Flagship Kit, DDR5-6000 CL30, Swappable Top Bars, DHX Patented Cooling",
                "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=85",
                null, null, null, "DDR5", 2, 6000, null, null, null, null, null, null, null);

        comps.addAll(Arrays.asList(ramCrucial8GbDdr4, ramCorsair16GbDdr4, ramGskill32GbDdr4, ramKingston16GbDdr5,
                ramCorsair32GbDdr5, ramGskill32GbDdr5, ramGskill64GbDdr5, ramCorsair64GbDdr5));

        // ==========================================
        // 6. Storage (6 Drives across budgets)
        // ==========================================
        com.buildo.model.Component ssdKingston500Gb = createComp("Kingston NV2 500GB PCIe 4.0 NVMe", Category.STORAGE, "Kingston", "SNV2S/500G", new BigDecimal("3199"),
                "500GB M.2 2280 NVMe, Gen 4x4, Speeds up to 3,500 MB/s, Fast OS boot and game load times",
                "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, null, null, null);

        com.buildo.model.Component ssdCrucial1Tb = createComp("Crucial P3 Plus 1TB PCIe 4.0 NVMe", Category.STORAGE, "Crucial", "CT1000P3PSSD8", new BigDecimal("5499"),
                "1TB M.2 NVMe, Gen 4x4, Sequential Read 5,000 MB/s, Micron Advanced 3D NAND, Outstanding Value",
                "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, null, null, null);

        com.buildo.model.Component ssdWdBlue1Tb = createComp("WD Blue SN580 1TB PCIe 4.0 NVMe", Category.STORAGE, "Western Digital", "WDS100T3B0E", new BigDecimal("5899"),
                "1TB M.2 NVMe, nCache 4.0 Technology, 4,150 MB/s Read, Low power consumption for creator workflows",
                "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, null, null, null);

        com.buildo.model.Component ssdWdBlack1Tb = createComp("WD Black SN850X 1TB PCIe 4.0 NVMe", Category.STORAGE, "Western Digital", "WDS100T2X0E", new BigDecimal("8999"),
                "1TB Flagship Gaming SSD, 7,300 MB/s Read, Game Mode 2.0 Predictive Loading, Low Latency",
                "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, null, null, null);

        com.buildo.model.Component ssdSamsung2Tb = createComp("Samsung 990 PRO 2TB PCIe 4.0 NVMe", Category.STORAGE, "Samsung", "MZ-V9P2T0B/AM", new BigDecimal("16999"),
                "2TB Ultimate NVMe, 7,450 MB/s Read, 6,900 MB/s Write, V-NAND TLC, High endurance for 4K video rendering",
                "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, null, null, null);

        com.buildo.model.Component hddSeagate2Tb = createComp("Seagate Barracuda 2TB 7200RPM HDD", Category.STORAGE, "Seagate", "ST2000DM008", new BigDecimal("5199"),
                "2TB 3.5\" SATA 6Gb/s Internal Hard Drive, 7200 RPM, 256MB Cache, Bulk media & archival storage",
                "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, null, null, null);

        comps.addAll(Arrays.asList(ssdKingston500Gb, ssdCrucial1Tb, ssdWdBlue1Tb, ssdWdBlack1Tb, ssdSamsung2Tb, hddSeagate2Tb));

        // ==========================================
        // 7. Power Supplies (7 PSUs across budgets)
        // ==========================================
        com.buildo.model.Component psuAnt500W = createComp("Ant Esports VS500L 500W", Category.PSU, "Ant Esports", "VS500L", new BigDecimal("2299"),
                "500 Watts, 120mm Silent Fan, Over-Voltage & Short-Circuit Protection, Reliable for budget rigs",
                "https://images.unsplash.com/photo-1555617778-02518510b9fa?w=500&q=85",
                null, null, null, null, null, null, 500, null, "Standard", null, null, null, null);

        com.buildo.model.Component psuDeepcool550W = createComp("DeepCool PK550D 550W 80+ Bronze", Category.PSU, "DeepCool", "R-PK550D-FA0B-UK", new BigDecimal("3499"),
                "550 Watts, 80 PLUS Bronze Certified, Flat Black Stealth Cables, Direct Power Output",
                "https://images.unsplash.com/photo-1555617778-02518510b9fa?w=500&q=85",
                null, null, null, null, null, null, 550, null, "80+ Bronze", null, null, null, null);

        com.buildo.model.Component psuCoolermaster650W = createComp("Cooler Master MWE 650W V2 Bronze", Category.PSU, "Cooler Master", "MPE-6501-ACABW-BIN", new BigDecimal("4899"),
                "650 Watts, 80 PLUS Bronze, DC-to-DC Circuit Architecture, 120mm HDB Fan, 5-Year Warranty",
                "https://images.unsplash.com/photo-1555617778-02518510b9fa?w=500&q=85",
                null, null, null, null, null, null, 650, null, "80+ Bronze", null, null, null, null);

        com.buildo.model.Component psuCorsair750W = createComp("Corsair CX750 750W 80+ Bronze", Category.PSU, "Corsair", "CP-9020279-NA", new BigDecimal("6299"),
                "750 Watts, 80 PLUS Bronze, Continuous Power Delivery, Low-Noise 120mm Thermally Controlled Fan",
                "https://images.unsplash.com/photo-1555617778-02518510b9fa?w=500&q=85",
                null, null, null, null, null, null, 750, null, "80+ Bronze", null, null, null, null);

        com.buildo.model.Component psuMsi750W = createComp("MSI MAG A750GL 750W 80+ Gold PCIe 5.0", Category.PSU, "MSI", "MAG-A750GL-PCIE5", new BigDecimal("7899"),
                "750 Watts, 80 PLUS Gold, ATX 3.0 & Native 12VHPWR Cable for RTX 40-Series, Fully Modular",
                "https://images.unsplash.com/photo-1555617778-02518510b9fa?w=500&q=85",
                null, null, null, null, null, null, 750, null, "80+ Gold", null, null, null, null);

        com.buildo.model.Component psuCorsair850W = createComp("Corsair RM850e 850W 80+ Gold ATX 3.0", Category.PSU, "Corsair", "CP-9020263-NA", new BigDecimal("10999"),
                "850 Watts, 80 PLUS Gold, Low-Noise Operation with Zero RPM Fan Mode, 105°C Capacitors",
                "https://images.unsplash.com/photo-1555617778-02518510b9fa?w=500&q=85",
                null, null, null, null, null, null, 850, null, "80+ Gold", null, null, null, null);

        com.buildo.model.Component psuCorsair1000W = createComp("Corsair RM1000x 1000W 80+ Gold Modular", Category.PSU, "Corsair", "CP-9020201-NA", new BigDecimal("15999"),
                "1000 Watts, 80 PLUS Gold, 100% All Japanese Capacitors, Heavy Multi-GPU & Flagship CPU Stability",
                "https://images.unsplash.com/photo-1555617778-02518510b9fa?w=500&q=85",
                null, null, null, null, null, null, 1000, null, "80+ Gold", null, null, null, null);

        comps.addAll(Arrays.asList(psuAnt500W, psuDeepcool550W, psuCoolermaster650W, psuCorsair750W, psuMsi750W, psuCorsair850W, psuCorsair1000W));

        // ==========================================
        // 8. Cabinets / Cases (7 Cases across budgets)
        // ==========================================
        com.buildo.model.Component cabAntIce100 = createComp("Ant Esports ICE-100 Airflow Mid Tower", Category.CABINET, "Ant Esports", "ICE-100", new BigDecimal("2899"),
                "Mesh Front Panel, 1x 120mm Rear Fan included, Supports ATX, Micro-ATX, up to 310mm GPU",
                "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&q=85",
                null, "ATX", "ATX,Micro-ATX,Mini-ITX", null, null, null, null, null, null, 310, 159, 240, null);

        com.buildo.model.Component cabQm300L = createComp("Cooler Master MasterBox Q300L Micro-ATX", Category.CABINET, "Cooler Master", "MCB-Q300L-KANN-S00", new BigDecimal("3899"),
                "Compact Micro-ATX Chassis, Magnetic Patterned Dust Filters, Fully Perforated, Supports Micro-ATX Only",
                "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&q=85",
                null, "Micro-ATX", "Micro-ATX,Mini-ITX", null, null, null, null, null, null, 360, 159, 240, null);

        com.buildo.model.Component cabDeepcoolCc560 = createComp("DeepCool CC560 V2 with 4 LED Fans", Category.CABINET, "DeepCool", "R-CC560-BKGAA4-G-2", new BigDecimal("3999"),
                "High Airflow Front Panel, 4 Pre-installed LED Fans, Tempered Glass Side Window, Supports up to 360mm Rad",
                "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&q=85",
                null, "ATX", "ATX,Micro-ATX,Mini-ITX", null, null, null, null, null, null, 370, 163, 360, null);

        com.buildo.model.Component cabMontech903 = createComp("Montech AIR 903 MAX with 4 140mm ARGB", Category.CABINET, "Montech", "AIR-903-MAX-BLACK", new BigDecimal("5999"),
                "Ultra-High Airflow Steel Mesh, 4x 140mm Performance ARGB Fans, Supports E-ATX, 400mm GPU, 360mm Rad",
                "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&q=85",
                null, "ATX", "E-ATX,ATX,Micro-ATX,Mini-ITX", null, null, null, null, null, null, 400, 180, 360, null);

        com.buildo.model.Component cabCorsair4000D = createComp("Corsair 4000D Airflow Tempered Glass", Category.CABINET, "Corsair", "CC-9011200-WW", new BigDecimal("6899"),
                "Geometric Steel Airflow Front Panel, RapidRoute Cable Management System, Supports 360mm Radiator and ATX",
                "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&q=85",
                null, "ATX", "ATX,Micro-ATX,Mini-ITX", null, null, null, null, null, null, 360, 170, 360, null);

        com.buildo.model.Component cabNzxtH9 = createComp("NZXT H9 Flow Dual-Chamber Mid-Tower", Category.CABINET, "NZXT", "CM-H91FB-01", new BigDecimal("13499"),
                "Seamless Panoramic Glass Wrap, Dual-Chamber Thermal Isolation, Supports up to 10 Fans & 360mm Radiators",
                "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&q=85",
                null, "ATX", "ATX,Micro-ATX,Mini-ITX", null, null, null, null, null, null, 435, 165, 360, null);

        com.buildo.model.Component cabLianLiO11 = createComp("Lian Li O11 Dynamic EVO RGB", Category.CABINET, "Lian Li", "O11D-EVO-RGB-BLACK", new BigDecimal("14999"),
                "Showcase Enthusiast Chassis, Reversible Dual-Chamber, Built-in ARGB Diffusers, Supports E-ATX, 455mm GPU",
                "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&q=85",
                null, "ATX", "E-ATX,ATX,Micro-ATX,Mini-ITX", null, null, null, null, null, null, 455, 167, 360, null);

        comps.addAll(Arrays.asList(cabAntIce100, cabQm300L, cabDeepcoolCc560, cabMontech903, cabCorsair4000D, cabNzxtH9, cabLianLiO11));

        // ==========================================
        // 9. Coolers (8 Coolers across budgets)
        // ==========================================
        com.buildo.model.Component coolStock = createComp("Standard OEM Air Cooler", Category.COOLING, "Stock", "OEM-AIR-65W", new BigDecimal("499"),
                "Compact Low-Profile Top-Down Cooler, Aluminum Fin Stack with Pre-applied Thermal Paste, 65W TDP",
                "https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, 65, null, "AIR");

        com.buildo.model.Component coolAg300 = createComp("DeepCool AG300 Compact Tower", Category.COOLING, "DeepCool", "R-AG300-BKNMN0-G", new BigDecimal("1199"),
                "3 Direct-Touch Copper Heatpipes, 92mm PWM Hydro-Bearing Fan, 129mm Low Height for compact cases",
                "https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, 129, null, "AIR");

        com.buildo.model.Component coolAg400 = createComp("DeepCool AG400 ARGB Single Tower", Category.COOLING, "DeepCool", "R-AG400-BKANMC-G-1", new BigDecimal("1899"),
                "4 Direct-Touch Copper Heatpipes, 120mm ARGB PWM Fan, 220W TDP Dissipation, 150mm Height",
                "https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, 150, null, "AIR");

        com.buildo.model.Component coolPeerless = createComp("Thermalright Peerless Assassin 120 SE", Category.COOLING, "Thermalright", "PA120-SE-BLACK", new BigDecimal("3499"),
                "Legendary Dual-Tower 6 Heatpipes Cooler, 2x 120mm PWM Fans, Incredible 265W TDP Air Cooling Power",
                "https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, 155, null, "AIR");

        com.buildo.model.Component coolCm240 = createComp("Cooler Master MasterLiquid 240L Core ARGB AIO", Category.COOLING, "Cooler Master", "MLW-D24M-A17PK-R1", new BigDecimal("5299"),
                "240mm Dual-Chamber Gen S Liquid Pump, Expanded Radiator Surface Area, 120mm ARGB Fans",
                "https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, null, 240, "AIO_LIQUID");

        com.buildo.model.Component coolLt520 = createComp("DeepCool LT520 240mm High-Performance AIO", Category.COOLING, "DeepCool", "R-LT520-BKAMNF-G-1", new BigDecimal("7499"),
                "240mm Infinity Mirror Geometric Pump Block, 4th Gen High-Efficiency Water Pump, Anti-Leak Tech",
                "https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, null, 240, "AIO_LIQUID");

        com.buildo.model.Component coolArctic360 = createComp("Arctic Liquid Freezer III 360 ARGB AIO", Category.COOLING, "Arctic", "ACFRE00144A", new BigDecimal("10999"),
                "360mm Extra-Thick 38mm Radiator, VRM Fan on Pump Block, Maximum cooling headroom for 14th Gen & Ryzen 9",
                "https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, null, 360, "AIO_LIQUID");

        com.buildo.model.Component coolKraken360 = createComp("NZXT Kraken Elite 360 RGB LCD AIO", Category.COOLING, "NZXT", "RL-KR36E-B1", new BigDecimal("23499"),
                "360mm Premium Liquid Cooler with 2.36\" Wide-Angle 60Hz LCD Screen for System Stats & GIFs",
                "https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=500&q=85",
                null, null, null, null, null, null, null, null, null, null, null, 360, "AIO_LIQUID");

        comps.addAll(Arrays.asList(coolStock, coolAg300, coolAg400, coolPeerless, coolCm240, coolLt520, coolArctic360, coolKraken360));

        // Save all 60+ components
        componentRepository.saveAll(comps);

        // ==========================================
        // 10. Multi-Budget Curated Presets (7 Presets)
        // ==========================================
        // Preset 1: Budget Esports 1080p Gamer (Entry Level ~₹44,999)
        Preset pBudgetGaming = new Preset();
        pBudgetGaming.setName("Budget Esports 1080p Gamer");
        pBudgetGaming.setCategory(PresetCategory.GAMING);
        pBudgetGaming.setDescription("Perfect affordable entry for smooth 1080p 144Hz competitive gaming in Valorant, CS2, Fortnite, and GTA V with zero stutter.");
        pBudgetGaming.setTargetResolutionOrUse("1080p 144FPS Esports & Casual AAA Gaming");
        pBudgetGaming.setBasePrice(new BigDecimal("44999"));
        pBudgetGaming.setDiscountPercent(5);
        pBudgetGaming.setImageUrl("https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=85");
        pBudgetGaming.setComponents(Arrays.asList(cpuRyzen5500, mbGigabyteA520M, ramCorsair16GbDdr4, ssdKingston500Gb, gpuRx6600, psuAnt500W, cabAntIce100, coolAg300));
        savePresetIfMissing(pBudgetGaming);

        // Preset 2: Value 1440p High-FPS Gamer (Mid-Range ~₹89,999)
        Preset pMidGaming = new Preset();
        pMidGaming.setName("Value 1440p High-FPS Gamer");
        pMidGaming.setCategory(PresetCategory.GAMING);
        pMidGaming.setDescription("The sweet spot of price-to-performance. High-FPS 1440p gaming powered by AMD Ryzen 5 7600X and NVIDIA GeForce RTX 4060 Ti with DLSS 3 frame generation.");
        pMidGaming.setTargetResolutionOrUse("1440p High-FPS & DLSS 3 Ray Tracing");
        pMidGaming.setBasePrice(new BigDecimal("89999"));
        pMidGaming.setDiscountPercent(6);
        pMidGaming.setImageUrl("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=85");
        pMidGaming.setComponents(Arrays.asList(cpuRyzen7600X, mbAsrockB650M, ramCorsair32GbDdr5, ssdCrucial1Tb, gpuRtx4060Ti, psuCoolermaster650W, cabDeepcoolCc560, coolAg400));
        savePresetIfMissing(pMidGaming);

        // Preset 3: Apex Dominator 4K Gaming (Flagship ~₹2,39,999)
        Preset pApexGaming = new Preset();
        pApexGaming.setName("Apex Dominator 4K Gaming Rig");
        pApexGaming.setCategory(PresetCategory.GAMING);
        pApexGaming.setDescription("Engineered for uncompromising 4K AAA gaming at ultra max settings. Combines the world's best gaming CPU, the Ryzen 7 7800X3D, with the beastly RTX 4080 Super.");
        pApexGaming.setTargetResolutionOrUse("4K 144FPS Ultra Max Settings & Full Ray Tracing");
        pApexGaming.setBasePrice(new BigDecimal("239999"));
        pApexGaming.setDiscountPercent(5);
        pApexGaming.setImageUrl("https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=85");
        pApexGaming.setComponents(Arrays.asList(cpuRyzen7800X3D, mbMsiB650Tomahawk, ramGskill32GbDdr5, ssdWdBlack1Tb, gpuRtx4080Super, psuCorsair850W, cabLianLiO11, coolKraken360));
        savePresetIfMissing(pApexGaming);

        // Preset 4: Budget Student & Home Office (Entry Office ~₹29,999)
        Preset pBudgetOffice = new Preset();
        pBudgetOffice.setName("Budget Student & Home Office");
        pBudgetOffice.setCategory(PresetCategory.OFFICE);
        pBudgetOffice.setDescription("Fast, snappy, and silent PC built for everyday computing, remote work, Zoom meetings, and multi-tab browsing on a budget.");
        pBudgetOffice.setTargetResolutionOrUse("Silent Operation, Online Classes, & Office Suites");
        pBudgetOffice.setBasePrice(new BigDecimal("29999"));
        pBudgetOffice.setDiscountPercent(5);
        pBudgetOffice.setImageUrl("https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=85");
        pBudgetOffice.setComponents(Arrays.asList(cpuI3_14100F, mbMsiH610M, ramCrucial8GbDdr4, ssdKingston500Gb, gpuRtx3050, psuAnt500W, cabQm300L, coolStock));
        savePresetIfMissing(pBudgetOffice);

        // Preset 5: SwiftPro Productivity & Coding (Mid-Range Office ~₹64,999)
        Preset pMidOffice = new Preset();
        pMidOffice.setName("SwiftPro Productivity & Coding");
        pMidOffice.setCategory(PresetCategory.OFFICE);
        pMidOffice.setDescription("Built for software developers, financial analysts, and power multitaskers who need fast code compilation, virtual machines, and multiple 4K displays.");
        pMidOffice.setTargetResolutionOrUse("Multi-Monitor Workspace, Docker & Fast Compiles");
        pMidOffice.setBasePrice(new BigDecimal("64999"));
        pMidOffice.setDiscountPercent(8);
        pMidOffice.setImageUrl("https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=85");
        pMidOffice.setComponents(Arrays.asList(cpuI5_14400F, mbAsusB760M, ramCorsair32GbDdr5, ssdWdBlue1Tb, gpuRtx4060, psuDeepcool550W, cabQm300L, coolAg400));
        savePresetIfMissing(pMidOffice);

        // Preset 6: Creator Studio Pro 3D/CAD (~₹2,84,999)
        Preset pStudio = new Preset();
        pStudio.setName("Creator Studio Pro 3D & CAD");
        pStudio.setCategory(PresetCategory.STUDIO);
        pStudio.setDescription("The ultimate workstation for Blender 3D rendering, Maya, AutoCAD, Unreal Engine 5 real-time ray-tracing, and high-fidelity music production DAWs.");
        pStudio.setTargetResolutionOrUse("Blender 3D, Unreal Engine 5, Architectural CAD");
        pStudio.setBasePrice(new BigDecimal("284999"));
        pStudio.setDiscountPercent(7);
        pStudio.setImageUrl("https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=85");
        pStudio.setComponents(Arrays.asList(cpuI9_14900K, mbMsiZ790Tomahawk, ramCorsair64GbDdr5, ssdSamsung2Tb, gpuRtx4070TiSuper, psuCorsair1000W, cabNzxtH9, coolArctic360));
        savePresetIfMissing(pStudio);

        // Preset 7: DaVinci CineRender 8K (~₹2,69,999)
        Preset pVideo = new Preset();
        pVideo.setName("DaVinci CineRender 8K Workstation");
        pVideo.setCategory(PresetCategory.VIDEO_EDITING);
        pVideo.setDescription("Built specifically for professional colorists and video editors handling multi-stream 4K/8K ProRes, RED RAW timelines, and complex After Effects VFX.");
        pVideo.setTargetResolutionOrUse("8K Raw Timeline Playback & Fast Multi-Stream Export");
        pVideo.setBasePrice(new BigDecimal("269999"));
        pVideo.setDiscountPercent(5);
        pVideo.setImageUrl("https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=85");
        pVideo.setComponents(Arrays.asList(cpuRyzen7950X, mbMsiB650Tomahawk, ramGskill64GbDdr5, ssdSamsung2Tb, gpuRtx4080Super, psuCorsair1000W, cabLianLiO11, coolKraken360));
        savePresetIfMissing(pVideo);

        // Additional ready-to-customize builds assembled only from the existing catalog.
        List<com.buildo.model.Component> compactCreatorParts = Arrays.asList(
                cpuI5_12400F, mbMsiH610M, ramCorsair16GbDdr4, ssdKingston500Gb,
                gpuRtx3050, psuAnt500W, cabQm300L, coolStock);
        Preset pCompactCreator = new Preset();
        pCompactCreator.setName("Compact 1080p Creator");
        pCompactCreator.setCategory(PresetCategory.STUDIO);
        pCompactCreator.setDescription("A compact, accessible starting point for everyday creative work, online classes, and entry-level 1080p gaming.");
        pCompactCreator.setTargetResolutionOrUse("Compact mATX · 1080p esports · Everyday creation");
        pCompactCreator.setBasePrice(totalPrice(compactCreatorParts));
        pCompactCreator.setDiscountPercent(4);
        pCompactCreator.setImageUrl("/pc-setup.jpg");
        pCompactCreator.setComponents(compactCreatorParts);
        savePresetIfMissing(pCompactCreator);

        List<com.buildo.model.Component> streamingParts = Arrays.asList(
                cpuRyzen5600X, mbMsiB550M, ramGskill32GbDdr4, ssdWdBlue1Tb,
                gpuRx7700XT, psuCorsair750W, cabDeepcoolCc560, coolPeerless);
        Preset pStreaming = new Preset();
        pStreaming.setName("Streaming Ready 1440p");
        pStreaming.setCategory(PresetCategory.GAMING);
        pStreaming.setDescription("A balanced gaming and streaming build with 32GB of memory, fast NVMe storage, and room for a dual-monitor setup.");
        pStreaming.setTargetResolutionOrUse("1440p gaming · Streaming · 32GB memory");
        pStreaming.setBasePrice(totalPrice(streamingParts));
        pStreaming.setDiscountPercent(5);
        pStreaming.setImageUrl("/setup-bg.jpg");
        pStreaming.setComponents(streamingParts);
        savePresetIfMissing(pStreaming);

        List<com.buildo.model.Component> quietGamingParts = Arrays.asList(
                cpuRyzen9700X, mbGigabyteB650, ramCorsair32GbDdr5, ssdWdBlue1Tb,
                gpuRtx4070Super, psuCorsair850W, cabCorsair4000D, coolArctic360);
        Preset pQuietGaming = new Preset();
        pQuietGaming.setName("Quiet 1440p Gaming Build");
        pQuietGaming.setCategory(PresetCategory.GAMING);
        pQuietGaming.setDescription("A modern AM5 gaming system with a high-airflow case, generous cooling, and a strong 1440p graphics card.");
        pQuietGaming.setTargetResolutionOrUse("1440p high refresh · AM5 upgrade path · High-airflow case");
        pQuietGaming.setBasePrice(totalPrice(quietGamingParts));
        pQuietGaming.setDiscountPercent(5);
        pQuietGaming.setImageUrl("/pc-setup.jpg");
        pQuietGaming.setComponents(quietGamingParts);
        savePresetIfMissing(pQuietGaming);

        List<com.buildo.model.Component> rayTracingParts = Arrays.asList(
                cpuRyzen7800X3D, mbMsiB650Tomahawk, ramGskill32GbDdr5, ssdWdBlack1Tb,
                gpuRtx4080Super, psuCorsair1000W, cabLianLiO11, coolKraken360);
        Preset pRayTracing = new Preset();
        pRayTracing.setName("4K Ray Tracing Max");
        pRayTracing.setCategory(PresetCategory.GAMING);
        pRayTracing.setDescription("A flagship 4K gaming configuration for high visual settings, ray tracing, and demanding modern games.");
        pRayTracing.setTargetResolutionOrUse("4K gaming · Ray tracing · Premium cooling");
        pRayTracing.setBasePrice(totalPrice(rayTracingParts));
        pRayTracing.setDiscountPercent(4);
        pRayTracing.setImageUrl("/setup-bg.jpg");
        pRayTracing.setComponents(rayTracingParts);
        savePresetIfMissing(pRayTracing);

        List<com.buildo.model.Component> workstationParts = Arrays.asList(
                cpuRyzen7950X, mbGigabyteX670E, ramCorsair64GbDdr5, ssdSamsung2Tb,
                gpuRtx4090, psuCorsair1000W, cabNzxtH9, coolArctic360);
        Preset pWorkstation = new Preset();
        pWorkstation.setName("AI & 3D Workstation");
        pWorkstation.setCategory(PresetCategory.STUDIO);
        pWorkstation.setDescription("A high-memory workstation configuration for GPU rendering, local AI experiments, simulation, and large creative projects.");
        pWorkstation.setTargetResolutionOrUse("GPU rendering · Local AI · 3D and simulation");
        pWorkstation.setBasePrice(totalPrice(workstationParts));
        pWorkstation.setDiscountPercent(3);
        pWorkstation.setImageUrl("/desk-setup.jpg");
        pWorkstation.setComponents(workstationParts);
        savePresetIfMissing(pWorkstation);

        // Add the demo order once; do not recreate it when catalog seeds are refreshed.
        if (orderRepository.findByOrderNumber("BO-20268821").isEmpty()) {
        Order sampleOrder = new Order();
        sampleOrder.setOrderNumber("BO-20268821");
        sampleOrder.setUser(customer);
        sampleOrder.setBuildName("Apex Dominator 4K Gaming Rig");
        sampleOrder.setCustomerName("Alex Morgan");
        sampleOrder.setCustomerEmail("alex@example.com");
        sampleOrder.setCustomerPhone("+91 9811223344");
        sampleOrder.setShippingAddress("42 Silicon Enclave, Indiranagar");
        sampleOrder.setShippingCity("Bangalore");
        sampleOrder.setPostalCode("560038");
        sampleOrder.setStatus(OrderStatus.PROCESSING);
        sampleOrder.setPaymentMethod(PaymentMethod.UPI);
        sampleOrder.setPaymentStatus(PaymentStatus.PAID);
        sampleOrder.setTransactionId("TXN-UPI9921473");
        sampleOrder.setTrackingNumber("TRK-881920");

        BigDecimal sub = BigDecimal.ZERO;
        for (com.buildo.model.Component c : pApexGaming.getComponents()) {
            sampleOrder.getItems().add(new OrderItem(sampleOrder, c, 1));
            sub = sub.add(c.getPrice());
        }
        sampleOrder.setSubtotal(sub);
        sampleOrder.setDiscountAmount(new BigDecimal("5000.00"));
        BigDecimal afterDisc = sub.subtract(sampleOrder.getDiscountAmount());
        sampleOrder.setTaxAmount(afterDisc.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP));
        sampleOrder.setFinalAmount(afterDisc.add(sampleOrder.getTaxAmount()).setScale(2, RoundingMode.HALF_UP));
        orderRepository.save(sampleOrder);

        Invoice sampleInvoice = new Invoice(sampleOrder, "INV-20268821");
        sampleInvoice.setTransactionId("TXN-UPI9921473");
        sampleInvoice.setPaymentMethod(PaymentMethod.UPI);
        invoiceRepository.save(sampleInvoice);
        }
    }

    private com.buildo.model.Component createComp(String name, Category cat, String brand, String model,
                                                  BigDecimal price, String desc, String img,
                                                  String socket, String formFactor, String suppFactors,
                                                  String memType, Integer memSlots, Integer memSpeed,
                                                  Integer wattage, Integer tdp, String rating,
                                                  Integer len, Integer height, Integer radSize, String coolType) {
        if (model != null && !model.isBlank()) {
            com.buildo.model.Component existing = componentRepository.findFirstByModel(model).orElse(null);
            if (existing != null) {
                return existing;
            }
        }

        com.buildo.model.Component c = new com.buildo.model.Component();
        c.setName(name);
        c.setCategory(cat);
        c.setBrand(brand);
        c.setModel(model);
        c.setPrice(price);
        c.setDescription(desc);
        c.setImageUrl(img);
        c.setSocket(socket);
        c.setFormFactor(formFactor);
        c.setSupportedFormFactors(suppFactors);
        c.setMemoryType(memType);
        c.setMemorySlots(memSlots);
        c.setMemorySpeedMhz(memSpeed);
        c.setWattage(wattage);
        c.setTdp(tdp);
        c.setEfficiencyRating(rating);
        c.setLengthMm(len);
        c.setCoolerHeightMm(height);
        c.setRadiatorSizeMm(radSize);
        c.setCoolerType(coolType);
        c.setInStock(true);
        return c;
    }

    private void savePresetIfMissing(Preset preset) {
        boolean alreadySeeded = presetRepository.findByNameContainingIgnoreCase(preset.getName()).stream()
                .anyMatch(existing -> existing.getName().equalsIgnoreCase(preset.getName()));
        if (!alreadySeeded) {
            presetRepository.save(preset);
        }
    }

    private BigDecimal totalPrice(List<com.buildo.model.Component> components) {
        return components.stream()
                .map(component -> component.getPrice() == null ? BigDecimal.ZERO : component.getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
