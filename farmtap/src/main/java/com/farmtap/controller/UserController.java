package com.farmtap.controller;

import com.farmtap.dto.UserUpdateDTO;
import com.farmtap.model.Users;
import com.farmtap.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private ResponseEntity<Map<String, String>> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.badRequest().body(error);
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            return errorResponse("Failed to fetch users: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Users> getUserById(@PathVariable Long id) {
        try {
            Users user = userService.getUserById(id)
                    .orElseThrow(() -> new RuntimeException("User with ID " + id + " not found"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            // You must convert error to JSON manually or use a global handler
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(null); // or change return type to ResponseEntity<?>
        }
    }


    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Users users) {
        try {
            Users saved = userService.saveUser(users);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return errorResponse("Failed to create user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return errorResponse("Failed to delete user: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Collections.singletonMap("error", "Unauthorized"));
            }
            Users user = userService.getProfileByUsername(principal.getName());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return errorResponse("Failed to fetch profile: " + e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(Principal principal, @RequestBody UserUpdateDTO userUpdateDTO) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Collections.singletonMap("error", "Unauthorized"));
            }
            Users updatedUser = userService.updateProfile(principal.getName(), userUpdateDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return errorResponse("Failed to update profile: " + e.getMessage());
        }
    }
}
