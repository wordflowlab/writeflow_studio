use crate::models::project::{Project, CreateProjectData, ProjectStats};
use crate::services::database::Database;
use tauri::State;

#[tauri::command]
pub async fn create_project(
    database: State<'_, Database>,
    project_data: CreateProjectData,
) -> Result<Project, String> {
    database
        .create_project(project_data)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_projects(database: State<'_, Database>) -> Result<Vec<Project>, String> {
    database.get_projects().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_project_by_id(
    database: State<'_, Database>,
    project_id: String,
) -> Result<Option<Project>, String> {
    database
        .get_project_by_id(&project_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_project(
    database: State<'_, Database>,
    project_id: String,
    project_data: Project,
) -> Result<(), String> {
    database
        .update_project(&project_id, project_data)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_project(
    database: State<'_, Database>,
    project_id: String,
) -> Result<(), String> {
    database
        .delete_project(&project_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_project_stats(database: State<'_, Database>) -> Result<ProjectStats, String> {
    database.get_project_stats().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_projects_by_workspace(
    database: State<'_, Database>,
    workspace_id: String,
) -> Result<Vec<Project>, String> {
    database
        .get_projects_by_workspace(&workspace_id)
        .await
        .map_err(|e| e.to_string())
}