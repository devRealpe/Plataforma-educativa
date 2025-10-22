package com.unimar.plataforma_educativa_angular.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Guarda un archivo en el sistema de archivos
     */
    public String storeFile(MultipartFile file, String subfolder) throws IOException {
        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir, subfolder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único para el archivo
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        // Guardar archivo
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return subfolder + "/" + uniqueFilename;
    }

    /**
     * Obtiene la ruta completa de un archivo
     */
    public Path getFilePath(String relativePath) {
        return Paths.get(uploadDir).resolve(relativePath).normalize();
    }

    /**
     * Elimina un archivo del sistema
     */
    public void deleteFile(String relativePath) throws IOException {
        Path filePath = getFilePath(relativePath);
        Files.deleteIfExists(filePath);
    }

    /**
     * Verifica si un archivo existe
     */
    public boolean fileExists(String relativePath) {
        Path filePath = getFilePath(relativePath);
        return Files.exists(filePath);
    }
}