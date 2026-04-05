use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum TaskStatus {
    Queued,
    Preparing,
    Downloading,
    Verifying,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeTaskRecord {
    pub task_id: String,
    pub target: String,
    pub label: String,
    pub status: TaskStatus,
    pub message: String,
    pub progress_current: u64,
    pub progress_total: u64,
    pub updated_at: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeEventPayload {
    pub event: String,
    pub task_id: String,
    pub target: String,
    pub status: String,
    pub message: String,
    pub progress_current: u64,
    pub progress_total: u64,
    pub progress_unit: String,
    pub timestamp: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PythonEnvelope {
    pub kind: String,
    pub payload: serde_json::Value,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct EnvironmentProbePayload {
    pub workspace_root: String,
    pub repo_root: String,
    pub status: String,
    pub mode: Option<String>,
    pub torch_available: bool,
    pub torch_version: Option<String>,
    pub cuda_available: bool,
    pub issues: Vec<String>,
    pub message: String,
}
