export interface FieldDefinition {
  displayName: string;
  description: string;
}

export const FIELD_DEFINITIONS: Record<string, FieldDefinition> = {
  category: {
    displayName: 'Category',
    description: 'The type of risk found by Vault Radar. E.g. secret, PII, or NIL.',
  },
  description: {
    displayName: 'Description',
    description: 'A short human readable description or explanation of the risk.',
  },
  created_at: {
    displayName: 'Created',
    description: 'The time the risk was created or introduced.',
  },
  author: {
    displayName: 'Author',
    description: 'The user associated with creating or introducing the risk.',
  },
  severity: {
    displayName: 'Severity',
    description: 'Classification of the risk. Critical risks are things Vault Radar believes are the most deserving of immediate attention, followed by High, Medium, and Info.',
  },
  is_historic: {
    displayName: 'Is Historic',
    description: 'The risk was first created in a version that precedes the most recent version and is not present in the most recent version of the content.',
  },
  deep_link: {
    displayName: 'Deep Link',
    description: 'A link to the content where the risk was found.',
  },
  path: {
    displayName: 'Path',
    description: 'The file path where the risk was found.',
  },
  value_hash: {
    displayName: 'Value Hash',
    description: 'A hash of the secret value itself. This is NOT the value of the secret. Identical hashes mean the secret values are identical.',
  },
  fingerprint: {
    displayName: 'Fingerprint',
    description: 'A value used to distinguish different risk events and incorporates time and location into the value\'s generation.',
  },
  textual_context: {
    displayName: 'Textual Context',
    description: 'Sometimes populated when Vault Radar identifies a secret value within some text. Helpful when trying to find a secret in a page.',
  },
  activeness: {
    displayName: 'Activeness',
    description: 'Indicates if a secret is active or inactive. Empty means the status is unknown.',
  },
  tags: {
    displayName: 'Tags',
    description: 'Human readable context tags that may provide additional information about a risk.',
  },
  managed_location: {
    displayName: 'Managed Location',
    description: 'Populated when scanning with an index file. Shows the location of the secret in the managed store.',
  },
  managed_location_is_latest: {
    displayName: 'Managed Location Is Latest',
    description: 'Indicates if the found secret is the current version in the secret manager.',
  },
  total_managed_locations: {
    displayName: 'Total Managed Locations',
    description: 'The number of times a particular risk was found in the secrets manager.',
  },
  git_reference: {
    displayName: 'Git Reference',
    description: 'The git reference value where the risk was introduced.',
  },
  version: {
    displayName: 'Version',
    description: 'The version of the parameter where the risk was introduced.',
  },
  aws_account_id: {
    displayName: 'AWS Account ID',
    description: 'The account ID associated with the version of the parameter where the risk was introduced.',
  },
  awsaccountid: {
    displayName: 'AWS Account ID',
    description: 'The account ID associated with the version of the parameter where the risk was introduced.',
  },
  org_name: {
    displayName: 'Organization',
    description: 'The organization name where the risk was found.',
  },
  repo_name: {
    displayName: 'Repository',
    description: 'The repository name where the risk was found.',
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
