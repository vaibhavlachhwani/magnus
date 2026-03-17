package tech.vaibhavlachhwani.magnus.service;

import org.springframework.stereotype.Service;
import tech.vaibhavlachhwani.magnus.model.Document;
import tech.vaibhavlachhwani.magnus.model.Student;
import tech.vaibhavlachhwani.magnus.repository.DocumentRepository;
import tech.vaibhavlachhwani.magnus.repository.StudentRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final StudentRepository studentRepository;

    public DocumentService(DocumentRepository documentRepository, StudentRepository studentRepository) {
        this.documentRepository = documentRepository;
        this.studentRepository = studentRepository;
    }

    public Document saveDocument(
            String fileName,
            String filePath,
            String hash,
            UUID studentId
    ) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(
                        () -> new RuntimeException("Student not found")
                );

        Document doc = Document.builder()
                .fileName(fileName)
                .filePath(filePath)
                .hashValue(hash)
                .issueDate(LocalDateTime.now())
                .student(student)
                .build();

        return documentRepository.save(doc);
    }
}
