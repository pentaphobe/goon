'use strict'

const path = require('path')
const fs = require('fs')

const globby = require('globby')


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



const eslintProcess = (() => {
  const eslint = require('eslint')
  const CLIEngine = eslint.CLIEngine

  return (fileList, globalConfig) => {
    const config = globalConfig.eslint
    const ERROR_WEIGHT = config.weights.error
    const WARNING_WEIGHT = config.weights.warning

    let cwd = process.cwd()
    // console.log({config, cwd, __dirname})
    const convertDebt = obj => ({
      debt: obj.errorCount * ERROR_WEIGHT + obj.warningCount * WARNING_WEIGHT
    })

    let cli = new CLIEngine(
      Object.assign({
        useEslintrc: true
      }, config)
    )

    // let eslintResults = cli.executeOnFiles(['./*.js'])
    let eslintResults = cli.executeOnFiles(fileList)

    let results = Object.assign({}, {
      fileDetails: eslintResults.results.map( result => Object.assign({}, result, convertDebt(result)) ),
      totals: {
        errorCount: eslintResults.errorCount,
        warningCount: eslintResults.warningCount,
        debt: convertDebt(eslintResults).debt
      }
    })

    return results
  }
})()


const acornProcess = (() => {
  const acorn = require('acorn-jsx')

  return (fileList, globalConfig) => {
    const config = globalConfig.acorn
    const globOptions = globalConfig.glob

    const processFile = filename => {
      const source = fs.readFileSync(filename, 'utf8')
      const ast = acorn.parse(source, {

      })

      // ACORN RULES HERE

      return ast
    }

    const allResults = fileList.map( filename => {
      let result = processFile(filename)
    })
    console.log(`matched ${fileList.length} files`)
    let results = {
      // fileDetails: allResults.map( result => Object.assign({}, result, convertDebt(result)) ),
      totals: {
        debt: 0
      }
    }

    return results
  }
})()

;(function main() {
  check_valid_node_version()

  const defaultConfig = {
    globOptions: {
      gitignore: true,
    }
  }

  const userConfig = requireOptional('./analysis.config.js', {message:'no user config'})
  const config = Object.assign({}, defaultConfig, userConfig)

  const fileList = globby.sync(config.targets, config.globOptions)

  let acorn = acornProcess(fileList, config)

  console.log(acorn)

  let esl = eslintProcess(fileList, config)

  let total = esl.totals.debt + acorn.totals.debt
  console.log(`
Acorn debt: ${acorn.totals.debt} ()
Eslint debt: ${esl.totals.debt} (${esl.totals.errorCount} errors & ${esl.totals.warningCount} warnings)
---
TOTAL DEBT: ${total}
---
  `)

}())
