/**
 *
 * Default configuration file
 *
 * Keilin Olsen
 */

'use strict'

const targets = []

const severity = {
  style: 1,
  practices: 5,
  med: 10,
  high: 20,
  critical: 100
}

module.exports = {
  report: 'analysis_report.jsonl',

  globOptions: {
    gitignore: true
  },

  targets,

  eslint: {
    /**
     *
     * Rule overides sent directly to eslint
     *
     */
    rules: {
      /**
       * Stylistic preferences a la ADS
       */
      quotes: [
        'error',
        'single',
        {
          allowTemplateLiterals: true
        }
      ],
      'jsx-quotes': ['error', 'prefer-single'],

      /**
       * Hardcore issues
       */
      // cyclomatic complexity
      complexity: ['error', { max: 5 }],
      'max-nested-callbacks': ['error', { max: 5 }],
      'max-params': ['error', { max: 10 }],
      'max-statements': ['error', { max: 15 }],
      'max-depth': ['error', { max: 4 }],
      // maximum line length
      'max-len': [
        'error',
        {
          code: 80
        }
      ],
      eqeqeq: ['error'],
      'no-extra-bind': ['error'],
      'no-global-assign': ['error'],
      'no-undef': ['error'],
      'no-unused-vars': ['error'],

      'no-const-assign': ['error'],

      'react/forbid-dom-props': [
        'error',
        {
          forbid: [
            // not included as it would penalise styled-components
            // 'className',
            'style'
          ]
        }
      ],
      'react/require-default-props': [
        'error',
        { forbidDefaultForRequired: true }
      ],
      'react/jsx-max-depth': ['error', { max: 2 }]
    },

    /**
     *
     * Weights used to calculate a debt metric
     *
     * Necessary since eslint doesn't support custom severity levels
     * structured this way to minimise typing, however it's annoying not having
     * it alongside the eslint overrides
     */
    weights: {
      // default weights used for warnings and errors
      warning: severity.practices,
      error: severity.high,

      // rule-specific weights
      rules: [
        //
        // low severity
        //
        {
          weight: severity.style,
          rules: [
            'quotes',
            'jsx-quotes',
            'max-len',
            'comma-dangle',
            'no-multiple-empty-lines'
          ]
        },

        //
        // medium severity
        //
        {
          weight: severity.practices,
          rules: [
            'max-nested-callbacks',
            'max-params',
            'max-depth',
            'no-extra-bind'
          ]
        },
        {
          weight: severity.med,
          rules: ['complexity', 'max-statements', 'no-unused-vars', 'no-undef']
        },

        //
        // high severity
        //
        {
          weight: severity.high,
          rules: ['no-global-assign', 'no-const-assign']
        },
        {
          weight: severity.critical,
          rules: ['eqeqeq', 'import/no-unresolved']
        }
      ]
    }
  }
}
