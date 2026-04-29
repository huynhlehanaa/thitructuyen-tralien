import { dangKy, dangNhap } from '../lib/auth'

// Mock Supabase
jest.mock('../lib/supabase', () => ({
    supabase: {
    from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
    })),
    },
}))

describe('Chức năng Đăng Ký', () => {
    test('Đăng ký thành công với SĐT hợp lệ', async () => {
    const { supabase } = require('../lib/supabase')
    supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
        .mockResolvedValueOnce({ data: null, error: {} }) // SĐT chưa tồn tại
        .mockResolvedValueOnce({ data: { id: '123', phone: '0901234567' }, error: null }),
    })

    const result = await dangKy('0901234567', 'Nguyễn Văn A', 'matkhau123')
    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()
    })

    test('Đăng ký thất bại khi SĐT đã tồn tại', async () => {
    const { supabase } = require('../lib/supabase')
    supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: { id: '123' }, error: null }),
    })

    const result = await dangKy('0901234567', 'Nguyễn Văn A', 'matkhau123')
    expect(result.error).toBe('Số điện thoại đã được đăng ký!')
    })
})

describe('Chức năng Đăng Nhập', () => {
    test('Đăng nhập thất bại khi SĐT không tồn tại', async () => {
    const { supabase } = require('../lib/supabase')
    supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: null, error: {} }),
    })

    const result = await dangNhap('0999999999', 'satkhau')
    expect(result.error).toBe('Số điện thoại không tồn tại!')
    })

    test('Đăng nhập thất bại khi sai mật khẩu', async () => {
    const bcrypt = require('bcryptjs')
    const { supabase } = require('../lib/supabase')

    const hashedPw = await bcrypt.hash('matkhau_dung', 10)
    supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ 
        data: { id: '123', phone: '0901234567', password_hash: hashedPw }, 
        error: null 
        }),
    })

    const result = await dangNhap('0901234567', 'matkhau_sai')
    expect(result.error).toBe('Mật khẩu không đúng!')
    })

    test('Đăng nhập thành công với đúng SĐT và mật khẩu', async () => {
    const bcrypt = require('bcryptjs')
    const { supabase } = require('../lib/supabase')

    const hashedPw = await bcrypt.hash('matkhau123', 10)
    supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ 
        data: { id: '123', phone: '0901234567', password_hash: hashedPw }, 
        error: null 
        }),
    })

    const result = await dangNhap('0901234567', 'matkhau123')
    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()
    })
})