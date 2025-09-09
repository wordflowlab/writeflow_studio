use crate::models::config::{AppConfig, AIProvider, MCPServer, MCPConnectionType};
use crate::services::database::Database;
use anyhow::Result;
use tokio::fs;
use std::path::Path;

pub struct ConfigService;

impl ConfigService {
    pub async fn get_config() -> Result<AppConfig> {
        let db = Database::new().await?;
        
        if let Some(mut config) = db.get_config().await? {
            // 检查并迁移配置以确保包含所有必需字段
            let mut needs_update = false;
            
            // 确保 ai_providers 字段存在
            if config.ai_providers.providers.is_empty() && config.ai_providers.default_provider.is_none() {
                // 这可能是旧配置，需要初始化新字段
                needs_update = true;
            }
            
            // 如果需要更新，保存迁移后的配置
            if needs_update {
                config.updated_at = chrono::Utc::now();
                db.save_config(config.clone()).await?;
                println!("Configuration migrated to include new fields");
            }
            
            Ok(config)
        } else {
            let default_config = AppConfig::default();
            db.save_config(default_config.clone()).await?;
            println!("Created default configuration");
            Ok(default_config)
        }
    }

    pub async fn save_config(mut config: AppConfig) -> Result<()> {
        config.updated_at = chrono::Utc::now();
        
        let db = Database::new().await?;
        db.save_config(config).await?;
        
        Ok(())
    }

    pub async fn import_config(file_path: &str) -> Result<AppConfig> {
        let content = fs::read_to_string(file_path).await?;
        let config: AppConfig = serde_json::from_str(&content)?;
        
        Self::save_config(config.clone()).await?;
        
        Ok(config)
    }

    pub async fn export_config(config: AppConfig, file_path: &str) -> Result<()> {
        let content = serde_json::to_string_pretty(&config)?;
        
        if let Some(parent) = Path::new(file_path).parent() {
            fs::create_dir_all(parent).await?;
        }
        
        fs::write(file_path, content).await?;
        
        Ok(())
    }

    pub async fn reset_config() -> Result<AppConfig> {
        let default_config = AppConfig::default();
        Self::save_config(default_config.clone()).await?;
        Ok(default_config)
    }

    pub async fn test_ai_provider(provider: AIProvider) -> Result<bool> {
        // 基本验证
        if provider.api_key.is_none() || provider.api_key.as_ref().unwrap().is_empty() {
            return Ok(false);
        }

        // 简单的 HTTP 请求测试（这里可以根据具体提供商实现更详细的测试）
        match provider.provider_type.as_str() {
            "openai" => {
                let client = reqwest::Client::new();
                let base_url = provider.api_base.unwrap_or_else(|| "https://api.openai.com/v1".to_string());
                let response = client
                    .get(format!("{}/models", base_url))
                    .header("Authorization", format!("Bearer {}", provider.api_key.unwrap()))
                    .send()
                    .await;
                
                match response {
                    Ok(resp) => Ok(resp.status().is_success()),
                    Err(_) => Ok(false),
                }
            }
            _ => {
                // 对于其他提供商，暂时只检查 API key 是否存在
                Ok(provider.api_key.is_some() && !provider.api_key.unwrap().is_empty())
            }
        }
    }

    pub async fn test_mcp_server(server: MCPServer) -> Result<bool> {
        match server.connection_type {
            MCPConnectionType::Stdio => {
                // 检查命令是否存在
                if let Some(command) = &server.command {
                    match std::process::Command::new(command)
                        .arg("--version")
                        .output()
                    {
                        Ok(_) => Ok(true),
                        Err(_) => Ok(false),
                    }
                } else {
                    Ok(false)
                }
            }
            MCPConnectionType::SSE => {
                // 简单的 HTTP 连接测试
                if let Some(url) = &server.url {
                    let client = reqwest::Client::new();
                    match client.get(url).send().await {
                        Ok(_) => Ok(true),
                        Err(_) => Ok(false),
                    }
                } else {
                    Ok(false)
                }
            }
        }
    }
}