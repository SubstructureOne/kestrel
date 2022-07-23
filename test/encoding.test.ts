import { describe, jest, test } from '@jest/globals'
import { b64encode, b64decode } from '../src/encoding'

describe('base64', () => {
    test('base64 encode', async () => {
        const input = Uint8Array.from([1, 2, 12, 15])
        console.log(`Input: ${input}`)
        const encoded = b64encode(input)
        console.log(`Encoded: ${encoded}`)
        const decoded = b64decode(encoded)
        console.log(`Decoded: ${decoded}`)
        expect(decoded).toEqual(input)
    })
})
