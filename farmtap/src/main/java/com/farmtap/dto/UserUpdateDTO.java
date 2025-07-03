package com.farmtap.dto;

import lombok.Data;

// Using Lombok's @Data to generate getters, setters, etc.
@Data
public class UserUpdateDTO {

    private String name;
    private String phoneNumber; // MODIFIED: Renamed from 'phone' to 'phoneNumber'
    private String villageName; // ADDED
    private String district;    // ADDED
    private String state;       // ADDED
    private String pincode;     // ADDED

    // Note: We are intentionally not including email, aadharNumber, role, or password
    // as these should not be updatable from a standard profile edit screen.
}