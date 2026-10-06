const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'tat',
  aliases: ['dtat'],
  description: 'Tát một cú trời giáng kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first();
    
    if (!targetUser) {
      return message.reply('❌ Đạo hữu phải tag một người cần tát chứ! Ví dụ: `dtat @User`');
    }

    // Link GIF tát mặc định hoặc nhận từ args[1]
    const gifUrl = args[1] || 'https://media.giphy.com/media/Gf3AUz3eBNbTW/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#e67e22') // Màu cam đậm chát chúa
      .setTitle('👋 CÚ TÁT TRỜI GIÁNG 👋')
      .setDescription(`Đạo hữu **${message.author}** vừa giáng một cú tát "yêu" bay màu cho **${targetUser}**! Tỉnh cả người chưa hả em? 🌌`)
      .setImage(gifUrl) // Dùng setImage để hỗ trợ link ảnh GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Ra đòn bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};