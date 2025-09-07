use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentInfo {
    pub system: SystemEnvironment,
    pub writeflow: WriteFlowEnvironment,
    pub tools: ToolsEnvironment,
    pub status: EnvironmentStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemEnvironment {
    pub platform: String,
    pub arch: String,
    pub os_version: String,
    pub available_memory: u64,
    pub disk_space: u64,
    pub cpu_cores: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WriteFlowEnvironment {
    pub cli_installed: bool,
    pub cli_version: Option<String>,
    pub cli_path: Option<String>,
    pub config_path: Option<String>,
    pub templates_path: Option<String>,
    pub compatibility: CompatibilityStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompatibilityStatus {
    Compatible,
    UpdateRequired,
    Incompatible,
    NotInstalled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolsEnvironment {
    pub pandoc: ToolInfo,
    pub latex: ToolInfo,
    pub git: ToolInfo,
    pub node: ToolInfo,
    pub python: ToolInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolInfo {
    pub installed: bool,
    pub version: Option<String>,
    pub path: Option<String>,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EnvironmentStatus {
    Ready,
    PartiallyReady,
    NotReady,
    CheckFailed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallationRequest {
    pub tool: String,
    pub version: Option<String>,
    pub auto_install: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallationResult {
    pub tool: String,
    pub success: bool,
    pub message: String,
    pub installed_version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentCheckResult {
    pub overall_status: EnvironmentStatus,
    pub missing_tools: Vec<String>,
    pub warnings: Vec<String>,
    pub recommendations: Vec<String>,
    pub can_proceed: bool,
}

impl Default for ToolInfo {
    fn default() -> Self {
        Self {
            installed: false,
            version: None,
            path: None,
            required: false,
        }
    }
}

impl EnvironmentInfo {
    pub fn check_compatibility(&self) -> CompatibilityStatus {
        self.writeflow.compatibility.clone()
    }

    pub fn get_missing_tools(&self) -> Vec<String> {
        let mut missing = Vec::new();
        
        if self.tools.pandoc.required && !self.tools.pandoc.installed {
            missing.push("pandoc".to_string());
        }
        if self.tools.latex.required && !self.tools.latex.installed {
            missing.push("latex".to_string());
        }
        if self.tools.git.required && !self.tools.git.installed {
            missing.push("git".to_string());
        }
        if self.tools.node.required && !self.tools.node.installed {
            missing.push("node".to_string());
        }
        if self.tools.python.required && !self.tools.python.installed {
            missing.push("python".to_string());
        }

        missing
    }

    pub fn is_ready(&self) -> bool {
        matches!(self.status, EnvironmentStatus::Ready)
    }
}