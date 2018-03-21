'use strict'

const path = require('path')
const fs = require('fs')

const commander = require('commander')
const chalk = require('chalk')
const globby = require('globby')

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
    console.log(fname)
    return fs.existsSync(fname) ? require(fname) : _default
  }
)(path.join(process.cwd(), fname))

const customFormatter = (results, config) => {
  const ERROR_WEIGHT = config.weights.error
  const WARNING_WEIGHT = config.weights.warning

  results = results || []

  const weightLookup = config.weights.rules.reduce( (accum, entry) => {
    entry.rules.forEach( rule => {
      accum[rule] = entry.weight
    })

    return accum
  }, {})

  const convertDebt = obj => {
    // console.log(obj)
    let debtCount = 0

    let mappedMessages = obj.messages.map( message => {
        let ruleId = message.ruleId
        let fallbackScore = (message.severity === 2 ? ERROR_WEIGHT : WARNING_WEIGHT)
        let score = weightLookup[message.ruleId] || fallbackScore

        debtCount += score
        message.debt = score
    })

    return {
      debt: debtCount
    }
  }

  let summary = results.results.reduce( (accum, result) => {
    let detail = Object.assign({}, result, convertDebt(result))

    accum.debt += detail.debt
    accum.fileDetails.push(detail)

    return accum
  }, {
    fileDetails: [],
    totals: {
      errorCount: results.errorCount,
      warningCount: results.warningCount,
      debt: 0
    }
  })

  return summary
}

const eslintProcess = (() => {
  const eslint = require('eslint')
  const CLIEngine = eslint.CLIEngine

  return (fileList, globalConfig) => {
    const config = globalConfig.eslint

    console.log(config.weights)
    console.log('\n\n\n\n###########')

    let cwd = process.cwd()
    // console.log({config, cwd, __dirname})

    let cli = new CLIEngine(
      Object.assign({
        useEslintrc: true
      }, config)
    )

    // let eslintResults = cli.executeOnFiles(['./*.js'])
    let eslintResults = cli.executeOnFiles(fileList)

    // let results = Object.assign({}, {
    //   fileDetails: eslintResults.results.map( result => Object.assign({}, result, convertDebt(result)) ),
    //   totals: {
    //     errorCount: eslintResults.errorCount,
    //     warningCount: eslintResults.warningCount,
    //     debt: convertDebt(eslintResults).debt
    //   }
    // })

    return customFormatter(eslintResults, config)
  }
})()


// const acornProcess = (() => {
//   const acorn = require('acorn-jsx')
//
//   return (fileList, globalConfig) => {
//     const config = globalConfig.acorn
//     const globOptions = globalConfig.glob
//
//     const processFile = filename => {
//       const source = fs.readFileSync(filename, 'utf8')
//       const ast = acorn.parse(source, {
//
//       })
//
//       // ACORN RULES HERE
//
//       return ast
//     }
//
//     const allResults = fileList.map( filename => {
//       let result = processFile(filename)
//     })
//     console.log(`matched ${fileList.length} files`)
//     let results = {
//       // fileDetails: allResults.map( result => Object.assign({}, result, convertDebt(result)) ),
//       totals: {
//         debt: 0
//       }
//     }
//
//     return results
//   }
// })()

;(function main() {
  check_valid_node_version()

  const defaultConfig = {
    globOptions: {
      gitignore: true,
    }
  }

  const userConfig = requireOptional('./analysis.config.js', {message:'no user config'})
  console.log(userConfig.eslint.weights)
  const config = Object.assign({}, defaultConfig, userConfig)

  // const fileList = globby.sync(config.targets, config.globOptions)

  // let acorn = acornProcess(fileList, config)

  // console.log(acorn)

  let esl = eslintProcess(config.targets, config)

  console.dir(esl, {color: true})
  let total = esl.totals.debt
  console.log(`
Eslint debt: ${esl.totals.debt} (${esl.totals.errorCount} errors & ${esl.totals.warningCount} warnings)
---
TOTAL DEBT: ${total}
---
  `)

}())
