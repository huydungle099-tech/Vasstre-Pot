const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Hiển thị thông tin chi tiết về người dùng',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(targetUser.id);

    const embed = new EmbedBuilder()
      .setColor('#3498db') // Dùng mã màu trực tiếp thay vì Colors.BLUE để chống lỗi null
      .setTitle(`📊 Thông tin tài khoản: ${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🆔 ID Người dùng', value: targetUser.id, inline: true },
        { name: '📅 Ngày tạo tài khoản', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '📥 Ngày tham gia server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Không rõ', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `Yêu cầu bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};