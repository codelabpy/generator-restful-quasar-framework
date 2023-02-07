
const changeCase = require('change-case')
const titleCase = require('title-case')
const Generator = require('yeoman-generator')

module.exports = class extends Generator {
  async prompting () {
    this.props = await this.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter the project name:',
        default: 'My Super Project'
      }
    ])
  }

  writing () {
    this.fs.copy(this.templatePath(), this.destinationPath(), {
      globOptions: { dot: true }
    })

    const properties = {
      projectName: this.props.projectName,
      projectNameTitleCase: titleCase.titleCase(this.props.projectName),
      projectNameParamCase: changeCase.paramCase(this.props.projectName)
    }

    const thisobj = this
    function ctpl (tplname) {
      thisobj.fs.copyTpl(
        thisobj.templatePath(tplname),
        thisobj.destinationPath(tplname),
        properties
      )
    }
    ctpl('package.json')
    ctpl('README.md')
    ctpl('index.html')
    ctpl('src/i18n/en-US/index.js')
    ctpl('src/i18n/es/index.js')
    ctpl('quasar.config.js')
    ctpl('src/pages/LoginPage.vue')
    ctpl('src/layouts/MainLayout.vue')
  }

  install () {
    if (this.options['skip-install']) {
      return
    }

    this.spawnCommand('yarn')
  }
}
