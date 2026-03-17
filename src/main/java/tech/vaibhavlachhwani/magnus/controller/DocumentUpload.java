package tech.vaibhavlachhwani.magnus.controller;

import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import tech.vaibhavlachhwani.magnus.service.FileStorageService;

import java.io.IOException;

@RestController
@RequestMapping("/documents")
public class DocumentUpload {
    private final FileStorageService fileStorageService;

    public DocumentUpload(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) throws IOException {
        String path = fileStorageService.storeFile(file);

        return ResponseEntity.ok(path);
    }
}
