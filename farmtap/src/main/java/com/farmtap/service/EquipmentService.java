package com.farmtap.service;

import com.farmtap.model.Equipment;
import com.farmtap.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public Equipment addEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    public List<Equipment> getAllAvailableEquipment() {
        return equipmentRepository.findByIsAvailableTrue();
    }

    public List<Equipment> getOwnerEquipment(Long ownerId) {
        return equipmentRepository.findByOwnerId(ownerId);
    }

    public Equipment getEquipment(Long equipmentId) {
        return equipmentRepository.findById(equipmentId).get();
    }

    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }
}
