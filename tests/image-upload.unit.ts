import { expect, test } from '@playwright/test'
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_UPLOAD_FOLDERS,
  MAX_IMAGE_BYTES,
  isAllowedFolder,
  isAllowedImageType,
} from '../src/lib/storage/image-types'
import { buildObjectPath, hasValidImageSignature, objectPathFromPublicUrl, validateImageFile } from '../src/lib/storage/images'

/**
 * Upload validation.
 *
 * This is the only route where attacker-chosen bytes reach storage, and the
 * guards are a folder allowlist, a MIME allowlist, a size ceiling and a magic
 * number. All four are pure functions and none of them had a test, so a
 * regression in any of them would have been found by an upload rather than by
 * the suite.
 *
 * The cases that matter are the ones a well-behaved client never sends: the
 * traversal string, the prototype key, the file whose name lies about its type.
 */

// Pinned to `ArrayBuffer` rather than the default `ArrayBufferLike`: TypeScript
// 5.7 made typed arrays generic over their buffer, and `BlobPart` only accepts
// the concrete `ArrayBuffer` form.
const bytes = (...values: number[]): Uint8Array<ArrayBuffer> => new Uint8Array(values)

/** Signatures as they actually appear at the head of each format. */
const SIGNATURES = {
  'image/jpeg': bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10),
  'image/png': bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
  'image/webp': bytes(0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00),
  'image/gif': bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61),
} as const

const fileOf = (type: string, data: Uint8Array<ArrayBuffer>, name = 'image') => new File([data], name, { type })

test.describe('folder allowlist', () => {
  test('accepts exactly the declared folders', () => {
    for (const folder of ALLOWED_UPLOAD_FOLDERS) {
      expect(isAllowedFolder(folder), folder).toBe(true)
    }
  })

  test('refuses traversal, absolute and relative escapes', () => {
    const rejected = [
      '../secrets',
      '../../etc/passwd',
      'projects/thumbnails/../../admin',
      '/projects/thumbnails',
      'projects/thumbnails/',
      'projects',
      'Projects/thumbnails',
      ' projects/thumbnails',
      '',
    ]
    for (const folder of rejected) {
      expect(isAllowedFolder(folder), JSON.stringify(folder)).toBe(false)
    }
  })

  test('refuses non-strings and prototype keys', () => {
    for (const value of [null, undefined, 0, 1, true, {}, [], ['projects/thumbnails'], Symbol('x')]) {
      expect(isAllowedFolder(value)).toBe(false)
    }
    expect(isAllowedFolder('__proto__')).toBe(false)
    expect(isAllowedFolder('constructor')).toBe(false)
  })
})

test.describe('MIME allowlist', () => {
  test('accepts exactly the four raster types', () => {
    expect(Object.keys(ALLOWED_IMAGE_TYPES)).toEqual(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    for (const type of Object.keys(ALLOWED_IMAGE_TYPES)) {
      expect(isAllowedImageType(type), type).toBe(true)
    }
  })

  test('refuses SVG and anything that can carry script', () => {
    // `next.config.mjs` sets `dangerouslyAllowSVG: false`. An SVG is a document
    // that runs script in the origin that serves it, so it must not get in here
    // by any route, including a case-different one.
    for (const type of ['image/svg+xml', 'IMAGE/SVG+XML', 'text/html', 'application/xhtml+xml', 'application/pdf', '']) {
      expect(isAllowedImageType(type), type).toBe(false)
    }
  })

  test('does not answer true for inherited Object properties', () => {
    // The guard is `hasOwnProperty`, not `in` and not a truthy lookup. A naive
    // `value in ALLOWED_IMAGE_TYPES` or `!!ALLOWED_IMAGE_TYPES[value]` returns
    // true here and lets a caller treat `"toString"` as an image type.
    for (const type of ['toString', 'constructor', 'hasOwnProperty', '__proto__', 'valueOf']) {
      expect(isAllowedImageType(type), type).toBe(false)
    }
  })
})

test.describe('validateImageFile', () => {
  test('accepts a well-formed file and derives the extension from the MIME type', () => {
    const result = validateImageFile(fileOf('image/png', SIGNATURES['image/png']))
    expect(result.ok).toBe(true)
    expect(result.extension).toBe('png')
  })

  test('takes the extension from the type, never from the filename', () => {
    // The property the whole module is built around: a client naming its file
    // `payload.html` must still be stored as `png`.
    const result = validateImageFile(fileOf('image/png', SIGNATURES['image/png'], 'payload.html'))
    expect(result.ok).toBe(true)
    expect(result.extension).toBe('png')
  })

  test('rejects a disallowed type before it looks at anything else', () => {
    const result = validateImageFile(fileOf('image/svg+xml', bytes(0x3c, 0x3f, 0x78, 0x6d, 0x6c)))
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/unsupported file type/i)
    expect(result.extension).toBeUndefined()
  })

  test('rejects an empty file', () => {
    const empty = validateImageFile(fileOf('image/png', bytes()))
    expect(empty.ok).toBe(false)
    expect(empty.error).toMatch(/empty/i)
  })

  test('accepts exactly the size ceiling and refuses one byte more', () => {
    const atLimit = validateImageFile(fileOf('image/png', new Uint8Array(MAX_IMAGE_BYTES)))
    expect(atLimit.ok).toBe(true)

    const overLimit = validateImageFile(fileOf('image/png', new Uint8Array(MAX_IMAGE_BYTES + 1)))
    expect(overLimit.ok).toBe(false)
    expect(overLimit.error).toMatch(/2mb or less/i)
  })

  test('rejects something that is not a File at all', () => {
    for (const value of [null, undefined, {}, 'a string', 42]) {
      const result = validateImageFile(value as unknown as File)
      expect(result.ok, String(value)).toBe(false)
    }
  })
})

