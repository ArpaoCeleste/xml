function setupFormAtualizar() {
    const selectReserva = document.getElementById('select-reserva-put');
    const form = document.getElementById('form-atualizar-reserva');

    if (!selectReserva || !form) return;

    selectReserva.addEventListener('change', async function () {
        const numeroReserva = this.value;

        if (!numeroReserva) {
            form.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/reservas/${numeroReserva}`);
            const data = await response.json();

            if (response.ok && data.sucesso) {
                const reserva = data.dados;

                document.getElementById('edit-id-reserva').value = reserva.numeroReserva;
                document.getElementById('edit-unidade').value = reserva.unidade || '';
                document.getElementById('edit-nome').value = reserva.hospede?.nome || '';
                document.getElementById('edit-id-cliente').value = reserva.hospede?.numeroCliente || '';
                document.getElementById('edit-quarto').value = reserva.quarto || '';
                document.getElementById('edit-valor').value = reserva.valorTotal || 0;
                document.getElementById('edit-checkin').value = reserva.checkIn || '';
                document.getElementById('edit-checkout').value = reserva.checkOut || '';

                ['spa', 'restaurante', 'transporte', 'outros'].forEach(tipo => {
                    const cb = document.getElementById(`edit-check-${tipo}`);
                    if (cb) {
                        cb.checked = false;
                        const container = cb.closest('.service-item-container');
                        if (container) container.classList.remove('service-item-active');
                    }
                    document.getElementById(`edit-qtd-${tipo}`).value = '';
                    document.getElementById(`edit-price-${tipo}`).value = '';
                });

                if (reserva.servicosAdicionais && Array.isArray(reserva.servicosAdicionais)) {
                    reserva.servicosAdicionais.forEach(servico => {
                        const checkbox = document.getElementById(`edit-check-${servico.tipo}`);
                        const qtdInput = document.getElementById(`edit-qtd-${servico.tipo}`);
                        const priceInput = document.getElementById(`edit-price-${servico.tipo}`);

                        if (checkbox) {
                            checkbox.checked = true;
                            const container = checkbox.closest('.service-item-container');
                            if (container) container.classList.add('service-item-active');
                        }
                        if (qtdInput) qtdInput.value = servico.quantidade;
                        if (priceInput) priceInput.value = servico.preco;
                    });
                }

                form.style.display = 'block';


                const idClienteInput = document.getElementById('edit-id-cliente');
                if (idClienteInput) {
                    let msgErro = idClienteInput.parentNode.querySelector('.hint');
                    if (!msgErro) {
                        msgErro = document.createElement('small');
                        msgErro.className = 'hint';
                        msgErro.innerHTML = 'Formato: CLIxxx';
                        idClienteInput.parentNode.appendChild(msgErro);
                    } else {
                        msgErro.innerHTML = 'Formato: CLIxxx';
                        msgErro.style.color = 'var(--text-secondary)';
                        idClienteInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }

                    const newIdClienteInput = idClienteInput.cloneNode(true);
                    idClienteInput.parentNode.replaceChild(newIdClienteInput, idClienteInput);

                    const currentIdClienteInput = document.getElementById('edit-id-cliente');

                    currentIdClienteInput.addEventListener('blur', () => {
                        const val = currentIdClienteInput.value.trim();
                        const currentMsg = currentIdClienteInput.parentNode.querySelector('.hint');

                        if (!val) {
                            currentMsg.innerHTML = 'Formato: CLIxxx';
                            currentMsg.style.color = 'var(--text-secondary)';
                            currentIdClienteInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            return;
                        }

                        const regex = /^CLI\d{3}$/;
                        if (!regex.test(val)) {
                            currentIdClienteInput.style.borderColor = 'var(--accent-primary)';
                            currentMsg.style.color = 'var(--accent-primary)';
                            currentMsg.innerHTML = '<i class="fas fa-times-circle"></i> Inválido! Usa CLIxxx';
                        } else {
                            currentIdClienteInput.style.borderColor = '#4ade80';
                            currentMsg.style.color = '#4ade80';
                            currentMsg.innerHTML = '<i class="fas fa-check-circle"></i> Formato válido';
                        }
                    });

                    currentIdClienteInput.addEventListener('input', () => {
                        const currentMsg = currentIdClienteInput.parentNode.querySelector('.hint');
                        if (!currentIdClienteInput.value.trim()) {
                            currentMsg.innerHTML = 'Formato: CLIxxx';
                            currentIdClienteInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            currentMsg.style.color = 'var(--text-secondary)';
                        } else {
                            currentMsg.innerHTML = '&nbsp;';
                        }
                    });
                }

            }
        } catch (error) {
            Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível carregar os dados da reserva.'
            });
        }
    });

    ['spa', 'restaurante', 'transporte', 'outros'].forEach(tipo => {
        const checkbox = document.getElementById(`edit-check-${tipo}`);
        if (checkbox) {
            checkbox.addEventListener('change', function () {
                const container = this.closest('.service-item-container');
                if (container) {
                    if (this.checked) container.classList.add('service-item-active');
                    else container.classList.remove('service-item-active');
                }
            });
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const numeroReserva = document.getElementById('edit-id-reserva').value;

        const checkIn = document.getElementById('edit-checkin').value;
        const checkOut = document.getElementById('edit-checkout').value;

        if (new Date(checkIn) >= new Date(checkOut)) {
            Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Datas Inválidas',
                text: 'O check-in deve ser antes do check-out!'
            });
            return;
        }

        Swal.fire({
            ...swalConfig,
            title: 'A atualizar reserva...',
            html: 'Por favor aguarda.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const servicos = [];
        ['spa', 'restaurante', 'transporte', 'outros'].forEach(tipo => {
            const checkbox = document.getElementById(`edit-check-${tipo}`);
            if (checkbox && checkbox.checked) {
                const qtd = parseInt(document.getElementById(`edit-qtd-${tipo}`).value) || 1;
                const price = parseFloat(document.getElementById(`edit-price-${tipo}`).value) || 0;
                servicos.push({ tipo, quantidade: qtd, preco: price });
            }
        });

        if (servicos.length > 4) {
            Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Limite Excedido',
                text: 'Máximo de 4 serviços permitidos!'
            });
            return;
        }

        const data = {
            unidade: document.getElementById('edit-unidade').value,
            valorTotal: parseFloat(document.getElementById('edit-valor').value),
            quarto: document.getElementById('edit-quarto').value,
            checkIn: checkIn,
            checkOut: checkOut,
            hospede: {
                numeroCliente: document.getElementById('edit-id-cliente').value,
                nome: document.getElementById('edit-nome').value
            },
            servicosAdicionais: servicos
        };

        try {
            const response = await fetch(`${API_URL}/api/reservas/${numeroReserva}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const resData = await response.json();

            if (response.ok) {
                Swal.fire({
                    ...swalConfig,
                    icon: 'success',
                    title: 'Atualizado!',
                    text: 'A reserva foi atualizada com sucesso.',
                    timer: 2000
                });

                carregarEstatisticas();
                form.reset();
                form.style.display = 'none';
                selectReserva.value = '';
            } else {
                Swal.fire({
                    ...swalConfig,
                    icon: 'error',
                    title: 'Erro',
                    text: resData.erro || 'Erro ao atualizar reserva'
                });
            }
        } catch (error) {
            Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Erro',
                text: error.message
            });
        }
    });
}

setupFormAtualizar();
