export interface Contestant {
  success: boolean;
  message: string;
  data: {
    totalsuccessful: number;
    totalErrors: number;
    filesProcessed: number;
    errorFiles: string[];
    details: {
      file: string;
      success: number;
      errors: number;
    }[];
  };
}

export interface uploadCsv{
  olympiadId: number;
  files: File[];
}
