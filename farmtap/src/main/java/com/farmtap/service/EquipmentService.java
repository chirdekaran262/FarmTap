package com.farmtap.service;

import com.farmtap.dto.EquipmentDTO;
import com.farmtap.model.Equipment;
import com.farmtap.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public Optional<Equipment> getEquipmentById(Long id) {
        return equipmentRepository.findById(id); // avoid using getById (lazy load)
    }

    public void updateEquipment(Equipment equipment) {
        Equipment oldEquipment = equipmentRepository.findById(equipment.getId()).orElseThrow();
        oldEquipment.setIsAvailable(equipment.getIsAvailable());
        Equipment updated = equipmentRepository.save(oldEquipment);
        new EquipmentDTO(updated);
    }

}
