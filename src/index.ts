import { verifyJwt, registerDeposit, verifySignature } from './handler'
import { Env, VerifyRequestJson, DepositRequestJson, VerifySigantureJson } from './types'

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
            const message = Uint8Array.from(atob(json.message_b64), toChar)
            const signature = Uint8Array.from(atob(json.signature_b64), toChar)
            const key = Uint8Array.from(atob(json.key_b64), toChar)
            const result = await verifySignature(
                json.jwt,
                message,
                signature,
                key,
                env
            )
            if (result) {
                return new Response("Verified", {status: 200})
            } else {
                return new Response("Failed", {status: 400})
            }
        } else {
            return new Response(`Unknown path: ${url.pathname}`, {status: 404})
        }
    },
}

