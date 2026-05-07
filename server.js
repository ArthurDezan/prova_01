const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 3307, 
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
            res.json({ sucesso: true });
        } else {
            res.status(401).json({ sucesso: false });
        }
    });
});

app.get('/produtos', (req, res) => {
    db.query('SELECT * FROM produtos', (err, results) => {
        res.json(results);
    });
});

app.post('/produtos', (req, res) => {
    const { nome, preco, quantidade, quantidade_minima } = req.body;
    const sql = 'INSERT INTO produtos (nome, preco, quantidade, quantidade_minima) VALUES (?, ?, ?, ?)';
    db.query(sql, [nome, preco, quantidade, quantidade_minima], (err, result) => {
        res.json({ mensagem: 'Produto adicionado!' });
    });
});

app.put('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { nome, preco, quantidade, quantidade_minima } = req.body;
    const sql = 'UPDATE produtos SET nome = ?, preco = ?, quantidade = ?, quantidade_minima = ? WHERE id = ?';
    db.query(sql, [nome, preco, quantidade, quantidade_minima, id], (err, result) => {
        res.json({ mensagem: 'Produto atualizado!' });
    });
});

app.delete('/produtos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM produtos WHERE id = ?', [id], () => {
        res.json({ mensagem: 'Produto deletado!' });
    });
});

app.get('/movimentacoes', (req, res) => {
    db.query('SELECT * FROM movimentacoes ORDER BY data DESC', (err, results) => {
        res.json(results);
    });
});

app.post('/movimentacoes', (req, res) => {
    const { produto_id, produto_nome, tipo, quantidade } = req.body;
    const sqlHist = 'INSERT INTO movimentacoes (produto_id, produto_nome, tipo, quantidade) VALUES (?, ?, ?, ?)';
    
    db.query(sqlHist, [produto_id, produto_nome, tipo, quantidade], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao registrar movimentação' });
        res.json({ mensagem: 'Movimentação registrada com sucesso!' });
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});