const path = require('path')
const fs = require('fs')
const _ = require('lodash')

const requireOptional = (fname, _default) => (
  (fname) => {

    return fs.existsSync(fname) ? require(fname) : _default
  }
)(path.join(process.cwd(), fname))

// breaks eslint rule arrays
// const arrayMerge = (target, src) => _.isArray(target) ? target.concat(src) : undefined
// const mergeObject = (target, ...sources) => _.mergeWith(target, ...[...sources, arrayMerge])

const mergeObject = _.merge

module.exports = {
  requireOptional,
  mergeObject
}
