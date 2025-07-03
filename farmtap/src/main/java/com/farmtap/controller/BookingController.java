package com.farmtap.controller;

import com.farmtap.dto.BookingRequestDTO;
import com.farmtap.model.Booking;
import com.farmtap.model.BookingStatus;
import com.farmtap.model.Equipment;
import com.farmtap.model.Users;
import com.farmtap.repository.UserRepository;
import com.farmtap.service.BookingService;
import com.farmtap.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final EquipmentService equipmentService;
    private final UserRepository userRepository;

    private ResponseEntity<Map<String, String>> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.badRequest().body(error);
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDTO bookingRequest, Principal principal) {
        try {
            Booking createdBooking = bookingService.createBooking(bookingRequest, principal);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
        } catch (Exception e) {
            return errorResponse("Failed to create booking: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUserBookings(Principal principal) {
        try {
            List<Booking> bookings = bookingService.getBookingsForUser(principal);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return errorResponse("Failed to fetch your bookings: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam BookingStatus status, Principal principal) {
        try {
            Booking updatedBooking = bookingService.updateStatus(id, status, principal);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return errorResponse("Failed to update booking status: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id, Principal principal) {
        try {
            bookingService.deleteBooking(id, principal);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return errorResponse("Failed to delete booking: " + e.getMessage());
        }
    }

    @GetMapping("/farmer/{farmerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getFarmerBookings(@PathVariable Long farmerId) {
        try {
            List<Booking> bookings = bookingService.getFarmerBookings(farmerId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return errorResponse("Failed to fetch farmer bookings: " + e.getMessage());
        }
    }

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOwnerBookings(@PathVariable Long ownerId) {
        try {
            List<Booking> bookings = bookingService.getOwnerBookings(ownerId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return errorResponse("Failed to fetch owner bookings: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllBookings() {
        try {
            return ResponseEntity.ok(bookingService.getAll().getBody());
        } catch (Exception e) {
            return errorResponse("Failed to fetch all bookings: " + e.getMessage());
        }
    }



}
