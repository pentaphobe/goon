/**
 *
 * Configuration file for the analysis script in libs/analysis.js
 *
 * Keilin Olsen
 */

'use strict'

const targets = [
  'sbos-ui/server',
  'sbos-ui/src',
  'sbos-ui/stories',
  'sbos-ui/tests',
  'libs',
]

module.exports = {
  targets,
  eslint: {
    rules: {
      quotes: 1
    },
    weights: {
      warning: 5,
      error: 20
    }
  }
}
