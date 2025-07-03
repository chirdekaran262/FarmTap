package com.farmtap.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role; // Must be "Farmer" or "Owner"
    private String phoneNumber;
    private String aadharNumber;
    private String villageName;
    private String district;
    private String state;
    private String pincode;
    private String profileImageUrl;
}
