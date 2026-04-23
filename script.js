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
    document.getElementById('prod-qtd').value = '';
    document.getElementById('prod-min').value = '';
    document.getElementById('modal-produto').classList.remove('escondido');
}

function prepararEdicao(id, nome, qtd, qtd_min) {
    document.getElementById('modal-titulo').innerHTML = 'Editar Produto';
    document.getElementById('produto-id').value = id;
    document.getElementById('prod-nome').value = nome;
    document.getElementById('prod-qtd').value = qtd;
    document.getElementById('prod-min').value = qtd_min;
    document.getElementById('modal-produto').classList.remove('escondido');
}

function fecharModais() {
    document.getElementById('modal-produto').classList.add('escondido');
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
        tbody.innerHTML = ''; 
        
        let contadorVisual = 1;

        produtos.forEach(prod => {
            const baixoEstoque = prod.quantidade < prod.quantidade_minima;
            const classeLinha = baixoEstoque ? 'alerta-vermelho' : '';
            const statusHTML = baixoEstoque 
                ? '<span class="badge badge-alerta">Abaixo do mínimo</span>' 
                : '<span class="badge badge-normal">Normal</span>';
            
            const tr = document.createElement('tr');
            tr.className = classeLinha;
            tr.innerHTML = `
                <td>${contadorVisual}</td>
                <td>${prod.nome}</td>
                <td>${prod.quantidade}</td>
                <td>${prod.quantidade_minima}</td>
                <td>${statusHTML}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="prepararEdicao(${prod.id}, '${prod.nome}', ${prod.quantidade}, ${prod.quantidade_minima})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon btn-delete" onclick="deletarProduto(${prod.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
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
            const badgeTipo = mov.tipo === 'Entrada' ? 'badge-entrada' : 'badge-saida';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${mov.produto_nome}</td>
                <td><span class="badge ${badgeTipo}">${mov.tipo}</span></td>
                <td>${mov.quantidade}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (erro) { console.error(erro); }
}

async function salvarProduto() {
    const id = document.getElementById('produto-id').value;
    const nome = document.getElementById('prod-nome').value;
    const quantidade = document.getElementById('prod-qtd').value;
    const quantidade_minima = document.getElementById('prod-min').value;

    if (!nome || !quantidade || !quantidade_minima) return;

    const url = id ? `${API_URL}/produtos/${id}` : `${API_URL}/produtos`;
    const metodo = id ? 'PUT' : 'POST'; 

    await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, quantidade, quantidade_minima })
    });
    
    fecharModais();
    carregarDados();
}

async function deletarProduto(id) {
    if(confirm('Tem certeza? Isso apagará o produto e seu histórico.')) {
        await fetch(`${API_URL}/produtos/${id}`, { method: 'DELETE' });
        carregarDados();
    }
}