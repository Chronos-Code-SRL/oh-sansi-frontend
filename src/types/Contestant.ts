export interface Contestant {
  success: boolean;
  message: string;
  data: {
    total_successful: number;
    total_errors: number;
    files_processed: number;
    error_files: string[];
    details: {
      file: string;
      success: number;
      errors: number;
    }[];
  };
}