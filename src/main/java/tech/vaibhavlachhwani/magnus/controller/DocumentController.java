package tech.vaibhavlachhwani.magnus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import tech.vaibhavlachhwani.magnus.crypto.HashService;
import tech.vaibhavlachhwani.magnus.model.Document;
import tech.vaibhavlachhwani.magnus.service.DocumentService;
import tech.vaibhavlachhwani.magnus.service.FileStorageService;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/documents")
public class DocumentController {
    private final FileStorageService fileStorageService;
    private final HashService hashService;
    private final DocumentService documentService;

    public DocumentController(FileStorageService fileStorageService, HashService hashService, DocumentService documentService) {
        this.fileStorageService = fileStorageService;
        this.hashService = hashService;
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("studentId") UUID studentId
    ) throws IOException {
        byte[] fileBytes = file.getBytes();
        String hash = hashService.generateHmac(fileBytes);

        String path = fileStorageService.storeFile(file);

        Document doc = documentService.saveDocument(
                file.getOriginalFilename(),
                path,
                hash,
                studentId
        );

        return ResponseEntity.ok(doc);
    }
}
