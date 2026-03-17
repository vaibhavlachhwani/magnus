package tech.vaibhavlachhwani.magnus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.vaibhavlachhwani.magnus.model.Student;
import tech.vaibhavlachhwani.magnus.repository.StudentRepository;

import java.util.Map;

@RestController
@RequestMapping("/students")
public class StudentController {
    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");

        Student savedStudent = studentRepository.save(
                Student
                        .builder()
                        .name(name)
                        .build()
        );

        return ResponseEntity.ok(savedStudent);
    }

    @GetMapping()
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(studentRepository.findAll());
    }
}
