package com.farmtap.controller;

import com.farmtap.model.Booking;
import com.farmtap.model.BookingStatus;
import com.farmtap.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        Booking createdBooking = bookingService.createBooking(booking);
        return ResponseEntity.ok(createdBooking);
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<Booking>> getFarmerBookings(@PathVariable Long farmerId) {
        List<Booking> bookings = bookingService.getFarmerBookings(farmerId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Booking>> getOwnerBookings(@PathVariable Long ownerId) {
        List<Booking> bookings = bookingService.getOwnerBookings(ownerId);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(@PathVariable Long id, @RequestParam BookingStatus status) {
        Booking updatedBooking = bookingService.updateStatus(id, status);
        return ResponseEntity.ok(updatedBooking);
    }
}
