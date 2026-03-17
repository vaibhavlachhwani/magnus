package tech.vaibhavlachhwani.magnus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private UUID id;
    private String fileName;
    private String hashValue;
    private LocalDateTime issueDate;
    private UUID studentId;
}
