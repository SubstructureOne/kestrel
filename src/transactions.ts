import { Env } from './types'
import { createClient } from '@supabase/supabase-js'
import { extractUserId, verifyJwt } from './auth'

export async function registerDeposit(
    jwt: string,
    userid: string,
    amount: number,
    env: Env
): Promise<Response> {
    // todo: verify deposit
    const verified = await verifyJwt(jwt, env.SUPABASE_JWT_SECRET)
    if (!verified) {
        return new Response(
            JSON.stringify({"error": "Authentication failed"}),
            {status: 403}
        )
    }
    const jwtuser = await extractUserId(jwt)
    if (userid != jwtuser) {
        return new Response(
            JSON.stringify({"error": "Only allowed to deposit to your own account"})
        )
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
    const {error} = await supabase.rpc(
        "add_external_deposit",
        {
            "to_user": userid,
            "amount": amount,
        },
    )
    if (error) {
        console.log(JSON.stringify(error))
        return new Response(
            JSON.stringify({"error": "Error registering deposit"}),
            {status: 500}
        )
    }
    return new Response(
        JSON.stringify({"message": `Deposited ${amount} to ${userid}`}),
        {status: 200}
    )
}

export async function createTransaction(
    jwt: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
    env: Env,
): Promise<Response> {
    const verified = await verifyJwt(jwt, env.SUPABASE_JWT_SECRET)
    if (!verified) {
        return new Response(
            JSON.stringify({"error": "Authentication failed"}),
            {status: 403}
        )
    }
    const jwtuser = await extractUserId(jwt)
    if (fromUserId != jwtuser) {
        return new Response(
            JSON.stringify({"error": "Only allowed to transfer from your own account"})
        )
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
    const {error} = await supabase.rpc(
        "add_internal_transaction",
        {
            "from_user": fromUserId,
            "to_user": toUserId,
            "amount": amount,
        },
    )
    if (error) {
        console.log(JSON.stringify(error))
        return new Response(
            JSON.stringify({"error": "Error creating transaction"}),
            {status: 500}
        )
    }
    return new Response(
        JSON.stringify({"message": `${amount} transferred from ${fromUserId} to ${toUserId}`}),
        {status: 200}
    )
}