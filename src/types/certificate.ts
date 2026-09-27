export interface Certificate {
  id: string
  title: string
  issuer: string
  /** Month precision: stored as `YYYY-MM-01`. Required by the database. */
  issue_date: string
  expiration_date: string | null
  credential_id: string | null
  credential_url: string | null
  certificate_image_url: string | null
  description: string | null
  skills: string[] | null
  sort_order: number
  published: boolean
  created_at: string
  updated_at: string
}

/** The exact set of fields the certificate editor manages. */
export interface CertificateFormData {
  title: string
  issuer: string
  issue_date: string
  expiration_date: string
  credential_id: string
  credential_url: string
  certificate_image_url: string
  description: string
  /** Comma separated, matching the project editor. */
  skills: string
  sort_order: string
  published: boolean
}

export type CertificateFieldErrors = Partial<Record<keyof CertificateFormData, string>>
