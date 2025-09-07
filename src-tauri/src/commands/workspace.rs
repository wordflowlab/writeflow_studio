use crate::models::workspace::{Workspace, CreateWorkspaceData};
use crate::services::database::Database;
use tauri::State;

#[tauri::command]
pub async fn create_workspace(
    database: State<'_, Database>,
    workspace_data: CreateWorkspaceData,
) -> Result<Workspace, String> {
    database
        .create_workspace(workspace_data)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_workspaces(database: State<'_, Database>) -> Result<Vec<Workspace>, String> {
    database.get_workspaces().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn switch_workspace(
    database: State<'_, Database>,
    workspace_id: String,
) -> Result<Workspace, String> {
    database
        .get_workspace_by_id(&workspace_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Workspace not found".to_string())
}

#[tauri::command]
pub async fn delete_workspace(
    database: State<'_, Database>,
    workspace_id: String,
) -> Result<(), String> {
    database
        .delete_workspace(&workspace_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_workspace(
    database: State<'_, Database>,
    workspace_id: String,
    name: String,
    description: String,
) -> Result<Workspace, String> {
    database
        .update_workspace(&workspace_id, &name, &description)
        .await
        .map_err(|e| e.to_string())
}
