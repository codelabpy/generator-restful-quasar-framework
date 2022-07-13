'use strict'
const utils = require('../utils')
const Generator = require('yeoman-generator')
const path = require('path')
const fs = require('fs')
const rp = require('request-promise')
const ejs = require('ejs')

const changeCase = require('change-case')
const changeTitleCase = require('title-case')

module.exports = class extends Generator {

  async prompting () {
    const prompts = [
      {
        type: 'input',
        name: 'baseUrl',
        message:
          'Ingrese la url BASE del servicio RESTful a construir las vistas crud',
        default: 'http://localhost:5000'
      },
      {
        type: 'input',
        name: 'path',
        message:
          'Ingrese el path del servicio RESTful a construir las vistas crud',
        default: '/user'
      },
      {
        type: 'confirm',
        name: 'isPaginated',
        message: '¿El servicio devuelve items paginados?',
        default: true
      },
      {
        type: 'input',
        name: 'itemsName',
        message: 'Ingrese el nombre del atributo json que contiene los items',
        default: 'items',
        when: function (answers) {
          return answers.isPaginated
        }
      },
      {
        type: 'confirm',
        name: 'authRequired',
        message:
          'El servicio requiere cabecera de autencicación (JWT, Basic, etc.)',
        default: true
      },
      {
        type: 'input',
        name: 'authHeader',
        message: 'Ingrese la cabecera de autorización del servicio',
        default: async (answers) => {
          let response = await rp({
            method: "POST",
            uri: `${answers.baseUrl}/login`,
            body: {
              username: "test",
              password: "test"
            },
            json: true
          });
          return `Bearer ${response.access_token}`;
        }
      },
      {
        type: 'input',
        name: 'serviceName',
        message:
          'Ingrese el nombre del servicio (basado en el mismo se generaran los nombres de las vistas)',
        default: async (answers) => answers.path.slice(1)
      },
      {
        type: 'input',
        name: 'metaJsonPath',
        message:
          'Ingrese la ubicación del archivo de configuración opcional (ej. generator/user.meta.json)'
      }
    ]

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      props.jsonUrl = `${props.baseUrl}${props.path}`
      this.props = props
    })
  }

  async writing () {
    let thejson
    if (this.props.authRequired) {
      thejson = await rp(this.props.jsonUrl, {
        headers: {
          Authorization: this.props.authHeader
        },
        json: true
      })
    } else {
      thejson = await rp(this.props.jsonUrl, {
        json: true
      })
    }

    let meta
    if (!this.props.metaJsonPath) {
      this.props.metaJsonPath = `${this.props.serviceName}.meta.json`
    }
    if (fs.existsSync(this.props.metaJsonPath)) {
      if (path.isAbsolute(this.props.metaJsonPath)) {
        meta = require(this.props.metaJsonPath)
      } else {
        meta = require(path.join(process.cwd(), this.props.metaJsonPath))
      }
    }

    let thekeys

    if (this.props.isPaginated) {
      thekeys = Object.keys(thejson[this.props.itemsName][0])
    } else {
      thekeys = Array.isArray(thejson)
        ? Object.keys(thejson[0])
        : Object.keys(thejson)
    }

    const templateData = {
      serviceName: this.props.serviceName,
      isPaginated: this.props.isPaginated,
      itemsName: this.props.itemsName,
      serviceNameTitleCase: changeTitleCase.titleCase(this.props.serviceName),
      serviceNamePascalCase: changeCase.pascalCase(this.props.serviceName),
      thejson,
      meta,
      changeCase,
      thekeys,
      editFields: thekeys.filter(e => {
        return !(meta && meta.no_edit && meta.no_edit.includes(e))
      }).map(e => {
        return {
          field: e,
          fieldTitle: meta && meta.titles && meta.titles[e] ? meta.titles[e] : changeTitleCase.titleCase(e)
        }
      })
    }

    this.log(templateData)

    // this.fs.copy(`${this.templatePath()}/src`, `${this.destinationPath()}/src`)

    this.fs.copyTpl(
      this.templatePath('Page.vue.ejs'),
      this.destinationPath(
        'src/pages/' + changeCase.pascalCase(this.props.serviceName) + 'Page.vue'
      ),
      templateData
    )

    const dis = this

    function modifyDestFile (filename, withThis) {
      if (dis.fs.exists(dis.destinationPath(filename))) {
        const fileString = dis.fs.read(dis.destinationPath(filename))
        const newFileString = withThis(fileString)
        if (newFileString) {
          dis.fs.write(dis.destinationPath(filename), newFileString)
        }
      }
    }

    modifyDestFile('src/layouts/MainLayout.vue', (mainLayoutJs) => {
      // check MainLayout.vue content to avoid duplicate entries
      if (utils.wordInText(templateData.serviceNamePascalCase, mainLayoutJs)) {
        return
      }

      const menuLinksIndex = mainLayoutJs.indexOf('menuLinks = [')

      if (menuLinksIndex === -1) {
        throw new Error('No definition found in MenuLinks')
      }

      let before = mainLayoutJs.substring(0, menuLinksIndex + 13)
      let after = mainLayoutJs.substring(menuLinksIndex + 14)
      let jsonMenuLink = this.fs.read(this.templatePath("json_menu_link.ejs"));

      return ejs.render(
        before + jsonMenuLink + after,
        templateData
      )
    })

    modifyDestFile('src/router/routes.js', (routesJs) => {
      // check routes.js content to avoid duplicate entries
      if (utils.wordInText(`${templateData.serviceNamePascalCase}Page.vue`, routesJs)) {
        return
      }

      let indexPageIndex = routesJs.indexOf("IndexPage.vue') }")
      let hasMoreRoutes = routesJs.indexOf("IndexPage.vue') },") !== -1

      if (indexPageIndex === -1) {
        throw new Error('No definition found in routes.js')
      }

      let before = routesJs.substring(0, indexPageIndex + 17)
      let after = routesJs.substring(indexPageIndex + 18)
      let jsonRoute = this.fs.read(this.templatePath("json_route_router.ejs"));

      return ejs.render(
        before + `${jsonRoute}${hasMoreRoutes ? ',' : ''}` + after,
        templateData
      )
    })

  }

  install () {
    // if (this.options['skip-install']) {
    //   return
    // }

    // if (this.options.packageJsonModified) {
    //   this.spawnCommand('npm', ['install'])
    // }
  }
}
