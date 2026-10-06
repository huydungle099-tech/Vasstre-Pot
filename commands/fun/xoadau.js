const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'xoadau',
  aliases: ['dxoadau'],
  description: 'Xoa đầu cưng chiều kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first();
    
    if (!targetUser) {
      return message.reply('❌ Đạo hữu phải tag một người cần xoa đầu chứ! Ví dụ: `dxoadau @User`');
    }

    // Link GIF xoa đầu cưng chiều mặc định hoặc nhận từ args[1]
    const gifUrl = args[1] || 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm9xNmtyOGZwdjJ2aHl6Y3F1ZTFmcHF5M3ZxNWMyNDQyZ29xdzZ2ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f9EmXxglhdhAj1bo28/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#00bfff') // Màu xanh trời nhẹ nhàng, dễ thương
      .setTitle('🥰 XOA ĐẦU CƯNG CHIỀU 🥰')
      .setDescription(`Đạo hữu **${message.author}** đã nhẹ nhàng xoa đầu **${targetUser}** một cái thật cưng chiều! Ngọt ngào quá đi mất thôi! ✨`)
      .setImage(gifUrl) // Dùng setImage để hỗ trợ link ảnh GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Cưng chiều bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};