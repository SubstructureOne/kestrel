import { handleRequest } from './handler'
import { Env } from './types'


export default {
    async fetch(
        request: Request,
        env: Env,
        context: ExecutionContext,
    ): Promise<Response> {
        console.log(request.url)
        return await handleRequest(request, env, context);
    },
}

