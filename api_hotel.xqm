(:~
 : REST API para o sistema de gestão de reservas do hotel
 : Usar com BaseX HTTP Server
 :)

module namespace api = "http://hotel.com/api";

(:~
 : Endpoint 1: GET /api/reservas/hospede/{numeroCliente}
 : Retorna todas as reservas de um hóspede específico
 :)
declare
  %rest:GET
  %rest:path("/api/reservas/hospede/{$numeroCliente}")
  %rest:produces("application/xml", "text/xml")
function api:reservas-hospede($numeroCliente as xs:string) {
  let $reservas := doc("reservas.xml")//reserva[hospede/numeroCliente = $numeroCliente]
  return
    <resultado>
      <hospede>{$numeroCliente}</hospede>
      <totalReservas>{count($reservas)}</totalReservas>
      <reservas>
      {
        for $reserva in $reservas
        return
          <reserva numero="{$reserva/@numeroReserva}">
            <nome>{$reserva/hospede/nome/text()}</nome>
            <unidade>{$reserva/unidade/text()}</unidade>
            <checkIn>{$reserva/checkIn/text()}</checkIn>
            <checkOut>{$reserva/checkOut/text()}</checkOut>
            <valorTotal>{$reserva/valorTotal/text()}</valorTotal>
            <servicosAdicionais>
            {
              for $servico in $reserva/servicosAdicionais/servicoAdicional
              return
                <servico>
                  <tipo>{$servico/tipo/text()}</tipo>
                  <nome>{$servico/nome/text()}</nome>
                  <preco>{$servico/preco/text()}</preco>
                  <quantidade>{$servico/quantidade/text()}</quantidade>
                </servico>
            }
            </servicosAdicionais>
          </reserva>
      }
      </reservas>
    </resultado>
};

(:~
 : Endpoint 2: GET /api/reservas/unidade
 : Retorna a quantidade de reservas por unidade
 :)
declare
  %rest:GET
  %rest:path("/api/reservas/unidade")
  %rest:produces("application/xml", "text/xml")
function api:reservas-por-unidade() {
  let $reservas := doc("reservas.xml")//reserva
  return
    <resultado>
      <totalGeral>{count($reservas)}</totalGeral>
      <unidades>
      {
        for $unidade in distinct-values($reservas/unidade)
        let $quantidade := count($reservas[unidade = $unidade])
        order by $unidade
        return
          <unidade codigo="{$unidade}">
            <nome>
            {
              switch($unidade)
                case "LS" return "Lisboa"
                case "PO" return "Porto"
                case "CB" return "Coimbra"
                case "FR" return "Faro"
                case "BR" return "Braga"
                default return "Desconhecida"
            }
            </nome>
            <quantidade>{$quantidade}</quantidade>
          </unidade>
      }
      </unidades>
    </resultado>
};

(:~
 : Endpoint 3: GET /api/servicos/total
 : Retorna o total de serviços adicionais vendidos
 :)
declare
  %rest:GET
  %rest:path("/api/servicos/total")
  %rest:produces("application/xml", "text/xml")
function api:total-servicos() {
  let $servicos := doc("reservas.xml")//servicoAdicional
  return
    <resultado>
      <totalServicos>{count($servicos)}</totalServicos>
      <totalQuantidade>{sum($servicos/quantidade)}</totalQuantidade>
      <valorTotal>{sum($servicos/preco * $servicos/quantidade)}</valorTotal>
      <servicosPorTipo>
      {
        for $tipo in distinct-values($servicos/tipo)
        let $servicosDoTipo := $servicos[tipo = $tipo]
        let $quantidadeTotal := sum($servicosDoTipo/quantidade)
        let $valorTotal := sum($servicosDoTipo/preco * $servicosDoTipo/quantidade)
        order by $quantidadeTotal descending
        return
          <tipo nome="{$tipo}">
            <quantidade>{$quantidadeTotal}</quantidade>
            <valor>{$valorTotal}</valor>
          </tipo>
      }
      </servicosPorTipo>
    </resultado>
};

(:~
 : Endpoint Extra: GET /api/reservas
 : Retorna todas as reservas
 :)
declare
  %rest:GET
  %rest:path("/api/reservas")
  %rest:produces("application/xml", "text/xml")
function api:todas-reservas() {
  doc("reservas.xml")//reservas
};
