use crate::models::environment::{EnvironmentStatus, InstallationResult};
use crate::services::environment::EnvironmentService;
use tauri::State;

#[tauri::command]
pub async fn check_environment() -> Result<EnvironmentStatus, String> {
    let service = EnvironmentService::new();
    service.check_environment()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn install_nodejs() -> Result<InstallationResult, String> {
    let service = EnvironmentService::new();
    service.install_nodejs()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn install_writeflow_cli() -> Result<InstallationResult, String> {
    let service = EnvironmentService::new();
    service.install_writeflow_cli()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn repair_environment() -> Result<InstallationResult, String> {
    let service = EnvironmentService::new();
    service.repair_environment()
        .await
        .map_err(|e| e.to_string())
}