'use strict'
const utils = require('../utils')
const iconLists = require('./inconlists')
const Generator = require('yeoman-generator')
const path = require('path')
const fs = require('fs')
const rp = require('request-promise')
const ejs = require('ejs')

const changeCase = require('change-case')
const changeTitleCase = require('title-case')

module.exports = class extends Generator {

  async prompting() {
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
        default: '/departamento'
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
          'Ingrese la ubicación del archivo de configuración opcional (ej. generator/user.meta.json)',
        default: (answers) => `generator/${answers.serviceName}.meta.json`
      }
    ]

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      props.jsonUrl = `${props.baseUrl}${props.path}`
      this.props = props
    })
  }

  async writing() {
    let thejson
    try {
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
    } catch (error) {
      this.log(`Error obtaining data from ${this.props.jsonUrl}`, error)
      process.exit(1)
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

    try {
      if (this.props.isPaginated) {
        thekeys = Object.keys(thejson[this.props.itemsName][0])
      } else {
        thekeys = Array.isArray(thejson)
          ? Object.keys(thejson[0])
          : Object.keys(thejson)
      }
    } catch (error) {
      this.log(`Error reading json items. There is no data?`, error)
      process.exit(2)
    }

    const icon = meta && meta.icon ? meta.icon :
      iconLists.iconsList[utils.generateRandom(iconLists.iconsList.length, this.props.serviceName)]

    const fields = thekeys.map(e => {
      return {
        field: e,
        fieldTitle: meta && meta.titles && meta.titles[e] ? meta.titles[e] : changeTitleCase.titleCase(e)
      }
    })


    const serviceNameTitleCase = changeTitleCase.titleCase(this.props.serviceName)
    const serviceNamePascalCase = changeCase.pascalCase(this.props.serviceName)

    const templateData = {
      serviceName: this.props.serviceName,
      isPaginated: this.props.isPaginated,
      itemsName: this.props.itemsName,
      icon: icon,
      serviceNameTitleCase,
      serviceNamePascalCase,
      thejson,
      meta,
      title: meta?.main_title ? meta.main_title : serviceNameTitleCase,
      changeCase,
      thekeys,
      listFields: fields.filter(e => {
        return !meta?.no_list?.includes(e.field)
      }),
      editFields: fields.filter(e => {
        return !meta?.no_edit?.includes(e.field)
      }),
      relations: meta?.relations
    }

    this.log(templateData)

    // Process simple relations (ensure this is processed first in order to get
    // relationship info on other templates)
    for (let rn in templateData.relations) {
      const rel = templateData.relations[rn]
      // inject relationship info
      rel.originModel = rel.origin_model
      rel.originModelTitleCase = changeTitleCase.titleCase(rel.origin_model)
      rel.originModelPascalCase = changeCase.pascalCase(rel.origin_model)
      rel.originModelSnakeCase = changeCase.snakeCase(rel.origin_model)
      // process and create specific component
      this.fs.copyTpl(
        this.templatePath('ModelSelect.vue.ejs'),
        this.destinationPath(`src/components/${rel.originModel}/${rel.originModelPascalCase}Select.vue`),
        {
          title: meta?.main_title ? meta?.main_title : serviceNameTitleCase,
          ...rel,
        }
      )
    }

    this.fs.copy(`${this.templatePath()}/src`, `${this.destinationPath()}/src`)

    this.fs.copyTpl(
      this.templatePath('Page.vue.ejs'),
      this.destinationPath(`src/pages/${serviceNamePascalCase}Page.vue`),
      templateData
    )

    const dis = this

    function modifyDestFile(filename, withThis) {
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

      const pattern = `    route: '/'\n  },`
      const menuLinksIndex = mainLayoutJs.indexOf(pattern)

      if (menuLinksIndex === -1) {
        throw new Error('No definition found in MenuLinks')
      }

      let before = mainLayoutJs.substring(0, menuLinksIndex + pattern.length)
      let after = mainLayoutJs.substring(menuLinksIndex + pattern.length + 1)
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
      let after = routesJs.substring(indexPageIndex + 19)
      let jsonRoute = this.fs.read(this.templatePath("json_route_router.ejs"));

      return ejs.render(
        before + `${jsonRoute.slice(0, -1)}${hasMoreRoutes ? ',\n' : '\n'}` + after,
        templateData
      )
    })

    modifyDestFile('quasar.config.js', (quasarConf) => {
      // check routes.js content to avoid duplicate entries
      if (utils.wordInText('global-components', quasarConf)) {
        return
      }

      let startIndex = quasarConf.indexOf("'navigation-guard'")
      let hasMore = quasarConf.indexOf("'navigation-guard',") !== -1

      if (startIndex === -1) {
        throw new Error('No definition found in navigation-guard')
      }

      let before = quasarConf.substring(0, startIndex + 18)
      let after = quasarConf.substring(startIndex + 19)

      return ejs.render(
        before + `,\n      'global-components'${hasMore ? ',' : ''}\n` + after,
        templateData
      )
    })

  }

}
