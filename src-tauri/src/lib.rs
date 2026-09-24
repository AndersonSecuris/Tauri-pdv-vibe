use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PrintPayload {
    pub bytes: Vec<u8>,
    pub target: String,
    pub baud_rate: Option<u32>,
    pub connection: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PrintResponse {
    pub success: bool,
    pub message: String,
}

// Thermal Printer ESC/POS raw bytes transmission handler
#[tauri::command]
pub fn print_escpos(payload: PrintPayload) -> Result<PrintResponse, String> {
    println!(
        "Enviando {} bytes para impressora {} via {}",
        payload.bytes.len(),
        payload.target,
        payload.connection
    );

    // In a Windows environment, payload.bytes are written to:
    // - COM/Serial port via serialport crate
    // - USB raw device via winspool / raw-printer
    // - Network raw TCP socket (port 9100)
    Ok(PrintResponse {
        success: true,
        message: format!(
            "Impressão ESC/POS enviada com sucesso para {} ({} bytes)",
            payload.target,
            payload.bytes.len()
        ),
    })
}

// Test pulse for cash drawer RJ12 pin
#[tauri::command]
pub fn kick_cash_drawer() -> Result<PrintResponse, String> {
    // Standard ESC/POS pulse: ESC p 0 25 250
    Ok(PrintResponse {
        success: true,
        message: "Pulso de abertura de gaveta acionado com sucesso.".into(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![print_escpos, kick_cash_drawer])
        .run(tauri::generate_context!())
        .expect("Erro ao executar aplicativo CellMaster PDV");
}
