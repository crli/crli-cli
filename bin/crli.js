#!/usr/bin/env node --harmony
'use strict'
process.env.NODE_PATH = __dirname + '/../node_modules/'
const chalk = require('chalk')
const program = require('commander')
const minimist = require('minimist')
program.version(require('../package').version)
.usage('<command> [options]') //-h 打印的用户提示


program
    .command('create <app-name>')
    .description('create a new project powered by crli-cli')
    .option('-c, --clone', 'Use git clone when fetching remote preset')
    .action((name, options) => {
      // console.log(minimist(process.argv.slice(3)))
      if (minimist(process.argv.slice(3))._.length > 1) {
        console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
      }
      require('../command/init.js')(name, options)
    })
// add some useful info on help
program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`vue <command> --help`)} for detailed usage of given command.`)
  console.log()
})

program.commands.forEach(c => c.on('--help', () => console.log()))

program.parse(process.argv)

if (!program.args.length) {
    program.help()
}