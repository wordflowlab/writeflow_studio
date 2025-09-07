use crate::models::config::AppConfig;
use crate::services::database::Database;
use anyhow::Result;
use tokio::fs;
use std::path::Path;

pub struct ConfigService;

impl ConfigService {
    pub async fn get_config() -> Result<AppConfig> {
        let db = Database::new().await?;
        
        if let Some(config) = db.get_config().await? {
            Ok(config)
        } else {
            let default_config = AppConfig::default();
            db.save_config(default_config.clone()).await?;
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
}