use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub general: GeneralConfig,
    pub editor: EditorConfig,
    pub ui: UIConfig,
    pub export: ExportConfig,
    pub writeflow: WriteFlowConfig,
    pub plugins: PluginConfig,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneralConfig {
    pub language: String,
    pub auto_save: bool,
    pub auto_save_interval: u32, // seconds
    pub backup_enabled: bool,
    pub backup_interval: u32, // minutes
    pub default_workspace: Option<String>,
    pub recent_files_limit: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EditorConfig {
    pub theme: String,
    pub font_family: String,
    pub font_size: u32,
    pub line_height: f32,
    pub word_wrap: bool,
    pub show_line_numbers: bool,
    pub show_minimap: bool,
    pub tab_size: u32,
    pub vim_mode: bool,
    pub spell_check: bool,
    pub grammar_check: bool,
    pub live_preview: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UIConfig {
    pub sidebar_width: u32,
    pub preview_width: u32,
    pub show_sidebar: bool,
    pub show_preview: bool,
    pub show_toolbar: bool,
    pub show_status_bar: bool,
    pub compact_mode: bool,
    pub color_scheme: ColorScheme,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ColorScheme {
    Light,
    Dark,
    Auto,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportConfig {
    pub default_format: String,
    pub pdf_options: PdfExportOptions,
    pub html_options: HtmlExportOptions,
    pub markdown_options: MarkdownExportOptions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfExportOptions {
    pub page_size: String,
    pub margins: String,
    pub include_toc: bool,
    pub include_page_numbers: bool,
    pub custom_css: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HtmlExportOptions {
    pub include_css: bool,
    pub standalone: bool,
    pub custom_template: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarkdownExportOptions {
    pub format: String,
    pub include_metadata: bool,
    pub line_ending: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WriteFlowConfig {
    pub cli_path: Option<String>,
    pub auto_sync: bool,
    pub sync_interval: u32, // minutes
    pub default_template: Option<String>,
    pub custom_commands: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginConfig {
    pub enabled_plugins: Vec<String>,
    pub plugin_settings: HashMap<String, serde_json::Value>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            general: GeneralConfig {
                language: "zh-CN".to_string(),
                auto_save: true,
                auto_save_interval: 30,
                backup_enabled: true,
                backup_interval: 10,
                default_workspace: None,
                recent_files_limit: 10,
            },
            editor: EditorConfig {
                theme: "default".to_string(),
                font_family: "Monaco".to_string(),
                font_size: 14,
                line_height: 1.5,
                word_wrap: true,
                show_line_numbers: true,
                show_minimap: false,
                tab_size: 2,
                vim_mode: false,
                spell_check: true,
                grammar_check: false,
                live_preview: true,
            },
            ui: UIConfig {
                sidebar_width: 280,
                preview_width: 400,
                show_sidebar: true,
                show_preview: true,
                show_toolbar: true,
                show_status_bar: true,
                compact_mode: false,
                color_scheme: ColorScheme::Auto,
            },
            export: ExportConfig {
                default_format: "pdf".to_string(),
                pdf_options: PdfExportOptions {
                    page_size: "A4".to_string(),
                    margins: "2cm".to_string(),
                    include_toc: true,
                    include_page_numbers: true,
                    custom_css: None,
                },
                html_options: HtmlExportOptions {
                    include_css: true,
                    standalone: true,
                    custom_template: None,
                },
                markdown_options: MarkdownExportOptions {
                    format: "CommonMark".to_string(),
                    include_metadata: true,
                    line_ending: "LF".to_string(),
                },
            },
            writeflow: WriteFlowConfig {
                cli_path: None,
                auto_sync: false,
                sync_interval: 5,
                default_template: None,
                custom_commands: HashMap::new(),
            },
            plugins: PluginConfig {
                enabled_plugins: vec![],
                plugin_settings: HashMap::new(),
            },
            updated_at: Utc::now(),
        }
    }
}