export type CaseType = 'fir' | 'court' | 'general';
export type QuestionType = 'text' | 'dropdown' | 'number' | 'email' | 'phone';
export type SessionStatus = 'in_progress' | 'completed';

export interface ChatQuestion {
  id: number;
  question_text: string;
  order_index: number;
  type: QuestionType;
  options: string | null;
  required: number;
  active: number;
  created_at: string;
}

export interface ChatSession {
  id: string;
  status: SessionStatus;
  current_question_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  id: number;
  session_id: string;
  question_id: number;
  response_text: string;
  created_at: string;
}
export type QueryStatus = 'pending' | 'reviewed' | 'resolved';

// Shape expected in POST /api/queries body
export interface CreateQueryBody {
  name: string;
  email: string;
  phone?: string;
  caseType: CaseType;
  firNumber?: string;
  firCity?: string;
  courtCity?: string;
  caseNumber?: string;
  description: string;
}

// Row as stored in SQLite (snake_case columns)
export interface QueryRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  case_type: CaseType;
  fir_number: string | null;
  fir_city: string | null;
  court_city: string | null;
  case_number: string | null;
  description: string;
  status: QueryStatus;
  created_at: string;
}
