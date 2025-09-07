use crate::models::{
    project::{Project, CreateProjectData, ProjectStats},
    workspace::{Workspace, CreateWorkspaceData},
    document::{Document, CreateDocumentData, DocumentStats},
    config::AppConfig,
};
use sqlx::{SqlitePool, Row};
use tokio::fs;
use std::path::PathBuf;
use anyhow::Result;

#[derive(Clone)]
pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new() -> Result<Self> {
        let db_dir = Self::get_data_directory()?;
        
        // 确保目录存在
        if let Err(e) = fs::create_dir_all(&db_dir).await {
            println!("Failed to create data directory: {}", e);
            return Err(e.into());
        }
        
        let db_path = db_dir.join("writeflow.db");
        let database_url = format!("sqlite:{}?mode=rwc", db_path.display());
        
        println!("Connecting to database: {}", database_url);
        let pool = SqlitePool::connect(&database_url).await?;
        
        let database = Self { pool };
        database.init_tables().await?;
        
        Ok(database)
    }

    fn get_data_directory() -> Result<PathBuf> {
        // 使用当前目录下的 data 文件夹，避免权限问题
        let current_dir = std::env::current_dir()?;
        let data_dir = current_dir.join("data");
        
        Ok(data_dir)
    }

    async fn init_tables(&self) -> Result<()> {
        // Workspaces table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS workspaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                projects_count INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                last_accessed TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Projects table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                icon TEXT NOT NULL,
                color TEXT NOT NULL,
                status TEXT NOT NULL,
                progress INTEGER NOT NULL DEFAULT 0,
                documents_count INTEGER NOT NULL DEFAULT 0,
                words_count INTEGER NOT NULL DEFAULT 0,
                workspace_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Documents table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                content_type TEXT NOT NULL,
                status TEXT NOT NULL,
                word_count INTEGER NOT NULL DEFAULT 0,
                char_count INTEGER NOT NULL DEFAULT 0,
                project_id TEXT NOT NULL,
                folder_path TEXT,
                tags TEXT, -- JSON array
                metadata TEXT NOT NULL, -- JSON
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                last_accessed TEXT NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Config table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS config (
                id INTEGER PRIMARY KEY,
                config_data TEXT NOT NULL, -- JSON
                updated_at TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    // Workspace operations
    pub async fn create_workspace(&self, data: CreateWorkspaceData) -> Result<Workspace> {
        let workspace = Workspace::new(data);
        
        sqlx::query(
            r#"
            INSERT INTO workspaces (id, name, description, projects_count, status, created_at, updated_at, last_accessed)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            "#,
        )
        .bind(&workspace.id)
        .bind(&workspace.name)
        .bind(&workspace.description)
        .bind(workspace.projects_count as i64)
        .bind(serde_json::to_string(&workspace.status)?)
        .bind(workspace.created_at.to_rfc3339())
        .bind(workspace.updated_at.to_rfc3339())
        .bind(workspace.last_accessed.to_rfc3339())
        .execute(&self.pool)
        .await?;

        Ok(workspace)
    }

    pub async fn get_workspaces(&self) -> Result<Vec<Workspace>> {
        let rows = sqlx::query("SELECT * FROM workspaces ORDER BY updated_at DESC")
            .fetch_all(&self.pool)
            .await?;

        let mut workspaces = Vec::new();
        for row in rows {
            let workspace = Workspace {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                projects_count: row.get::<i64, _>("projects_count") as u32,
                status: serde_json::from_str(&row.get::<String, _>("status"))?,
                created_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?.with_timezone(&chrono::Utc),
                updated_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))?.with_timezone(&chrono::Utc),
                last_accessed: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("last_accessed"))?.with_timezone(&chrono::Utc),
            };
            workspaces.push(workspace);
        }

        Ok(workspaces)
    }

    // Project operations
    pub async fn create_project(&self, data: CreateProjectData) -> Result<Project> {
        let project = Project::new(data);
        
        sqlx::query(
            r#"
            INSERT INTO projects (id, name, description, icon, color, status, progress, documents_count, words_count, workspace_id, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
            "#,
        )
        .bind(&project.id)
        .bind(&project.name)
        .bind(&project.description)
        .bind(&project.icon)
        .bind(&project.color)
        .bind(serde_json::to_string(&project.status)?)
        .bind(project.progress as i64)
        .bind(project.documents_count as i64)
        .bind(project.words_count as i64)
        .bind(&project.workspace_id)
        .bind(project.created_at.to_rfc3339())
        .bind(project.updated_at.to_rfc3339())
        .execute(&self.pool)
        .await?;

        // Update workspace projects count
        sqlx::query("UPDATE workspaces SET projects_count = projects_count + 1 WHERE id = ?1")
            .bind(&project.workspace_id)
            .execute(&self.pool)
            .await?;

        Ok(project)
    }

    pub async fn get_projects_by_workspace(&self, workspace_id: &str) -> Result<Vec<Project>> {
        let rows = sqlx::query("SELECT * FROM projects WHERE workspace_id = ?1 ORDER BY updated_at DESC")
            .bind(workspace_id)
            .fetch_all(&self.pool)
            .await?;

        let mut projects = Vec::new();
        for row in rows {
            let project = Project {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                icon: row.get("icon"),
                color: row.get("color"),
                status: serde_json::from_str(&row.get::<String, _>("status"))?,
                progress: row.get::<i64, _>("progress") as u32,
                documents_count: row.get::<i64, _>("documents_count") as u32,
                words_count: row.get::<i64, _>("words_count") as u32,
                workspace_id: row.get("workspace_id"),
                created_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?.with_timezone(&chrono::Utc),
                updated_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))?.with_timezone(&chrono::Utc),
            };
            projects.push(project);
        }

        Ok(projects)
    }

    // Document operations
    pub async fn create_document(&self, data: CreateDocumentData) -> Result<Document> {
        let document = Document::new(data);
        
        sqlx::query(
            r#"
            INSERT INTO documents (id, title, content, content_type, status, word_count, char_count, project_id, folder_path, tags, metadata, created_at, updated_at, last_accessed)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
            "#,
        )
        .bind(&document.id)
        .bind(&document.title)
        .bind(&document.content)
        .bind(serde_json::to_string(&document.content_type)?)
        .bind(serde_json::to_string(&document.status)?)
        .bind(document.word_count as i64)
        .bind(document.char_count as i64)
        .bind(&document.project_id)
        .bind(&document.folder_path)
        .bind(serde_json::to_string(&document.tags)?)
        .bind(serde_json::to_string(&document.metadata)?)
        .bind(document.created_at.to_rfc3339())
        .bind(document.updated_at.to_rfc3339())
        .bind(document.last_accessed.to_rfc3339())
        .execute(&self.pool)
        .await?;

        // Update project documents count and words count
        sqlx::query("UPDATE projects SET documents_count = documents_count + 1, words_count = words_count + ?1 WHERE id = ?2")
            .bind(document.word_count as i64)
            .bind(&document.project_id)
            .execute(&self.pool)
            .await?;

        Ok(document)
    }

    pub async fn get_documents_by_project(&self, project_id: &str) -> Result<Vec<Document>> {
        let rows = sqlx::query("SELECT * FROM documents WHERE project_id = ?1 ORDER BY updated_at DESC")
            .bind(project_id)
            .fetch_all(&self.pool)
            .await?;

        let mut documents = Vec::new();
        for row in rows {
            let document = Document {
                id: row.get("id"),
                title: row.get("title"),
                content: row.get("content"),
                content_type: serde_json::from_str(&row.get::<String, _>("content_type"))?,
                status: serde_json::from_str(&row.get::<String, _>("status"))?,
                word_count: row.get::<i64, _>("word_count") as u32,
                char_count: row.get::<i64, _>("char_count") as u32,
                project_id: row.get("project_id"),
                folder_path: row.get("folder_path"),
                tags: serde_json::from_str(&row.get::<String, _>("tags"))?,
                metadata: serde_json::from_str(&row.get::<String, _>("metadata"))?,
                created_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?.with_timezone(&chrono::Utc),
                updated_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))?.with_timezone(&chrono::Utc),
                last_accessed: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("last_accessed"))?.with_timezone(&chrono::Utc),
            };
            documents.push(document);
        }

        Ok(documents)
    }

    // Config operations
    pub async fn get_config(&self) -> Result<Option<AppConfig>> {
        let row = sqlx::query("SELECT config_data FROM config WHERE id = 1")
            .fetch_optional(&self.pool)
            .await?;

        if let Some(row) = row {
            let config_str: String = row.get("config_data");
            let config: AppConfig = serde_json::from_str(&config_str)?;
            Ok(Some(config))
        } else {
            Ok(None)
        }
    }

    pub async fn save_config(&self, config: AppConfig) -> Result<()> {
        let config_data = serde_json::to_string(&config)?;
        
        sqlx::query(
            r#"
            INSERT OR REPLACE INTO config (id, config_data, updated_at)
            VALUES (1, ?1, ?2)
            "#,
        )
        .bind(&config_data)
        .bind(config.updated_at.to_rfc3339())
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    // Additional project methods
    pub async fn get_projects(&self) -> Result<Vec<Project>> {
        let rows = sqlx::query("SELECT * FROM projects ORDER BY updated_at DESC")
            .fetch_all(&self.pool)
            .await?;

        let mut projects = Vec::new();
        for row in rows {
            let project = Project {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                icon: row.get("icon"),
                color: row.get("color"),
                status: serde_json::from_str(&row.get::<String, _>("status"))?,
                progress: row.get::<i64, _>("progress") as u32,
                documents_count: row.get::<i64, _>("documents_count") as u32,
                words_count: row.get::<i64, _>("words_count") as u32,
                workspace_id: row.get("workspace_id"),
                created_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?.with_timezone(&chrono::Utc),
                updated_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))?.with_timezone(&chrono::Utc),
            };
            projects.push(project);
        }

        Ok(projects)
    }

    pub async fn get_project_by_id(&self, project_id: &str) -> Result<Option<Project>> {
        let row = sqlx::query("SELECT * FROM projects WHERE id = ?1")
            .bind(project_id)
            .fetch_optional(&self.pool)
            .await?;

        if let Some(row) = row {
            let project = Project {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                icon: row.get("icon"),
                color: row.get("color"),
                status: serde_json::from_str(&row.get::<String, _>("status"))?,
                progress: row.get::<i64, _>("progress") as u32,
                documents_count: row.get::<i64, _>("documents_count") as u32,
                words_count: row.get::<i64, _>("words_count") as u32,
                workspace_id: row.get("workspace_id"),
                created_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?.with_timezone(&chrono::Utc),
                updated_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))?.with_timezone(&chrono::Utc),
            };
            Ok(Some(project))
        } else {
            Ok(None)
        }
    }

    pub async fn update_project(&self, project_id: &str, mut project: Project) -> Result<()> {
        project.updated_at = chrono::Utc::now();
        
        sqlx::query(
            r#"
            UPDATE projects 
            SET name = ?1, description = ?2, icon = ?3, color = ?4, status = ?5, progress = ?6, updated_at = ?7
            WHERE id = ?8
            "#,
        )
        .bind(&project.name)
        .bind(&project.description)
        .bind(&project.icon)
        .bind(&project.color)
        .bind(serde_json::to_string(&project.status)?)
        .bind(project.progress as i64)
        .bind(project.updated_at.to_rfc3339())
        .bind(project_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn delete_project(&self, project_id: &str) -> Result<()> {
        // First delete all documents in this project
        sqlx::query("DELETE FROM documents WHERE project_id = ?1")
            .bind(project_id)
            .execute(&self.pool)
            .await?;

        // Then delete the project
        sqlx::query("DELETE FROM projects WHERE id = ?1")
            .bind(project_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    pub async fn get_project_stats(&self) -> Result<crate::models::project::ProjectStats> {
        use crate::models::project::{ProjectStats, ProjectStatus};
        
        let total_row = sqlx::query("SELECT COUNT(*) as count FROM projects")
            .fetch_one(&self.pool)
            .await?;
        let total: u32 = total_row.get::<i64, _>("count") as u32;

        let active_row = sqlx::query("SELECT COUNT(*) as count FROM projects WHERE status = ?1")
            .bind(serde_json::to_string(&ProjectStatus::Active)?)
            .fetch_one(&self.pool)
            .await?;
        let active: u32 = active_row.get::<i64, _>("count") as u32;

        let completed_row = sqlx::query("SELECT COUNT(*) as count FROM projects WHERE status = ?1")
            .bind(serde_json::to_string(&ProjectStatus::Completed)?)
            .fetch_one(&self.pool)
            .await?;
        let completed: u32 = completed_row.get::<i64, _>("count") as u32;

        let archived_row = sqlx::query("SELECT COUNT(*) as count FROM projects WHERE status = ?1")
            .bind(serde_json::to_string(&ProjectStatus::Archived)?)
            .fetch_one(&self.pool)
            .await?;
        let archived: u32 = archived_row.get::<i64, _>("count") as u32;

        // Projects created this week
        let week_ago = chrono::Utc::now() - chrono::Duration::weeks(1);
        let this_week_row = sqlx::query("SELECT COUNT(*) as count FROM projects WHERE created_at > ?1")
            .bind(week_ago.to_rfc3339())
            .fetch_one(&self.pool)
            .await?;
        let this_week: u32 = this_week_row.get::<i64, _>("count") as u32;

        Ok(ProjectStats {
            total,
            active,
            completed,
            archived,
            this_week,
        })
    }

    // Additional document methods
    pub async fn get_document_by_id(&self, document_id: &str) -> Result<Option<Document>> {
        let row = sqlx::query("SELECT * FROM documents WHERE id = ?1")
            .bind(document_id)
            .fetch_optional(&self.pool)
            .await?;

        if let Some(row) = row {
            let document = Document {
                id: row.get("id"),
                title: row.get("title"),
                content: row.get("content"),
                content_type: serde_json::from_str(&row.get::<String, _>("content_type")).unwrap_or_default(),
                status: serde_json::from_str(&row.get::<String, _>("status")).unwrap_or_default(),
                word_count: row.get::<i64, _>("word_count") as u32,
                char_count: row.get::<i64, _>("char_count") as u32,
                project_id: row.get("project_id"),
                folder_path: row.get("folder_path"),
                tags: serde_json::from_str(&row.get::<String, _>("tags")).unwrap_or_default(),
                metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
                created_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?.with_timezone(&chrono::Utc),
                updated_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))?.with_timezone(&chrono::Utc),
                last_accessed: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("last_accessed"))?.with_timezone(&chrono::Utc),
            };
            Ok(Some(document))
        } else {
            Ok(None)
        }
    }

    pub async fn update_document(&self, document_id: &str, document_data: Document) -> Result<()> {
        sqlx::query(
            "UPDATE documents SET title = ?2, content = ?3, status = ?4, word_count = ?5, char_count = ?6, tags = ?7, metadata = ?8, updated_at = ?9 WHERE id = ?1"
        )
        .bind(document_id)
        .bind(&document_data.title)
        .bind(&document_data.content)
        .bind(serde_json::to_string(&document_data.status)?)
        .bind(document_data.word_count as i64)
        .bind(document_data.char_count as i64)
        .bind(serde_json::to_string(&document_data.tags)?)
        .bind(serde_json::to_string(&document_data.metadata)?)
        .bind(chrono::Utc::now().to_rfc3339())
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }

    pub async fn delete_document(&self, document_id: &str) -> Result<()> {
        sqlx::query("DELETE FROM documents WHERE id = ?1")
            .bind(document_id)
            .execute(&self.pool)
            .await?;
        
        Ok(())
    }

    pub async fn save_document_content(&self, document_id: &str, content: &str) -> Result<()> {
        let word_count = content.split_whitespace().count() as u32;
        let char_count = content.chars().count() as u32;
        
        sqlx::query(
            "UPDATE documents SET content = ?2, word_count = ?3, char_count = ?4, updated_at = ?5, last_accessed = ?6 WHERE id = ?1"
        )
        .bind(document_id)
        .bind(content)
        .bind(word_count as i64)
        .bind(char_count as i64)
        .bind(chrono::Utc::now().to_rfc3339())
        .bind(chrono::Utc::now().to_rfc3339())
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }

    // Additional workspace methods
    pub async fn get_workspace_by_id(&self, workspace_id: &str) -> Result<Option<Workspace>> {
        let row = sqlx::query("SELECT * FROM workspaces WHERE id = ?1")
            .bind(workspace_id)
            .fetch_optional(&self.pool)
            .await?;

        if let Some(row) = row {
            let workspace = Workspace {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                projects_count: row.get::<i64, _>("projects_count") as u32,
                status: serde_json::from_str(&row.get::<String, _>("status")).unwrap_or_default(),
                created_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?.with_timezone(&chrono::Utc),
                updated_at: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))?.with_timezone(&chrono::Utc),
                last_accessed: chrono::DateTime::parse_from_rfc3339(&row.get::<String, _>("last_accessed"))?.with_timezone(&chrono::Utc),
            };
            Ok(Some(workspace))
        } else {
            Ok(None)
        }
    }

    pub async fn delete_workspace(&self, workspace_id: &str) -> Result<()> {
        sqlx::query("DELETE FROM workspaces WHERE id = ?1")
            .bind(workspace_id)
            .execute(&self.pool)
            .await?;
        
        Ok(())
    }
}