const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'om',
  aliases: ['dom'],
  description: 'Ôm một người thật chặt kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first();
    
    if (!targetUser) {
      return message.reply('❌ Đạo hữu phải tag một người cần ôm chứ! Ví dụ: `dom @User`');
    }

    // Link GIF ôm ấm áp mặc định hoặc nhận từ args[1]
    const gifUrl = args[1] || 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2FwbGN0cTlweWhydnRhbzJsMzlzZDBudWx5dWNqMTVvdW1veHFlYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VhRU9RvKZWKujYXhlJ/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#ffb6c1') // Màu hồng nhạt ấm áp
      .setTitle('🤗 ÔM ÔM ẤM ÁP 🤗')
      .setDescription(`Đạo hữu **${message.author}** đã ôm chầm lấy **${targetUser}** một cái thật chặt! Ấm lòng quá đi thôi! 💕`)
      .setImage(gifUrl) // Dùng setImage để hỗ trợ link ảnh GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Trao gửi bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};