const chai = require('chai')
const { 
  httpServices, 
  createAction, 
  createReducer,
  statusToError, 
  getStatusError 
} = require('../')
const server = require('./server')

const should = chai.should()

describe('Test -> httpServices', () => {

  var HttpServices
  const FETCH_SIGNIN_SUCCESS = 'FETCH_SIGNIN_SUCCESS'
  const FETCH_SIGNIN_FAILURE = 'FETCH_SIGNIN_FAILURE'
  const ROOT_INITIAL_SUCCESS = 'ROOT_INITIAL_SUCCESS'

  before( done => {
    server.listen(14001)
    done()
  })

  after( done => {
    done()
  })

  describe('\n    Setting Options \n', () => {
    it('should set domain', done => {
      HttpServices = new httpServices()
      HttpServices.domain = 'http://localhost'
      HttpServices.domain.should.equal('http://localhost')
      done()
    })
    it('should set apiPath', done => {
      HttpServices = new httpServices()
      HttpServices.apiPath = '/api/v1'
      HttpServices.apiPath.should.equal('/api/v1')
      done()
    })
    it('should set statusMessage', done => {
      HttpServices = new httpServices()
      HttpServices.statusMessage = 'Request Success!'
      HttpServices.statusMessage.should.equal('Request Success!')
      done()
    })
  })

  describe('\n    GET Request \n', () => {
    it('should fail 404 Not Found', done => {
      HttpServices = new httpServices('http://localhost:14001', '/api/v1')
      HttpServices.GET('/user123')
        .catch( error => {
          error.should.be.an('error')
          error.response.status.should.equal(404)
          done()
        })
    })
    it('should fail 500 Server Error', done => {
      HttpServices = new httpServices('http://localhost:14001', '/api/v1')
      HttpServices.GET('/user', { key: 'info' }, { Authorization: '1234567890' })
        .catch( error => {
          error.should.be.an('error')
          error.response.status.should.equal(500)
          done()
        })
    })
    it('should success', done => {
      HttpServices = new httpServices('http://localhost:14001', '/api/v1')
      HttpServices.GET('/user', null, { Authorization: '1234567890' })
        .then( ret => {
          ret.should.be.an('object')
          ret.data.should.be.an('object')
          ret.data.id.should.equal(1)
          ret.data.username.should.equal('admin')
          ret.status.should.be.an('object')
          ret.status.code.should.equal(0)
          ret.status.message.should.equal('Request Success!')
          done()
        })
    })
  })

  describe('\n    POST Request \n', () => {
    it('should fail', done => {
      HttpServices = new httpServices('http://localhost:14001', '/api/v1')
      HttpServices.POST('/sign-in', {
          username: 'admin',
          password: 'password'
        })
        .then( ret => {
          ret.should.be.an('object')
          ret.status.should.be.an('object')
          ret.status.code.should.equal(1024)
          ret.status.message.should.equal('Wrong user name or password!')
          done()
        })
        .catch( err => {
          done()
        })
    })
    it('should success', done => {
      HttpServices = new httpServices('http://localhost:14001', '/api/v1')
      HttpServices.POST('/sign-in', {
        username: 'admin',
        password: 'password'
      }, { Authorization: '1234567890' })
        .then( ret => {
          ret.should.be.an('object')
          ret.data.should.be.an('object')
          ret.data.id.should.equal(1)
          ret.data.username.should.equal('admin')
          ret.status.should.be.an('object')
          ret.status.code.should.equal(0)
          ret.status.message.should.equal('Request Success!')
          done()
        })
        .catch( err => {
          done()
        })
    })
  })

  describe('\n    Method createAction \n', () => {
    it('should fail', done => {
      let error = new Error()
      let ret = createAction(FETCH_SIGNIN_FAILURE, error)
      ret.should.be.an('object')
      ret.type.should.equal(FETCH_SIGNIN_FAILURE)
      ret.error.should.be.an('error')
      done()
    })
    it('should success', done => {
      let Response = {
        data: {
          id: 1,
          username: 'admin'
        },
        status: {
          code: 0,
          message: 'Request Success!'
        }
      }
      let ret = createAction(FETCH_SIGNIN_SUCCESS, Response)
      ret.should.be.an('object')
      ret.type.should.equal(FETCH_SIGNIN_SUCCESS)
      ret.payload.should.be.an('object')
      ret.payload.data.should.be.an('object')
      ret.payload.data.id.should.equal(1)
      ret.payload.data.username.should.equal('admin')
      ret.payload.status.should.be.an('object')
      ret.payload.status.code.should.equal(0)
      ret.payload.status.message.should.equal('Request Success!')
      done()
    })
  })

  describe('\n    Method createReducer \n', () => {
    it('should success', done => {
      const initialState = {
        initial: false
      }
      const action = createAction(ROOT_INITIAL_SUCCESS, null)
      const handlers = {
        [ROOT_INITIAL_SUCCESS]: function (state, action) {
          return Object.assign(state, { initial: true })
        }
      }
      const reducer = createReducer(initialState, action, handlers)
      reducer.should.be.an('object')
      reducer.should.be.ok
      done()
    })
  })

  describe('\n    Method defaultStatus \n', () => {
    it('should success', done => {
      HttpServices = new httpServices()
      let ret = HttpServices.defaultStatus
      ret.should.be.an('object')
      ret.code.should.be.an('number')
      ret.message.should.be.an('string')
      done()
    })
  })

  describe('\n    Method getStatusError \n', () => {
    it('should empty error', done => {
      let error = new Error()
      let ret = getStatusError(error)
      ret.should.be.an('object')
      ret.code.should.be.an('number')
      ret.message.should.be.an('string')
      done()
    })
    it('should message error', done => {
      let error = new Error('Unexpected token < in JSON at position 0')
      let ret = getStatusError(error)
      ret.should.be.an('object')
      ret.code.should.be.an('number')
      ret.message.should.be.an('string')
      done()
    })
    it('should response error', done => {
      let error = new Error()
      error.response = { status: 404, statusText: 'Not Found' }
      let ret = getStatusError(error)
      ret.should.be.an('object')
      ret.code.should.be.an('number')
      ret.message.should.be.an('string')
      done()
    })
  })

  describe('\n    Method statusToError \n', () => {
    it('should to error', done => {
      let Response = {
        data: null,
        status: {
          code: 1024,
          message: 'Wraning Message!'
        }
      }
      let ret = statusToError(Response, 'loginError')
      ret.should.be.an('object')
      ret.loginError.should.be.an('object')
      ret.loginError.code.should.be.an('number')
      ret.loginError.message.should.be.an('string')
      done()
    })
    it('should to error & message', done => {
      let Response = {
        data: null,
        status: {
          code: 1024,
          message: 'Wraning Message!'
        }
      }
      let ret = statusToError(Response, 'loginError', 'loginMessage')
      ret.should.be.an('object')
      ret.loginError.should.be.an('number')
      ret.loginMessage.should.be.an('string')
      done()
    })
    it('should no error', done => {
      let Response = {
        data: {},
        status: {
          code: 0,
          message: 'Request Success!'
        }
      }
      let ret = statusToError(Response, 'loginError')
      ret.should.be.an('object')
      done()
    })
  })
  
})