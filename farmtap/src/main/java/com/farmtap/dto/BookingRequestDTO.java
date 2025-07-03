package com.farmtap.dto;

import lombok.Data;
import java.time.LocalDate;

// This DTO represents the data sent from the frontend to create a booking.
@Data
public class BookingRequestDTO {

    private Long equipmentId; // We only need the ID of the equipment.

    private LocalDate startDate;

    private LocalDate endDate;

}