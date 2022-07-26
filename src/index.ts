import { verifyJwt, registerDeposit, verifySignature, addKey, listKeys, deleteKey } from './handler'
import {
    Env,
    VerifyRequestJson,
    DepositRequestJson,
    VerifySigantureJson,
    AddKeyJson,
    ListKeysJson, DeleteKeyJson
} from './types'

import { b64decode } from './encoding'

export default {
    async fetch(
        request: Request,
        env: Env,
        _context: ExecutionContext,
    ): Promise<Response> {
        console.log(request.url)
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
            return registerDeposit(json['jwt'], json['userid'], parseFloat(json['txnid']))
        } else if (url.pathname == '/signature') {
            const json: VerifySigantureJson = await request.json()
            const toChar = (x: string): number => x.charCodeAt(0)
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
                    JSON.stringify({message: "Success"}),
                    {status: 200}
                )
            } catch (e) {
                return new Response(
                    JSON.stringify({error: e}),
                    {status: 500}
                )
            }
        } else {
            return new Response(`Unknown path: ${url.pathname}`, {status: 404})
        }
    },
}

