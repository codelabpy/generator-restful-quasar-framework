const insertBefore = function (txt, search, insert) {
  const position = txt.indexOf(search)
  return [txt.slice(0, position), insert, txt.slice(position)].join('')
}

const insertAfter = function (txt, search, insert) {
  const position = txt.indexOf(search) + search.length
  return [txt.slice(0, position), insert, txt.slice(position)].join('')
}

const wordInText = function (search, txt) {
  const regexWord = new RegExp(`\\b${search}\\b`)
  return regexWord.test(txt)
}

const generateRandom = (maxInt, stringParam) => {
  let sum = 0
  for (let i = 0; i < stringParam.length; i++){
    sum += stringParam.charCodeAt(i)
  }
  let result = sum % maxInt
  return result
}

module.exports.insertBefore = insertBefore
module.exports.insertAfter = insertAfter
module.exports.wordInText = wordInText
module.exports.generateRandom = generateRandom
