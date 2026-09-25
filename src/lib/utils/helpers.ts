import { format } from 'date-fns'

export function formatProjectDate(dateString: string | null): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString + '-01')
    return format(date, 'MMMM yyyy')
  } catch {
    return dateString
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return format(date, 'MMMM d, yyyy')
  } catch {
    return dateString
  }
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}