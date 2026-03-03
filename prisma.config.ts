import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Debug: check if URL is loaded
console.log('Loading DATABASE_URL:', process.env.DATABASE_URL ? '✅ Found' : '❌ Not Found')


export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
