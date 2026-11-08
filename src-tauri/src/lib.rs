use std::{fs, path::PathBuf};
use tauri::Manager;

fn library_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve the app data directory: {error}"))?;
    fs::create_dir_all(&dir)
        .map_err(|error| format!("Could not create the app data directory: {error}"))?;
    Ok(dir.join("library.json"))
}

/// Load the saved library JSON. `None` means this is a first launch.
#[tauri::command]
fn load_library(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = library_path(&app)?;
    match fs::read_to_string(&path) {
        Ok(contents) => Ok(Some(contents)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(format!("Could not read the saved library: {error}")),
    }
}

/// Persist the library atomically so a crash mid-write cannot corrupt progress.
#[tauri::command]
fn save_library(app: tauri::AppHandle, json: String) -> Result<(), String> {
    serde_json::from_str::<serde_json::Value>(&json)
        .map_err(|error| format!("Refusing to save malformed library data: {error}"))?;

    let path = library_path(&app)?;
    let temporary = path.with_extension("json.tmp");
    fs::write(&temporary, json.as_bytes())
        .map_err(|error| format!("Could not write the library: {error}"))?;
    fs::rename(&temporary, &path)
        .map_err(|error| format!("Could not commit the library: {error}"))?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_library, save_library])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
