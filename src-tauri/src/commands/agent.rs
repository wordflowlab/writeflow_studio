use crate::services::database::Database;
use crate::models::agent::{AgentModel, InstallAgentInput};
use tauri::State;

#[tauri::command]
pub async fn list_agents(database: State<'_, Database>) -> Result<Vec<AgentModel>, String> {
    database.list_agents().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn install_agent(database: State<'_, Database>, input: InstallAgentInput) -> Result<AgentModel, String> {
    database.install_agent(input).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_agent_enabled(database: State<'_, Database>, id: String, enabled: bool) -> Result<(), String> {
    database.set_agent_enabled(&id, enabled).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn uninstall_agent(database: State<'_, Database>, id: String) -> Result<(), String> {
    database.uninstall_agent(&id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_agent_version(database: State<'_, Database>, id: String, version: String) -> Result<(), String> {
    database.update_agent_version(&id, &version).await.map_err(|e| e.to_string())
}

