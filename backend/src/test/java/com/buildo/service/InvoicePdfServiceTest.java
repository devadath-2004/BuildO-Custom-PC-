package com.buildo.service;

import com.buildo.model.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class InvoicePdfServiceTest {

    @Test
    @DisplayName("Generate Valid PDF Invoice Byte Stream")
    void testGenerateInvoicePdf() throws Exception {
        InvoicePdfService service = new InvoicePdfService();

        Order order = new Order();
        order.setOrderNumber("BO-TEST12345");
        order.setBuildName("Apex Dominator Gaming Rig");
        order.setCustomerName("Alex Morgan");
        order.setCustomerEmail("alex@example.com");
        order.setCustomerPhone("+91 9811223344");
        order.setShippingAddress("42 Silicon Enclave, Bangalore");
        order.setPaymentMethod(PaymentMethod.UPI);
        order.setTransactionId("TXN-TEST9999");
        order.setSubtotal(new BigDecimal("150000.00"));
        order.setDiscountAmount(new BigDecimal("5000.00"));
        order.setTaxAmount(new BigDecimal("26100.00"));
        order.setFinalAmount(new BigDecimal("171100.00"));

        Component cpu = new Component();
        cpu.setName("AMD Ryzen 7 7800X3D");
        cpu.setCategory(Category.CPU);
        cpu.setPrice(new BigDecimal("39999.00"));

        OrderItem item = new OrderItem(order, cpu, 1);
        order.setItems(List.of(item));

        Invoice invoice = new Invoice(order, "INV-TEST12345");
        invoice.setTransactionId("TXN-TEST9999");
        invoice.setPaymentMethod(PaymentMethod.UPI);

        byte[] pdfBytes = service.generateInvoicePdf(invoice);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 500, "PDF byte stream should contain binary data");

        // Verify PDF Magic Bytes: %PDF
        assertEquals('%', (char) pdfBytes[0]);
        assertEquals('P', (char) pdfBytes[1]);
        assertEquals('D', (char) pdfBytes[2]);
        assertEquals('F', (char) pdfBytes[3]);
    }
}
