const globby = require('globby')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const handlebars = require('handlebars')
const execa = require('execa')
const cwd = process.cwd()

const getPackagePath = () => {
  const packagePaths = globby.sync('../packages', {
    cwd: __dirname,
    onlyDirectories: true,
    deep: 1,
  })
  return packagePaths.map((item) => item.replace('../', ''))
}

const choosePackage = async (packages) => {
  const answer = await inquirer.prompt({
    type: 'checkbox',
    name: 'packages',
    message: '选择你要发布的包',
    choices: [...packages],
  })
  return answer
}

const reWriteLerna = (packages) => {
  const jsonContent = fs.readFileSync(`${cwd}/lerna-template.txt`, 'utf-8')
  const jsonResult = handlebars.compile(jsonContent)(packages)
  fs.writeFileSync(`${cwd}/lerna.json`, jsonResult)
}

const publish = async () => {
  const packages = getPackagePath()
  const publishPackages = await choosePackage(packages)
  reWriteLerna(publishPackages)
  execa.commandSync('git commit -am "发包"', {
    stdio: 'inherit',
    cwd,
  })

  execa.commandSync('git push', {
    stdio: 'inherit',
    cwd,
  })

  execa.commandSync('lerna publish', {
    stdio: 'inherit',
    cwd,
  })
}

publish()
