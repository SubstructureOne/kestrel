export type Env = {
    SUPABASE_JWT_SECRET: string,
    SUPABASE_URL: string,
    SUPABASE_ANON_KEY: string,
    SUPABASE_SERVICE_KEY: string,
}

export type VerifyRequestJson = {
    jwt: string
}

export type DepositRequestJson = {
    jwt: string,
    userid: string,
    txnid?: string,
    amount: number
}

export type VerifySigantureJson = {
    jwt: string,
    message_b64: string,
    signature_b64: string,
    key_b64: string,
}

export type AddKeyJson = {
    jwt: string,
    key_b64: string,
    keytype: string
}

export type ListKeysJson = {
    jwt: string
}

export type DeleteKeyJson = {
    jwt: string,
    key_b64: string,
}

export type CreateTransactionJson = {
    jwt: string,
    fromuser: string,
    touser: string,
    amount: number
}
