use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub title: String,
    pub content: String,
    pub content_type: DocumentType,
    pub status: DocumentStatus,
    pub word_count: u32,
    pub char_count: u32,
    pub project_id: String,
    pub folder_path: Option<String>,
    pub tags: Vec<String>,
    pub metadata: DocumentMetadata,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_accessed: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub enum DocumentType {
    #[default]
    Markdown,
    PlainText,
    RichText,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub enum DocumentStatus {
    #[default]
    Draft,
    InProgress,
    Review,
    Final,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DocumentMetadata {
    pub author: Option<String>,
    pub language: String,
    pub reading_time: u32,
    pub export_formats: Vec<String>,
    pub version: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateDocumentData {
    pub title: String,
    pub content: Option<String>,
    pub content_type: DocumentType,
    pub project_id: String,
    pub folder_path: Option<String>,
    pub tags: Option<Vec<String>>,
    pub template_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentStats {
    pub total: u32,
    pub by_status: std::collections::HashMap<String, u32>,
    pub by_type: std::collections::HashMap<String, u32>,
    pub total_words: u32,
    pub recent_count: u32,
}

impl Document {
    pub fn new(data: CreateDocumentData) -> Self {
        let now = Utc::now();
        let content = data.content.unwrap_or_default();
        let word_count = content.split_whitespace().count() as u32;
        let char_count = content.chars().count() as u32;
        let reading_time = (word_count as f32 / 200.0).ceil() as u32; // 200 words per minute

        Self {
            id: Uuid::new_v4().to_string(),
            title: data.title,
            content,
            content_type: data.content_type,
            status: DocumentStatus::Draft,
            word_count,
            char_count,
            project_id: data.project_id,
            folder_path: data.folder_path,
            tags: data.tags.unwrap_or_default(),
            metadata: DocumentMetadata {
                author: None,
                language: "zh-CN".to_string(),
                reading_time,
                export_formats: vec!["markdown".to_string(), "pdf".to_string()],
                version: 1,
            },
            created_at: now,
            updated_at: now,
            last_accessed: now,
        }
    }

    pub fn update_content(&mut self, content: String) {
        self.content = content.clone();
        self.word_count = content.split_whitespace().count() as u32;
        self.char_count = content.chars().count() as u32;
        self.metadata.reading_time = (self.word_count as f32 / 200.0).ceil() as u32;
        self.metadata.version += 1;
        self.updated_at = Utc::now();
        self.last_accessed = Utc::now();
    }

    pub fn update_status(&mut self, status: DocumentStatus) {
        self.status = status;
        self.updated_at = Utc::now();
    }
}