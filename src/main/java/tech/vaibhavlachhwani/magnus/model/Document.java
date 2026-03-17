package tech.vaibhavlachhwani.magnus.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String fileName;
    private String filePath;

    @Column(columnDefinition = "TEXT")
    private String hashValue;

    private LocalDateTime issueDate;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;
}
