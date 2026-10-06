const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Định nghĩa 5 đại bí cảnh thượng cổ
const BI_CANH = {
  '1': { name: '🔥 Viêm Cốc (Hỏa Diệm Sơn)', color: 0xe74c3c, minLinhThach: 50, maxLinhThach: 150, xp: 50 },
  '2': { name: '❄️ Băng Uyên Cổ Địa', color: 0x3498db, minLinhThach: 100, maxLinhThach: 250, xp: 90 },
  '3': { name: '🌲 Thượng cổ Yêu Thú Sâm Lâm', color: 0x2ecc71, minLinhThach: 180, maxLinhThach: 400, xp: 150 },
  '4': { name: '⚡ Lôi Kiếp Cốc', color: 0x9b59b6, minLinhThach: 300, maxLinhThach: 700, xp: 250 },
  '5': { name: '🌌 Hư Không Giới Thâm Sâu', color: 0xf1c40f, minLinhThach: 500, maxLinhThach: 1200, xp: 450 }
};

// Thời gian Cooldown: 30 phút (tính bằng mili-giây)
const COOLDOWN_TIME = 30 * 60 * 1000;

module.exports = {
  name: 'thamhiem',
  aliases: ['bc', 'xongpha', 'phuot'],
  description: 'Xông pha 5 đại bí cảnh 50 tầng tháp với cơ chế chiến thuật, bẫy tử thần và thương nhân (Cooldown 30 phút)',
  async execute(message, args, db, client, PREFIX) {
    const userId = message.author.id;
    const mapChoice = args[0];

    // --- KIỂM TRA COOLDOWN TRƯỚC KHI VÀO BÍ CẢNH ---
    let lastTime = (await db.get(`cooldown_thamhiem_${userId}`)) || 0;
    let now = Date.now();

    if (now - lastTime < COOLDOWN_TIME) {
      let remaining = Math.ceil((COOLDOWN_TIME - (now - lastTime)) / 1000);
      let mins = Math.floor(remaining / 60);
      let secs = remaining % 60;
      return message.reply(`⏳ Nguyên thần của đạo hữu còn mỏi mệt sau chuyến thám hiểm trước! Hãy chờ thêm **${mins} phút ${secs} giây** nữa rồi hãy tiếp tục xông pha.`);
    }

    if (!mapChoice || !BI_CANH[mapChoice]) {
      const listEmbed = new EmbedBuilder()
        .setColor(0x34495e)
        .setTitle('⚔️ HỆ THỐNG THÁM HIỂM 5 ĐẠI BÍ CẢNH ⚔️')
        .setDescription(`Vui lòng chọn một trong các bí cảnh dưới đây để xông pha:\n\n` +
          `🔹 \`${PREFIX}thamhiem 1\` : 🔥 Viêm Cốc (Sơ cấp)\n` +
          `🔹 \`${PREFIX}thamhiem 2\` : ❄️ Băng Uyên Cổ Địa\n` +
          `🔹 \`${PREFIX}thamhiem 3\` : 🌲 Thượng cổ Yêu Thú Sâm Lâm\n` +
          `🔹 \`${PREFIX}thamhiem 4\` : ⚡ Lôi Kiếp Cốc\n` +
          `🔹 \`${PREFIX}thamhiem 5\` : 🌌 Hư Không Giới Thâm Sâu (Cao cấp)`);
      return message.reply({ embeds: [listEmbed] });
    }

    // Đã chọn map hợp lệ và vượt qua cooldown -> Set thời gian cooldown mới ngay lập tức
    await db.set(`cooldown_thamhiem_${userId}`, now);

    const currentMap = BI_CANH[mapChoice];
    let floor = 1;
    let accumulatedMoney = 0;
    let accumulatedXp = 0;
    let hasMapItem = false;
    let hasShieldItem = false;

    // Hàm render giao diện thám hiểm từng tầng
    const getExploreEmbed = (statusText = 'Đang tiến bước vào cõi u minh...') => {
      return new EmbedBuilder()
        .setColor(currentMap.color)
        .setTitle(`🗺️ Thám Hiểm: ${currentMap.name}`)
        .setDescription(statusText)
        .addFields(
          { name: '🛡️ Tiến độ', value: `\`${floor}/50 Tầng\``, inline: true },
          { name: '💰 Linh Thạch tích lũy', value: `\`${accumulatedMoney}\``, inline: true },
          { name: '📈 XP Tu Vi nhận', value: `\`+${accumulatedXp}\``, inline: true },
          { name: '🎒 Đạo Cụ', value: `🗺️ Bản đồ: **${hasMapItem ? 'Có ✅' : 'Không ❌'}**\n🛡️ Bùa chắn bẫy: **${hasShieldItem ? 'Có ✅' : 'Không ❌'}**`, inline: false }
        )
        .setFooter({ text: `Đạo hữu: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
    };

    const getButtons = (disableAll = false) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('next_floor').setLabel('🗡️ Tiến Lên Tầng Tiếp').setStyle(ButtonStyle.Primary).setDisabled(disableAll),
        new ButtonBuilder().setCustomId('buy_item').setLabel('🛒 Ghé Tiệm Thương Nhân').setStyle(ButtonStyle.Success).setDisabled(disableAll),
        new ButtonBuilder().setCustomId('retreat').setLabel('🏳️ Rút Lui An Toàn').setStyle(ButtonStyle.Danger).setDisabled(disableAll)
      );
    };

    const msg = await message.reply({ embeds: [getExploreEmbed('Đạo hữu đã bước chân vào cửa khẩu bí cảnh, hãy chọn hành động!')], components: [getButtons()] });

    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time: 300000 // 5 phút cho mỗi cuộc hành trình
    });

    collector.on('collect', async i => {
      if (i.customId === 'retreat') {
        collector.stop('retreat');
        return;
      }

      if (i.customId === 'buy_item') {
        const shopEmbed = new EmbedBuilder()
          .setColor(0xf39c12)
          .setTitle('🛒 THƯƠNG NHÂN BÍ ẨN XUẤT HIỆN')
          .setDescription('"Hehe, đạo hữu muốn mua bảo vật gì để hộ thân không?"\n\n' +
            '1️⃣ **Bản Đồ Cổ (100 Linh Thạch)**: Soi trước nguy hiểm tầng tiếp theo.\n' +
            '2️⃣ **Bùa Hộ Thân (150 Linh Thạch)**: Miễn dịch 1 lần bẫy tử thần.');

        const shopRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('buy_map').setLabel('Mua Bản Đồ (100 🪙)').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('buy_shield').setLabel('Mua Bùa Chắn (150 🪙)').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('back_game').setLabel('Quay Lại').setStyle(ButtonStyle.Primary)
        );

        await i.update({ embeds: [shopEmbed], components: [shopRow] });
        return;
      }

      if (i.customId === 'buy_map' || i.customId === 'buy_shield') {
        const cost = i.customId === 'buy_map' ? 100 : 150;
        let userMoney = parseInt(await db.get(`money_${userId}`)) || 0;

        if (userMoney < cost) {
          return i.reply({ content: `❌ Không đủ linh thạch trong tài khoản chính! Bạn cần ${cost} Linh Thạch.`, ephemeral: true });
        }

        await db.set(`money_${userId}`, userMoney - cost);
        if (i.customId === 'buy_map') hasMapItem = true;
        if (i.customId === 'buy_shield') hasShieldItem = true;

        await i.update({ embeds: [getExploreEmbed(`✨ Đã mua thành công bảo vật! Tiếp tục hành trình.`)], components: [getButtons()] });
        return;
      }

      if (i.customId === 'back_game') {
        await i.update({ embeds: [getExploreEmbed('Đạo hữu đã rời tiệm thương nhân, tiếp tục tiến bước.')], components: [getButtons()] });
        return;
      }

      // Xử lý nút Tiến Lên Tầng
      if (i.customId === 'next_floor') {
        floor++;

        if (floor > 50) {
          collector.stop('win');
          return;
        }

        // 10% tỷ lệ gặp bẫy chết người
        const isDeathTrap = Math.random() < 0.10;

        if (isDeathTrap) {
          if (hasShieldItem) {
            hasShieldItem = false;
            await i.update({ embeds: [getExploreEmbed(`⚠️ **CẠM BẪY TỬ THẦN!** May mắn là Bùa Hộ Thân đã gánh chịu thay một kiếp nạn, bùa đã vỡ vụn! Đã lên tầng **${floor}**.` )], components: [getButtons()] });
            return;
          } else {
            collector.stop('died');
            return;
          }
        }

        // Thưởng ngẫu nhiên theo tầng
        const earnedMoney = Math.floor(Math.random() * (currentMap.maxLinhThach - currentMap.minLinhThach + 1)) + currentMap.minLinhThach;
        const earnedXp = currentMap.xp;

        accumulatedMoney += earnedMoney;
        accumulatedXp += earnedXp;

        let hint = '';
        if (hasMapItem && floor < 50) {
          const nextTrap = Math.random() < 0.10;
          hint = `\n🔮 **[Thiên Nhãn Bản Đồ]**: Tầng tiếp theo dự báo có **${nextTrap ? '⚠️ Bẫy hiểm nguy' : '✅ An toàn'}**.`;
        }

        await i.update({ embeds: [getExploreEmbed(`⚔️ Vượt qua tầng **${floor}** an toàn!\n💰 Thu hoạch: \`+${earnedMoney} Linh Thạch\` | 📈 XP: \`+${earnedXp}\`${hint}`)], components: [getButtons()] });
      }
    });

    collector.on('end', async (collected, reason) => {
      try {
        let finalMsg = '';
        if (reason === 'retreat' || reason === 'win') {
          // Ép kiểu số nguyên khi cộng vào DB để tránh lỗi chuỗi
          let currentMoney = parseInt(await db.get(`money_${userId}`)) || 0;
          let currentXp = parseInt(await db.get(`xp_${userId}`)) || 0;

          currentMoney += accumulatedMoney;
          currentXp += accumulatedXp;

          await db.set(`money_${userId}`, currentMoney);
          await db.set(`xp_${userId}`, currentXp);

          finalMsg = reason === 'win' 
            ? `🏆 **ĐẠI THẮNG!** Đạo hữu đã chinh phục hoàn toàn 50 tầng tháp ${currentMap.name}!\n💰 Tổng kho báu nhận được: **${accumulatedMoney} Linh Thạch** cùng **+${accumulatedXp} XP** tu vi!`
            : `🏳️ Rút lui an toàn ở tầng **${floor}** của 🌲 **${currentMap.name}**.\n💰 Mang về kho báu: **${accumulatedMoney} Linh Thạch** cùng **+${accumulatedXp} XP** tu vi gia tăng nguyên thần!`;
        } else if (reason === 'died') {
          finalMsg = `💀 **TỬ VONG!** Đạo hữu đã sập bẫy tử thần ở tầng **${floor}** do không có bùa chắn! Toàn bộ linh thạch tích lũy trong chuyến đi này đã tiêu tan theo mây khói.`;
        } else {
          finalMsg = `⏳ Hết thời gian thám hiểm, đạo hữu bị trục xuất khỏi bí cảnh với số tài sản tích lũy được bảo lưu một nửa.`;
          let currentMoney = parseInt(await db.get(`money_${userId}`)) || 0;
          let currentXp = parseInt(await db.get(`xp_${userId}`)) || 0;
          
          currentMoney += Math.floor(accumulatedMoney / 2);
          currentXp += Math.floor(accumulatedXp / 2);
          
          await db.set(`money_${userId}`, currentMoney);
          await db.set(`xp_${userId}`, currentXp);
        }

        const endEmbed = new EmbedBuilder()
          .setColor(0x2c3e50)
          .setTitle('📜 KẾT QUẢ THÁM HIỂM')
          .setDescription(finalMsg)
          .setTimestamp();

        await msg.edit({ embeds: [endEmbed], components: [] });
      } catch (e) {}
    });
  }
};