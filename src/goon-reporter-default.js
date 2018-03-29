const path = require('path')
const chalk = require('chalk')
const {table} = require('table')

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
${chalk.yellow('### Full Report')}
${table(report, {
  columns: {
    2: {
      alignment: 'right'
    }
  }
})}
`
}

const printDelta = delta =>
  delta > 0
    ? chalk.bold.red(`+${delta}`)
    : delta === 0
      ? chalk.bold.yellow(delta)
      : chalk.bold.green(delta)

const customReporter = (results, debtDelta, config) => {
  let total = results.totals.debt

  console.log(`
${chalk.yellow('Unweighted rules (use --show-unweighted to see more detail):')}
  ${Object.keys(results.unweightedRules).join('\n  ')}

${config.options.verbose ? verboseReport(config, results) : ''}
---
TOTAL DEBT:  ${chalk.bold(total)} (${results.totals.errorCount} errors & ${results.totals.warningCount} warnings)
SINCE LAST: ${printDelta(debtDelta)}
---
  `)
}

module.exports = {
  reporter: customReporter
}
