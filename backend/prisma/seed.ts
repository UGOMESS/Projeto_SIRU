// backend/prisma/seed.ts

import { PrismaClient, Role, Unit } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando a semeadura do banco (Seeding)...')

  // 1. Limpar dados antigos (opcional, mas bom para garantir)
  await prisma.requestItem.deleteMany()
  await prisma.request.deleteMany()
  await prisma.wasteLog.deleteMany()
  await prisma.reagent.deleteMany()
  await prisma.user.deleteMany()

  // 2. Criar Hash das senhas
  const passwordAdmin = await bcrypt.hash('admin123', 6)
  const passwordResearcher = await bcrypt.hash('123456', 6)

  // 3. Criar Usuário ADMIN
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador Principal',
      email: 'admin@unilab.br',
      password: passwordAdmin,
      role: Role.ADMIN,
    }
  })

  // 4. Criar Usuário PESQUISADOR
  const researcher = await prisma.user.create({
    data: {
      name: 'Pesquisador Silva',
      email: 'silva@unilab.br',
      password: passwordResearcher,
      role: Role.RESEARCHER,
    }
  })

  // 5. Criar um Reagente de Exemplo (para não ficar tudo vazio)
  await prisma.reagent.create({
    data: {
      name: 'Ácido Sulfúrico',
      category: 'Ácido',
      quantity: 500,
      unit: Unit.ML, // Usando o Enum do Prisma
      minQuantity: 50,
      expirationDate: new Date('2025-12-31'),
      isControlled: true,
      location: 'Armário de Corrosivos',
      formula: 'H2SO4',
      casNumber: '7664-93-9'
    }
  })

  console.log(`✅ Banco populado com sucesso!`)
  console.log(`👤 Admin: admin@unilab.br (senha: admin123)`)
  console.log(`👤 User: silva@unilab.br (senha: 123456)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })