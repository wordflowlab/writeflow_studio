use crate::models::system::SystemInfo;

#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[tauri::command]
pub async fn show_notification(
    title: String,
    body: String,
) -> Result<(), String> {
    // This will be implemented when notification plugin is properly set up
    println!("Notification: {} - {}", title, body);
    Ok(())
}
