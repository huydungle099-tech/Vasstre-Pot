const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'nuong',
  aliases: ['dnuong', 'nuongthit'],
  description: 'Nướng mục tiêu trên lửa hồng kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first();
    
    if (!targetUser) {
      return message.reply('❌ Đạo hữu phải tag một người cần "nướng" chứ! Ví dụ: `dnuong @User`');
    }

    if (targetUser.id === message.author.id) {
      return message.reply('❌ Ơ hay, sao lại tự đem mình lên giàn nướng thế này? Khát nước đến mức tự nướng chín luôn à? 😅');
    }

    // Link GIF nướng/lửa hài hước mặc định hoặc nhận từ args[1]
    const gifUrl = args[1] || 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWZlbDllaDExdWlyd3c4MDB2NnZhZzZjenhydHljemZreXI5b3MxdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2xPS9bJpkDXWvgcW4L/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#ff4500') // Màu đỏ cam lửa cháy rực rỡ
      .setTitle('🔥 LÒ NƯỚNG THẦN THÁNH 🔥')
      .setDescription(`Đạo hữu **${message.author}** đã bật lửa max công suất để "nướng" **${targetUser}** chín vàng ươm! Thơm phức!!`)
      .setImage(gifUrl) // Dùng setImage để hỗ trợ link ảnh GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Được nướng bởi đầu bếp ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};