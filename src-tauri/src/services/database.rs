use crate::models::{
    project::{Project, CreateProjectData, ProjectListResult, ProjectStatus},
    workspace::{Workspace, CreateWorkspaceData},
    document::{Document, CreateDocumentData},
    config::AppConfig,
    agent::{AgentModel, InstallAgentInput},
    provider::{AIProvider, CreateAIProviderInput},
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
        // 使用系统应用数据目录，避免监视器监听到 db 改变触发重建
        // macOS: ~/Library/Application Support
        // Windows: %APPDATA%
        // Linux: ~/.local/share
        let base = dirs::data_dir().ok_or_else(|| anyhow::anyhow!("No data dir"))?;
        Ok(base.join("writeflow-studio"))
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

        // Agents table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                version TEXT NOT NULL,
                enabled INTEGER NOT NULL DEFAULT 1,
                description TEXT,
                tags TEXT NOT NULL -- JSON array
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // AI Providers table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS ai_providers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                model_name TEXT NOT NULL,
                api_key TEXT NOT NULL,
                base_url TEXT,
                icon TEXT NOT NULL,
                bg_color TEXT NOT NULL,
                status TEXT NOT NULL,
                status_text TEXT NOT NULL,
                max_tokens INTEGER NOT NULL,
                context_length INTEGER NOT NULL,
                last_tested TEXT NOT NULL,
                description TEXT,
                priority INTEGER NOT NULL,
                model_pointer TEXT
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

    pub async fn search_projects(
        &self,
        workspace_id: Option<&str>,
        query: Option<&str>,
        status: Option<&str>,
        sort: Option<&str>,
        order: Option<&str>,
        page: u32,
        page_size: u32,
    ) -> Result<ProjectListResult> {
        let mut where_clauses: Vec<String> = Vec::new();
        let mut args: Vec<String> = Vec::new();

        if let Some(wid) = workspace_id {
            where_clauses.push("workspace_id = ?".to_string());
            args.push(wid.to_string());
        }

        if let Some(q) = query {
            where_clauses.push("(name LIKE ? OR description LIKE ?)".to_string());
            let like = format!("%{}%", q);
            args.push(like.clone());
            args.push(like);
        }

        if let Some(st) = status {
            let status_json = match st {
                "Active" => serde_json::to_string(&ProjectStatus::Active)?,
                "Completed" => serde_json::to_string(&ProjectStatus::Completed)?,
                "Archived" => serde_json::to_string(&ProjectStatus::Archived)?,
                _ => "".to_string(),
            };
            if !status_json.is_empty() {
                where_clauses.push("status = ?".to_string());
                args.push(status_json);
            }
        }

        let where_sql = if where_clauses.is_empty() { String::new() } else { format!(" WHERE {}", where_clauses.join(" AND ")) };

        let (sort_col, sort_dir) = match (sort.unwrap_or("updated_at"), order.unwrap_or("DESC")) {
            ("name", dir) => ("name", if dir.eq_ignore_ascii_case("ASC") {"ASC"} else {"DESC"}),
            ("created_at", dir) => ("created_at", if dir.eq_ignore_ascii_case("ASC") {"ASC"} else {"DESC"}),
            _ => ("updated_at", "DESC"),
        };

        let limit = page_size.max(1) as i64;
        let offset = ((page.max(1) - 1) * page_size) as i64;

        // Build count query
        let count_sql = format!("SELECT COUNT(*) as count FROM projects{}", where_sql);
        let mut count_q = sqlx::query(&count_sql);
        for a in &args { count_q = count_q.bind(a); }
        let count_row = count_q.fetch_one(&self.pool).await?;
        let total: u32 = count_row.get::<i64, _>("count") as u32;

        // Build list query
        let list_sql = format!("SELECT * FROM projects{} ORDER BY {} {} LIMIT ? OFFSET ?", where_sql, sort_col, sort_dir);
        let mut list_q = sqlx::query(&list_sql);
        for a in &args { list_q = list_q.bind(a); }
        list_q = list_q.bind(limit).bind(offset);
        let rows = list_q.fetch_all(&self.pool).await?;

        let mut items = Vec::new();
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
            items.push(project);
        }

        Ok(ProjectListResult { items, total })
    }

    // Document operations
    pub async fn create_document(&self, data: CreateDocumentData) -> Result<Document> {
        // 验证项目是否存在
        if self.get_project_by_id(&data.project_id).await?.is_none() {
            anyhow::bail!(format!("Project not found: {}", data.project_id));
        }

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
        .await
        .map_err(|e| {
            println!("SQL error inserting document (project_id={}): {}", document.project_id, e);
            e
        })?;

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
            println!("Loading config from database, length: {} chars", config_str.len());
            
            match serde_json::from_str::<AppConfig>(&config_str) {
                Ok(config) => {
                    println!("Successfully parsed config with {} AI providers, {} MCP servers", 
                        config.ai_providers.providers.len(),
                        config.mcp_servers.servers.len()
                    );
                    Ok(Some(config))
                },
                Err(e) => {
                    println!("Failed to parse config from database: {}. Using default config.", e);
                    // 如果解析失败，可能是旧版本的配置，返回 None 让上层创建默认配置
                    Ok(None)
                }
            }
        } else {
            println!("No config found in database, will create default");
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

    // Agent operations
    pub async fn list_agents(&self) -> Result<Vec<AgentModel>> {
        let rows = sqlx::query("SELECT * FROM agents ORDER BY name ASC")
            .fetch_all(&self.pool)
            .await?;

        let mut agents = Vec::new();
        for row in rows {
            let a = AgentModel {
                id: row.get("id"),
                name: row.get("name"),
                category: row.get("category"),
                version: row.get("version"),
                enabled: row.get::<i64, _>("enabled") == 1,
                description: row.get::<Option<String>, _>("description"),
                tags: serde_json::from_str(&row.get::<String, _>("tags")).unwrap_or_default(),
            };
            agents.push(a);
        }
        Ok(agents)
    }

    pub async fn install_agent(&self, input: InstallAgentInput) -> Result<AgentModel> {
        let id = format!("agent-{}", uuid::Uuid::new_v4());
        let tags = serde_json::to_string(&input.tags)?;
        sqlx::query(
            r#"INSERT INTO agents (id, name, category, version, enabled, description, tags) VALUES (?1, ?2, ?3, ?4, 1, ?5, ?6)"#,
        )
        .bind(&id)
        .bind(&input.name)
        .bind(&input.category)
        .bind(&input.version)
        .bind(&input.description)
        .bind(&tags)
        .execute(&self.pool)
        .await?;
        Ok(AgentModel { id, name: input.name, category: input.category, version: input.version, enabled: true, description: input.description, tags: serde_json::from_str(&tags).unwrap_or_default() })
    }

    pub async fn set_agent_enabled(&self, id: &str, enabled: bool) -> Result<()> {
        sqlx::query("UPDATE agents SET enabled = ?2 WHERE id = ?1")
            .bind(id)
            .bind(if enabled {1} else {0})
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn uninstall_agent(&self, id: &str) -> Result<()> {
        sqlx::query("DELETE FROM agents WHERE id = ?1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn update_agent_version(&self, id: &str, version: &str) -> Result<()> {
        sqlx::query("UPDATE agents SET version = ?2 WHERE id = ?1")
            .bind(id)
            .bind(version)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    // AI Provider operations
    pub async fn list_ai_providers(&self) -> Result<Vec<AIProvider>> {
        let rows = sqlx::query("SELECT * FROM ai_providers ORDER BY priority ASC, name ASC")
            .fetch_all(&self.pool)
            .await?;
        let mut items = Vec::new();
        for row in rows {
            items.push(AIProvider {
                id: row.get("id"),
                name: row.get("name"),
                model_name: row.get("model_name"),
                api_key: row.get("api_key"),
                base_url: row.get("base_url"),
                icon: row.get("icon"),
                bg_color: row.get("bg_color"),
                status: row.get("status"),
                status_text: row.get("status_text"),
                max_tokens: row.get::<i64, _>("max_tokens"),
                context_length: row.get::<i64, _>("context_length"),
                last_tested: row.get("last_tested"),
                description: row.get("description"),
                priority: row.get::<i64, _>("priority"),
                model_pointer: row.get("model_pointer"),
            });
        }
        Ok(items)
    }

    pub async fn create_ai_provider(&self, input: CreateAIProviderInput) -> Result<AIProvider> {
        let id = format!("prov-{}", uuid::Uuid::new_v4());
        let provider = AIProvider {
            id: id.clone(),
            name: input.name,
            model_name: input.model_name,
            api_key: input.api_key,
            base_url: input.base_url,
            icon: input.icon,
            bg_color: input.bg_color,
            status: "testing".to_string(),
            status_text: "测试中...".to_string(),
            max_tokens: input.max_tokens,
            context_length: input.context_length,
            last_tested: "从未".to_string(),
            description: input.description,
            priority: input.priority,
            model_pointer: input.model_pointer,
        };

        sqlx::query(
            r#"INSERT INTO ai_providers (id, name, model_name, api_key, base_url, icon, bg_color, status, status_text, max_tokens, context_length, last_tested, description, priority, model_pointer)
               VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)"#
        )
        .bind(&provider.id)
        .bind(&provider.name)
        .bind(&provider.model_name)
        .bind(&provider.api_key)
        .bind(&provider.base_url)
        .bind(&provider.icon)
        .bind(&provider.bg_color)
        .bind(&provider.status)
        .bind(&provider.status_text)
        .bind(provider.max_tokens)
        .bind(provider.context_length)
        .bind(&provider.last_tested)
        .bind(&provider.description)
        .bind(provider.priority)
        .bind(&provider.model_pointer)
        .execute(&self.pool)
        .await?;

        Ok(provider)
    }

    pub async fn delete_ai_provider(&self, id: &str) -> Result<()> {
        sqlx::query("DELETE FROM ai_providers WHERE id = ?1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn update_ai_provider(&self, provider: &AIProvider) -> Result<()> {
        sqlx::query(
            r#"UPDATE ai_providers SET name=?2, model_name=?3, api_key=?4, base_url=?5, icon=?6, bg_color=?7,
                status=?8, status_text=?9, max_tokens=?10, context_length=?11, last_tested=?12, description=?13, priority=?14, model_pointer=?15 WHERE id=?1"#
        )
        .bind(&provider.id)
        .bind(&provider.name)
        .bind(&provider.model_name)
        .bind(&provider.api_key)
        .bind(&provider.base_url)
        .bind(&provider.icon)
        .bind(&provider.bg_color)
        .bind(&provider.status)
        .bind(&provider.status_text)
        .bind(provider.max_tokens)
        .bind(provider.context_length)
        .bind(&provider.last_tested)
        .bind(&provider.description)
        .bind(provider.priority)
        .bind(&provider.model_pointer)
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

    pub async fn update_workspace(&self, workspace_id: &str, name: &str, description: &str) -> Result<Workspace> {
        sqlx::query("UPDATE workspaces SET name = ?2, description = ?3, updated_at = ?4 WHERE id = ?1")
            .bind(workspace_id)
            .bind(name)
            .bind(description)
            .bind(chrono::Utc::now().to_rfc3339())
            .execute(&self.pool)
            .await?;

        // return updated row
        Ok(self.get_workspace_by_id(workspace_id).await?.expect("workspace should exist"))
    }

    pub async fn delete_workspace(&self, workspace_id: &str) -> Result<()> {
        sqlx::query("DELETE FROM workspaces WHERE id = ?1")
            .bind(workspace_id)
            .execute(&self.pool)
            .await?;
        
        Ok(())
    }
}
