package com.nic.user.service;

import com.nic.user.dto.*;
import com.nic.user.entity.User;
import com.nic.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Called internally by auth-service after registration
    public UserDTO createUser(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return UserDTO.from(userRepository.findByEmail(req.getEmail()).get());
        }
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        if (req.getRole() != null) {
            user.setRole(User.Role.valueOf(req.getRole()));
        }
        return UserDTO.from(userRepository.save(user));
    }

    public UserDTO getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDTO.from(user);
    }

    public UserDTO getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDTO.from(user);
    }

    public UserDTO updateUser(String email, UpdateUserRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(req.getName());
        return UserDTO.from(userRepository.save(user));
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDTO::from)
                .collect(Collectors.toList());
    }

    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }
}