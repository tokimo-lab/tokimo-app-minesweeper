//! 内嵌 axum HTTP server，监听本地 socket。
//!
//! 路由布局（server 端 `/api/apps/minesweeper/<rest>` 反代到本 sock 的 `/<rest>`）：
//! - `GET /assets/{*path}` — 静态资源

use axum::{Router, routing::get};
use tokimo_bus_protocol::{BusListener, DataPlaneSocket};
use tracing::{error, info};

use crate::assets;

pub async fn spawn(service: &str) -> anyhow::Result<DataPlaneSocket> {
    let (listener, socket) = BusListener::bind_for_app(service)?;
    info!(?socket, "minesweeper: app server listening");

    let router = Router::new().route("/assets/{*path}", get(assets::serve));

    tokio::spawn(async move {
        if let Err(e) = axum::serve(listener, router).await {
            error!(error = %e, "minesweeper: app server stopped");
        }
    });

    Ok(socket)
}
