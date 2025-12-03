export interface AuditLogResponse {
  logs: AuditLog[];
}

export interface AuditLog {
  audit_id: number;
  event: string;
  created_at: string;
  ip_address: string;
  user_agent: string;
  url: string;

  user: {
    id: number;
    name: string;
    email: string;
  };

  evaluation: {
    id: number;
    contestant: {
      id: number;
      name: string;
      ci_document: string;
    };
    olympiad: {
      id: number;
      name: string;
    };
    area: {
      id: number;
      name: string;
    };
    phase: {
      id: number;
      name: string;
      order: number;
    };
  };

  changes: {
    old_values: {
      score: number | null;
      status: boolean | null;
      classification_status: string | null;
    };
    new_values: {
      score: number | null;
      status: boolean | null;
      classification_status: string | null;
    };
  };
}
