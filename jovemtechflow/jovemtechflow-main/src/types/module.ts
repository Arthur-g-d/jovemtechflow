
export interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_required: boolean;
  created_at: string;
}

export interface ModuleContent {
  id: string;
  title: string;
  description: string;
  content_type: string;
  content_url?: string;
  content_text?: string;
  is_required: boolean;
  order_index: number;
  module_id: string;
}

export interface ModuleContentInput {
  title: string;
  description: string;
  content_type: string;
  content_url?: string;
  content_text?: string;
  is_required: boolean;
}
