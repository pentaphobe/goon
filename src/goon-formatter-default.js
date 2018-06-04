const {mergeObject} = require('./utils')
/**
 *
 * Custom eslint formatter monolithic monstrosity
 *
 */
const customFormatter = (results, config) => {
  const ERROR_WEIGHT = config.weights.error
  const WARNING_WEIGHT = config.weights.warning

  results = results || []

  const weightLookup = config.weights.rules.reduce((accum, entry) => {
    entry.rules.forEach(rule => {
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
    let debtCount = 0

    let mappedMessages = obj.messages.map(message => {
      let score = getRuleScore(message)

      debtCount += score

      return mergeObject({}, message, {
        debt: score
      })
    })

    return {
      messages: mappedMessages,
      debt: debtCount
    }
  }

  let summary = results.results.reduce((accum, result) => {
    let detail = mergeObject({}, result, convertDebt(result))
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

module.exports = {
  formatter: customFormatter
}
