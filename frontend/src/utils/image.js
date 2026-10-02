export const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

export function isAcceptedImage(file) {
  return Boolean(file) && ACCEPTED_TYPES.includes(file.type)
}

export async function toResizedJpegBase64(file, size = 224, quality = 0.9) {
  const bitmap = await createImageBitmap(file)
  // Center-crop to the largest square, then scale that square to size x size.
  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  // JPEG has no alpha; without a fill, transparent PNG pixels become black.
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, size, size)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size)
  bitmap.close()

  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not encode image.'))),
      'image/jpeg',
      quality,
    ),
  )

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

  return dataUrl.slice(dataUrl.indexOf(',') + 1)
}
