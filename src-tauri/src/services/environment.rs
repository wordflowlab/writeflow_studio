// 环境管理服务
// 用于检查和安装运行环境

use crate::models::environment::{EnvironmentStatus, InstallationResult, EnvSummary, EnvComponent};
use tokio::process::Command;

pub struct EnvironmentService;

impl EnvironmentService {
    pub fn new() -> Self {
        Self
    }
    
    // TODO: 实现环境检查和安装功能
    pub async fn check_environment(&self) -> anyhow::Result<EnvironmentStatus> {
        Ok(EnvironmentStatus::Ready)
    }

    pub async fn get_summary(&self) -> anyhow::Result<EnvSummary> {
        let node_v = get_version(&["node", "-v"]).await;
        let npm_v = get_version(&["npm", "-v"]).await;
        let wf_v = get_version_multi(&[["writeflow", "--version"], ["writeflow-cli", "--version"]]).await;

        let node = EnvComponent { installed: node_v.is_some(), version: node_v };
        let npm = EnvComponent { installed: npm_v.is_some(), version: npm_v };
        let writeflow = EnvComponent { installed: wf_v.is_some(), version: wf_v };

        let missing = (!node.installed) as u32 + (!npm.installed) as u32 + (!writeflow.installed) as u32;
        let health = (100i32 - (missing as i32) * 20).clamp(0, 100) as u8;

        Ok(EnvSummary { health, issues: missing, node, npm, writeflow })
    }
    
    pub async fn install_nodejs(&self) -> anyhow::Result<InstallationResult> {
        Ok(InstallationResult {
            tool: "nodejs".to_string(),
            success: true,
            message: "Node.js installation placeholder".to_string(),
            installed_version: Some("18.0.0".to_string()),
        })
    }
    
    pub async fn install_writeflow_cli(&self) -> anyhow::Result<InstallationResult> {
        Ok(InstallationResult {
            tool: "writeflow-cli".to_string(),
            success: true,
            message: "WriteFlow CLI installation placeholder".to_string(),
            installed_version: Some("1.0.0".to_string()),
        })
    }
    
    pub async fn repair_environment(&self) -> anyhow::Result<InstallationResult> {
        Ok(InstallationResult {
            tool: "environment".to_string(),
            success: true,
            message: "Environment repair placeholder".to_string(),
            installed_version: None,
        })
    }
}

async fn get_version(parts: &[&str]) -> Option<String> {
    let (cmd, args) = parts.split_first()?;
    let output = Command::new(cmd).args(args).output().await.ok()?;
    if !output.status.success() { return None; }
    let mut s = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if s.is_empty() { s = String::from_utf8_lossy(&output.stderr).trim().to_string(); }
    if s.is_empty() { None } else { Some(s) }
}

async fn get_version_multi(candidates: &[[&str; 2]]) -> Option<String> {
    for parts in candidates {
        if let Some(v) = get_version(parts).await { return Some(v); }
    }
    None
}
