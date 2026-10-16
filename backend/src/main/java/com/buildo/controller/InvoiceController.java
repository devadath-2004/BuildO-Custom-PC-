package com.buildo.controller;

import com.buildo.model.Invoice;
import com.buildo.model.Order;
import com.buildo.model.PaymentStatus;
import com.buildo.repository.InvoiceRepository;
import com.buildo.service.InvoicePdfService;
import com.buildo.service.OrderService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final OrderService orderService;
    private final InvoicePdfService invoicePdfService;

    public InvoiceController(InvoiceRepository invoiceRepository,
                             OrderService orderService,
                             InvoicePdfService invoicePdfService) {
        this.invoiceRepository = invoiceRepository;
        this.orderService = orderService;
        this.invoicePdfService = invoicePdfService;
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getInvoiceByOrderId(@PathVariable Long orderId,
                                                  Authentication authentication) {
        Optional<Order> orderOpt = authorizedPaidOrder(orderId, authentication);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseGet(() -> invoiceRepository.save(createInvoice(order)));
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/{orderId}/download")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long orderId,
                                                     Authentication authentication) {
        try {
            Optional<Order> orderOpt = authorizedPaidOrder(orderId, authentication);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Order order = orderOpt.get();
            Invoice invoice = invoiceRepository.findByOrderId(orderId)
                    .orElseGet(() -> invoiceRepository.save(createInvoice(order)));
            byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData(
                    "attachment", "BuildO-Invoice-" + invoice.getInvoiceNumber() + ".pdf");
            headers.setContentLength(pdfBytes.length);
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private Optional<Order> authorizedPaidOrder(Long orderId, Authentication authentication) {
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        return orderService.getOrderByIdForUser(orderId, authentication.getName(), admin)
                .filter(order -> order.getPaymentStatus() == PaymentStatus.PAID);
    }

    private Invoice createInvoice(Order order) {
        String invoiceNumber = "INV-" + order.getOrderNumber().replace("BO-", "");
        return new Invoice(order, invoiceNumber);
    }
}
