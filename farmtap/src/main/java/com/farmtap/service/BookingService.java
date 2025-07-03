package com.farmtap.service;

import com.farmtap.dto.BookingRequestDTO; // <-- IMPORT THE NEW DTO
import com.farmtap.model.*;
import com.farmtap.repository.BookingRepository;
import com.farmtap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.ResourceClosedException; // Corrected import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    // No @Autowired needed on final fields with @RequiredArgsConstructor
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EquipmentService equipmentService;

    private Users getUserFromPrincipal(Principal principal) throws IllegalAccessException {
        if (principal == null) {
            throw new IllegalAccessException("User must be authenticated.");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalAccessException("User not found for principal: " + principal.getName()));
    }

     public Booking createBooking(BookingRequestDTO bookingRequest, Principal principal) throws IllegalAccessException {
         Users user = getUserFromPrincipal(principal);

         Equipment equipment = equipmentService.getEquipment(bookingRequest.getEquipmentId());

         Booking newBooking = new Booking();

        long days = ChronoUnit.DAYS.between(bookingRequest.getStartDate(), bookingRequest.getEndDate()) + 1;
        if (days <= 0) {
            throw new IllegalArgumentException("End date must be after or the same as the start date.");
        }

        // 5. Calculate total price
        double rentalPrice = equipment.getRentalPricePerDay();
        double total = days * rentalPrice;

        // 6. Populate the new booking entity with data from the DTO and server-side logic
        newBooking.setFarmer(user);
        newBooking.setEquipment(equipment);
        newBooking.setStartDate(bookingRequest.getStartDate());
        newBooking.setEndDate(bookingRequest.getEndDate());
        newBooking.setTotalPrice(total);
        newBooking.setStatus(BookingStatus.PENDING); // Status is always PENDING on creation

        System.out.println(newBooking);

        return bookingRepository.save(newBooking);
    }

    // --- The rest of your service is mostly fine, just removed duplicate methods ---

    public List<Booking> getFarmerBookings(Long farmerId) {
        return bookingRepository.findByFarmerId(farmerId);
    }

    public List<Booking> getOwnerBookings(Long ownerId) {
        return bookingRepository.findByEquipmentOwnerId(ownerId);
    }

    public ResponseEntity<List<Booking>> getAll() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    public List<Booking> getBookingsForUser(Principal principal) throws IllegalAccessException {
        Users currentUser = getUserFromPrincipal(principal);
        return bookingRepository.findBookingsForUser(currentUser.getId());
    }

    public Booking updateStatus(Long id, BookingStatus status, Principal principal) throws IllegalAccessException {
        Users currentUser = getUserFromPrincipal(principal);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceClosedException("Booking not found with id: " + id));

        // SECURITY: Only the owner of the equipment can update the status
        if (!booking.getEquipment().getOwner().getId().equals(currentUser.getId())) {
            throw new IllegalAccessException("Only the equipment owner can update the booking status.");
        }

        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    public void deleteBooking(Long id, Principal principal) throws IllegalAccessException {
        Users currentUser = getUserFromPrincipal(principal);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceClosedException("Booking not found with id: " + id));

        // SECURITY: Only the farmer who made the booking or the equipment owner can delete it.
        boolean isFarmer = booking.getFarmer().getId().equals(currentUser.getId());
        boolean isOwner = booking.getEquipment().getOwner().getId().equals(currentUser.getId());

        if (!isFarmer && !isOwner) {
            throw new IllegalAccessException("You are not authorized to cancel this booking.");
        }

        bookingRepository.delete(booking);
    }
}