import { KJUR } from 'jsrsasign';


export async function verifyJwt(jwt: string, jwtsecret: string): Promise<Response> {
  const result = KJUR.jws.JWS.verifyJWT(jwt, jwtsecret, {
    alg: ['HS256'],
  })
  console.log(JSON.stringify(KJUR.jws.JWS.parse(jwt)))
  if (result) {
    return new Response(`validation status: ${result}`, { status: 200 })
  } else {
    return new Response(`Error verifying JWT`, {status: 400})
  }
}
