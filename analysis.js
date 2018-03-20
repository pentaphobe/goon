'use strict'

const path = require('path')
const fs = require('fs')

const check_valid_node_version = () => {
  // const [major, minor, patch] = process.versions.node.split('.').map( n => parseInt(n, 10) )
  const parts = process.versions.node.split('.').map( n => parseInt(n, 10) )
  const major = parts[0]

  if (major < 6) {
    throw new Error('this script requires node version 6 or above')
  }
}

const requireOptional = (fname, _default) => (
  (fname) => {
    console.log(fname)
    return fs.existsSync(fname) ? require(fname) : _default
  }
)(path.join(process.cwd(), fname))

const eslintProcess = (globalConfig) => {
  const config = globalConfig.eslint
  const ERROR_WEIGHT = config.weights.error
  const WARNING_WEIGHT = config.weights.warning

  let cwd = process.cwd()
  // console.log({config, cwd, __dirname})
  const convertDebt = obj => ({
    debt: obj.errorCount * ERROR_WEIGHT + obj.warningCount * WARNING_WEIGHT
  })

  let CLIEngine = require('eslint').CLIEngine
  let cli = new CLIEngine(
    Object.assign({
      useEslintrc: true
    }, config)
  )

  // let eslintResults = cli.executeOnFiles(['./*.js'])
  let eslintResults = cli.executeOnFiles(globalConfig.targets)

  let results = Object.assign({}, convertDebt(eslintResults), {
    fileDetails: eslintResults.results.map( result => Object.assign({}, result, convertDebt(result)) ),
    errorCount: eslintResults.errorCount,
    warningCount: eslintResults.warningCount
  })

  return results
}

(function main() {
  check_valid_node_version()

  const defaultConfig = {
  }

  const userConfig = requireOptional('./analysis.config.js', {message:'no user config'})
  const config = Object.assign({}, defaultConfig, userConfig)

  let esl = eslintProcess(config)

  let total = esl.debt
  console.log(`
Eslint debt: ${esl.debt} (${esl.errorCount} errors & ${esl.warningCount} warnings)
---
TOTAL DEBT: ${total}
---
  `)

}())
