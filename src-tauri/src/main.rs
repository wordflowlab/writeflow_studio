// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod services;
mod utils;

use commands::*;
use services::database::Database;

#[tokio::main]
async fn main() {
    // Initialize database
    let database = Database::new().await.expect("Failed to initialize database");
    
    tauri::Builder::default()
        .manage(database)
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            // Project management
            project::create_project,
            project::get_projects,
            project::get_project_by_id,
            project::update_project,
            project::delete_project,
            project::get_project_stats,
            project::get_projects_by_workspace,
            
            // Workspace management
            workspace::create_workspace,
            workspace::get_workspaces,
            workspace::switch_workspace,
            workspace::delete_workspace,
            
            // Document management
            document::create_document,
            document::get_documents,
            document::get_documents_by_project,
            document::get_document_by_id,
            document::update_document,
            document::update_document_content,
            document::delete_document,
            document::save_document,
            
            // Environment management
            environment::check_environment,
            environment::install_nodejs,
            environment::install_writeflow_cli,
            environment::repair_environment,
            
            // Configuration
            config::get_config,
            config::save_config,
            config::import_config,
            config::export_config,
            
            // System utilities
            system::get_system_info,
            system::show_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}