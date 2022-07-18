import { verifyJwt } from './handler'

type Env = {
  SUPABASE_JWT_SECRET: string
}

type VerifyRequestJson = {
    jwt: string
}

type DepositRequestJson = {
    jwt: string,
    userid: string,
    txnid: string,
}

export default {
    async fetch(
        request: Request,
        env: Env,
        _context: ExecutionContext,
    ): Promise<Response> {
        console.log(request.url)
        const url = new URL(request.url)
        if (url.pathname == '/verify') {
            const json: VerifyRequestJson = await request.json()
            return verifyJwt(json['jwt'], env.SUPABASE_JWT_SECRET)
        } else if (url.pathname == '/deposit') {
            const json: DepositRequestJson = await request.json()
            return registerDeposit(json['jwt'], json['userid'], json['txnid'])
        }
    },
}

