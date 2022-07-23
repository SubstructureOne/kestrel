export type Env = {
    SUPABASE_JWT_SECRET: string,
    SUPABASE_URL: string,
    SUPABASE_ANON_KEY: string,
}

export type VerifyRequestJson = {
    jwt: string
}

export type DepositRequestJson = {
    jwt: string,
    userid: string,
    txnid: string,
}

export type VerifySigantureJson = {
    jwt: string,
    message_b64: string,
    signature_b64: string,
    key_b64: string,
}
