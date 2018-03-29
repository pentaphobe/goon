const eslint = require('eslint')
const CLIEngine = eslint.CLIEngine

const eslintProcess = (fileList, globalConfig) => {
  const config = globalConfig.eslint

  let cli = new CLIEngine(
    Object.assign({
      useEslintrc: true
    }, config)
  )

  let eslintResults = cli.executeOnFiles(fileList)

  return {
    eslintResults, config
  }
}

module.exports = {
  process: eslintProcess
}
