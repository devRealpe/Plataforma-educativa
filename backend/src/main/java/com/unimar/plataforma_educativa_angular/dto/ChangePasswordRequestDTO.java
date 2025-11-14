package com.unimar.plataforma_educativa_angular.dto;

import lombok.Data;

@Data
public class ChangePasswordRequestDTO {
    private String currentPassword;
    private String newPassword;
}