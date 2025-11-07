export interface UploadCsvResponse {
  success: boolean;
  message: string;
  data: UploadData;
}

export interface UploadData {
  total_files_processed: number;
  total_records_processed: number;
  total_successful: number;
  total_competitor_errors: number;
  total_header_errors: number;
  total_errors: number;
  success_rate: number;
  competitor_error_rate: number;
  header_error_rate: number;
  files_with_errors: number;
  files_with_header_errors: number;
  files_with_competitor_errors: number;
  error_files: string[];
  processing_time_seconds: number;
  records_per_second: number;
  olympiad_id: string;
  summary: UploadCsvSummary;
  details: FileDetail[];
}

export interface UploadCsvSummary {
  total_competitors_registered: number;
  total_competitors_with_errors: number;
  total_header_errors: number;
  total_files_processed: number;
  total_files_with_errors: number;
  total_files_with_header_errors: number;
  total_files_with_competitor_errors: number;
  processing_time_seconds: number;
}

export interface FileDetail {
  id:number;
  filename: string;
  total_records: number;
  successful: number;
  competitor_errors: number;
  header_errors: number;
  error_file?: string;
  file_size: number;
  uploaded_at_human:string;
}

//to get CSV's 
export interface UploadCsv {
  id: number;
  original_file_name: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  header_errors:number;
  success_rate: number;
  has_errors: boolean;
  has_error_file: boolean;
  file_size: number;
  uploaded_at_human:string;
}

export interface CsvUploadsResponse {
  success: boolean;
  data: {
    // olympiad: OlympiadSummary;
    csv_uploads: UploadCsv[];
    // total_uploads: number;
    // total_records_processed: number;
    // total_successful_records: number;
    // total_failed_records: number;
  };
}

// export interface OlympiadSummary {
//   id: number;
//   name: string;
// }



