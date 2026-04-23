const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root', 
    database: 'gerenciador_produtos'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL!');
});

app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE usuario = ? AND senha = ?';
    db.query(sql, [usuario, senha], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor' });
        if (results.length > 0) {
            res.json({ sucesso: true, mensagem: 'Login efetuado!' });
        } else {
            res.status(401).json({ sucesso: false, mensagem: 'Usuário ou senha incorretos' });
        }
    });
});

app.get('/produtos', (req, res) => {
    db.query('SELECT * FROM produtos', (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar produtos' });
        res.json(results);
    });
});

app.post('/produtos', (req, res) => {
    const { nome, quantidade, quantidade_minima } = req.body;
    const sql = 'INSERT INTO produtos (nome, quantidade, quantidade_minima) VALUES (?, ?, ?)';
    db.query(sql, [nome, quantidade, quantidade_minima], (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao adicionar produto' });
        res.json({ mensagem: 'Produto adicionado!' });
    });
});

app.put('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { nome, quantidade, quantidade_minima } = req.body;
    const sql = 'UPDATE produtos SET nome = ?, quantidade = ?, quantidade_minima = ? WHERE id = ?';
    db.query(sql, [nome, quantidade, quantidade_minima, id], (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao editar produto' });
        res.json({ mensagem: 'Produto atualizado!' });
    });
});

app.delete('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM produtos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao deletar produto' });
        res.json({ mensagem: 'Produto deletado!' });
    });
});

app.get('/movimentacoes', (req, res) => {
    db.query('SELECT * FROM movimentacoes ORDER BY data DESC', (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar histórico' });
        res.json(results);
    });
});

app.post('/movimentacoes', (req, res) => {
    const { produto_id, produto_nome, tipo, quantidade } = req.body;
    
    const sqlHist = 'INSERT INTO movimentacoes (produto_id, produto_nome, tipo, quantidade) VALUES (?, ?, ?, ?)';
    db.query(sqlHist, [produto_id, produto_nome, tipo, quantidade], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao salvar histórico' });

        const operacao = tipo === 'Entrada' ? '+' : '-';
        const sqlUpdate = `UPDATE produtos SET quantidade = quantidade ${operacao} ? WHERE id = ?`;
        
        db.query(sqlUpdate, [quantidade, produto_id], (err2) => {
            if (err2) return res.status(500).json({ erro: 'Erro ao atualizar estoque' });
            res.json({ mensagem: 'Movimentação registrada com sucesso!' });
        });
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});