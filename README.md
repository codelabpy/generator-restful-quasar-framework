# generator-restful-quasar-framework
> Generador de aplicaciones con Quasar Framework

## Instalación

Primero, instalar [Yeoman](http://yeoman.io) y generator-restful-quasar-framework usando [npm](https://www.npmjs.com/) (asumimos que has instalado previamente [node.js](https://nodejs.org/))

```bash
npm install -g yo
npm install -g generator-restful-quasar-framework
```

Entonces, cree un directorio y genera tu proyecto:

```bash
mkdir super-proyecto
cd super-proyecto
yo generator-restful-quasar-framework
```

Para iniciar el proyecto, ingrese en el directorio e inicie el dev server con el comando

```bash
npm run serve
```

El comando deberia iniciar su navegador con la url de la applicación

## Subgeneradores

### Crud

Genera vistas crud basados en una API REST (o hace su mejor esfuerzo) ejecute el comando en la raiz del proyecto:

```bash
yo generator-restful-quasar-framework:crud
```

Ingrese los datos a las preguntas que el generador le consulte y seleccione los datos de los servicios cuyas vistas CRUD desea generar:

## Conociendo a Yeoman

 * Yeoman tiene un corazon de oro.
 * Yeoman es una persona con sentimientos y opiniones, pero se trabaja fácilmente con él. 
 * Yeoman también puede tener opiniones propias, pero puede convencersele fácilmente. 
 * Siéntete libre de [aprender más sobre Yeoman](http://yeoman.io/) 

## Licencia

Apache-2.0 © [Pedro Flores](http://codelab.com.py)

