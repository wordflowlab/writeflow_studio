use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub platform: String,
    pub arch: String,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub memory: MemoryInfo,
    pub disk: DiskInfo,
    pub cpu: CpuInfo,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryInfo {
    pub total: u64,
    pub available: u64,
    pub used: u64,
    pub usage_percentage: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskInfo {
    pub total: u64,
    pub available: u64,
    pub used: u64,
    pub usage_percentage: f32,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuInfo {
    pub cores: u32,
    pub usage_percentage: f32,
    pub temperature: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationStats {
    pub uptime: u64,
    pub memory_usage: u64,
    pub cpu_usage: f32,
    pub documents_open: u32,
    pub projects_count: u32,
    pub workspaces_count: u32,
    pub last_backup: Option<DateTime<Utc>>,
    pub auto_saves_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationData {
    pub id: String,
    pub title: String,
    pub body: String,
    pub notification_type: NotificationType,
    pub actions: Vec<NotificationAction>,
    pub timestamp: DateTime<Utc>,
    pub read: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationType {
    Info,
    Warning,
    Error,
    Success,
    Update,
    Backup,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationAction {
    pub id: String,
    pub label: String,
    pub action_type: ActionType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionType {
    Dismiss,
    OpenDocument,
    OpenProject,
    OpenSettings,
    RunBackup,
    Update,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemSettings {
    pub theme: String,
    pub language: String,
    pub notifications_enabled: bool,
    pub auto_update: bool,
    pub telemetry_enabled: bool,
    pub crash_reporting: bool,
    pub debug_mode: bool,
    pub log_level: LogLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
    Trace,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub id: String,
    pub level: LogLevel,
    pub message: String,
    pub module: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub current_version: String,
    pub latest_version: String,
    pub update_available: bool,
    pub release_notes: Option<String>,
    pub download_url: Option<String>,
    pub update_size: Option<u64>,
    pub is_critical: bool,
}

impl Default for SystemSettings {
    fn default() -> Self {
        Self {
            theme: "auto".to_string(),
            language: "zh-CN".to_string(),
            notifications_enabled: true,
            auto_update: true,
            telemetry_enabled: false,
            crash_reporting: true,
            debug_mode: false,
            log_level: LogLevel::Info,
        }
    }
}

#[allow(dead_code)]
impl NotificationData {
    pub fn new(title: String, body: String, notification_type: NotificationType) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            title,
            body,
            notification_type,
            actions: vec![NotificationAction {
                id: "dismiss".to_string(),
                label: "关闭".to_string(),
                action_type: ActionType::Dismiss,
            }],
            timestamp: Utc::now(),
            read: false,
        }
    }

    pub fn with_action(mut self, action: NotificationAction) -> Self {
        self.actions.push(action);
        self
    }

    pub fn mark_as_read(&mut self) {
        self.read = true;
    }
}
