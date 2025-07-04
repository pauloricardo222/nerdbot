const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./db.sqlite');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'painel-nerdbot', resave: false, saveUninitialized: true }));

const PORT = 3010;
const LOGIN = 'admin';
const PASSWORD = 'admin1010';

app.get('/', (req, res) => {
  if (req.session.logged) return res.redirect('/dashboard');
  res.render('login');
});

app.post('/login', (req, res) => {
  const { user, pass } = req.body;
  if (user === LOGIN && pass === PASSWORD) {
    req.session.logged = true;
    return res.redirect('/dashboard');
  }
  res.send("Login inválido.");
});

app.get('/dashboard', (req, res) => {
  if (!req.session.logged) return res.redirect('/');
  db.all("SELECT id, name, saldo FROM users", [], (err, users) => {
    db.all("SELECT * FROM produtos", [], (err, produtos) => {
      res.render('dashboard', { users, produtos });
    });
  });
});

app.listen(PORT, () => {
  console.log(`🖥️ Painel rodando em http://localhost:${PORT}`);
});

app.post('/add-saldo', (req, res) => {
  if (!req.session.logged) return res.redirect('/');
  const { userId, valor } = req.body;
  const v = parseFloat(valor);
  db.run("UPDATE users SET saldo = saldo + ? WHERE id = ?", [v, userId], function (err) {
    return res.redirect('/dashboard');
  });
});
