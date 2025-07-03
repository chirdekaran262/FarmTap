package com.farmtap.service;

import com.farmtap.dto.UserUpdateDTO;
import com.farmtap.model.Users;
import com.farmtap.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepo;

    public UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public List<Users> getAllUsers() {
        return userRepo.findAll();
    }

    public Optional<Users> getUserById(Long id) {
        return userRepo.findById(id);
    }

    public Users saveUser(Users user) {
        return userRepo.save(user);
    }

    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }

    public Optional<Users> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    @Transactional
    public Users updateProfile(String username, UserUpdateDTO userUpdateDTO) {
        // Find the user by their username (email)
        Users userToUpdate = userRepo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        // MODIFIED: Update fields based on the new DTO structure
        userToUpdate.setName(userUpdateDTO.getName());
        userToUpdate.setPhoneNumber(userUpdateDTO.getPhoneNumber());
        userToUpdate.setVillageName(userUpdateDTO.getVillageName());
        userToUpdate.setDistrict(userUpdateDTO.getDistrict());
        userToUpdate.setState(userUpdateDTO.getState());
        userToUpdate.setPincode(userUpdateDTO.getPincode());

        // The @PreUpdate annotation in your Users entity will handle the 'updatedAt' field
        return userRepo.save(userToUpdate);
    }
    public Users getProfileByUsername(String username) {
        return userRepo.findByEmail(username) // Assuming email is the username
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }
}

