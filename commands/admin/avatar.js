const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Hiển thị ảnh đại diện của bạn hoặc người được nhắc đến',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setColor('#9b59b6') // Sử dụng mã màu Hex trực tiếp, an toàn tuyệt đối
      .setTitle(`🖼️ Ảnh đại diện của ${targetUser.tag}`)
      .setImage(targetUser.displayAvatarURL({ size: 4096, dynamic: true }))
      .setTimestamp()
      .setFooter({ text: `Yêu cầu bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};