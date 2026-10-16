package com.buildo.service;

import com.buildo.model.Invoice;
import com.buildo.model.OrderItem;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class InvoicePdfService {

    private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy, HH:mm");

    public byte[] generateInvoicePdf(Invoice invoice) throws DocumentException {
        Document document = new Document(PageSize.A4, 36, 36, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();

        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(20, 24, 33));
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(100, 116, 139));
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(30, 41, 59));
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(30, 41, 59));
        Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(71, 85, 105));
        Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(15, 23, 42));
        Font badgeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(16, 185, 129));

        // Header Table (Brand + Invoice Meta)
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{60, 40});

        PdfPCell brandCell = new PdfPCell();
        brandCell.setBorder(Rectangle.NO_BORDER);
        Paragraph brand = new Paragraph("BuildO", titleFont);
        Paragraph brandDesc = new Paragraph("Custom PC Configurator & High-Performance Rigs\nGSTIN: 27AABCB1234F1Z9\nsupport@buildo.pc | www.buildo.pc", subtitleFont);
        brandCell.addElement(brand);
        brandCell.addElement(brandDesc);
        headerTable.addCell(brandCell);

        PdfPCell metaCell = new PdfPCell();
        metaCell.setBorder(Rectangle.NO_BORDER);
        metaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph invTitle = new Paragraph("TAX INVOICE", headerFont);
        invTitle.setAlignment(Element.ALIGN_RIGHT);
        Paragraph invNum = new Paragraph("Invoice #: " + invoice.getInvoiceNumber(), boldFont);
        invNum.setAlignment(Element.ALIGN_RIGHT);
        Paragraph invDate = new Paragraph("Date: " + invoice.getIssueDate().format(DATE_FORMATTER), regularFont);
        invDate.setAlignment(Element.ALIGN_RIGHT);
        Paragraph statusPara = new Paragraph("PAYMENT STATUS: PAID", badgeFont);
        statusPara.setAlignment(Element.ALIGN_RIGHT);

        metaCell.addElement(invTitle);
        metaCell.addElement(invNum);
        metaCell.addElement(invDate);
        metaCell.addElement(statusPara);
        headerTable.addCell(metaCell);

        document.add(headerTable);
        document.add(new Paragraph(" "));

        // Customer & Shipping Info Box
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{50, 50});

        PdfPCell customerCell = new PdfPCell();
        customerCell.setBackgroundColor(new Color(248, 250, 252));
        customerCell.setPadding(10);
        customerCell.setBorderColor(new Color(226, 232, 240));

        Paragraph billTo = new Paragraph("BILLED TO / SHIP TO:", boldFont);
        Paragraph custName = new Paragraph(invoice.getCustomerName(), headerFont);
        Paragraph custEmail = new Paragraph("Email: " + invoice.getCustomerEmail(), regularFont);
        Paragraph custPhone = new Paragraph("Phone: " + invoice.getCustomerPhone(), regularFont);
        Paragraph custAddress = new Paragraph("Address: " + invoice.getShippingAddress(), regularFont);

        customerCell.addElement(billTo);
        customerCell.addElement(custName);
        customerCell.addElement(custEmail);
        customerCell.addElement(custPhone);
        customerCell.addElement(custAddress);
        infoTable.addCell(customerCell);

        PdfPCell paymentCell = new PdfPCell();
        paymentCell.setBackgroundColor(new Color(248, 250, 252));
        paymentCell.setPadding(10);
        paymentCell.setBorderColor(new Color(226, 232, 240));

        Paragraph payInfoTitle = new Paragraph("ORDER & PAYMENT DETAILS:", boldFont);
        Paragraph orderNum = new Paragraph("Order #: " + invoice.getOrder().getOrderNumber(), regularFont);
        Paragraph buildName = new Paragraph("Build: " + (invoice.getOrder().getBuildName() != null ? invoice.getOrder().getBuildName() : "Custom Rig"), regularFont);
        Paragraph payMode = new Paragraph("Payment Mode: " + (invoice.getPaymentMethod() != null ? invoice.getPaymentMethod().name() : "ONLINE"), regularFont);
        Paragraph txnId = new Paragraph("Transaction ID: " + (invoice.getTransactionId() != null ? invoice.getTransactionId() : "TXN-OFFLINE"), regularFont);

        paymentCell.addElement(payInfoTitle);
        paymentCell.addElement(orderNum);
        paymentCell.addElement(buildName);
        paymentCell.addElement(payMode);
        paymentCell.addElement(txnId);
        infoTable.addCell(paymentCell);

        document.add(infoTable);
        document.add(new Paragraph(" "));

        // Itemized Components Table
        PdfPTable itemsTable = new PdfPTable(5);
        itemsTable.setWidthPercentage(100);
        itemsTable.setWidths(new float[]{8, 22, 42, 12, 16});

        // Header
        String[] headers = {"#", "Category", "Component Description", "Qty", "Amount (INR)"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, boldFont));
            cell.setBackgroundColor(new Color(241, 245, 249));
            cell.setPadding(6);
            cell.setBorderColor(new Color(203, 213, 225));
            cell.setHorizontalAlignment(h.contains("Amount") || h.equals("Qty") ? Element.ALIGN_RIGHT : Element.ALIGN_LEFT);
            itemsTable.addCell(cell);
        }

        int index = 1;
        if (invoice.getOrder().getItems() != null) {
            for (OrderItem item : invoice.getOrder().getItems()) {
                Color rowBg = (index % 2 == 0) ? new Color(248, 250, 252) : Color.WHITE;

                PdfPCell idxCell = new PdfPCell(new Phrase(String.valueOf(index++), regularFont));
                idxCell.setBackgroundColor(rowBg);
                idxCell.setPadding(6);
                idxCell.setBorderColor(new Color(226, 232, 240));
                itemsTable.addCell(idxCell);

                PdfPCell catCell = new PdfPCell(new Phrase(item.getCategory().name(), boldFont));
                catCell.setBackgroundColor(rowBg);
                catCell.setPadding(6);
                catCell.setBorderColor(new Color(226, 232, 240));
                itemsTable.addCell(catCell);

                PdfPCell nameCell = new PdfPCell(new Phrase(item.getComponentName(), regularFont));
                nameCell.setBackgroundColor(rowBg);
                nameCell.setPadding(6);
                nameCell.setBorderColor(new Color(226, 232, 240));
                itemsTable.addCell(nameCell);

                PdfPCell qtyCell = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), regularFont));
                qtyCell.setBackgroundColor(rowBg);
                qtyCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                qtyCell.setPadding(6);
                qtyCell.setBorderColor(new Color(226, 232, 240));
                itemsTable.addCell(qtyCell);

                PdfPCell priceCell = new PdfPCell(new Phrase("₹" + item.getPrice().toString(), regularFont));
                priceCell.setBackgroundColor(rowBg);
                priceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                priceCell.setPadding(6);
                priceCell.setBorderColor(new Color(226, 232, 240));
                itemsTable.addCell(priceCell);
            }
        }

        document.add(itemsTable);
        document.add(new Paragraph(" "));

        // Financial Totals Table
        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(45);
        totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalsTable.setWidths(new float[]{60, 40});

        addTotalRow(totalsTable, "Subtotal:", "₹" + invoice.getSubtotal(), regularFont);
        if (invoice.getDiscountAmount() != null && invoice.getDiscountAmount().doubleValue() > 0) {
            addTotalRow(totalsTable, "Discount:", "-₹" + invoice.getDiscountAmount(), regularFont);
        }
        addTotalRow(totalsTable, "GST (18%):", "₹" + invoice.getTaxAmount(), regularFont);
        addTotalRow(totalsTable, "Total Payable:", "₹" + invoice.getTotalAmount(), totalFont);

        document.add(totalsTable);

        // Footer Note
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));
        Paragraph footerNote = new Paragraph("Important Information:\n" +
                "• 3-Year comprehensive hardware assembly and parts warranty backed by BuildO and official brand manufacturers.\n" +
                "• All parts are 100% brand new, factory sealed, and benchmark stress-tested for 4 hours prior to delivery.\n" +
                "• This is a computer-generated tax invoice and requires no physical signature.", subtitleFont);
        document.add(footerNote);

        document.close();
        return out.toByteArray();
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setPadding(4);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPadding(4);
        table.addCell(valueCell);
    }
}
