export interface CSVRecord {
  "Field name": string;
  Category: string;
  Description: string;
  CreatedAt: string;
  Author: string;
  Severity: string;
  "Is Historic": string;
  "Deep Link": string;
  "Value Hash": string;
  Fingerprint: string;
  "Textual Context": string;
  Activeness: string;
  Tags: string;
  ManagedLocation: string;
  ManagedLocationIsLatest: string;
  TotalManagedLocations: string;
  GitReference: string;
  Version: string;
  AWSAccountID: string;
}

export type CSVData = CSVRecord[];
