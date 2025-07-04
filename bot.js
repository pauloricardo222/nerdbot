// Nerdbot - Bot de vendas com Pix Manual
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const db = require('./db.json');
const config = require('./config.json');

const bot = new Telegraf(config.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply(`👋 Olá ${ctx.from.first_name}! Seja bem-vindo ao *Nerdbot*!`, {
        parse_mode: 'Markdown',
        ...Markup.keyboard([['🛒 COMPRAR', '➕ ADD SALDO'], ['👤 PERFIL', '👑 DONO']]).resize()
    });
});

bot.hears('👤 PERFIL', (ctx) => {
    const id = String(ctx.from.id);
    const user = db.users[id] || { saldo: 0 };
    ctx.reply(`🧾 Seu Perfil:
🆔 ID: ${id}
💰 Saldo: R$${user.saldo.toFixed(2)}`);
});

bot.hears('➕ ADD SALDO', (ctx) => {
    ctx.reply(`Para adicionar saldo, envie o valor desejado (mínimo R$5):`);
});

bot.on('text', (ctx) => {
    const value = parseFloat(ctx.message.text.replace('R$', '').replace(',', '.'));
    if (!isNaN(value) && value >= 5) {
        ctx.reply(`🚨 Pix Manual

💸 Envie R$${value.toFixed(2)} para a chave Pix:

📌 ${config.PIX_KEY}

Após o pagamento, envie o comprovante para um admin.`);
    }
});

bot.launch();
console.log('🤖 Nerdbot está rodando...');