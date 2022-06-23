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

module.exports.insertBefore = insertBefore
module.exports.insertAfter = insertAfter
module.exports.wordInText = wordInText
