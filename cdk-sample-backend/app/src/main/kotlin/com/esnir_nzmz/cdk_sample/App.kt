package com.esnir_nzmz.cdk_sample

import io.ktor.application.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*

fun main() {
    embeddedServer(Netty, port = 8080) {
        routing {
            get("/api/v1/healthCheck") {
                call.respondText("The server is healthy.")
            }
            get("/api/v1/message") {
                call.respondText("Hello, world")
            }
        }
    }.start(wait = true)
}
