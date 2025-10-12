job "vault-radar-csv-parser" {
  datacenters = ["dc1"]

  group "parser" {
    count = 1

    network {
      port "parser" {
        static = 8080
        to = 8080
      }
    }

    task "worker" {
      driver = "docker"

      config {
        image = "fwarfvinge/vault-radar-csv:latest"
        ports = ["parser"]

      }

      resources {
        cpu    = 256
        memory = 512
      }

      restart {
        attempts = 3
        interval = "5m"
        delay    = "30s"
        mode     = "delay"
      }
    }
  }
}