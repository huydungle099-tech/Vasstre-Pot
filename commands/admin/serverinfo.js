const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  description: 'Hiển thị thông tin chi tiết về máy chủ',
  async execute(message, args, db, client, PREFIX) {
    const { guild } = message;
    
    const embed = new EmbedBuilder()
      .setColor('#00ffcc') // Sử dụng mã màu Hex trực tiếp an toàn tuyệt đối
      .setTitle(`🏰 Thông tin Server: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '🆔 ID Server', value: guild.id, inline: true },
        { name: '👑 Chủ sở hữu', value: `<@${guild.ownerId}>`, inline: true },
        { name: '👥 Tổng thành viên', value: `${guild.memberCount} thành viên`, inline: true },
        { name: '📅 Ngày thành lập', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `Yêu cầu bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};