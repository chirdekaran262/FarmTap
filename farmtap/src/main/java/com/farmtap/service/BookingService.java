package com.farmtap.service;

import com.farmtap.model.*;
import com.farmtap.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final EquipmentService equipmentService;
    public Booking createBooking(Booking booking) {
        System.out.println(booking);

        try {
            long days = ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate());
            if (days <= 0) days = 1;
            double rentalPrice=equipmentService.getEquipment(booking.getEquipment().getId()).getRentalPricePerDay();
            double total = days * rentalPrice;
            booking.setTotalPrice(total);
            booking.setStatus(BookingStatus.PENDING);
            return bookingRepository.save(booking);
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public List<Booking> getFarmerBookings(Long farmerId) {
        return bookingRepository.findByFarmerId(farmerId);
    }

    public List<Booking> getOwnerBookings(Long ownerId) {
        return bookingRepository.findByEquipmentOwnerId(ownerId);
    }

    public Booking updateStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}
