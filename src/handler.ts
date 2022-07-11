import { KJUR } from 'jsrsasign'

export async function verifyJwt(
    jwt: string,
    jwtsecret: string,
): Promise<Response> {
    let result = false;
    try {
        result = KJUR.jws.JWS.verifyJWT(jwt, jwtsecret, {
            alg: ['HS256'],
        })
    } catch (e) {
        console.log(`Unable to parse JWT: ${e}`)
    }
    if (result) {
        return new Response(`validation status: ${result}`, { status: 200 })
    } else {
        return new Response(`Error verifying JWT`, { status: 400 })
    }
}
