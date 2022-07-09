import { describe } from '@jest/globals'
import { KJUR } from 'jsrsasign';

import { verifyJwt } from '../src/handler'

import makeServiceWorkerEnv from 'service-worker-mock'

declare let global: Record<string, unknown>


describe('handle', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })

  test('handle GET', async () => {
    const alg = 'HS256'
    const jwtsecret = '616161'
    const header = {
      alg: alg,
      typ: 'JWT'
    }
    const now = KJUR.jws.IntDate.get('now')
    const end = KJUR.jws.IntDate.get('now + 1day')
    const payload = {
      iss: "http://foo.com",
      sub: "mailto:mike@foo.com",
      nbf: now,
      iat: now,
      exp: end,
      jti: 'id123456',
      aud: 'http://foo.com/employee'
    }
    const jwt = KJUR.jws.JWS.sign(
      'HS256',
      JSON.stringify(header),
      JSON.stringify(payload),
      jwtsecret
    )
    const result = await verifyJwt(jwt, jwtsecret)
    expect(result.status).toEqual(200)
  })
})
