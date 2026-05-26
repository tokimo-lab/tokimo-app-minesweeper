//! Minesweeper app — 方案 3 形态：内嵌 axum + UDS。
//!
//! 纯前端游戏，无后端业务逻辑。仅暴露：
//! - `GET /assets/{*path}` — 静态资源（rust-embed）

/// Compile-time embedded app manifest.
const MANIFEST: &str = include_str!("../tokimo-app.toml");

mod app_server;
mod assets;

use tokimo_bus_client::{BusClient, ClientConfig};
use tracing::{error, info};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // server 模式：由 supervisor 无参拉起（注入了 TOKIMO_BUS_SOCKET）
    if std::env::var_os("TOKIMO_BUS_SOCKET").is_none() {
        eprintln!("Usage: tokimo-app-minesweeper (started by tokimo supervisor)");
        eprintln!("Set TOKIMO_BUS_SOCKET to run in server mode.");
        std::process::exit(0);
    }

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,tokimo_bus_client=info".into()),
        )
        .init();

    if let Err(error) = run_server().await {
        error!(%error, "minesweeper: fatal");
        std::process::exit(1);
    }
    Ok(())
}

async fn run_server() -> anyhow::Result<()> {
    let cfg = ClientConfig::from_env().map_err(|e| anyhow::anyhow!("ClientConfig: {e}"))?;
    info!(endpoint = ?cfg.endpoint, "minesweeper: connecting to broker");

    let app_socket = app_server::spawn("minesweeper")
        .await
        .map_err(|e| anyhow::anyhow!("app_server spawn: {e}"))?;

    let client = BusClient::builder(cfg)
        .service("minesweeper", env!("CARGO_PKG_VERSION"))
        .data_plane(app_socket)
        .build()
        .await
        .map_err(|e| anyhow::anyhow!("bus build: {e}"))?;

    info!("minesweeper: registered with broker");

    let shutdown = {
        let client = std::sync::Arc::clone(&client);
        tokio::spawn(async move { client.run_until_shutdown().await })
    };

    tokio::select! {
        _ = tokio::signal::ctrl_c() => {
            info!("minesweeper: SIGINT received");
            client.shutdown();
        }
        _ = shutdown => info!("minesweeper: broker sent Shutdown"),
    }

    Ok(())
}
