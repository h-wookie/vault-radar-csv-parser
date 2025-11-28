# Vault-Radar CSV Parser

[![Open Source](https://img.shields.io/badge/open%20source-yes-brightgreen?style=for-the-badge&logo=github)](https://github.com/Atnaszurc/vault-radar-csv-parser)
[![SBOM](https://img.shields.io/badge/SBOM-CycloneDX-blue?style=for-the-badge&logo=dependabot)](./sbom/sbom.json)
[![Docker Hub](https://img.shields.io/badge/DockerHub-vault--radar--csv-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/r/fwarfvinge/vault-radar-csv)

Vault-Radar CSV Parser는 Vault Radar export CSV를 오프라인에서 분석하기 위한 오픈 소스 도구입니다. SaaS를 바로 쓸 수 없는 상황에서도 CSV에 담긴 secret/PII 탐지 결과를 필터링하고 확인하며, 필요한 데이터를 PDF로 내보낼 수 있습니다.

주요 기능:

* 복수 조건으로 secret 결과 필터링
* 필터 상태를 유지한 채 PDF 내보내기
* 완전 오프라인 동작, 런타임 외부 의존성 없음
* React + Vite + TailwindCSS 기반의 현대적 UI
* 오픈 소스이므로 자유롭게 수정/확장 가능


## Disclaimer

이 프로젝트는 개인·커뮤니티 주도의 도구이며 HashiCorp의 공식 제품이 아닙니다.
HashiCorp와의 제휴, 승인, 지원이 없습니다.
소프트웨어는 “있는 그대로(as is)” 제공되며, 명시적·묵시적 보증이 없습니다. 사용에 따른 책임은 사용자에게 있습니다.

---

![Screenshot of finding](./screenshot.png?raw=true "Dark mode findings")

## 시작하기

### 필요 조건

로컬 개발(npm):

* Node.js ≥ 22
* npm ≥ 11.6

Docker 실행:

* Docker ≥ 20

SBOM: 전체 Software Bill of Materials는 `/sbom` 폴더에 있습니다. SBOM 생성 스크립트는 [generate_sbom.py](./generate_sbom.py)에 있습니다.

---

### 로컬 실행(개발용)

```bash
# Clone the repo
git clone https://github.com/Atnaszurc/vault-radar-csv-parser.git
cd vault-radar-csv

# Install dependencies
npm ci

# Start development server
npm run dev
```

기본적으로 [http://localhost:8080](http://localhost:8080)에서 확인할 수 있습니다.

---

### Docker로 실행

#### 미리 빌드된 이미지 사용

```bash
docker run -p 8080:8080 fwarfvinge/vault-radar-csv:latest
```

#### 로컬에서 이미지 빌드

```bash
# Build the Docker image
docker build -t vault-radar-csv .

# Run the container, exposing port 8080
docker run -p 8080:8080 vault-radar-csv
```

[http://localhost:8080](http://localhost:8080)로 접속해 앱을 사용할 수 있습니다.


---

### Nomad로 실행

File: [example-nomad-jobspec.hcl](./example-nomad-jobspec.hcl)

Run it with:

```sh
nomad job run example-nomad-jobspec.hcl
```

Then access it with your browser on <NOMAD_NODE_IP>:8080

---

### Kubernetes로 실행

File: [example-kubernetes-spec.yaml](./example-kubernetes-spec.yaml)

Deploy with:

```sh
kubectl apply -f example-kubernetes-spec.yaml
```

Access it from inside the cluster via:

```sh
kubectl port-forward pod/vault-radar-csv-parser 8080:8080
```

## Vault Radar CSV 만드는 방법

Vault Radar CLI로 스캔 결과를 CSV로 추출한 뒤 이 앱에 업로드하면 됩니다. [공식 가이드: [Vault Radar CLI](https://developer.hashicorp.com/hcp/docs/vault-radar/cli), [CSV 출력 정의](https://developer.hashicorp.com/hcp/docs/vault-radar/cli/configuration/csv-output-definition)
]
1) Vault Radar CLI 설치  
   운영체제별 설치 방법은 공식 문서의 설치 섹션을 따릅니다.

2) 인증 설정  
   공식 문서에 나온 방식대로 인증 정보를 설정합니다. (예: 서비스 프린시플 자격 증명 환경 변수, 토큰 등)

3) 리포지토리 스캔 후 CSV로 내보내기 (공식 예시 형식)
```bash
vault-radar scan repo \
  --dir ./target-repo \
  --output-format csv \
  --output-path ./radar-findings.csv
```
* `--dir` : 스캔할 코드/파일이 있는 경로
* `--output-format csv` / `--output-path` : CSV 파일 저장 형식과 위치
* 다른 플래그(예: 프로젝트/조직 지정, ignore 설정 등)는 문서의 “CSV Output Definition” 및 스캔 섹션을 참고

4) 생성된 `radar-findings.csv`를 이 앱에서 업로드합니다.

## Support

Vault-Radar CSV Parser는 커뮤니티 기반으로 지원됩니다. 이슈/기능 요청/기여는 아래를 통해 남겨주세요.

* Open an issue on the [GitHub repository](https://github.com/Atnaszurc/vault-radar-csv-parser/issues)
* Submit pull requests for improvements

---

## License

이 프로젝트는 MIT License 하에 공개되어 있습니다.
자유롭게 사용, 수정, 배포할 수 있습니다.

---

Created with [Lovable](https://lovable.dev)
