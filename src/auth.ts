import { KJUR } from 'jsrsasign'
import { Env } from './types'
import { verifyKey } from './handler'

interface SupabasePayload {
    aud: string
    exp: number
    sub: string
    email: string
    phone: string
    app_metadata: object
}

export async function verifyJwt(
    jwt: string,
    jwtsecret: string,
): Promise<boolean> {
    let result
    try {
        result = KJUR.jws.JWS.verifyJWT(jwt, jwtsecret, { alg: ['HS256'] })
    } catch (e) {
        console.log(`Unable to parse JWT: ${e}`)
        result = false
    }
    if (!result) {
        console.log(`Error verifying JWT`)
    }
    return result
}


export async function extractUserId(jwt: string): Promise<string> {
    const result = KJUR.jws.JWS.parse(jwt)
    if (!result || !result.payloadObj) {
        throw new Error('Could not parse payload from JWT')
    }
    const payload = <SupabasePayload>result.payloadObj
    return payload.sub
}

export async function verifySignature(
    jwt: string,
    message: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array,
    env: Env,
): Promise<boolean> {
    const jwtVerified = await verifyJwt(jwt, env.SUPABASE_JWT_SECRET)
    if (!jwtVerified) {
        console.log('Verify signature failed due to failed JWT')
        return false
    }
    try {
        const key = await crypto.subtle.importKey(
            'raw',
            publicKey,
            { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' },
            true,
            ['verify'],
        )
        console.log('Checking signature')
        const signatureMatch = await crypto.subtle.verify(
            'NODE-ED25519',
            key,
            signature,
            message,
        )
        if (!signatureMatch) {
            console.log('Verify signature failed')
            return false
        }
        console.log('Verifying key')
        const keyVerified = await verifyKey(jwt, publicKey, env)
        if (!keyVerified) {
            console.log('Key verification failed')
        }
        return keyVerified
    } catch (e) {
        console.log(`Caught ${e}: ${JSON.stringify(e)}`)
        return false
    }
}