const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'nguyenrua',
  aliases: ['dnguyenrua'],
  description: 'Giáng họa phạt kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first() || message.author;
    
    // Đạo hữu có thể truyền link GIF động vào args[1] hoặc bot tự dùng link mặc định bên dưới
    const gifUrl = args[1] || 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3Fqcm5scGJ2eHE4a3ExYmtuejViMGxzY25xdGJsbnZoaDd6NnBhaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UQGENzUunTddjktfiO/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#e74c3c') // Màu đỏ cảnh báo lôi đình giáng thế
      .setTitle('⚡ LÔI ĐÌNH NGUYỀN RỦA ⚡')
      .setDescription(`Thiên phạt giáng xuống đầu đạo hữu **${targetUser}**! Nghiệp chướng nặng nề, cẩn thận ra đường bước hụt châm, uống nước bị sặc! 🌩️`)
      .setImage(gifUrl) // Dùng setImage để hỗ trợ link ảnh GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Giáng họa bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};