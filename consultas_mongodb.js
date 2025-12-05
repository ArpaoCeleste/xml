// ========================================
// CONSULTAS MONGODB - SISTEMA DE RESERVAS
// ========================================

// NOTA: Executar estas consultas no MongoDB Compass, Shell ou Atlas

// ========================================
// 1. NÚMERO TOTAL DE SERVIÇOS VENDIDOS POR TIPO
// ========================================

db.reservas.aggregate([
  {
    $unwind: "$servicosAdicionais"
  },
  {
    $group: {
      _id: "$servicosAdicionais.tipo",
      totalServicos: { $sum: 1 },
      quantidadeTotal: { $sum: "$servicosAdicionais.quantidade" },
      valorTotal: { 
        $sum: { 
          $multiply: ["$servicosAdicionais.preco", "$servicosAdicionais.quantidade"] 
        } 
      }
    }
  },
  {
    $sort: { quantidadeTotal: -1 }
  },
  {
    $project: {
      _id: 0,
      tipo: "$_id",
      totalServicos: 1,
      quantidadeTotal: 1,
      valorTotal: { $round: ["$valorTotal", 2] }
    }
  }
])

// ========================================
// 2. QUANTIDADE DE RESERVAS POR UNIDADE
// ========================================

db.reservas.aggregate([
  {
    $group: {
      _id: "$unidade",
      quantidadeReservas: { $count: {} },
      valorTotalReservas: { $sum: "$valorTotal" }
    }
  },
  {
    $sort: { quantidadeReservas: -1 }
  },
  {
    $project: {
      _id: 0,
      unidade: "$_id",
      nomeUnidade: {
        $switch: {
          branches: [
            { case: { $eq: ["$_id", "LS"] }, then: "Lisboa" },
            { case: { $eq: ["$_id", "PO"] }, then: "Porto" },
            { case: { $eq: ["$_id", "CB"] }, then: "Coimbra" },
            { case: { $eq: ["$_id", "FR"] }, then: "Faro" },
            { case: { $eq: ["$_id", "BR"] }, then: "Braga" }
          ],
          default: "Desconhecida"
        }
      },
      quantidadeReservas: 1,
      valorTotalReservas: { $round: ["$valorTotalReservas", 2] }
    }
  }
])

// ========================================
// 3. VALOR MÉDIO DAS RESERVAS
// ========================================

db.reservas.aggregate([
  {
    $group: {
      _id: null,
      valorMedio: { $avg: "$valorTotal" },
      totalReservas: { $sum: 1 },
      valorTotalGeral: { $sum: "$valorTotal" }
    }
  },
  {
    $project: {
      _id: 0,
      valorMedio: { $round: ["$valorMedio", 2] },
      totalReservas: 1,
      valorTotalGeral: { $round: ["$valorTotalGeral", 2] }
    }
  }
])

// ========================================
// 4. MAIOR VALOR DE RESERVA
// ========================================

db.reservas.find().sort({ valorTotal: -1 }).limit(1)

// OU com mais detalhes:

db.reservas.aggregate([
  {
    $sort: { valorTotal: -1 }
  },
  {
    $limit: 1
  },
  {
    $project: {
      _id: 0,
      numeroReserva: 1,
      "hospede.nome": 1,
      "hospede.numeroCliente": 1,
      unidade: 1,
      checkIn: 1,
      checkOut: 1,
      valorTotal: 1,
      totalServicos: { $size: "$servicosAdicionais" }
    }
  }
])

// ========================================
// 5. TODOS OS DADOS DE UMA RESERVA ESPECÍFICA
// ========================================

// Por número de reserva:
db.reservas.findOne({ numeroReserva: "R001" })

// OU com filtro mais completo:
db.reservas.find({ numeroReserva: "R001" }).pretty()

// Por cliente:
db.reservas.find({ "hospede.numeroCliente": "CLI123" })

// ========================================
// CONSULTAS ADICIONAIS ÚTEIS
// ========================================

// Total de serviços adicionais vendidos (todas as unidades):
db.reservas.aggregate([
  {
    $unwind: "$servicosAdicionais"
  },
  {
    $group: {
      _id: null,
      totalServicos: { $sum: 1 },
      quantidadeTotal: { $sum: "$servicosAdicionais.quantidade" },
      valorTotal: { 
        $sum: { 
          $multiply: ["$servicosAdicionais.preco", "$servicosAdicionais.quantidade"] 
        } 
      }
    }
  },
  {
    $project: {
      _id: 0,
      totalServicos: 1,
      quantidadeTotal: 1,
      valorTotal: { $round: ["$valorTotal", 2] }
    }
  }
])

// Listar todas as reservas com contagem de serviços:
db.reservas.aggregate([
  {
    $project: {
      numeroReserva: 1,
      "hospede.nome": 1,
      unidade: 1,
      valorTotal: 1,
      totalServicos: { $size: "$servicosAdicionais" }
    }
  }
])

// Estatísticas gerais:
db.reservas.aggregate([
  {
    $facet: {
      totalReservas: [{ $count: "total" }],
      valorMedio: [{ $group: { _id: null, media: { $avg: "$valorTotal" } } }],
      maiorValor: [{ $sort: { valorTotal: -1 } }, { $limit: 1 }, { $project: { valorTotal: 1 } }],
      menorValor: [{ $sort: { valorTotal: 1 } }, { $limit: 1 }, { $project: { valorTotal: 1 } }]
    }
  }
])
