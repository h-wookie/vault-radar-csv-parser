#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path
import sys

SBOM_DIR = Path("sbom")
SBOM_DIR.mkdir(exist_ok=True)

# Docker image tags
FINAL_IMAGE = "vault-radar-csv:latest"
BUILD_IMAGE = "vault-radar-csv-build:latest"

# Build commands
BUILD_COMMANDS = [
    # Build final image (default target)
    ["docker", "build", "-t", FINAL_IMAGE, "."],
    # Build intermediate stage using the `build` target
    ["docker", "build", "--target", "build", "-t", BUILD_IMAGE, "."],
]

# Syft targets
TARGETS = {
    "app": ["dir:."],
    "image-final": [FINAL_IMAGE],
    "image-build": [BUILD_IMAGE],
}

def run_command(cmd, description=None):
    """Run a shell command and stream output live."""
    desc = description or " ".join(cmd)
    print(f"\n🚀 {desc}")
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in process.stdout:
        print(line, end="")
    process.wait()
    if process.returncode != 0:
        print(f"❌ Error running: {' '.join(cmd)}")
        sys.exit(process.returncode)

def run_syft(target_args):
    """Run Syft and return parsed CycloneDX JSON output."""
    cmd = ["syft", *target_args, "-o", "cyclonedx-json"]
    print(f"\n🧩 Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"❌ Syft failed:\n{e.stderr}")
        sys.exit(1)

def key(component):
    """Unique key for deduplication."""
    return component.get("purl") or f"{component.get('name')}:{component.get('version','')}"

# --- Step 1: Build Docker images ---
for cmd in BUILD_COMMANDS:
    run_command(cmd, description=f"Building image: {cmd[-1]}")

# --- Step 2: Run Syft scans ---
docs = []
for label, args in TARGETS.items():
    print(f"\n🔍 Scanning {label} ...")
    docs.append(run_syft(args))

# --- Step 3: Merge SBOM data ---
print("\n🔄 Merging results ...")
result = docs[0].copy()  # start from app SBOM
components = {}

for doc in docs:
    for comp in doc.get("components", []):
        components.setdefault(key(comp), comp)

result["components"] = list(components.values())

# --- Step 4: Write final SBOM ---
output_path = SBOM_DIR / "sbom.json"
output_path.write_text(json.dumps(result, indent=2))

print(f"\n✅ Combined SBOM written to: {output_path.resolve()}")
print(f"📦 Total components: {len(result['components'])}")
print("\n🧠 Tip: You can upload this SBOM to security scanners like Grype or Dependency-Track.")
