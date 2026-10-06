const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'thom',
  aliases: ['dthom'],
  description: 'Thơm má nhẹ nhàng kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first();
    
    if (!targetUser) {
      return message.reply('❌ Đạo hữu phải tag một người cần thơm chứ! Ví dụ: `dthom @User`');
    }

    // Link GIF thơm má mặc định hoặc nhận từ args[1]
    const gifUrl = args[1] || 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXdqZml1bjZ1bDFkaG45Z2NnYmowNnd6ZDE5c3B4Y3phN2V6MXA1NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KmxmoHUGPDjfQXqGgv/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#ff1493') // Màu hồng đậm sâu lắng
      .setTitle('😚 THƠM MÁ NGỌT NGÀO 😚')
      .setDescription(`Đạo hữu **${message.author}** đã lén thơm má **${targetUser}** một cái thật kêu! Ngại ngùng chưa kìa! 😳`)
      .setImage(gifUrl) // Dùng setImage để hỗ trợ link ảnh GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Trao gửi bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};