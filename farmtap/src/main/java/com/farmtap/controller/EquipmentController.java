package com.farmtap.controller;

import com.farmtap.model.Equipment;
import com.farmtap.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @PostMapping
    public ResponseEntity<Equipment> addEquipment(@RequestBody Equipment equipment) {
        Equipment saved = equipmentService.addEquipment(equipment);
        return ResponseEntity.ok(saved); // Or use created status if needed
    }

    @GetMapping
    public ResponseEntity<List<Equipment>> getAvailableEquipment() {
        List<Equipment> equipmentList = equipmentService.getAllAvailableEquipment();
        return ResponseEntity.ok(equipmentList);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Equipment>> getEquipmentByOwner(@PathVariable Long ownerId) {
        List<Equipment> ownerEquipment = equipmentService.getOwnerEquipment(ownerId);
        return ResponseEntity.ok(ownerEquipment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.noContent().build(); // HTTP 204
    }
}
