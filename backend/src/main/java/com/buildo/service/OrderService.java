package com.buildo.service;

import com.buildo.dto.OrderItemDto;
import com.buildo.dto.OrderRequest;
import com.buildo.model.*;
import com.buildo.repository.ComponentRepository;
import com.buildo.repository.OrderRepository;
import com.buildo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ComponentRepository componentRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        ComponentRepository componentRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.componentRepository = componentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Order createOrder(OrderRequest request, String authenticatedUsername) {
        if (authenticatedUsername == null || authenticatedUsername.isBlank()) {
            throw new IllegalArgumentException("Sign in before creating an order.");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("An order must contain at least one component.");
        }

        Order order = new Order();
        order.setOrderNumber("BO-" + System.currentTimeMillis() % 10000000);
        order.setBuildName(request.getBuildName() != null && !request.getBuildName().isBlank()
                ? request.getBuildName() : "Custom Gaming & Creator PC");
        User owner = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new IllegalArgumentException("The signed-in account could not be found."));
        order.setUser(owner);

        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setShippingCity(request.getShippingCity());
        order.setPostalCode(request.getPostalCode());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setTrackingNumber("TRK-" + (100000 + (int)(Math.random() * 900000)));

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemDto itemDto : request.getItems()) {
            if (itemDto.getQuantity() == null || itemDto.getQuantity() < 1) {
                throw new IllegalArgumentException("Component quantities must be at least one.");
            }
            Component comp = componentRepository.findById(itemDto.getComponentId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Component not found: " + itemDto.getComponentId()));
            if (Boolean.FALSE.equals(comp.getInStock())) {
                throw new IllegalArgumentException(comp.getName() + " is out of stock.");
            }
            OrderItem item = new OrderItem(order, comp, itemDto.getQuantity());
            order.getItems().add(item);
            BigDecimal linePrice = comp.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(linePrice);
        }

        if (subtotal.signum() <= 0) {
            throw new IllegalArgumentException("Order total must be greater than zero.");
        }
        order.setSubtotal(subtotal);

        // Discount logic
        BigDecimal discount = BigDecimal.ZERO;
        if ("BUILDO10".equalsIgnoreCase(request.getDiscountCode())) {
            discount = subtotal.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        } else if ("PCBUILDER".equalsIgnoreCase(request.getDiscountCode())) {
            discount = subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        }
        order.setDiscountAmount(discount);

        BigDecimal discountedSubtotal = subtotal.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal tax = discountedSubtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        order.setTaxAmount(tax);
        order.setFinalAmount(discountedSubtotal.add(tax).setScale(2, RoundingMode.HALF_UP));

        return orderRepository.save(order);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Order> getOrderByIdForUser(Long id, String username, boolean admin) {
        return orderRepository.findById(id).filter(order -> canAccess(order, username, admin));
    }

    public Optional<Order> getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    @Transactional(readOnly = true)
    public Optional<Order> getOrderByNumberForUser(String orderNumber, String username, boolean admin) {
        return orderRepository.findByOrderNumber(orderNumber)
                .filter(order -> canAccess(order, username, admin));
    }

    @Transactional(readOnly = true)
    public boolean canAccessOrder(Long orderId, String username, boolean admin) {
        return orderRepository.findById(orderId).map(order -> canAccess(order, username, admin)).orElse(false);
    }

    private boolean canAccess(Order order, String username, boolean admin) {
        if (admin) {
            return true;
        }
        return username != null && order.getUser() != null &&
                username.equals(order.getUser().getUsername());
    }

    public List<Order> getUserOrders(String usernameOrEmail) {
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail));

        if (userOpt.isPresent()) {
            return orderRepository.findByUserOrderByCreatedAtDesc(userOpt.get());
        }
        return orderRepository.findByCustomerEmailOrderByCreatedAtDesc(usernameOrEmail);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
        order.setStatus(status);
        if (trackingNumber != null && !trackingNumber.isBlank()) {
            order.setTrackingNumber(trackingNumber);
        }
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }
}
