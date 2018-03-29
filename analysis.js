#!/usr/bin/env node --harmony

'use strict'

require('./src/enforce-node-version')

const path = require('path')
const fs = require('fs')

const commander = require('commander')
const chalk = require('chalk')
const _ = require('lodash')

const CONFIG_FILE = 'analysis.config.js'
const scriptDir = path.dirname(__filename)

const eslProcessor = require('./src/goon-processor-eslint')
const reporter = require('./src/goon-reporter-default')
const customFormatter = require('./src/goon-formatter-default').formatter
const {loadHistory, addHistory} = require('./src/history')
const {requireOptional, mergeObject} = require('./src/utils')

const program = commander
  .usage('[options] [<files or paths> ...]')
  .option('-v,--verbose', 'verbose error output')
  .option('-f,--full', 'show full statistics per file')
  .option('--show-unweighted-rules', 'lists all rules which lack a weighting')
  .option('--config', 'override config')
  .option('-n,--no-report', `don't write to the history report log`)
  .option('-w,--watch', 'stay active and recalculate debt on file changes')
  .parse(process.argv)



;(function main() {
  const defaultConfig = require(path.join(scriptDir, CONFIG_FILE))

  const userConfig = requireOptional(path.join('.', CONFIG_FILE), {
    message: 'no user config'
  })
  const config = mergeObject({}, defaultConfig, userConfig, {
    options: program
  })

  if (program.args && program.args.length > 0) {
    config.targets = program.args
  }

  if (!config.targets || config.targets.length === 0) {
    const defaultTarget = path.join(process.cwd(), '**/*')
    console.log(`no targets specified, defaulting to cwd ${defaultTarget}...`)
    config.targets = [defaultTarget]
  }

  let eslResults = eslProcessor.process(config.targets, config)

  const update = (eslResults) => {
    let esl = customFormatter(eslResults.eslintResults, eslResults.config)
    const history = loadHistory(config)
    const lastHistoryEntry = history.slice(-1)[0]
    let debtDelta = esl.totals.debt -
    ((lastHistoryEntry && lastHistoryEntry.totals.debt) || 0)

    reporter.reporter(esl, debtDelta, config)

    if (!program['no-report'] && debtDelta !== 0) {
      console.log(`writing new history log to ${config.report}...`)
      esl.date = new Date().toISOString()
      addHistory(config, esl)
    }
  }
  // console.log(eslResults.eslintResults)
  update(eslResults)

  if (program.watch) {
    const Gaze = require('gaze').Gaze
    const gaze = new Gaze(config.targets)

    console.log('watching for changes...', config.targets)

    gaze.on('all', function (event, filepath) {
      console.log(`got a change ${filepath}`)

      let newResults = eslProcessor.process([filepath], config).eslintResults.results[0]

      // console.log(filepath, newResults)

      // merge in our updated record
      eslResults.eslintResults.results = eslResults.eslintResults.results.map(
        record => record.filePath === newResults.filePath ? newResults : record
      )

      update(eslResults)
    })
  }

}())
