const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'chucphuc',
  aliases: ['dchucphuc'],
  description: 'Ban phúc lành kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first() || message.author;
    
    // Đạo hữu có thể tùy chỉnh link ảnh GIF động (hoặc lấy argument đầu tiên làm link ảnh nếu muốn)
    // Ví dụ mặc định ta để một link GIF chúc phúc, hoặc đạo hữu truyền link vào args[0]
    const gifUrl = args[1] || 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXgybDZzMXppMmo5eXVjZ2FtMTFmZGx3ZHZoNnhzZjI4dGg1YW55ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Y8hjRkJBfGuOWWxtM6/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#f1c40f') // Màu vàng phúc lộc, an toàn tuyệt đối
      .setTitle('✨ PHÚC LÀNH THIÊN CUNG ✨')
      .setDescription(`Thiên Tôn ban phước lành cho đạo hữu **${targetUser}**! Vận may ngập tràn, tu vi tinh tấn! 🙏`)
      .setImage(gifUrl) // Dùng setImage để hiển thị ảnh hoặc link GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Ban phúc bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};