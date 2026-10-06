const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'tracuu',
  description: 'Tra cứu lịch sử tin nhắn vi phạm bị xóa của thành viên',
  async execute(message, args, db, COLORS, PREFIX) {
    const sub = args[0]?.toLowerCase();
    
    if (sub !== 'xoa') {
      const embedGuide = new EmbedBuilder()
        .setColor('#EF4444')
        .setTitle('❌ Sai Cú Pháp Tra Cứu')
        .setDescription(`Cú pháp đúng:\n\`${PREFIX}tracuu xoa @user\` (Xem toàn bộ tin nhắn bị xóa)\n\`${PREFIX}tracuu xoa @user [từ khóa]\` (Lọc tin nhắn chứa từ khóa)`);
      return message.reply({ embeds: [embedGuide] });
    }

    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      return message.reply('❌ Đạo hữu chưa tag thành viên cần tra cứu! Ví dụ: `!tracuu xoa @User`');
    }

    const guildId = message.guild.id;
    const userId = targetUser.id;
    const keyword = args.slice(2).join(' ').toLowerCase();

    let deletedLogs = (await db.get(`deleted_logs_${guildId}_${userId}`)) || [];

    if (deletedLogs.length === 0) {
      return message.reply(`✨ Thành viên **${targetUser.tag}** rất trong sạch, chưa có tin nhắn vi phạm nào bị xóa cả!`);
    }

    let filteredLogs = deletedLogs;
    if (keyword) {
      filteredLogs = deletedLogs.filter(log => log.content.toLowerCase().includes(keyword));
    }

    if (filteredLogs.length === 0) {
      return message.reply(`🔍 Không tìm thấy tin nhắn nào của **${targetUser.tag}** chứa từ khóa *"**${keyword}**"* trong lịch sử bị xóa.`);
    }

    const displayLogs = filteredLogs.slice(-10).reverse();
    
    let description = displayLogs.map((log, index) => {
      const timeString = `<t:${Math.floor(log.time / 1000)}:R>`;
      return `**${index + 1}.** ${timeString} tại <#${log.channelId}>\n> ${log.content}`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
      .setColor('#F59E0B')
      .setTitle(`📜 Lịch Sử Tin Nhắn Bị Xóa: ${targetUser.tag}`)
      .setDescription(`Tổng số tin nhắn vi phạm tìm thấy: **${filteredLogs.length}**\n*(Hiển thị 10 bản ghi gần nhất)*\n\n${description}`)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};