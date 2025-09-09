use crate::models::config::{AppConfig, AIProvider, MCPServer};
use crate::services::config::ConfigService;

#[tauri::command]
pub async fn get_config() -> Result<AppConfig, String> {
    ConfigService::get_config().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_config(config: AppConfig) -> Result<(), String> {
    ConfigService::save_config(config)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn import_config(file_path: String) -> Result<AppConfig, String> {
    ConfigService::import_config(&file_path)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_config(config: AppConfig, file_path: String) -> Result<(), String> {
    ConfigService::export_config(config, &file_path)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn test_ai_provider(provider: AIProvider) -> Result<bool, String> {
    ConfigService::test_ai_provider(provider)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn test_mcp_server(server: MCPServer) -> Result<bool, String> {
    ConfigService::test_mcp_server(server)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn reset_config() -> Result<AppConfig, String> {
    ConfigService::reset_config()
        .await
        .map_err(|e| e.to_string())
}