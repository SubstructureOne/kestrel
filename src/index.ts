import { verifyJwt } from './handler'

type Env = {
  SUPABASE_JWT_SECRET: string
}

type RequestJson = {
    jwt: string
}

export default {
    async fetch(
        request: Request,
        env: Env,
        _context: ExecutionContext,
    ): Promise<Response> {
        console.log(request.url)
        const json: RequestJson = await request.json()
        return verifyJwt(json['jwt'], env.SUPABASE_JWT_SECRET)
    },
}

