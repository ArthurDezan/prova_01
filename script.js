const API_URL = 'http://localhost:3000';

function mudarAba(aba) {
    document.getElementById('secao-produtos').classList.add('escondido');
    document.getElementById('secao-historico').classList.add('escondido');
    document.getElementById('tab-produtos').classList.remove('ativo');
    document.getElementById('tab-historico').classList.remove('ativo');

    document.getElementById(`secao-${aba}`).classList.remove('escondido');
    document.getElementById(`tab-${aba}`).classList.add('ativo');
}

async function fazerLogin() {
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    try {
        const resposta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });
        
        if (resposta.ok) {
            document.getElementById('tela-login').classList.add('escondido');
            document.getElementById('tela-produtos').classList.remove('escondido');
            mudarAba('produtos'); 
            carregarDados(); 
        } else {
            alert('Acesso negado: Usuário ou senha incorretos!');
        }
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

function sair() {
    document.getElementById('tela-login').classList.remove('escondido');
    document.getElementById('tela-produtos').classList.add('escondido');
    document.getElementById('usuario').value = '';
    document.getElementById('senha').value = '';
}

function abrirModalProduto() {
    document.getElementById('modal-titulo').innerHTML = 'Novo Produto';
    document.getElementById('produto-id').value = '';
    document.getElementById('prod-nome').value = '';
    document.getElementById('prod-preco').value = '';
    document.getElementById('prod-qtd').value = '';
    document.getElementById('prod-min').value = '';
    document.getElementById('modal-produto').classList.remove('escondido');
}

function prepararEdicao(id, nome, preco, qtd, qtd_min) {
    document.getElementById('modal-titulo').innerHTML = 'Editar Produto';
    document.getElementById('produto-id').value = id;
    document.getElementById('prod-nome').value = nome;
    document.getElementById('prod-preco').value = preco;
    document.getElementById('prod-qtd').value = qtd;
    document.getElementById('prod-min').value = qtd_min;
    document.getElementById('modal-produto').classList.remove('escondido');
}

function abrirModalMovimentacao() {
    document.getElementById('mov-qtd').value = 1;
    document.getElementById('modal-movimentacao').classList.remove('escondido');
}

function fecharModais() {
    document.getElementById('modal-produto').classList.add('escondido');
    document.getElementById('modal-movimentacao').classList.add('escondido');
}

function ordenarPorNome(array) {
    let trocou;
    do {
        trocou = false;
        for (let i = 0; i < array.length - 1; i++) {
            if (array[i].nome.toLowerCase() > array[i + 1].nome.toLowerCase()) {
                let temp = array[i];
                array[i] = array[i + 1];
                array[i + 1] = temp;
                trocou = true;
            }
        }
    } while (trocou);
    return array;
}

async function carregarDados() {
    await carregarProdutos();
    await carregarHistorico();
}

async function carregarProdutos() {
    try {
        const resposta = await fetch(`${API_URL}/produtos`);
        let produtos = await resposta.json();
        
        produtos = ordenarPorNome(produtos);

        const tbody = document.getElementById('tabela-corpo');
        const selectMov = document.getElementById('mov-produto');
        tbody.innerHTML = ''; 
        selectMov.innerHTML = '';
        
        let contadorVisual = 1;

        produtos.forEach(prod => {
            const baixoEstoque = prod.quantidade < prod.quantidade_minima;
            const classeLinha = baixoEstoque ? 'alerta-vermelho' : '';
            const statusHTML = baixoEstoque 
                ? '<span class="badge">Abaixo do mínimo</span>' 
                : '<span class="badge">Normal</span>';
            
            const precoFormatado = Number(prod.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            const tr = document.createElement('tr');
            tr.className = classeLinha;
            tr.innerHTML = `
                <td>${contadorVisual}</td>
                <td>${prod.nome}</td>
                <td>${precoFormatado}</td>
                <td>${prod.quantidade}</td>
                <td>${prod.quantidade_minima}</td>
                <td>${statusHTML}</td>
                <td>
                    <button onclick="prepararEdicao(${prod.id}, '${prod.nome}', ${prod.preco}, ${prod.quantidade}, ${prod.quantidade_minima})">Editar</button>
                    <button class="btn-delete" onclick="deletarProduto(${prod.id})">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);

            const option = document.createElement('option');
            option.value = prod.id;
            option.text = prod.nome;
            option.dataset.nome = prod.nome; 
            selectMov.appendChild(option);

            contadorVisual++;
        });
    } catch (erro) { console.error(erro); }
}

async function carregarHistorico() {
    try {
        const resposta = await fetch(`${API_URL}/movimentacoes`);
        const historico = await resposta.json();
        const tbody = document.getElementById('tabela-historico');
        tbody.innerHTML = '';

        historico.forEach(mov => {
            const dataObj = new Date(mov.data);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR') + ' ' + dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${mov.produto_nome}</td>
                <td><span class="badge">${mov.tipo}</span></td>
                <td>${mov.quantidade}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (erro) { console.error(erro); }
}

async function salvarProduto() {
    const id = document.getElementById('produto-id').value;
    const nome = document.getElementById('prod-nome').value;
    const preco = document.getElementById('prod-preco').value;
    const quantidade = document.getElementById('prod-qtd').value;
    const quantidade_minima = document.getElementById('prod-min').value;

    if (!nome || !preco || !quantidade || !quantidade_minima) return;

    const url = id ? `${API_URL}/produtos/${id}` : `${API_URL}/produtos`;
    const metodo = id ? 'PUT' : 'POST'; 

    await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, preco, quantidade, quantidade_minima })
    });
    
    fecharModais();
    carregarDados();
}

async function deletarProduto(id) {
    if(confirm('Tem certeza que deseja apagar?')) {
        await fetch(`${API_URL}/produtos/${id}`, { method: 'DELETE' });
        carregarDados();
    }
}

async function salvarMovimentacao() {
    const selectBox = document.getElementById('mov-produto');
    const produto_id = selectBox.value;
    const produto_nome = selectBox.options[selectBox.selectedIndex]?.dataset.nome;
    const tipo = document.getElementById('mov-tipo').value;
    const quantidade = document.getElementById('mov-qtd').value;

    if (!produto_id || !quantidade || quantidade <= 0) {
        alert("Preencha corretamente!"); return;
    }

    try {
        await fetch(`${API_URL}/movimentacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ produto_id, produto_nome, tipo, quantidade })
        });
        
        fecharModais();
        carregarDados();
    } catch (erro) { console.error(erro); }
}