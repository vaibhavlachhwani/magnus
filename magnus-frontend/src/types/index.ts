export interface StudentDTO {
  id: string;
  name: string;
}

export interface DocumentDTO {
  id: string;
  fileName: string;
  hashValue: string;
  issueDate: string;
  studentId: string;
}

export interface VerificationResultDTO {
  authentic: boolean;
  status: string;
  documentId?: string;
  message: string;
}
