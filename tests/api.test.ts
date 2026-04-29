import { POST as registerPOST } from '../app/api/auth/register/route'
import { POST as loginPOST } from '../app/api/auth/login/route'
import { NextRequest } from 'next/server'

jest.mock('../lib/auth', () => ({
    dangKy: jest.fn(),
    dangNhap: jest.fn(),
}))

describe('API Đăng Ký', () => {
    test('POST /api/auth/register — thành công', async () => {
    const { dangKy } = require('../lib/auth')
    dangKy.mockResolvedValueOnce({
        data: { id: '123', phone: '0901234567', full_name: 'Nguyễn Văn A' }
    })

    const req = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ phone: '0901234567', fullName: 'Nguyễn Văn A', password: 'matkhau123' }),
    })

    const res = await registerPOST(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    })

    test('POST /api/auth/register — SĐT đã tồn tại', async () => {
    const { dangKy } = require('../lib/auth')
    dangKy.mockResolvedValueOnce({ error: 'Số điện thoại đã được đăng ký!' })

    const req = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ phone: '0901234567', fullName: 'Test', password: '123' }),
    })

    const res = await registerPOST(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Số điện thoại đã được đăng ký!')
    })
})

describe('API Đăng Nhập', () => {
    test('POST /api/auth/login — thành công', async () => {
    const { dangNhap } = require('../lib/auth')
    dangNhap.mockResolvedValueOnce({
        data: { id: '123', phone: '0901234567', full_name: 'Nguyễn Văn A', role: 'player' }
    })

    const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone: '0901234567', password: 'matkhau123' }),
    })

    const res = await loginPOST(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.token).toBeDefined()
    })
})