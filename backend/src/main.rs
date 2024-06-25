use actix_web::{get, middleware::Logger, post, web, App, HttpResponse, HttpServer, Responder};
use actix_files::NamedFile;
use env_logger::Env;
use std::path::{Path, PathBuf};

const FRONTEND: &str = env!("FONT_FRONTEND");

#[get("/")]
async fn index() -> actix_web::Result<NamedFile> {
    let path = Path::new(FRONTEND).join("index.html");
    Ok(NamedFile::open(path)?)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    env_logger::init_from_env(Env::default().default_filter_or("info"));

    HttpServer::new(|| 
        App::new()
            .service(index)
            .service(actix_files::Files::new("/static", Path::new(FRONTEND).join("static")))
            .service(actix_files::Files::new("/scripts", Path::new(FRONTEND).join("scripts").join("dist")))
            .service(actix_files::Files::new("/css", Path::new(FRONTEND).join("css")))
            .wrap(Logger::default())
    )
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
