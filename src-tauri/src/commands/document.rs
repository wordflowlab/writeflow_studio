use crate::models::document::{Document, CreateDocumentData};
use crate::services::database::Database;
use tauri::State;

#[tauri::command]
pub async fn create_document(
    database: State<'_, Database>,
    document_data: CreateDocumentData,
) -> Result<Document, String> {
    database
        .create_document(document_data)
        .await
        .map_err(|e| format!("创建文档失败: {}", e))
}

#[tauri::command]
pub async fn get_documents(
    database: State<'_, Database>,
    project_id: String,
) -> Result<Vec<Document>, String> {
    database
        .get_documents_by_project(&project_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_document_by_id(
    database: State<'_, Database>,
    document_id: String,
) -> Result<Option<Document>, String> {
    database
        .get_document_by_id(&document_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_document(
    database: State<'_, Database>,
    document_id: String,
    document_data: Document,
) -> Result<(), String> {
    database
        .update_document(&document_id, document_data)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_document(
    database: State<'_, Database>,
    document_id: String,
) -> Result<(), String> {
    database
        .delete_document(&document_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_document(
    database: State<'_, Database>,
    document_id: String,
    content: String,
) -> Result<(), String> {
    database
        .save_document_content(&document_id, &content)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_documents_by_project(
    database: State<'_, Database>,
    project_id: String,
) -> Result<Vec<Document>, String> {
    database
        .get_documents_by_project(&project_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_document_content(
    database: State<'_, Database>,
    document_id: String,
    content: String,
) -> Result<(), String> {
    database
        .save_document_content(&document_id, &content)
        .await
        .map_err(|e| e.to_string())
}