package com.farmtap.repository;

import com.farmtap.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByIsAvailableTrue();
    List<Equipment> findByOwnerId(Long ownerId);
}
