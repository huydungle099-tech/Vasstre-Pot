const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  // Cấu hình cho Prefix Command (gõ dhelp)
  name: 'help',
  aliases: ['h', 'giupdo', 'menu'],
  description: 'Hiển thị bảng tra cứu bách khoa toàn thư, phân khu các lệnh của bot',

  // Cấu hình cho Slash Command (gõ /help)
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Hiển thị bảng tra cứu bách khoa toàn thư của bot'),

  // Hàm thực thi chung cho Prefix
  async execute(message, args, db, client, PREFIX) {
    await sendHelpMenu(message, message.author, PREFIX);
  },

  // Hàm thực thi cho Slash Command
  async executeSlash(interaction, db, client) {
    await sendHelpMenu(interaction, interaction.user, 'd', true);
  }
};

// Hàm dùng chung render giao diện Help để code gọn gàng
async function sendHelpMenu(target, author, PREFIX, isSlash = false) {
  const userId = author.id;

  const homeEmbed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setTitle('📜 BÁCH KHOA TOÀN THƯ - ĐIỂN TỊCH THƯỢNG CỔ 📜')
    .setDescription(`Chào mừng đạo hữu **${author.username}** đến với hệ thống tu tiên.\n\n` +
      `Bot hiện đã tập trung tối đa vào con đường **Tu Tiên & Thám Hiểm**.\n\n` +
      `📌 **Cách sử dụng:** Sử dụng menu lựa chọn bên dưới để tra cứu chi tiết các phân khu pháp thuật!`)
    .addFields(
      { name: '⚔️ 1. Khu Vực Tu Tiên & Thám Hiểm', value: 'Các lệnh câu cá, thám hiểm 5 đại bí cảnh chiến thuật, kiểm tra tu vi.', inline: false },
      { name: '⚙️ 2. Khu Vực Quản Trị & Trạng Thái', value: 'Các lệnh điều phối hoạt động, tạm dừng hoặc tiếp tục bot.', inline: false }
    )
    .setTimestamp()
    .setFooter({ text: `Yêu cầu bởi ${author.tag}`, iconURL: author.displayAvatarURL() });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('help_menu')
    .setPlaceholder('📂 Chọn phân khu điển tịch cần tra cứu...')
    .addOptions([
      { label: 'Trang Chủ', description: 'Quay lại sảnh chính', value: 'home', emoji: '📜' },
      { label: 'Khu Vực Tu Tiên & Thám Hiểm', description: 'Danh sách lệnh tu vi, câu cá, thám hiểm', value: 'tu_tien', emoji: '⚔' },
      { label: 'Khu Vực Quản Trị & Trạng Thái', description: 'Danh sách lệnh stopbot, continuebot', value: 'quan_tri', emoji: '⚙️' }
    ]);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  let initialMessage;
  if (isSlash) {
    await target.reply({ embeds: [homeEmbed], components: [row], fetchReply: true });
    initialMessage = await target.fetchReply();
  } else {
    initialMessage = await target.reply({ embeds: [homeEmbed], components: [row] });
  }

  const collector = initialMessage.createMessageComponentCollector({
    filter: i => i.user.id === userId,
    time: 120000
  });

  collector.on('collect', async i => {
    const selected = i.values[0];

    if (selected === 'home') {
      await i.update({ embeds: [homeEmbed], components: [row] });
    } 
    else if (selected === 'tu_tien') {
      const tuTienEmbed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('⚔️️ KHU VỰC TU TIÊN & THÁM HIỂM')
        .setDescription('Hệ thống rèn luyện nguyên thần, thu thập linh thạch và thám hiểm.')
        .addFields(
          { name: `\`${PREFIX}tuvi\` / \`/tuvi\``, value: 'Kiểm tra cảnh giới hiện tại, số linh thạch.', inline: false },
          { name: `\`${PREFIX}cauca\` / \`/cauca\``, value: 'Thả câu ở hồ linh khí nhận linh thạch và XP.', inline: false },
          { name: `\`${PREFIX}thamhiem\` / \`/thamhiem\``, value: 'Xông pha 5 đại bí cảnh chiến thuật.', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `Đạo hữu: ${author.tag}`, iconURL: author.displayAvatarURL() });

      await i.update({ embeds: [tuTienEmbed], components: [row] });
    } 
    else if (selected === 'quan_tri') {
      const adminEmbed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('⚙️ KHU VỰC QUẢN Trị & TRẠNG THÁI')
        .setDescription('Các lệnh điều khiển vận hành bot.')
        .addFields(
          { name: `\`${PREFIX}stopbot\``, value: 'Tạm dừng hoạt động của bot.', inline: false },
          { name: `\`${PREFIX}continuebot\``, value: 'Tiếp tục kích hoạt lại bot.', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `Đạo hữu: ${author.tag}`, iconURL: author.displayAvatarURL() });

      await i.update({ embeds: [adminEmbed], components: [row] });
    }
  });

  collector.on('end', async () => {
    try {
      await initialMessage.edit({ components: [] });
    } catch (e) {}
  });
}