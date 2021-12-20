/*
 * @Author: crli
 * @Date: 2021-11-05 14:33:33
 * @LastEditors: crli
 * @LastEditTime: 2021-12-20 10:21:39
 * @Description: file content
 */
const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const validateProjectName = require('validate-npm-package-name')
const { spawn } = require('child_process')
chalk.level = 3 // 设置chalk等级为3
async function create (projectName, options) {
  if (options.proxy) {
    process.env.HTTP_PROXY = options.proxy
  }
  console.log(1)
  const cwd = process.cwd()
  console.log(cwd)
  const inCurrent = projectName === '.'
  const name = inCurrent ? path.relative('../', cwd) : projectName  // path.relative( 该文件路径将用作基本路径, 该文件路径将用于查找相对路径 )
  // console.log(name)
  const targetDir = path.resolve(cwd, projectName || '.') //path.resolve 相当于cd操作，从左到右执行
  // console.log(targetDir)
  const result = validateProjectName(name)
  // console.log(result)
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`))
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red.dim('Error: ' + err))
    })
    result.warnings && result.warnings.forEach(warn => {
      console.error(chalk.red.dim('Warning: ' + warn))
    })
    exit(1)
  }
  // console.log('33333333333333',fs.pathExistsSync(targetDir))
  if (fs.pathExistsSync(targetDir)) {
    // console.log('路径存在')
    if (inCurrent) {
      // console.log('根路径')
      const { ok } = await inquirer.prompt([
        {
          name: 'ok',
          type: 'confirm',
          message: `Generate project in current directory?`
        }
      ])
      console.log('ok:' + ok)
      if (!ok) {
        return
      }
    } else {
      // console.log('非根路径')
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Cancel', value: false }
          ]
        }
      ])
      if (!action) {
        return
      } else if (action === 'overwrite') {
        console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
        await fs.remove(targetDir)
      }
    }
  } else {
    // console.log('路径不存在')
  }
  const { myframe } = await inquirer.prompt([
    {
      type: 'list',
      message: 'vue-cli-multipage(多页面脚手架) 或 vue3-admin-ts(管理端脚手架)',
      name: 'myframe',
      choices: [
        { name: 'vue-cli-multipage', value: 'multipage' },
        { name: 'vue3-admin-ts', value: 'admin' },
      ]
    }
  ])
  const { packageManager } = await inquirer.prompt([
    {
      type: 'list',
      message: 'yarn 或 cnpm 或 npm:',
      name: 'packageManager',
      choices: [
        { name: 'yarn', value: 'yarn' },
        { name: 'cnpm', value: 'cnpm' },
        { name: 'npm', value: 'npm' }
      ]
    }
  ])
  // console.log(packageManager, 777)
  if (!packageManager) {
    return
  } else {
    console.log(chalk.green('开始初始化文件\n'))
    console.log(chalk.gray('初始化中...'))
    console.log(projectName, packageManager)
    let gitUrl = 'https://github.com/crli/vue3-admin-ts.git'
    if (myframe === 'multipage') {
      gitUrl = 'https://github.com/crli/vue-cli-multipage.git'
    }
    let gitLs = spawn(`git`, ["clone", gitUrl, projectName])
    gitLs.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    gitLs.on('close', (error, stdout, stderr) => { // 克隆模板并进入项目根目录
        console.log(chalk.green('模板下载完毕'))
        if (error) { // 当有错误时打印出错误并退出操作
            console.log('error: ', error);
            console.log(chalk.red('git 失败'))
            process.exit()
        }
        let cmd = { yarn: "yarn", npm: "npm install", cnpm: "cnpm install" }[packageManager] || 'yarn'
        let yarnls = spawn(`cd ${projectName} && ${cmd}`, {
            shell: true
        });
        yarnls.stdout.on('data', (data) => {
            console.log(`${data}`);
        });
        yarnls.on("error", () => {
            console.log('error: ', error);
            console.log(chalk.red('安装依赖失败'))
            process.exit()
        })
        yarnls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            let runLs = spawn(`code ${projectName} && cd ${projectName} && yarn start`, { shell: true });
            runLs.stdout.on('data', (data) => {
                console.log(`${data}`);
            });
        });
    })
  }
}

module.exports = (...args) => {
  return create(...args).catch(err => {
    error(err)
  })
}