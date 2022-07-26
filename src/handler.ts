import { KJUR } from 'jsrsasign'
import { createClient } from '@supabase/supabase-js'
import { Env } from './types'
import { b64encode } from './encoding'

interface SupabasePayload {
    aud: string,
    exp: number,
    sub: string,
    email: string,
    phone: string,
    app_metadata: object
}

export async function verifyJwt(
    jwt: string,
    jwtsecret: string,
): Promise<boolean> {
    let result = false;
    try {
        result = KJUR.jws.JWS.verifyJWT(
            jwt,
            jwtsecret,
            {alg: ['HS256']}
        )
    } catch (e) {
        console.log(`Unable to parse JWT: ${e}`)
        result = false
    }
    if (!result) {
        console.log(`Error verifying JWT`)
    }
    return result
}

export async function extractUserId(
    jwt: string
): Promise<string> {
    const result = KJUR.jws.JWS.parse(jwt)
    if (!result || !result.payloadObj) {
        throw new Error("Could not parse payload from JWT")
    }
    const payload = <SupabasePayload>result.payloadObj
    return payload.sub
}

export async function registerDeposit(
    jwt: string,
    userid: string,
    amount: number
): Promise<Response> {
    return new Response(`Deposited ${amount} to ${userid}`)
}

export async function verifyKey(
    jwt: string,
    key: Uint8Array,
    env: Env
): Promise<boolean> {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    supabase.auth.setAuth(jwt)
    console.log(`Looking for ${b64encode(key)}`)
    const { count } = await supabase
        .from("keys")
        .select("publickey", {count: "exact"})
        .eq('publickey', b64encode(key))
    return count != null && count > 0
}

export async function listKeys(
    jwt: string,
    env: Env
): Promise<string[]> {
    let keys = []
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    supabase.auth.setAuth(jwt)
    const { data, count } = await supabase
        .from("keys")
        .select("publickey", {count: "exact"})
    console.log(`Count is ${count}`)
    return <string[]>data
}

export async function deleteKey(
    jwt: string,
    key: Uint8Array,
    env: Env
) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    supabase.auth.setAuth(jwt)
    const { error, count } = await supabase
        .from("keys")
        .delete({count: "exact"})
        .match({publickey: b64encode(key)})
    console.log(`${count} keys deleted`)
    if (error) {
        throw new Error(error.message)
    }
}

export async function verifySignature(
    jwt: string,
    message: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array,
    env: Env
): Promise<boolean> {
    console.log("Verifying JWT")
    const jwtVerified = await verifyJwt(jwt, env.SUPABASE_JWT_SECRET)
    if (!jwtVerified) {
        console.log("Verify signature failed due to failed JWT")
        return false
    }
    console.log("Importing key")
    try {
        const key = await crypto.subtle.importKey(
            "raw",
            publicKey,
            { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' },
            true,
            ['verify']
        )
        console.log("Checking signature")
        const signatureMatch = await crypto.subtle.verify(
            'NODE-ED25519',
            key,
            signature,
            message
        )
        if (!signatureMatch) {
            console.log("Verify signature failed")
            return false
        }
        console.log("Verifying key")
        const keyVerified = await verifyKey(jwt, publicKey, env)
        if (!keyVerified) {
            console.log("Key verification failed")
        }
        return keyVerified
    } catch (e) {
        console.log(`Caught ${e}: ${JSON.stringify(e)}`)
        return false
    }
}

export async function addKey(
    jwt: string,
    publicKey: Uint8Array,
    keytype: string,
    env: Env
) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    console.log(`Setting auth: ${jwt}`)
    supabase.auth.setAuth(jwt)
    const { user } = await supabase.auth.api.getUser(jwt)
    if (user == null) {
        throw Error("User is null")
    }
    const { data, error } = await supabase
        .from("keys")
        .insert([{
            userid: user.id,
            publickey: b64encode(publicKey),
            keytype: keytype
        }])
    if (error) {
        throw Error(error.message)
    }
}

// export async function removeKey(
//     jwt: string,
//     publicKey: Uint8Array,
//     keytype: string,
//     env: Env
// )