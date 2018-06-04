const chalk = require('chalk')

const checkValidNodeVersion = () => {
  const parts = process.versions.node.split('.').map(n => parseInt(n, 10))
  const major = parts[0]

  if (major < 6) {
    throw new Error(chalk.red('this script requires node version 6 or above'))
  }
}

checkValidNodeVersion()
