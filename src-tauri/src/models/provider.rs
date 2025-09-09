use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIProvider {
    pub id: String,
    pub name: String,
    pub model_name: String,
    pub api_key: String,
    pub base_url: Option<String>,
    pub icon: String,
    pub bg_color: String,
    pub status: String,         // connected/testing/error/disconnected
    pub status_text: String,
    pub max_tokens: i64,
    pub context_length: i64,
    pub last_tested: String,
    pub description: Option<String>,
    pub priority: i64,
    pub model_pointer: Option<String>, // main/task/inference
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateAIProviderInput {
    pub name: String,
    pub model_name: String,
    pub api_key: String,
    pub base_url: Option<String>,
    pub icon: String,
    pub bg_color: String,
    pub max_tokens: i64,
    pub context_length: i64,
    pub description: Option<String>,
    pub priority: i64,
    pub model_pointer: Option<String>,
}

