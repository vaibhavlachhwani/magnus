package tech.vaibhavlachhwani.magnus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationResultDTO {
    private boolean authentic;
    private String status;
    private UUID documentId;
    private String message;
}
