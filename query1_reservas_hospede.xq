(: 
  Query 1: Apresentar as reservas de um dado hóspede
  Parâmetro: numeroCliente (ex: CLI123)
:)

declare variable $numeroCliente as xs:string external := "CLI123";

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
