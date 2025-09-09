// 通用工具函数模块

use std::fs;
use std::path::Path;

#[allow(dead_code)]
pub fn ensure_dir_exists(path: &Path) -> anyhow::Result<()> {
    if !path.exists() {
        fs::create_dir_all(path)?;
    }
    Ok(())
}

#[allow(dead_code)]
pub fn get_file_extension(filename: &str) -> Option<&str> {
    Path::new(filename).extension()?.to_str()
}

#[allow(dead_code)]
pub fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| match c {
            '/' | '\\' | '<' | '>' | ':' | '"' | '|' | '?' | '*' => '_',
            c => c,
        })
        .collect()
}
