const http = require('http')
const URL = require('url')
const qs = require('query-string')

const server = http.createServer( (req, res) => {
  let urlParse = URL.parse(req.url)
  let pathname = urlParse.pathname
  let query = qs.parse(urlParse.query)
  let isNotFound = false
  if (req.method === 'POST') {
    if (pathname == '/api/v1/sign-in') {
      req.on('data', chunk => {
        let body = JSON.parse(chunk.toString())
        let info = validLogin(body)
        res.end(JSON.stringify(info))
      })
    }
    else {
      isNotFound = true
    }
  }
  else {
    if (pathname == '/api/v1/user') {
      if (query.key == 'info') {
        res.statusCode = 500
        res.statusMessage = 'Server Error'
        res.end()
      }
      let info = {
        data: {
          id: 1,
          username: 'admin'
        },
        status: {
          code: 0,
          message: 'Request Success!'
        }
      }
      res.end(JSON.stringify(info))
    }
    else {
      isNotFound = true
    }
  }
  if (isNotFound) {
    res.statusCode = 404
    res.statusMessage = 'Not Found'
    res.end()
  }
})

const validLogin = info => {
  let { username, password } = info
  if (username === 'admin' && password === 'password') {
    return {
      data: {
        id: 1,
        username: username
      },
      status: {
        code: 0,
        message: 'Request Success!'
      }
    }
  }
  else {
    return {
      data: null,
      status: {
        code: 1024,
        message: 'Wrong user name or password!'
      }
    }
  }
}

module.exports = server