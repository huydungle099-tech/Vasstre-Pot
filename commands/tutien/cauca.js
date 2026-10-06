const { EmbedBuilder } = require('discord.js');

const COOLDOWN_TIME = 8 * 60 * 1000; // 8 phút (tính bằng mili-giây)

const LOAI_CA = [
  { name: '🐟 Cá Diếc Thường', value: 20, xp: 10, rate: 40 },
  { name: '🐠 Cá Chép Vàng', value: 50, xp: 25, rate: 30 },
  { name: '🦀 Cua Hoàng Đế Sông', value: 100, xp: 50, rate: 15 },
  { name: '🐉 Giao Long Chi Tử (Cá Hiếm)', value: 300, xp: 150, rate: 10 },
  { name: '👑 Thượng Cổ Linh Ngư (Cực Hiếm)', value: 800, xp: 400, rate: 5 }
];

module.exports = {
  name: 'cauca',
  aliases: ['fishing', 'fish'],
  description: 'Câu cá tĩnh tâm (Cooldown 8 phút)',
  async execute(message, args, db, client, PREFIX) {
    const userId = message.author.id;

    let lastTime = (await db.get(`cooldown_cauca_${userId}`)) || 0;
    let now = Date.now();

    if (now - lastTime < COOLDOWN_TIME) {
      let remaining = Math.ceil((COOLDOWN_TIME - (now - lastTime)) / 1000);
      let mins = Math.floor(remaining / 60);
      let secs = remaining % 60;
      return message.reply(`⏳ Đạo hữu vừa thu cần chưa lâu, nguyên khí chưa hồi! Hãy đợi thêm **${mins} phút ${secs} giây** nữa.`);
    }

    await db.set(`cooldown_cauca_${userId}`, now);

    // Random cá
    let randomNum = Math.random() * 100;
    let cumulative = 0;
    let caughtFish = LOAI_CA[0];

    for (const fish of LOAI_CA) {
      cumulative += fish.rate;
      if (randomNum <= cumulative) {
        caughtFish = fish;
        break;
      }
    }

    let currentMoney = parseInt(await db.get(`money_${userId}`)) || 0;
    let currentXp = parseInt(await db.get(`xp_${userId}`)) || 0;

    currentMoney += caughtFish.value;
    currentXp += caughtFish.xp;

    await db.set(`money_${userId}`, currentMoney);
    await db.set(`xp_${userId}`, currentXp);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🎣 THU CẦN THÀNH CÔNG!')
      .setDescription(`Đạo hữu vung cần và tóm gọn:\n\n` +
        `🎁 **Phần thưởng**: **${caughtFish.name}**\n` +
        `💰 Bán được: \`+${caughtFish.value} Linh Thạch\`\n` +
        `📈 Điểm tu vi: \`+${caughtFish.xp} XP\``)
      .setFooter({ text: `Đạo hữu: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    return message.reply({ embeds: [embed] });
  }
};