use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentModel {
    pub id: String,
    pub name: String,
    pub category: String,
    pub version: String,
    pub enabled: bool,
    pub description: Option<String>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallAgentInput {
    pub name: String,
    pub category: String,
    pub version: String,
    pub description: Option<String>,
    pub tags: Vec<String>,
}
