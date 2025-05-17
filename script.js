document.addEventListener('DOMContentLoaded', function () {
    const listaMesas = document.querySelector('.listaordenadamesas.contarMesa');
    const listaPedidos = document.querySelector('.listaordenadamesas.esquerda');
    const listaValores = document.querySelector('.listaordenadamesas.valorProduto');
    const btnAdd = document.querySelector('.add');
    const btnRem = document.querySelector('.rem');
    const btnEdit = document.querySelector('.edit');
    const btnOpcoes = document.querySelector('.opcoes');
    const botoesPedidos = document.querySelector('.botoesPedidos');
    const btnFechar = document.querySelector('.fechar');
    const btnFinalizarMesa = document.querySelector('.finalizarMesa');
    const btnAdicionarMesaManual = document.querySelector('.adicionarMesaManual');
    const modalAdicionarMesa = document.getElementById('modalAdicionarMesa');
    const inputNomeMesaManual = document.getElementById('nomeMesaManual');
    const btnSalvarMesaManual = document.getElementById('btnSalvarMesaManual');
    const btnCancelarMesaManual = document.getElementById('btnCancelarMesaManual');
    const btnFormaPagamento = document.getElementById('btnFormaPagamento');
    const modalPagamento = document.getElementById('modalPagamento');
    const btnCancelarPagamento = document.getElementById('btnCancelarPagamento');

    // Agora cada mesa tem um nome/numero e seus pedidos
    let mesas = []; // Exemplo: [{nome: "1", pedidos: []}, {nome: "12", pedidos: []}, {nome: "24", pedidos: []}]
    let mesaAtual = -1;
    let pedidosRemovidos = [];
    let btnRestaurarPedido = null;
    let ultimaMesaRemovida = null;
    let btnRestaurarMesa = null;
    let formaPagamentoSelecionada = '';

    function renderizarMesas() {
        listaMesas.innerHTML = '';
        mesas.forEach((mesa, idx) => {
            const li = document.createElement('li');
            li.textContent = `Mesa ${mesa.nome}`;
            li.classList.toggle('selected', idx === mesaAtual);
            li.style.cursor = 'pointer';
            li.onclick = function () {
                mesaAtual = idx;
                renderizarMesas();
                renderizarPedidos();
            };
            listaMesas.appendChild(li);
        });
    }

    function renderizarPedidos() {
        listaPedidos.innerHTML = '';
        listaValores.innerHTML = '';
        if (mesaAtual < 0 || !mesas[mesaAtual]) return;
        const pedidos = mesas[mesaAtual].pedidos;
        let soma = 0;
        pedidos.forEach(pedido => {
            const li = document.createElement('li');
            li.textContent = pedido;
            listaPedidos.appendChild(li);

            // Extrai valor do texto do pedido
            const match = pedido.match(/R\$\s?([\d,.]+)/);
            if (match) {
                const valor = parseFloat(match[1].replace(',', '.'));
                soma += valor;
                const liValor = document.createElement('li');
                liValor.textContent = `R$${valor.toFixed(2).replace('.', ',')}`;
                listaValores.appendChild(liValor);
            }
        });
        if (pedidos.length > 0) {
            const separador = document.createElement('li');
            separador.className = 'separador-total';
            listaValores.appendChild(separador);
        }
        const liSoma = document.createElement('li');
        liSoma.className = 'total-final';
        liSoma.textContent = `Total: R$${soma.toFixed(2).replace('.', ',')}`;
        listaValores.appendChild(liSoma);
    }

    // Adicionar mesa manualmente
    btnAdicionarMesaManual.addEventListener('click', () => {
        inputNomeMesaManual.value = '';
        modalAdicionarMesa.style.display = 'flex';
        inputNomeMesaManual.focus();
    });
    btnSalvarMesaManual.addEventListener('click', () => {
        const nome = inputNomeMesaManual.value.trim();
        if (nome && !mesas.some(m => m.nome === nome)) {
            mesas.push({ nome, pedidos: [] });
            mesaAtual = mesas.length - 1;
            renderizarMesas();
            renderizarPedidos();
        }
        modalAdicionarMesa.style.display = 'none';
    });
    btnCancelarMesaManual.addEventListener('click', () => {
        modalAdicionarMesa.style.display = 'none';
    });

    // Botão Opções e Fechar
    btnOpcoes.addEventListener('click', function () {
        btnOpcoes.style.display = 'none';
        botoesPedidos.style.display = 'flex';
    });
    btnFechar.addEventListener('click', function () {
        botoesPedidos.style.display = 'none';
        btnOpcoes.style.display = 'inline-block';
    });

    // Adicionar pedido
    btnAdd.addEventListener('click', function () {
        if (mesaAtual < 0) return;
        const modalAdicionar = document.getElementById('modalAdicionar');
        const inputAdicionar = document.getElementById('novoPedidoAdicionar');
        modalAdicionar.style.display = 'flex';
        inputAdicionar.value = '';
        inputAdicionar.focus();

        document.getElementById('btnSalvarAdicionar').onclick = () => {
            let pedido = inputAdicionar.value.trim();
            if (pedido) {
                // Regex para separar nome e valor (ex: "Espeto Queijo 9" ou "Coca-Cola 6.5")
                const match = pedido.match(/^(.+?)\s+(\d+(?:[.,]\d{1,2})?)$/);
                if (match) {
                    let nome = match[1].trim();
                    let valor = match[2].replace(',', '.');
                    valor = parseFloat(valor).toFixed(2).replace('.', ',');
                    pedido = `${nome}(R$${valor})`;
                }
                mesas[mesaAtual].pedidos.push(pedido);
                renderizarPedidos();
            }
            modalAdicionar.style.display = 'none';
        };
        document.getElementById('btnCancelarAdicionar').onclick = () => {
            modalAdicionar.style.display = 'none';
        };
    });

    // Remover pedido
    btnRem.addEventListener('click', function () {
        if (mesaAtual < 0) return;
        const pedidos = mesas[mesaAtual].pedidos;
        if (pedidos.length > 0) {
            pedidosRemovidos.push(pedidos.pop());
            renderizarPedidos();
            mostrarBotaoRestaurarPedido();
        }
    });

    function mostrarBotaoRestaurarPedido() {
        if (btnRestaurarPedido) btnRestaurarPedido.remove();
        btnRestaurarPedido = document.createElement('button');
        btnRestaurarPedido.textContent = 'Restaurar pedido';
        btnRestaurarPedido.className = 'restaurar show';
        botoesPedidos.appendChild(btnRestaurarPedido);

        btnRestaurarPedido.onclick = () => {
            if (mesaAtual < 0 || pedidosRemovidos.length === 0) return;
            mesas[mesaAtual].pedidos.push(pedidosRemovidos.pop());
            renderizarPedidos();
            if (pedidosRemovidos.length === 0) {
                btnRestaurarPedido.remove();
            }
        };

        setTimeout(() => {
            if (btnRestaurarPedido) btnRestaurarPedido.classList.add('fade-out');
            setTimeout(() => {
                if (btnRestaurarPedido) btnRestaurarPedido.remove();
                btnRestaurarPedido = null;
                pedidosRemovidos = [];
            }, 500);
        }, 10000);
    }

    // Editar pedido
    btnEdit.addEventListener('click', function () {
        if (mesaAtual < 0) return;
        const pedidos = mesas[mesaAtual].pedidos;
        if (pedidos.length === 0) return;
        const select = document.getElementById('selectPedido');
        select.innerHTML = '';
        pedidos.forEach((pedido, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = pedido;
            select.appendChild(opt);
        });
        const input = document.getElementById('novoPedido');
        input.value = pedidos[0];
        const modal = document.getElementById('modalEditar');
        modal.style.display = 'flex';

        select.onchange = () => {
            input.value = pedidos[select.value];
        };

        document.getElementById('btnSalvarEdicao').onclick = () => {
            const idx = parseInt(select.value);
            const novoPedido = input.value.trim();
            if (novoPedido) {
                pedidos[idx] = novoPedido;
                renderizarPedidos();
            }
            modal.style.display = 'none';
        };
        document.getElementById('btnExcluirPedido').onclick = () => {
            const idx = parseInt(select.value);
            pedidos.splice(idx, 1);
            renderizarPedidos();
            modal.style.display = 'none';
        };
        document.getElementById('btnCancelarEdicao').onclick = () => {
            modal.style.display = 'none';
        };
    });

    // Finalizar mesa
    btnFinalizarMesa.addEventListener('click', function () {
        if (mesaAtual < 0) return;
        ultimaMesaRemovida = {
            mesa: mesas[mesaAtual],
            idx: mesaAtual
        };
        mesas.splice(mesaAtual, 1);
        mesaAtual = -1;
        renderizarMesas();
        renderizarPedidos();
        mostrarBotaoRestaurarMesa();
    });

    function mostrarBotaoRestaurarMesa() {
        if (btnRestaurarMesa) btnRestaurarMesa.remove();
        btnRestaurarMesa = document.createElement('button');
        btnRestaurarMesa.textContent = 'Restaurar mesa';
        btnRestaurarMesa.className = 'restaurar-mesa';
        btnFinalizarMesa.parentNode.insertBefore(btnRestaurarMesa, btnFinalizarMesa.nextSibling);

        btnRestaurarMesa.onclick = () => {
            if (!ultimaMesaRemovida) return;
            mesas.splice(ultimaMesaRemovida.idx, 0, ultimaMesaRemovida.mesa);
            mesaAtual = ultimaMesaRemovida.idx;
            ultimaMesaRemovida = null;
            renderizarMesas();
            renderizarPedidos();
            btnRestaurarMesa.remove();
        };

        setTimeout(() => {
            if (btnRestaurarMesa) btnRestaurarMesa.classList.add('fade-out');
            setTimeout(() => {
                if (btnRestaurarMesa) btnRestaurarMesa.remove();
                btnRestaurarMesa = null;
                ultimaMesaRemovida = null;
            }, 500);
        }, 15000);
    }

    // Forma de pagamento


    btnFormaPagamento.addEventListener('click', () => {
        modalPagamento.style.display = 'flex';
    });

    btnCancelarPagamento.addEventListener('click', () => {
        modalPagamento.style.display = 'none';
    });

    // Ao clicar em uma opção de pagamento
    document.querySelectorAll('.pag-opcao').forEach(btn => {
        btn.addEventListener('click', function () {
            formaPagamentoSelecionada = this.dataset.pag;
            btnFormaPagamento.textContent = `Pagamento: ${formaPagamentoSelecionada}`;
            modalPagamento.style.display = 'none';
        });
    });

    // Inicialização
    renderizarMesas();
    renderizarPedidos();
});