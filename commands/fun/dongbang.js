const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'dongbang',
  aliases: ['ddongbang', 'freeze'],
  description: 'Đóng băng mục tiêu trong tảng băng lạnh giá kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first();
    
    if (!targetUser) {
      return message.reply('❌ Đạo hữu phải tag một người cần đóng băng chứ! Ví dụ: `ddongbang @User`');
    }

    if (targetUser.id === message.author.id) {
      return message.reply('❌ Tự đóng băng chính mình để làm kem tươi hả đạo hữu? Lạnh lắm đấy nhé! 🧊😅');
    }

    // Link GIF đóng băng/băng giá mặc định hoặc nhận từ args[1]
    const gifUrl = args[1] || 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTcxanU2NXNxZHhpeW8wcXBoOGQ3N3IzYjFzYWRkYTV4eGN6bGU4aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKVESbDAfJJsPcY/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#00bfff') // Màu xanh băng giá (Deep Sky Blue) tuyệt đối an toàn
      .setTitle('🧊 PHÁP THUẬT ĐÓNG BĂNG 🧊')
      .setDescription(`Đạo hữu **${message.author}** đã thi triển pháp thuật băng phong, đóng băng **${targetUser}** thành một tượng đá lạnh ngắt! Đứng yên tĩnh dưỡng vài bèn đi nhé! ❄️🗿`)
      .setImage(gifUrl) // Dùng setImage để hỗ trợ link ảnh GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Đóng băng bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};