use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub description: String,
    pub projects_count: u32,
    pub status: WorkspaceStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_accessed: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub enum WorkspaceStatus {
    #[default]
    Active,
    Inactive,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateWorkspaceData {
    pub name: String,
    pub description: String,
}

impl Workspace {
    pub fn new(data: CreateWorkspaceData) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name: data.name,
            description: data.description,
            projects_count: 0,
            status: WorkspaceStatus::Active,
            created_at: now,
            updated_at: now,
            last_accessed: now,
        }
    }
}