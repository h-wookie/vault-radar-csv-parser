# Vault-Radar CSV Parser

[![Open Source](https://img.shields.io/badge/open%20source-yes-brightgreen)](https://github.com/Atnaszurc/vault-radar-csv-parser)

Vault-Radar CSV Parser is an offline, open-source tool designed to analyze Vault-Radar export files.
It allows you to filter, inspect, and export secret data directly from CSV files, even when the SaaS solution is unavailable.

Key features include:

* Filter secrets based on multiple criteria
* Export filtered results to PDF with active filters applied
* Fully offline, no external dependencies required for runtime
* Built with React, Vite, and TailwindCSS for fast and modern UI
* Open-source and free to modify

---

## Getting Started

### Prerequisites

To run locally with npm:

* Node.js ≥ 18
* npm ≥ 9

To run with Docker:

* Docker ≥ 20

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

```bash
# Build the Docker image
docker build -t vault-radar-csv .

# Run the container, exposing port 8080
docker run -p 8080:8080 vault-radar-csv
```

Open your browser at [http://localhost:8080](http://localhost:8080) to use the app.


---

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