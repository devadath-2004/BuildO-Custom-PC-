package com.buildo.service;

import com.buildo.dto.RegisterRequest;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final JavaMailSender mailSender;
    private final String mailHost;
    private final String username;
    private final String password;
    private final String fromEmail;
    private final boolean developmentFallback;
    private final Map<String, PendingRegistration> pendingMap = new ConcurrentHashMap<>();

    public OtpService(
            JavaMailSender mailSender,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${spring.mail.from:${spring.mail.username:}}") String fromEmail,
            @Value("${buildo.otp.development-fallback:false}") boolean developmentFallback) {
        this.mailSender = mailSender;
        this.mailHost = mailHost;
        this.username = username;
        this.password = password;
        this.fromEmail = fromEmail;
        this.developmentFallback = developmentFallback;
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

    private String generateOtp() {
        return String.format("%06d", SECURE_RANDOM.nextInt(900_000) + 100_000);
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
