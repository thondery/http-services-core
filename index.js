const qs = require('query-string')
const _ = require('lodash')

try {
  fetch
} catch (error) {
  require('isomorphic-fetch')
}

class httpServices {

  constructor (...opts) {
    opts = _.zipObject(['domain', 'apiPath', 'statusMessage'], opts)
    this.state = {
      domain: opts.domain || '',
      apiPath: opts.apiPath || '',
      statusMessage: opts.statusMessage || 'Request Success!'
    }
  }

  get options () {
    return this.state
  }

  set domain (val) {
    this.state.domain = val
  }

  get domain () {
    return this.state.domain
  }

  set apiPath (val) {
    this.state.apiPath = val
  }

  get apiPath () {
    return this.state.apiPath
  }

  set statusMessage (val) {
    this.state.statusMessage = val
  }

  get statusMessage () {
    return this.state.statusMessage
  }

  get defaultStatus () {
    return {
      code: 0,
      message: this.state.statusMessage
    }
  }

  getAPI (url) {
    let { domain, apiPath } = this.options
    return `${domain}${apiPath}${url}`
  }

  GET (url, params, headers = {}) {
    url = this.getAPI(url)
    if (params) {
      url += `?${qs.stringify(params)}`
    }
    return fetch(url, { headers })
      .then(checkStatus)
      .then(parseJSON)
  }

  POST (url, body, headers = {}) {
    url = this.getAPI(url)
    return fetch(url, {
        method: 'POST',
        headers: Object.assign({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }, headers),
        body: JSON.stringify(body)
      })
      .then(checkStatus)
      .then(parseJSON)
  }
}

exports.httpServices = httpServices

exports.createAction = function (type, ret, opts = null) {
  const isError = _.isError(ret)
  return Object.assign({
    type,
    payload: isError ? null : ret,
    error: isError ? ret : null,
  }, opts)
}

exports.getStatusError = function (error) {
  const { code, message, response } = error
  if (response) {
    const { status, statusText } = response
    return {
      code: status,
      message: statusText
    }
  }
  return {
    code: code || 1000,
    message: message || 'Abnormal error'
  }
}

exports.statusToError = function (payload, error, message) {
  const status = payload.Status || payload.status
  const info = {}
  info[error] = status.code > 0 ? status : null
  if (message) {
    info[error] = status.code
    info[message] = status.message
  }
  return info
}

exports.createReducer = function (state, action, handlers) {
  const handler = handlers[action.type]
  return handler ? handler(state, action) : state
}

function checkStatus (response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  else {
    let error = new Error(response._bodyText)
    error.response = response
    throw error
  }
}

function parseJSON (response) {
  return response.json()
}