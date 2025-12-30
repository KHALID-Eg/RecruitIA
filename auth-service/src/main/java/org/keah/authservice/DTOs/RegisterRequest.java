package org.keah.authservice.DTOs;

import lombok.Data;
import org.keah.authservice.entity.Role;

@Data
public class RegisterRequest {

    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private Role role;
}
