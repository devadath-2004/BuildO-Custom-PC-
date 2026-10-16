package com.buildo.controller;

import com.buildo.dto.AuthRequest;
import com.buildo.dto.AuthResponse;
import com.buildo.dto.RegisterRequest;
import com.buildo.model.Role;
import com.buildo.model.User;
import com.buildo.repository.UserRepository;
import com.buildo.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.buildo.dto.VerifyOtpRequest;
import com.buildo.service.OtpService;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final OtpService otpService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider,
                          OtpService otpService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.otpService = otpService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(loginRequest.getUsernameOrEmail()))
                .orElse(null);

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid username or password"));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), loginRequest.getPassword())
        );

        String token = tokenProvider.generateToken(user.getUsername(), user.getRole().name());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is already taken!"));
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered!"));
        }

        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getFullName(),
                Role.ROLE_CUSTOMER
        );
        user.setPhone(registerRequest.getPhone());
        user.setAddress(registerRequest.getAddress());

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser.getUsername(), savedUser.getRole().name());

        return ResponseEntity.ok(new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole()
        ));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is already taken!"));
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered!"));
        }

        try {
            String devOtp = otpService.generateAndSendOtp(registerRequest);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("message", devOtp == null
                    ? "Verification code sent to " + registerRequest.getEmail()
                    : "Email delivery is disabled. Use the local development verification code.");
            response.put("email", registerRequest.getEmail());
            if (devOtp != null) {
                response.put("devOtp", devOtp);
            }
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
                    "error", ex.getReason() != null ? ex.getReason() : "Email delivery failed."));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest verifyRequest) {
        OtpService.PendingRegistration pending = otpService.validateOtp(verifyRequest.getEmail(), verifyRequest.getOtp());

        if (pending == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired verification code. Please check your email or request a new one."));
        }

        RegisterRequest reg = pending.getRequest();

        if (userRepository.existsByUsername(reg.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is already taken!"));
        }

        if (userRepository.existsByEmail(reg.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered!"));
        }

        User user = new User(
                reg.getUsername(),
                reg.getEmail(),
                passwordEncoder.encode(reg.getPassword()),
                reg.getFullName(),
                Role.ROLE_CUSTOMER
        );
        user.setPhone(reg.getPhone());
        user.setAddress(reg.getAddress());

        User savedUser = userRepository.save(user);
        otpService.removePending(verifyRequest.getEmail());

        String token = tokenProvider.generateToken(savedUser.getUsername(), savedUser.getRole().name());

        return ResponseEntity.ok(new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole()
        ));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        try {
            String devOtp = otpService.resendOtp(email);
            if (devOtp == null && !otpService.hasPendingRegistration(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "No pending registration found for this email. Please fill out the sign up form again."));
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("message", devOtp == null
                    ? "A new verification code has been sent to " + email
                    : "Email delivery is disabled. Use the local development verification code.");
            if (devOtp != null) {
                response.put("devOtp", devOtp);
            }
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
                    "error", ex.getReason() != null ? ex.getReason() : "Email delivery failed."));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthenticated"));
        }
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "fullName", user.getFullName() != null ? user.getFullName() : user.getUsername(),
                "role", user.getRole().name(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "address", user.getAddress() != null ? user.getAddress() : ""
        ));
    }
}
