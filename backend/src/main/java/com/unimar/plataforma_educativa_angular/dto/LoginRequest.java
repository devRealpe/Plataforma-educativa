package com.unimar.plataforma_educativa_angular.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}