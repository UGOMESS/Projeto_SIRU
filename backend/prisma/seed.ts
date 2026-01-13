import { PrismaClient, Role, Unit } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando a semeadura do banco (Seeding) com dados reais UNILAB...')

  // 1. Limpar dados antigos (Ordem correta para evitar erro de Foreign Key)
  await prisma.wasteLog.deleteMany()
  await prisma.wasteContainer.deleteMany()
  await prisma.requestItem.deleteMany()
  await prisma.request.deleteMany()
  await prisma.reagent.deleteMany()
  await prisma.user.deleteMany()

  // 2. Criar Hash das senhas
  const passwordAdmin = await bcrypt.hash('admin123', 6)
  const passwordResearcher = await bcrypt.hash('123456', 6)

  // 3. Criar Usuários
  const admin = await prisma.user.create({
    data: {
      name: 'Coordenador de Laboratório',
      email: 'admin@unilab.br',
      password: passwordAdmin,
      role: Role.ADMIN,
    }
  })

  const researcher = await prisma.user.create({
    data: {
      name: 'Pesquisador Silva',
      email: 'silva@unilab.br',
      password: passwordResearcher,
      role: Role.RESEARCHER,
    }
  })

  // 4. Criar Bombonas (Waste Containers)
  console.log('📦 Criando bombonas para resíduos...')
  await prisma.wasteContainer.createMany({
    data: [
      {
        identifier: 'BOM-01-AC',
        type: 'Ácidos Inorgânicos',
        capacity: 20.0,
        currentVolume: 5.2,
        location: 'Abrigo de Resíduos - Bloco A',
        isActive: true
      },
      {
        identifier: 'BOM-02-ORG',
        type: 'Solventes Orgânicos',
        capacity: 10.0,
        currentVolume: 2.0,
        location: 'Laboratório de Química Orgânica',
        isActive: true
      }
    ]
  })

  // 5. Criar Reagentes Reais (Estoque)
  console.log('🧪 Cadastrando reagentes de teste...')
  const reagents = [
    {
      name: 'Ácido Sulfúrico 98%',
      category: 'Ácido Corrosivo',
      quantity: 1000,
      unit: Unit.ML,
      minQuantity: 200,
      expirationDate: new Date('2026-06-30'),
      isControlled: true, // PF
      location: 'Armário de Corrosivos A1',
      formula: 'H2SO4',
      casNumber: '7664-93-9'
    },
    {
      name: 'Hidróxido de Sódio Pa',
      category: 'Base Forte',
      quantity: 500,
      unit: Unit.G,
      minQuantity: 100,
      expirationDate: new Date('2027-12-31'),
      isControlled: false,
      location: 'Prateleira de Sólidos B2',
      formula: 'NaOH',
      casNumber: '1310-73-2'
    },
    {
      name: 'Acetona Pa',
      category: 'Solvente Inflamável',
      quantity: 5000,
      unit: Unit.ML,
      minQuantity: 1000,
      expirationDate: new Date('2025-10-15'),
      isControlled: true, // PF / Exército
      location: 'Almoxarifado de Inflamáveis',
      formula: 'C3H6O',
      casNumber: '67-64-1'
    },
    {
      name: 'Cloreto de Sódio Pa',
      category: 'Sal',
      quantity: 1000,
      unit: Unit.G,
      minQuantity: 100,
      expirationDate: new Date('2029-01-01'),
      isControlled: false,
      location: 'Bancada Geral',
      formula: 'NaCl',
      casNumber: '7647-14-5'
    }
  ]

  for (const reagent of reagents) {
    await prisma.reagent.create({ data: reagent })
  }

  console.log(`✅ Banco populado com sucesso!`)
  console.log(`👤 Admin: admin@unilab.br / admin123`)
  console.log(`👤 Pesquisador: silva@unilab.br / 123456`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })