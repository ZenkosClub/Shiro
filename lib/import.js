/**
 * Import utility for dynamic module loading
 */

export default async function importFile(filePath) {
  try {
    const module = await import(filePath)
    return module.default || module
  } catch (error) {
    console.error(`Error importing ${filePath}:`, error)
    return null
  }
} 