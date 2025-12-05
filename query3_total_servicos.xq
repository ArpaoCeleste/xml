(: 
  Query 3: Apresentar o total de serviços adicionais vendidos em todas as unidades
:)

let $servicos := doc("reservas.xml")//servicoAdicional

return
  <resultado>
    <totalServicos>{count($servicos)}</totalServicos>
    <totalQuantidade>{sum($servicos/quantidade)}</totalQuantidade>
    <valorTotal>{sum(for $s in $servicos return $s/preco * $s/quantidade)}</valorTotal>
    <servicosPorTipo>
    {
      for $tipo in distinct-values($servicos/tipo)
      let $servicosDoTipo := $servicos[tipo = $tipo]
      let $quantidadeTotal := sum($servicosDoTipo/quantidade)
      let $valorTotal := sum(for $s in $servicosDoTipo return $s/preco * $s/quantidade)
      order by $quantidadeTotal descending
      return
        <tipo nome="{$tipo}">
          <quantidade>{$quantidadeTotal}</quantidade>
          <valor>{$valorTotal}</valor>
          <servicos>
          {
            for $servico in $servicosDoTipo
            return
              <servico>
                <nome>{$servico/nome/text()}</nome>
                <preco>{$servico/preco/text()}</preco>
                <quantidade>{$servico/quantidade/text()}</quantidade>
              </servico>
          }
          </servicos>
        </tipo>
    }
    </servicosPorTipo>
  </resultado>
