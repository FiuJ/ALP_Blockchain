export interface IssueDocumentDto {
  documentHash: string;
  documentType: string;
  documentDescription: string;
  issuerWallet: string;
  patientWallet: string;
  expiredAt?: string; 
}