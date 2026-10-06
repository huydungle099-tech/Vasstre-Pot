const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unmute',
  aliases: ['dunmute', 'unm'],
  description: 'Gỡ câm cho thành viên trong server',
  async execute(message, args, db, client, PREFIX) {
    // Kiểm tra quyền quản lý thành viên hoặc Administrator
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Đạo hữu không đủ quyền hạn để sử dụng lệnh này!');
    }

    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    
    if (!targetMember) {
      return message.reply(`❌ Cú pháp không đúng hoặc không tìm thấy thành viên! Ví dụ: \`${PREFIX}unmute @User\``);
    }

    try {
      // Gỡ timeout (unmute) cho thành viên
      await targetMember.timeout(null, `Thực hiện bởi ${message.author.tag}`);

      // Dùng chuỗi Hex cố định, KHÔNG BAO GIỜ bị lỗi màu
      const embed = new EmbedBuilder()
        .setColor('#2ecc71') // Màu xanh lá an toàn, tuyệt đối không bao giờ lỗi null/invalid
        .setTitle('🔊 GỠ CÂM THÀNH CÔNG 🔊')
        .setDescription(`Đạo hữu **${targetMember}** đã được gỡ câm (unmute) thành công! ✨`)
        .setTimestamp()
        .setFooter({ text: `Thực hiện bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await message.reply('❌ Có lỗi xảy ra khi gỡ câm! Hãy kiểm tra lại quyền hạn của bot (Bot cần ở cấp bậc cao hơn người bị gỡ câm).');
    }
  }
};