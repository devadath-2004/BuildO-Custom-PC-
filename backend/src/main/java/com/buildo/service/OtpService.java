package com.buildo.service;

import com.buildo.dto.RegisterRequest;
import com.buildo.model.Order;
import com.buildo.model.User;
import com.buildo.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int PASSWORD_RESET_MAX_ATTEMPTS = 5;
    private static final int TEMPORARY_PASSWORD_LENGTH = 24;
    private static final String TEMPORARY_PASSWORD_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final JavaMailSender mailSender;
    private final String mailHost;
    private final String username;
    private final String password;
    private final String fromEmail;
    private final boolean developmentFallback;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Map<String, PendingRegistration> pendingMap = new ConcurrentHashMap<>();
    private final Map<String, PendingPasswordReset> pendingPasswordResetMap = new ConcurrentHashMap<>();

    public OtpService(
            JavaMailSender mailSender,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${spring.mail.from:${spring.mail.username:}}") String fromEmail,
            @Value("${buildo.otp.development-fallback:false}") boolean developmentFallback,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.mailSender = mailSender;
        this.mailHost = mailHost;
        this.username = username;
        this.password = password;
        this.fromEmail = fromEmail;
        this.developmentFallback = developmentFallback;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static class PendingRegistration {
        private final RegisterRequest request;
        private String otp;
        private LocalDateTime expiresAt;

        public PendingRegistration(RegisterRequest request, String otp, LocalDateTime expiresAt) {
            this.request = request;
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        public RegisterRequest getRequest() {
            return request;
        }

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }

        public LocalDateTime getExpiresAt() {
            return expiresAt;
        }

        public void setExpiresAt(LocalDateTime expiresAt) {
            this.expiresAt = expiresAt;
        }

        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    /** Sends an OTP and stores the registration only after delivery succeeds. */
    public String generateAndSendOtp(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp = generateOtp();
        boolean developmentCode = sendEmailNotification(email, request.getFullName(), otp);

        pendingMap.put(email, new PendingRegistration(
                request, otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));

        // Only local development mode may return the OTP to the UI.
        return developmentCode ? otp : null;
    }

    /** Resends a new OTP without invalidating the current code unless delivery succeeds. */
    public String resendOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        PendingRegistration pending = pendingMap.get(normalizedEmail);
        if (pending == null) {
            return null;
        }

        String newOtp = generateOtp();
        boolean developmentCode = sendEmailNotification(
                normalizedEmail, pending.getRequest().getFullName(), newOtp);

        pending.setOtp(newOtp);
        pending.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        return developmentCode ? newOtp : null;
    }

    /** Validates whether the given OTP matches the pending registration. */
    public PendingRegistration validateOtp(String email, String otp) {
        String normalizedEmail = email.trim().toLowerCase();
        PendingRegistration pending = pendingMap.get(normalizedEmail);

        if (pending == null || pending.isExpired()) {
            return null;
        }

        if (!pending.getOtp().equals(otp.trim())) {
            return null;
        }

        return pending;
    }

    public boolean hasPendingRegistration(String email) {
        return email != null && pendingMap.containsKey(email.trim().toLowerCase());
    }

    /** Removes the pending registration upon successful completion. */
    public void removePending(String email) {
        if (email != null) {
            pendingMap.remove(email.trim().toLowerCase());
        }
    }

    /** Starts an email-ownership check before issuing a temporary password. */
    public String requestPasswordReset(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (user == null) {
            // The controller returns the same response whether an account exists or not.
            return null;
        }

        String otp = generateOtp();
        boolean developmentCode = sendPasswordResetOtp(normalizedEmail, otp);
        pendingPasswordResetMap.put(normalizedEmail, new PendingPasswordReset(
                otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        return developmentCode ? otp : null;
    }

    /** Verifies the email code, then emails and stores a newly generated temporary password. */
    public void verifyPasswordReset(String email, String otp) {
        String normalizedEmail = email.trim().toLowerCase();
        PendingPasswordReset pending = pendingPasswordResetMap.get(normalizedEmail);
        if (pending == null || pending.isExpired()) {
            pendingPasswordResetMap.remove(normalizedEmail);
            throw invalidPasswordResetCode();
        }
        if (pending.attempts >= PASSWORD_RESET_MAX_ATTEMPTS) {
            pendingPasswordResetMap.remove(normalizedEmail);
            throw invalidPasswordResetCode();
        }

        byte[] expectedCode = pending.otp.getBytes(StandardCharsets.UTF_8);
        byte[] submittedCode = otp.trim().getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(expectedCode, submittedCode)) {
            pending.attempts++;
            if (pending.attempts >= PASSWORD_RESET_MAX_ATTEMPTS) {
                pendingPasswordResetMap.remove(normalizedEmail);
            }
            throw invalidPasswordResetCode();
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(OtpService::invalidPasswordResetCode);
        String temporaryPassword = generateTemporaryPassword();
        sendTemporaryPassword(normalizedEmail, temporaryPassword);

        user.setPassword(passwordEncoder.encode(temporaryPassword));
        userRepository.save(user);
        pendingPasswordResetMap.remove(normalizedEmail);
    }

    /** Sends a receipt for the ₹1 test-mode verification charge (not for the full PC order). */
    public boolean sendVerificationReceipt(Order order, String paymentId, byte[] receiptPdf) {
        String toEmail = order.getCustomerEmail();
        if (!hasText(toEmail) || !isSmtpConfigured()) {
            logger.warn("₹1 verification receipt was not sent because the recipient or SMTP settings are missing.");
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "BuildO PC Builder");
            helper.setTo(toEmail);
            helper.setSubject("Your BuildO demo payment receipt (₹1 test payment)");
            helper.setText(getVerificationReceiptTemplate(
                    order.getCustomerName(), order.getOrderNumber(), paymentId,
                    order.getFinalAmount() == null ? "0.00" : order.getFinalAmount().toPlainString(),
                    order.getRazorpayVerificationRefundStatus(), order.getRazorpayVerificationRefundId()), true);
            helper.addAttachment("BuildO-Demo-Receipt-" + safeAttachmentName(order.getOrderNumber()) + ".pdf",
                    new ByteArrayResource(receiptPdf));
            mailSender.send(message);
            logger.info("₹1 test receipt PDF sent for BuildO order {}", order.getOrderNumber());
            return true;
        } catch (Exception ex) {
            logger.error("Could not send ₹1 verification receipt for BuildO order {}", order.getOrderNumber(), ex);
            return false;
        }
    }

    private static ResponseStatusException invalidPasswordResetCode() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid or expired verification code. Request a new password reset code and try again.");
    }

    private String generateOtp() {
        return String.format("%06d", SECURE_RANDOM.nextInt(900_000) + 100_000);
    }

    private String generateTemporaryPassword() {
        StringBuilder value = new StringBuilder(TEMPORARY_PASSWORD_LENGTH);
        for (int i = 0; i < TEMPORARY_PASSWORD_LENGTH; i++) {
            value.append(TEMPORARY_PASSWORD_CHARACTERS.charAt(
                    SECURE_RANDOM.nextInt(TEMPORARY_PASSWORD_CHARACTERS.length())));
        }
        return value.toString();
    }

    private boolean sendPasswordResetOtp(String toEmail, String otp) {
        if (!isSmtpConfigured()) {
            if (developmentFallback) {
                logger.warn("SMTP is not configured. Development password-reset OTP for {}: {}", toEmail, otp);
                return true;
            }
            logger.warn("Password-reset OTP was not sent because SMTP is not configured.");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Password reset email is not configured. Set the SMTP environment variables and restart the backend.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "BuildO PC Builder");
            helper.setTo(toEmail);
            helper.setSubject("Your BuildO password reset code");
            helper.setText(getPasswordResetOtpTemplate(otp), true);
            mailSender.send(message);
            logger.info("Password-reset code sent to {}", toEmail);
            return false;
        } catch (Exception ex) {
            logger.error("SMTP password-reset code delivery failed for {}", toEmail, ex);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not send the password reset code. Check the SMTP settings and try again.");
        }
    }

    private void sendTemporaryPassword(String toEmail, String temporaryPassword) {
        if (!isSmtpConfigured()) {
            logger.warn("Temporary password was not sent because SMTP is not configured.");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Password reset email is not configured. Set the SMTP environment variables and restart the backend.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "BuildO PC Builder");
            helper.setTo(toEmail);
            helper.setSubject("Your temporary BuildO password");
            helper.setText(getTemporaryPasswordTemplate(temporaryPassword), true);
            mailSender.send(message);
            logger.info("Temporary password delivered to {}", toEmail);
        } catch (Exception ex) {
            logger.error("SMTP temporary-password delivery failed for {}", toEmail, ex);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not send the temporary password. Your current password has not been changed.");
        }
    }

    private String getPasswordResetOtpTemplate(String otp) {
        return """
            <div style="font-family:Arial,sans-serif;background:#10110d;color:#f5f6ef;padding:32px;border-radius:16px;max-width:520px;margin:auto">
              <h2 style="color:#d8ff43;margin-bottom:8px">Reset your BuildO password</h2>
              <p style="font-size:14px;color:#c9cbbd;line-height:1.6">Use this six-digit code to verify that you own this email address.</p>
              <div style="text-align:center;margin:24px 0">
                <span style="font:700 32px monospace;letter-spacing:8px;color:#d8ff43;background:#191b14;padding:12px 24px;border-radius:12px;border:1px solid #829c12">%s</span>
              </div>
              <p style="font-size:12px;color:#96978e">The code expires in %d minutes. If you did not request a reset, ignore this message; your password will remain unchanged.</p>
            </div>
            """.formatted(otp, OTP_EXPIRY_MINUTES);
    }

    private String getTemporaryPasswordTemplate(String temporaryPassword) {
        return """
            <div style="font-family:Arial,sans-serif;background:#10110d;color:#f5f6ef;padding:32px;border-radius:16px;max-width:520px;margin:auto">
              <h2 style="color:#d8ff43;margin-bottom:8px">Your new BuildO password</h2>
              <p style="font-size:14px;color:#c9cbbd;line-height:1.6">Your email was verified. Use this newly generated password to sign in to BuildO:</p>
              <div style="text-align:center;margin:24px 0">
                <span style="display:inline-block;font:700 20px monospace;letter-spacing:2px;color:#d8ff43;background:#191b14;padding:14px 18px;border-radius:12px;border:1px solid #829c12">%s</span>
              </div>
              <p style="font-size:12px;color:#96978e">Keep this password private. If you did not request this reset, contact BuildO support.</p>
            </div>
            """.formatted(temporaryPassword);
    }

    private String getVerificationReceiptTemplate(String customerName, String orderNumber, String paymentId,
                                                  String buildTotal, String refundStatus, String refundId) {
        String safeName = escapeHtml(hasText(customerName) ? customerName : "BuildO customer");
        String safeOrderNumber = escapeHtml(orderNumber);
        String safePaymentId = escapeHtml(paymentId);
        String safeBuildTotal = escapeHtml(buildTotal);
        String safeRefundStatus = escapeHtml(hasText(refundStatus) ? refundStatus.replace('_', ' ') : "Not available");
        String safeRefundId = escapeHtml(refundId);
        String refundDetails = hasText(refundId)
                ? "<p style=\"margin:6px 0;color:#c9cbbd\"><strong>Refund reference:</strong> " + safeRefundId + "</p>"
                : "";

        return """
            <div style="font-family:Arial,sans-serif;background:#10110d;color:#f5f6ef;padding:32px;border-radius:16px;max-width:560px;margin:auto">
              <h2 style="color:#d8ff43;margin:0 0 8px">BuildO payment verification receipt</h2>
              <p style="font-size:14px;color:#c9cbbd;line-height:1.6">Hello %s, Razorpay verified the ₹1.00 test-mode payment for your BuildO checkout.</p>
              <div style="background:#191b14;border:1px solid #3d4820;border-radius:12px;padding:18px;margin:20px 0">
                <p style="margin:6px 0;color:#c9cbbd"><strong>Verification amount:</strong> ₹1.00 INR</p>
                <p style="margin:6px 0;color:#c9cbbd"><strong>Build total (reference only):</strong> ₹%s INR — not charged</p>
                <p style="margin:6px 0;color:#c9cbbd"><strong>BuildO order reference:</strong> %s</p>
                <p style="margin:6px 0;color:#c9cbbd"><strong>Razorpay payment ID:</strong> %s</p>
                <p style="margin:6px 0;color:#c9cbbd"><strong>Refund status:</strong> %s</p>
                %s
              </div>
              <p style="font-size:12px;color:#a6a895;line-height:1.6"><strong>DEMO / TEST MODE:</strong> BuildO marks this order paid only for local demo flow. Only the ₹1 test payment was verified; the full build amount above was not collected. This is not a tax invoice or proof of full payment, and the order must not be fulfilled. Razorpay test mode does not move real money.</p>
            </div>
            """.formatted(safeName, safeBuildTotal, safeOrderNumber, safePaymentId, safeRefundStatus, refundDetails);
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String safeAttachmentName(String value) {
        return value == null ? "order" : value.replaceAll("[^A-Za-z0-9._-]", "_");
    }

    private static class PendingPasswordReset {
        private final String otp;
        private final LocalDateTime expiresAt;
        private int attempts;

        private PendingPasswordReset(String otp, LocalDateTime expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        private boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    /**
     * @return true only when returning the code through the API is permitted for local development.
     */
    private boolean sendEmailNotification(String toEmail, String fullName, String otp) {
        if (!isSmtpConfigured()) {
            if (developmentFallback) {
                logger.warn("SMTP is not configured. Development OTP for {}: {}", toEmail, otp);
                return true;
            }
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Email verification is not configured. Set SPRING_MAIL_USERNAME and SPRING_MAIL_PASSWORD, then restart the backend.");
        }

        String recipient = (fullName != null && !fullName.isBlank()) ? fullName : "there";
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "BuildO PC Builder");
            helper.setTo(toEmail);
            helper.setSubject("Your BuildO account verification code");
            helper.setText(getHtmlOtpTemplate(recipient, otp), true);
            mailSender.send(message);
            logger.info("Verification email sent to {}", toEmail);
            return false;
        } catch (Exception ex) {
            logger.error("SMTP delivery failed for {}", toEmail, ex);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not send the verification email. Check your SMTP host, sender address, and app password.");
        }
    }

    private boolean isSmtpConfigured() {
        return mailSender != null
                && hasText(mailHost)
                && hasText(username)
                && hasText(password)
                && hasText(fromEmail);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String getHtmlOtpTemplate(String recipient, String otp) {
        return """
            <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 32px; border-radius: 16px; max-width: 520px; margin: auto;">
              <h2 style="color: #06b6d4; margin-bottom: 8px;">BuildO PC Customizer</h2>
              <p style="font-size: 14px; color: #94a3b8;">Welcome, <strong>%s</strong>!</p>
              <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5;">
                Please use the following 6-digit security code to verify your BuildO account:
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #22d3ee; background-color: #032b35; padding: 12px 24px; border-radius: 12px; border: 1px solid #0891b2; font-family: monospace;">
                  %s
                </span>
              </div>
              <p style="font-size: 12px; color: #64748b;">
                This code will expire in %d minutes. If you did not initiate this request, you can safely ignore this email.
              </p>
            </div>
            """.formatted(recipient, otp, OTP_EXPIRY_MINUTES);
    }
}
