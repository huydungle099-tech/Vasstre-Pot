const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'tieudiet',
  aliases: ['dtieudiet'],
  description: 'Thi triển thần thông "tiêu diệt" mục tiêu kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first();
    
    if (!targetUser) {
      return message.reply('❌ Đạo hữu phải tag một mục tiêu cần tiêu diệt chứ! Ví dụ: `dtieudiet @User`');
    }

    if (targetUser.id === message.author.id) {
      return message.reply('❌ Ơ hay, sao đạo hữu lại tự hủy tu vi thế này? Bình tĩnh lại đi chứ! 😅');
    }

    // Link GIF hành quyết/tiêu diệt hài hước mặc định hoặc nhận từ args[1]
    const gifUrl = args[1] || 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2xlaDl1eGpzaTJlbWFiZnVwdjAybG0xaWFtMGozNnNoNDgxdXZpbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RLi2oeVZiVkE8/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#8b0000') // Màu đỏ máu đậm chất "tử hình"
      .setTitle('⚡ KIM VŨ THẦN LÔI ⚡')
      .setDescription(`Đạo hữu **${message.author}** đã tung đại chiêu tiêu diệt **${targetUser}** thành tro bụi! 💀 `)
      .setImage(gifUrl) // Dùng setImage để hỗ trợ link ảnh GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Ra đòn bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};