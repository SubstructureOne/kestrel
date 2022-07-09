import { verifyJwt } from './handler'

interface Env {
  SUPABASE_JWT_SECRET: string
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _context: ExecutionContext,
  ): Promise<Response> {
    const jwt: string = await request.json()
    return verifyJwt(jwt, env.SUPABASE_JWT_SECRET)
  },
}

