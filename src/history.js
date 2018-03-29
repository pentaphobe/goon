const fs = require('fs')

const loadHistory = (config) => {
  if (!fs.existsSync(config.report)) {
    console.log(`no history file found at: ${config.report}`)
    return []
  }
  const content = fs.readFileSync(config.report, 'utf8')
  const lines = (content || '').split(/[\r\n]+/)

  return lines
    // remove comment lines
    .filter( line => line.match(/^\s*#/))
    // remove blank lines
    .filter( line => line.trim().length > 0)
    // parse lines
    .map( line => JSON.parse(line) )
}

const addHistory = (config, entry) => {
  fs.appendFileSync(config.report, JSON.stringify(entry) + '\n')
}

module.exports = {
  loadHistory,
  addHistory
}
