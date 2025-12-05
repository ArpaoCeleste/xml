(: 
  Query 2: Apresentar a quantidade de reservas por unidade
:)

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
