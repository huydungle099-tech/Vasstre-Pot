const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'hoathieu',
  aliases: ['dhoathieu'],
  description: 'Hỏa thiêu mục tiêu kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first() || message.author;
    
    // Đạo hữu có thể truyền link GIF động vào args[1] hoặc bot tự dùng link lửa cháy mặc định bên dưới
    const gifUrl = args[1] || 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExM283c3BnNDB0bzZ6M3JyN2Q1MTgzb2FrMXozcHFucTB4MzBjeHMwbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kbJQ5WGbINezGWgvmz/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#d35400') // Màu cam lửa cực kỳ cháy bỏng
      .setTitle('🔥 NGHIỆP HỎA HỎA THIÊU 🔥')
      .setDescription(`Tam muội chân hỏa nổi lên, hỏa thiêu đạo hữu **${targetUser}** thành tro bụi! Nóng quá... nóng quá! 🌋`)
      .setImage(gifUrl) // Dùng setImage để hỗ trợ link ảnh GIF động liên kết
      .setTimestamp()
      .setFooter({ text: `Hỏa thiêu bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};