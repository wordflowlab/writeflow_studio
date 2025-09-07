use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub color: String,
    pub status: ProjectStatus,
    pub progress: u32,
    pub documents_count: u32,
    pub words_count: u32,
    pub workspace_id: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProjectStatus {
    Active,
    Completed,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProjectData {
    pub name: String,
    pub description: String,
    pub icon: String,
    pub color: String,
    pub workspace_id: String,
    pub template_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectStats {
    pub total: u32,
    pub active: u32,
    pub completed: u32,
    pub archived: u32,
    pub this_week: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectListResult {
    pub items: Vec<Project>,
    pub total: u32,
}

impl Project {
    pub fn new(data: CreateProjectData) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name: data.name,
            description: data.description,
            icon: data.icon,
            color: data.color,
            status: ProjectStatus::Active,
            progress: 0,
            documents_count: 0,
            words_count: 0,
            workspace_id: data.workspace_id,
            created_at: now,
            updated_at: now,
        }
    }
}
