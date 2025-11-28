export interface FieldDefinition {
  displayName: string;
  description: string;
}

export const FIELD_DEFINITIONS: Record<string, FieldDefinition> = {
  category: {
    displayName: 'Category (카테고리)',
    description: 'Vault Radar가 발견한 위험 유형입니다. 예: secret, PII, NIL.',
  },
  description: {
    displayName: 'Description (설명)',
    description: '리스크에 대한 짧은 설명입니다. Vault Radar export의 원문을 그대로 표시합니다.',
  },
  created_at: {
    displayName: 'Created (발견/생성 시각)',
    description: '리스크가 생성되거나 도입된 시각입니다. CSV 원문은 UTC ISO 타임스탬프를 사용합니다.',
  },
  author: {
    displayName: 'Author (작성자)',
    description: '리스크 생성 또는 도입과 연결된 사용자입니다.',
  },
  severity: {
    displayName: 'Severity (심각도)',
    description: 'Vault Radar가 분류한 심각도입니다. 우선순위: Critical → High → Medium → Info.',
  },
  is_historic: {
    displayName: 'Is Historic (히스토릭 여부)',
    description: '가장 최근 버전에는 존재하지 않고 과거 버전에서만 발견된 리스크입니다.',
  },
  deep_link: {
    displayName: 'Deep Link (딥 링크)',
    description: '리스크가 발견된 콘텐츠로 바로 이동할 수 있는 링크입니다.',
  },
  path: {
    displayName: 'Path (파일 경로)',
    description: '리스크가 발견된 파일 경로입니다.',
  },
  value_hash: {
    displayName: 'Value Hash (값 해시)',
    description: 'secret 값 자체가 아닌 해시 값입니다. 동일한 해시는 동일한 secret 값을 의미합니다.',
  },
  fingerprint: {
    displayName: 'Fingerprint (핑거프린트)',
    description: '시간과 위치 정보를 포함해 서로 다른 리스크 이벤트를 구분하는 식별 값입니다.',
  },
  textual_context: {
    displayName: 'Textual Context (텍스트 컨텍스트)',
    description: 'Vault Radar가 텍스트 안에서 secret을 찾았을 때 주변 문맥을 제공합니다.',
  },
  activeness: {
    displayName: 'Activeness (활성 상태)',
    description: 'secret이 active/inactive인지 나타냅니다. 값이 없으면 알 수 없음입니다.',
  },
  tags: {
    displayName: 'Tags (태그)',
    description: '리스크에 대한 추가 정보를 제공하는 컨텍스트 태그입니다.',
  },
  managed_location: {
    displayName: 'Managed Location (관리 위치)',
    description: 'index 파일과 함께 스캔할 때 채워지며, secret manager에서의 위치를 나타냅니다.',
  },
  managed_location_is_latest: {
    displayName: 'Managed Location Is Latest (최신 버전 여부)',
    description: '발견된 secret이 secret manager의 최신 버전인지 여부입니다.',
  },
  total_managed_locations: {
    displayName: 'Total Managed Locations (총 관리 위치 수)',
    description: '동일한 리스크가 secret manager에서 발견된 횟수입니다.',
  },
  git_reference: {
    displayName: 'Git Reference (Git 레퍼런스)',
    description: '리스크가 도입된 Git 참조(커밋/브랜치)입니다.',
  },
  version: {
    displayName: 'Version (버전)',
    description: '리스크가 도입된 파라미터 버전입니다.',
  },
  aws_account_id: {
    displayName: 'AWS Account ID',
    description: '리스크가 도입된 파라미터 버전과 연결된 AWS Account ID입니다.',
  },
  awsaccountid: {
    displayName: 'AWS Account ID',
    description: '리스크가 도입된 파라미터 버전과 연결된 AWS Account ID입니다.',
  },
  org_name: {
    displayName: 'Organization (조직)',
    description: '리스크가 발견된 조직 이름입니다.',
  },
  repo_name: {
    displayName: 'Repository (레포지토리)',
    description: '리스크가 발견된 레포지토리 이름입니다.',
  },
};

/**
 * Get formatted display name for a field
 */
export function getFieldDisplayName(fieldName: string): string {
  const normalized = fieldName.toLowerCase().replace(/\s+/g, '_');
  
  if (FIELD_DEFINITIONS[normalized]) {
    return FIELD_DEFINITIONS[normalized].displayName;
  }
  
  // Fallback: capitalize each word and replace underscores with spaces
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get description for a field
 */
export function getFieldDescription(fieldName: string): string | null {
  const normalized = fieldName.toLowerCase().replace(/\s+/g, '_');
  return FIELD_DEFINITIONS[normalized]?.description || null;
}
