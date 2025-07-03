package com.farmtap.repository;

import com.farmtap.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByFarmerId(Long farmerId);
    List<Booking> findByEquipmentOwnerId(Long ownerId);
    @Query("SELECT b FROM Booking b WHERE b.farmer.id = :userId OR b.equipment.owner.id = :userId")
    List<Booking> findBookingsForUser(@Param("userId") Long userId);

}
