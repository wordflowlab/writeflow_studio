use crate::services::database::Database;
use crate::models::provider::{AIProvider, CreateAIProviderInput};
use tauri::State;

#[tauri::command]
pub async fn list_ai_providers(database: State<'_, Database>) -> Result<Vec<AIProvider>, String> {
    database.list_ai_providers().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_ai_provider(database: State<'_, Database>, input: CreateAIProviderInput) -> Result<AIProvider, String> {
    database.create_ai_provider(input).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_ai_provider(database: State<'_, Database>, id: String) -> Result<(), String> {
    database.delete_ai_provider(&id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_ai_provider(database: State<'_, Database>, provider: AIProvider) -> Result<(), String> {
    database.update_ai_provider(&provider).await.map_err(|e| e.to_string())
}

