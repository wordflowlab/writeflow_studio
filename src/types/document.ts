// 文档相关类型定义，与后端Rust模型保持同步

export enum DocumentType {
  Markdown = "Markdown",
  PlainText = "PlainText", 
  RichText = "RichText"
}

export enum DocumentStatus {
  Draft = "Draft",
  InProgress = "InProgress",
  Review = "Review", 
  Final = "Final"
}

export interface DocumentMetadata {
  author?: string;
  language: string;
  reading_time: number;
  export_formats: string[];
  version: number;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  content_type: DocumentType;
  status: DocumentStatus;
  word_count: number;
  char_count: number;
  project_id: string;
  folder_path?: string;
  tags: string[];
  metadata: DocumentMetadata;
  created_at: string;
  updated_at: string;
  last_accessed: string;
}

export interface CreateDocumentData {
  title: string;
  content?: string;
  content_type: DocumentType;
  project_id: string;
  folder_path?: string;
  tags?: string[];
  template_id?: string;
}

export interface DocumentStats {
  total: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  total_words: number;
  recent_count: number;
}

// 简化版本，用于向后兼容
export interface SimpleDocument {
  id: string;
  title: string;
  content: string;
  project_id: string;
  folder_path?: string;
  created_at: string;
  updated_at: string;
}

// 工具函数：将完整Document转换为简化版本
export function toSimpleDocument(doc: Document): SimpleDocument {
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    project_id: doc.project_id,
    folder_path: doc.folder_path,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

// 工具函数：创建默认的CreateDocumentData
export function createDefaultDocumentData(
  project_id: string,
  title: string = "新文档",
  content: string = "# 新文档\n\n开始写作...",
  folder_path?: string
): CreateDocumentData {
  // 与后端 Rust CreateDocumentData 对齐：可选字段不传递（由后端默认处理）
  return {
    title,
    content,
    content_type: DocumentType.Markdown,
    project_id,
    folder_path,
    // 不主动传 tags，保持为 undefined，以匹配后端 Option<Vec<String>>
  };
}