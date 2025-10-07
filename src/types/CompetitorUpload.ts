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
  filename: string;
  successful: number;
  competitor_errors: number;
  header_errors: number;
  total_records: number;
  error_file?: string;
}






