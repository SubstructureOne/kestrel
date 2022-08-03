import { KJUR } from 'jsrsasign'
import { createClient } from '@supabase/supabase-js'
import {
    AddKeyJson, CreateTransactionJson,
    DeleteKeyJson,
    DepositRequestJson,
    Env,
    ListKeysJson,
    VerifyRequestJson,
    VerifySigantureJson
} from './types'

import { createTransaction, registerDeposit } from "./transactions"
import { b64decode, b64encode } from './encoding'


interface SupabasePayload {
    aud: string,
    exp: number,
    sub: string,
    email: string,
    phone: string,
    app_metadata: object
}

class AuthenticationError extends Error {
}


export async function handleRequest(
    request: Request,
    env: Env,
    _context: ExecutionContext
): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname == '/jwt') {
        const json: VerifyRequestJson = await request.json()
        const jwtverified = await verifyJwt(json['jwt'], env.SUPABASE_JWT_SECRET)
        if (jwtverified) {
            return new Response("Successful JWT verification", {status: 200})
        } else {
            return new Response("JWT verification failed", {status: 400})
        }
    } else if (url.pathname == '/deposit') {
        const json: DepositRequestJson = await request.json()
        return registerDeposit(json['jwt'], json['userid'], json['amount'], env)
    } else if (url.pathname == '/signature') {
        const json: VerifySigantureJson = await request.json()
        const message = b64decode(json.message_b64)
        const signature = b64decode(json.signature_b64)
        const key = b64decode(json.key_b64)
        const result = await verifySignature(
            json.jwt,
            message,
            signature,
            key,
            env
        )
        if (result) {
            return new Response("Verified", { status: 200 })
        } else {
            return new Response(
                JSON.stringify({error: "Failed"}),
                { status: 400 }
            )
        }
    } else if (url.pathname == '/addkey') {
        const json: AddKeyJson = await request.json()
        await addKey(
            json['jwt'],
            b64decode(json['key_b64']),
            json['keytype'],
            env
        )
        return new Response("Key added", { status: 200 })
    } else if (url.pathname == '/listkeys') {
        const json: ListKeysJson = await request.json()
        const keys = await listKeys(json['jwt'], env)
        return new Response(
            JSON.stringify({ 'keys': keys }),
            { status: 200 }
        )
    } else if (url.pathname == '/deletekey') {
        const json: DeleteKeyJson = await request.json()
        try {
            await deleteKey(
                json['jwt'],
                b64decode(json['key_b64']),
                env
            )
            return new Response(
                JSON.stringify({ message: "Success" }),
                { status: 200 }
            )
        } catch (e) {
            return new Response(
                JSON.stringify({ error: e }),
                { status: 500 }
            )
        }
    } else if (url.pathname == '/createtransaction') {
        const json: CreateTransactionJson = await request.json()
        const response = await createTransaction(
            json['jwt'],
            json['fromuser'],
            json['touser'],
            json['amount'],
            env
        )
        return response
    } else {
        return new Response(`Unknown path: ${url.pathname}`, {status: 404})
    }
}

export async function verifyJwt(
    jwt: string,
    jwtsecret: string,
): Promise<boolean> {
    let result;
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
