package com.farmtap.controller;

import com.farmtap.dto.EquipmentDTO;
import com.farmtap.model.Equipment;
import com.farmtap.model.Users;
import com.farmtap.repository.UserRepository;
import com.farmtap.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final UserRepository userRepository;

    private ResponseEntity<Map<String, String>> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.badRequest().body(error);
    }

    @PostMapping
    public ResponseEntity<?> addEquipment(@RequestBody Equipment equipment, Principal principal) {
        try {
            String email = principal.getName();
            Users owner = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            equipment.setOwner(owner);
            Equipment saved = equipmentService.addEquipment(equipment);
            return ResponseEntity.ok(new EquipmentDTO(saved));
        } catch (Exception e) {
            return errorResponse("Error adding equipment: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAvailableEquipment() {
        try {
            List<EquipmentDTO> equipmentList = equipmentService.getAllAvailableEquipment()
                    .stream()
                    .map(EquipmentDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(equipmentList);
        } catch (Exception e) {
            return errorResponse("Error fetching equipment: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEquipmentById(@PathVariable Long id) {
        try {
            return equipmentService.getEquipmentById(id)
                    .map(equipment -> ResponseEntity.ok(new EquipmentDTO((Equipment) equipment)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return errorResponse("Error fetching equipment details: " + e.getMessage());
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getEquipmentByOwner(@PathVariable Long ownerId) {
        try {
            List<EquipmentDTO> ownerEquipment = equipmentService.getOwnerEquipment(ownerId)
                    .stream()
                    .map(EquipmentDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ownerEquipment);
        } catch (Exception e) {
            return errorResponse("Error fetching owner's equipment: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEquipment(@PathVariable Long id) {
        try {
            equipmentService.deleteEquipment(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return errorResponse("Error deleting equipment: " + e.getMessage());
        }
    }

    @GetMapping("/equipment")
    public ResponseEntity<List<Equipment>> getMyEquipment(Principal principal) {
        try {
            // You will need to implement this logic in your EquipmentService
            Optional<Users> users=userRepository.findByEmail(principal.getName());
            List<Equipment> myEquipment = equipmentService.getOwnerEquipment(users.get().getId());
            return ResponseEntity.ok(myEquipment);
        } catch (Exception e) {
            // Handle cases where the user is not found or other errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/available")
    public ResponseEntity<?> updateAvailable(@RequestBody Equipment equipment) {
        equipmentService.updateEquipment(equipment);
        return ResponseEntity.ok().build();
    }
}
