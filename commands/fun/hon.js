const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'hon',
  aliases: ['dhon'],
  description: 'Trao nụ hôn ngọt ngào kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first();
    
    if (!targetUser) {
      return message.reply('❌ Đạo hữu phải tag một người cần hôn chứ! Ví dụ: `dhon @User`');
    }

    // Link GIF hôn ngọt ngào mặc định hoặc nhận từ args[1]
    const gifUrl = args[1] || 'https://cdn.weeb.sh/images/Skc42pdv-.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#ff69b4') // Màu hồng ngọt ngào
      .setTitle('💋 NỤ HÔN NGỌT NGÀO 💋')
      .setDescription(`Đạo hữu **${message.author}** đã trao một nụ hôn ướt át cho **${targetUser}**! Phản ứng hóa học bùng nổ quá đi! 💕`)
      .setImage(gifUrl) // Dùng setImage để hỗ trợ link ảnh GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Trao gửi bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};