# Vault-Radar CSV Parser

[![Open Source](https://img.shields.io/badge/open%20source-yes-brightgreen?style=for-the-badge&logo=github)](https://github.com/Atnaszurc/vault-radar-csv-parser)
[![SBOM](https://img.shields.io/badge/SBOM-CycloneDX-blue?style=for-the-badge&logo=dependabot)](./sbom/sbom.json)
[![Docker Hub](https://img.shields.io/badge/DockerHub-vault--radar--csv-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/r/fwarfvinge/vault-radar-csv)


Vault-Radar CSV Parser is an offline, open-source tool designed to analyze Vault-Radar export files.
It allows you to filter, inspect, and export secret data directly from CSV files generated in situations when you are unable to use the SaaS solution.

Key features include:

* Filter secrets based on multiple criteria
* Export filtered results to PDF with active filters applied
* Fully offline, no external dependencies required for runtime
* Built with React, Vite, and TailwindCSS for fast and modern UI
* Open-source and free to modify


## Disclaimer

This project is a personal, community-driven tool and is not an official HashiCorp product.
It is not affiliated with, endorsed by, or supported by HashiCorp.
The software is provided “as is,” without warranty of any kind, express or implied. Use at your own risk.

---

![Screenshot of finding](./screenshot.png?raw=true "Dark mode findings")

## Getting Started

### Prerequisites

To run locally with npm:

* Node.js ≥ 22
* npm ≥ 11.6

To run with Docker:

* Docker ≥ 20

SBOM: The full Software Bill of Materials (SBOM) is available in the /sbom
Script to generate SBOM exists in [generate_sbom.py](./generate_sbom.py)

---

### Run locally (development)

```bash
# Clone the repo
git clone https://github.com/Atnaszurc/vault-radar-csv-parser.git
cd vault-radar-csv

# Install dependencies
npm ci

# Start development server
npm run dev
```

Your app will be available at [http://localhost:8080](http://localhost:8080) by default.

---

### Run with Docker

#### Pull the pre-built image

```bash
docker run -p 8080:8080 fwarfvinge/vault-radar-csv:latest
```

#### Build the image locally

```bash
# Build the Docker image
docker build -t vault-radar-csv .

# Run the container, exposing port 8080
docker run -p 8080:8080 vault-radar-csv
```

Open your browser at [http://localhost:8080](http://localhost:8080) to use the app.


---

### Run with Nomad

File: [example-nomad-jobspec.hcl](./example-nomad-jobspec.hcl)

Run it with:

```sh
nomad job run example-nomad-jobspec.hcl
```

Then access it with your browser on <NOMAD_NODE_IP>:8080

---

### Run with Kubernetes

File: [example-kubernetes-spec.yaml](./example-kubernetes-spec.yaml)

Deploy with:

```sh
kubectl apply -f example-kubernetes-spec.yaml
```

Access it from inside the cluster via:

```sh
kubectl port-forward pod/vault-radar-csv-parser 8080:8080
```

## Support

Vault-Radar CSV Parser is community-supported.
For issues, feature requests, or contributions:

* Open an issue on the [GitHub repository](https://github.com/Atnaszurc/vault-radar-csv-parser/issues)
* Submit pull requests for improvements

---

## License

This project is open-source under the MIT License.
Feel free to use, modify, and distribute it freely.

---

Created with [Lovable](https://lovable.dev)