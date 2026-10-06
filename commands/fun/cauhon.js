const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'cauhon',
  aliases: ['dcauhon'],
  description: 'Quỳ gối cầu hôn lãng mạn kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first();
    
    if (!targetUser) {
      return message.reply('❌ Đạo hữu phải tag người mình muốn cầu hôn chứ! Ví dụ: `dcauhon @User` hoặc `cauhon @User`');
    }

    if (targetUser.id === message.author.id) {
      return message.reply('❌ Ơ hay, sao lại tự cầu hôn chính mình thế này? FA quá hóa rồ rồi à đạo hữu? 😅');
    }

    // Link GIF cầu hôn lãng mạn mặc định hoặc nhận từ args[1]
    const gifUrl = args[1] || 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnplZmZ6aDd2MGhnenh3OHQwM292OGw0NGgwNzV4d2hpdG5mMDV4ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vnNVlrFZ6JHuKUT1FJ/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#ff69b4') // Màu hồng lãng mạn
      .setTitle('💍 MÀN CẦU HÔN THẾ KỶ 💍')
      .setDescription(`Đạo hữu **${message.author}** đã quỳ gối chân thành trao nhẫn và ngỏ lời cầu hôn đến **${targetUser}**! Đồng ý đi chờ chi nữa! 🌹✨`)
      .setImage(gifUrl) // Dùng setImage để hỗ trợ link ảnh GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Trao gửi bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};