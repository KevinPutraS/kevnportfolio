import { siteConfig, socialLinks, technologies } from '@/config/site'

/**
 * schema.org JSON-LD, built here rather than hand-written in the layout.
 *
 * The reason it is a function and not a literal is that every claim in it has
 * to come from `siteConfig`. A `Person` block written as a literal object
 * silently goes stale: the name changes in one file, the search result keeps
 * the old one, and nothing fails loudly because the markup is still valid
 * JSON. Deriving it means there is exactly one place a fact can live.
 */

/**
 * `knowsAbout` is the flattened technology list.
 *
 * The toolkit is four groups in `siteConfig.technologies` and one flat array
 * here, because that is the shape the vocabulary expects — a consumer reading
 * this wants "React, PostgreSQL, Rust", not the editorial grouping. The
 * "(learning)" suffixes are stripped, because "Rust (learning)" is not a thing
 * to be known *about*; the qualifier is an honest note for a human reader and
 * noise to a machine.
 */
function knownAbout(): string[] {
  return technologies
    .flatMap((group) => group.items)
    .map((item) => item.replace(/\s*\(learning\)\s*$/i, '').trim())
    .filter(Boolean)
}

/**
 * The person this site belongs to.
 *
 * Two decisions worth stating:
 *
 * - **`sameAs` is built from `socialLinks`,** the same array the footer and the
 *   contact page render. `sameAs` is the one property Google uses to reconcile
 *   a person across sites, and it is only worth declaring if those identities
 *   are real and stable. A placeholder profile URL in `sameAs` is worse than no
 *   `sameAs` at all: it points an identity claim at someone else's page.
 *
 * - **No `image`, no `jobTitle`, no `worksFor`.** The hero deliberately does not
 *   name a single role — "I do not label myself with a single role" is written
 *   on the About page — and `jobTitle` is the field a consumer reads as *the*
 *   answer. Asserting one here would contradict the site's own copy. `image`
 *   is left out for a different reason: the only portrait on the site is the
 *   favicon, and claiming a 32px icon is a profile photo is worse than having
 *   none.
 */
export function buildPersonSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteConfig.url}/#person`,
    name: siteConfig.personName,
    url: siteConfig.url,
    description: siteConfig.description,
    email: `mailto:${siteConfig.email}`,
    sameAs: socialLinks.map((link) => link.href),
    knowsAbout: knownAbout(),
  }
}
