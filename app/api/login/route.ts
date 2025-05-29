import { agent } from '@/utils/agent'
import axios from 'axios'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        console.log('Login API called')
        const data = await request.json()
        console.log('Request data:', data)
        const response = await axios.post('https://hoadondientu.gdt.gov.vn:30000/security-taxpayer/authenticate', data, {
            httpsAgent: agent,
        })
        console.log('Response data:', response)
        const token = response.data.token
        cookies().set('token', token, {
            maxAge: 60 * 60 * 24,
        })
        return Response.json({ token }, { status: 200 })
    } catch (error: any) {
        console.error('Login API error:', error.message)
        return Response.json(error.response.data, { status: 400 })
    }
}
