package tech.vaibhavlachhwani.magnus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import tech.vaibhavlachhwani.magnus.crypto.HashService;
import tech.vaibhavlachhwani.magnus.service.FileStorageService;

import java.io.IOException;

@RestController
@RequestMapping("/documents")
public class DocumentController {
    private final FileStorageService fileStorageService;
    private final HashService hashService;

    public DocumentController(FileStorageService fileStorageService, HashService hashService) {
        this.fileStorageService = fileStorageService;
        this.hashService = hashService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) throws IOException {
        String path = fileStorageService.storeFile(file);

        byte[] fileBytes = file.getBytes();
        String hash = hashService.generateHmac(fileBytes);

        return ResponseEntity.ok(
                "Stored at: " + path + "\nHash: " + hash
        );
    }
}
