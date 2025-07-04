const { Telegraf, Markup } = require('telegraf');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config.json');
const fs = require('fs');
const { exec } = require("child_process");

const db = new sqlite3.Database('./db.sqlite');
const bot = new Telegraf(config.BOT_TOKEN);

const isAdmin = (id) => config.ADMINS.includes(id);

db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, saldo REAL DEFAULT 0)");
db.run("CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, preco REAL)");

bot.start((ctx) => {
  const id = String(ctx.from.id);
  db.run("INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)", [id, ctx.from.first_name]);
  ctx.reply(`👋 Olá ${ctx.from.first_name}! Bem-vindo ao Nerdbot`, Markup.keyboard([['🛒 COMPRAR', '➕ ADD SALDO'], ['👤 PERFIL', '👑 DONO']]).resize());
});

bot.hears('👤 PERFIL', (ctx) => {
  const id = String(ctx.from.id);
  db.get("SELECT saldo FROM users WHERE id = ?", [id], (err, row) => {
    if (!row) return ctx.reply("❌ Usuário não encontrado.");
    ctx.reply(`🧾 Seu Perfil:
🆔 ID: ${id}
💰 Saldo: R$${row.saldo.toFixed(2)}`);
  });
});

bot.hears('➕ ADD SALDO', (ctx) => {
  ctx.reply(`🚨 Pix Manual

💸 Envie o valor para a chave Pix:
📌 ${config.PIX_KEY}

Após o pagamento, envie o comprovante para o admin.`);
});

bot.command('painel', (ctx) => {
  const id = String(ctx.from.id);
  if (!isAdmin(id)) return ctx.reply("❌ Acesso negado.");
  ctx.reply("📊 Painel Admin", Markup.inlineKeyboard([
    [Markup.button.callback("👥 Ver usuários", "ver_usuarios")],
    [Markup.button.callback("➕ Add saldo", "add_saldo")],
    [Markup.button.callback("🛒 Produtos", "ver_produtos")]
  ]));
});

bot.action("ver_usuarios", (ctx) => {
  db.all("SELECT id, name, saldo FROM users", [], (err, rows) => {
    if (!rows.length) return ctx.reply("Nenhum usuário.");
    let msg = "👥 Lista de Usuários:

";
    rows.forEach(u => {
      msg += `🆔 ${u.id} | ${u.name} | 💰 R$${u.saldo.toFixed(2)}
`;
    });
    ctx.reply(msg);
  });
});

bot.launch();
console.log("🤖 Nerdbot está rodando...");