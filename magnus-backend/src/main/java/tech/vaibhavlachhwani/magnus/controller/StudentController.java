package tech.vaibhavlachhwani.magnus.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.vaibhavlachhwani.magnus.dto.StudentDTO;
import tech.vaibhavlachhwani.magnus.model.Student;
import tech.vaibhavlachhwani.magnus.repository.StudentRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/students")
public class StudentController {
    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<StudentDTO> register(@Valid @RequestBody StudentDTO studentDTO) {
        Student student = Student.builder()
                .name(studentDTO.getName())
                .build();

        Student savedStudent = studentRepository.save(student);

        return ResponseEntity.ok(convertToDTO(savedStudent));
    }

    @GetMapping()
    public ResponseEntity<List<StudentDTO>> getAll() {
        List<StudentDTO> students = studentRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(students);
    }

    private StudentDTO convertToDTO(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .name(student.getName())
                .build();
    }
}
