package com.farmtap.dto;

import com.farmtap.model.Equipment;
import lombok.Data;

@Data
public class EquipmentDTO {
    private Long id;
    private String name;
    private String type;
    private String description;
    private Double rentalPricePerDay;
    private Boolean isAvailable;
    private String location;
    private String imageUrl;
    private Long ownerId;
    private String ownerName;

    public EquipmentDTO(Equipment equipment) {
        this.id = equipment.getId();
        this.name = equipment.getName();
        this.type = equipment.getType();
        this.description = equipment.getDescription();
        this.rentalPricePerDay = equipment.getRentalPricePerDay();
        this.isAvailable = equipment.getIsAvailable();
        this.location = equipment.getLocation();
        this.imageUrl = equipment.getImageUrl();
        this.ownerId = equipment.getOwner() != null ? equipment.getOwner().getId() : null;
        this.ownerName = equipment.getOwner() != null ? equipment.getOwner().getName() : null;
    }
}
