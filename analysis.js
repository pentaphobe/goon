'use strict'

const path = require('path')
const fs = require('fs')

const commander = require('commander')
const chalk = require('chalk')

const program = commander
  .option('-v,--verbose', 'verbose logging')
  .option('-f,--full', 'show full statistics per file')
  .parse(process.argv)

// console.log(program)

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
    // console.log(fname)
    return fs.existsSync(fname) ? require(fname) : _default
  }
)(path.join(process.cwd(), fname))

const eslintProcess = config => {
  const ERROR_WEIGHT = 100
  const WARNING_WEIGHT = 10

  let cwd = process.cwd()
  // console.log({config, cwd, __dirname})
  const convertDebt = obj => ({
    debt: obj.errorCount * ERROR_WEIGHT + obj.warningCount * WARNING_WEIGHT
  })

  let CLIEngine = require('eslint').CLIEngine
  let cli = new CLIEngine({
    // useEslintrc: true
  })

  // let eslintResults = cli.executeOnFiles(['./*.js'])
  let eslintResults = cli.executeOnFiles(config.targets)
  // console.log(eslintResults)

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
  // console.log(esl)

  if (program.full) {
    console.log('+-- full log\n|')
    let lastPath = ''
    const report = esl.fileDetails.map( result => {
      // console.log(result)
      let {filePath, errorCount, warningCount, debt} = result
      let fileDir = path.dirname(filePath)
      let reportLine = ''

      if (fileDir !== lastPath) {
        reportLine += `+ ${chalk.white.bold(fileDir)}:\n`
        lastPath = fileDir
      }
      reportLine += `|-   ${path.basename(filePath)} ${chalk.yellow.bold(debt)} (${chalk.red(errorCount)} ${chalk.yellow(warningCount)})\n`

      return reportLine
    })

    console.log(report.join(''))
  }

  let total = esl.debt
  console.log(`
Eslint debt: ${esl.debt} (${esl.errorCount} errors & ${esl.warningCount} warnings)
---
TOTAL DEBT: ${total}
---
  `)

}())
