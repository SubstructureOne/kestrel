import { handleRequest } from './handler'
import { Env } from './types'


export default {
    async fetch(
        request: Request,
        env: Env,
        context: ExecutionContext,
    ): Promise<Response> {
        console.log(request.url)
        if (request.method == 'OPTIONS') {
            const responseHeaders = {
                Allow: "GET, HEAD, POST, OPTIONS",
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
            }
            console.log(`Got OPTIONS: ${JSON.stringify(responseHeaders)}`)
            return new Response(null, {
                headers: responseHeaders,
            })
        }
        const response = await handleRequest(request, env, context)
        const responseHeaders = new Headers(response.headers)
        responseHeaders.set('Allow', 'GET, HEAD, POST, OPTIONS')
        responseHeaders.set('Access-Control-Allow-Origin', '*')
        responseHeaders.set('Access-Control-Allow-Headers', '*')
        console.log(JSON.stringify(responseHeaders))
        return new Response(
            response.body,
            {
                headers: responseHeaders,
                status: response.status,
                statusText: response.statusText
            }
        )
    },
}

