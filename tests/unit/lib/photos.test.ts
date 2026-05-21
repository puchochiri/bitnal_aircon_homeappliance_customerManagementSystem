import { describe, it, expect } from 'vitest'
import { validatePhotoFile } from '@/lib/photos'

function makeFile(name: string, type: string, sizeMB: number) {
  const blob = new Blob([new Uint8Array(sizeMB * 1024 * 1024)], { type })
  return new File([blob], name, { type })
}

describe('validatePhotoFile', () => {
  it('accepts valid JPEG under 10MB', () => {
    // Arrange
    const file = makeFile('photo.jpg', 'image/jpeg', 2)

    // Act
    const result = validatePhotoFile(file)

    // Assert
    expect(result).toBeNull()
  })

  it('accepts valid PNG under 10MB', () => {
    const file = makeFile('photo.png', 'image/png', 5)
    expect(validatePhotoFile(file)).toBeNull()
  })

  it('rejects non-image file type', () => {
    // Arrange
    const file = makeFile('doc.pdf', 'application/pdf', 1)

    // Act
    const result = validatePhotoFile(file)

    // Assert
    expect(result).toContain('JPEG')
  })

  it('rejects file over 10MB', () => {
    // Arrange
    const file = makeFile('large.jpg', 'image/jpeg', 11)

    // Act
    const result = validatePhotoFile(file)

    // Assert
    expect(result).toContain('10MB')
  })

  it('accepts WebP format', () => {
    const file = makeFile('image.webp', 'image/webp', 3)
    expect(validatePhotoFile(file)).toBeNull()
  })
})
