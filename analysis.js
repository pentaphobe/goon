'use strict'

const path = require('path')
const fs = require('fs')

const commander = require('commander')
const chalk = require('chalk')
const {table} = require('table')

const program = commander
  .option('-v,--verbose', 'verbose error output')
  .option('-f,--full', 'show full statistics per file')
  .option('--show-unweighted-rules', 'lists all rules which lack a weighting')
  .option('--config', 'override config')
  .option('-n,--no-report', `don't write to the history report log`)
  .parse(process.argv)

// console.log(program)

const check_valid_node_version = () => {
  // const [major, minor, patch] = process.versions.node
  //   .split('.').map( n => parseInt(n, 10) )
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

  const unweightedRules = {}

  const addUnweighted = message => {
    let list = unweightedRules[message.ruleId] ||
              (unweightedRules[message.ruleId] = [])
    list.push(message)
  }

  const getRuleScore = (message) => {
    let ruleId = message.ruleId
    let fallbackScore = (message.severity === 2 ? ERROR_WEIGHT : WARNING_WEIGHT)
    let score = fallbackScore

    if (ruleId in weightLookup) {
      score = weightLookup[ruleId]
    } else {
      addUnweighted(message)
    }

    return score
  }

  const convertDebt = obj => {
    // console.log(obj)
    let debtCount = 0

    let mappedMessages = obj.messages.map( message => {
        let score = getRuleScore(message)

        debtCount += score

        return Object.assign({}, message, {
          debt: score
        })
    })

    return {
      messages: mappedMessages,
      debt: debtCount
    }
  }

  let summary = results.results.reduce( (accum, result) => {
    let detail = Object.assign({}, result, convertDebt(result))
    delete detail.source

    accum.totals.debt += detail.debt
    accum.fileDetails.push(detail)

    return accum
  }, {
    fileDetails: [],
    totals: {
      errorCount: results.errorCount,
      warningCount: results.warningCount,
      debt: 0
    },
    unweightedRules
  })

  return summary
}

const eslintProcess = (() => {
  const eslint = require('eslint')
  const CLIEngine = eslint.CLIEngine

  return (fileList, globalConfig) => {
    const config = globalConfig.eslint

    // console.log(config.weights)
    // console.log('\n\n\n\n###########')

    // let cwd = process.cwd()
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

const verboseReport = (config, results) => {
  let report = results.fileDetails.reduce( (accum, fileDetail) => {
    return accum.concat(fileDetail.messages.map( message => {
      return [
        `${chalk.yellow(path.relative(__dirname, fileDetail.filePath))} ${message.line}:${message.column}`,
        `${message.message} (${message.ruleId})`,
        message.debt
      ]
    }))
  }, [
    [
      'file', 'message', 'debt'
    ].map( title => chalk.cyan.bold(title) )
  ])

  return `
### Full Report
${table(report, {
  columns: {
    2: {
      alignment: 'right'
    }
  }
})}
`
}

const loadHistory = (config) => {
  if (!fs.existsSync(config.report)) {
    console.log(`no history file found at: ${config.report}`)
    return []
  }
  const content = fs.readFileSync(config.report, 'utf8')
  const lines = (content || '').split(/[\r\n]+/)

  return lines.filter( line => line.trim().length > 0).map( line => JSON.parse(line) )
}

const addHistory = (config, entry) => {
  fs.appendFileSync(config.report, JSON.stringify(entry) + '\n')
}

const printDelta = delta =>
  delta > 0
  ? chalk.bold.red(`+${delta}`)
  : delta === 0
    ? chalk.bold.yellow(delta)
    : chalk.bold.green(delta)

;(function main() {
  check_valid_node_version()

  const defaultConfig = {
    report: 'analysis_report.jsonl',
    globOptions: {
      gitignore: true,
    }
  }

  const userConfig = requireOptional('./analysis.config.js', {
    message: 'no user config'
  })
  // console.log(userConfig.eslint.weights)
  const config = Object.assign({}, defaultConfig, userConfig)

  if (program.args && program.args.length > 0) {
    config.targets = program.args
  }

  const history = loadHistory(config)
  const lastHistoryEntry = history.slice(-1)[0]
  // console.log('last history', lastHistoryEntry)

  // const fileList = globby.sync(config.targets, config.globOptions)

  // let acorn = acornProcess(fileList, config)

  // console.log(acorn)

  let esl = eslintProcess(config.targets, config)


  // console.dir(esl, {color: true, depth:6})
  let total = esl.totals.debt
  let debtDelta = total -
    ((lastHistoryEntry && lastHistoryEntry.totals.debt) || 0)

  console.log(`
${chalk.yellow('Unweighted rules (use --show-unweighted to see more detail):')}
  ${Object.keys(esl.unweightedRules).join('\n  ')}

${program.verbose ? verboseReport(config, esl) : ''}
---
TOTAL DEBT:  ${chalk.bold(total)} (${esl.totals.errorCount} errors & ${esl.totals.warningCount} warnings)
SINCE LAST: ${printDelta(debtDelta)}
---
  `)

  if (!program['no-report'] && debtDelta !== 0) {
    console.log(`writing new history log to ${config.report}...`)
    esl.date = new Date().toISOString()
    addHistory(config, esl)
  }

}())
