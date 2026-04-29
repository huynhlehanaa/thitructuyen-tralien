import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Polyfill fetch API cho Jest
const { ReadableStream } = require('stream/web')
global.ReadableStream = ReadableStream