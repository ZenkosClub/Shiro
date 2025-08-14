/**
 * Helper utilities for file paths and directories
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

export default {
  __dirname: function __dirname(url) {
    return dirname(fileURLToPath(url))
  },
  
  __filename: function __filename(url, rmPrefix = true) {
    return rmPrefix ? fileURLToPath(url) : url
  },
  
  join: join
} 