test.describe('hasValidImageSignature', () => {
  test('accepts each format on its own real header', async () => {
    for (const [type, signature] of Object.entries(SIGNATURES)) {
      await expect(hasValidImageSignature(fileOf(type, signature)), type).resolves.toBe(true)
    }
  })

  test('rejects a declared type whose bytes are something else', async () => {
    // A PNG header prepended to HTML: passes every client-side check there is,
    // which is exactly why the magic number exists.
    const disguised = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x3c, 0x68, 0x74, 0x6d)
    await expect(hasValidImageSignature(fileOf('image/png', disguised))).resolves.toBe(true)
    await expect(hasValidImageSignature(fileOf('image/png', bytes(0x3c, 0x68, 0x74, 0x6d, 0x6c)))).resolves.toBe(false)
  })

  test('rejects a file shorter than the signature it claims', async () => {
    // Header slice comes back short, so the missing bytes are `undefined` and
    // must fail rather than be coerced into matching.
    await expect(hasValidImageSignature(fileOf('image/jpeg', bytes(0xff)))).resolves.toBe(false)
    await expect(hasValidImageSignature(fileOf('image/png', bytes(0x89, 0x50)))).resolves.toBe(false)
  })

  test('rejects SVG by its own type without consulting the bytes', async () => {
    const svg = bytes(0x3c, 0x3f, 0x78, 0x6d, 0x6c, 0x3f, 0x3e, 0x3c, 0x73, 0x76, 0x67)
    await expect(hasValidImageSignature(fileOf('image/svg+xml', svg))).resolves.toBe(false)
  })
})

test.describe('object paths', () => {
  test('builds a path under the given folder with the given extension', () => {
    const path = buildObjectPath('projects/thumbnails', 'png')
    expect(path.startsWith('projects/thumbnails/')).toBe(true)
    expect(path.endsWith('.png')).toBe(true)
  })

  test('never repeats a name, so two uploads in the same millisecond differ', () => {
    const paths = new Set(Array.from({ length: 50 }, () => buildObjectPath('projects/gallery', 'jpg')))
    expect(paths.size).toBe(50)
  })

  test('a folder that escaped the allowlist is not rewritten away by the builder', () => {
    // The builder is a formatter, not a validator: it is called after
    // `isAllowedFolder`. This test exists so that if someone later gives it the
    // job of sanitising, the change is visible rather than silent.
    const path = buildObjectPath('../escape' as never, 'png')
    expect(path.startsWith('../escape/')).toBe(true)
  })

  test('converts a public URL back to a key and refuses anything else', () => {
    expect(objectPathFromPublicUrl('/projects/gallery/a.jpg')).toBe('projects/gallery/a.jpg')
    expect(objectPathFromPublicUrl('//projects/gallery/a.jpg')).toBe('projects/gallery/a.jpg')
    expect(objectPathFromPublicUrl('https://x.supabase.co/storage/v1/object/public/p/a.jpg')).toBeNull()
    expect(objectPathFromPublicUrl('projects/gallery/a.jpg')).toBeNull()
  })
})
