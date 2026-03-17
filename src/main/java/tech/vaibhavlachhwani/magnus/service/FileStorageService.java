package tech.vaibhavlachhwani.magnus.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tech.vaibhavlachhwani.magnus.config.StorageConfig;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    public final Path storageLocation;

    public FileStorageService(StorageConfig config) throws IOException {
        this.storageLocation = Paths.get(config.getPath())
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(this.storageLocation);
    }

    public String storeFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        Path targetLocation = storageLocation.resolve(fileName);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        return targetLocation.toString();
    }
}
