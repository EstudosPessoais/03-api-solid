import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { Environment } from 'vitest'
import { PrismaClient } from '@prisma/client'

// postgresql://docker:dcoker@localhost:5432/apisolid?schema=public
const prisma = new PrismaClient()

function generateDabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable')
  }

  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schema)

  return url.toString()
}

const prismaEnvironment: Environment = {
  name: 'prisma',
  transformMode: 'ssr', // ou 'web', dependendo do seu caso
  async setup() {
    const schema = randomUUID()
    const databaseURL = generateDabaseUrl(schema)

    process.env.DATABASE_URL = databaseURL

    execSync('npx prisma migrate deploy')

    console.log('Setup')
    return {
      async teardown() {
        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        )

        await prisma.$disconnect()
      },
    }
  },
}

export default prismaEnvironment
