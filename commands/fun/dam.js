const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'dam',
  aliases: ['ddam', 'punch'],
  description: 'Đấm mục tiêu một cú trời giáng kèm theo hình ảnh/GIF động',
  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first();
    
    if (!targetUser) {
      return message.reply('❌ Đạo hữu muốn đấm ai thì phải tag người đó vào chứ! Ví dụ: `ddam @User`');
    }

    if (targetUser.id === message.author.id) {
      return message.reply('❌ Tự đấm chính mình để kiểm tra nội công à đạo hữu? Đau lắm đấy nhé! 🤕');
    }

    // Link GIF đấm/quyền cước hài hước mặc định hoặc nhận từ args[1]
    const gifUrl = args[1] || 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmcyZWR2OW8ycndsbGlnM3dvYWFjejNkZjI5YXJobjFkeTJ4c3JscCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NuiEoMDbstN0J2KAiH/giphy.gif'; 

    const embed = new EmbedBuilder()
      .setColor('#ff0000') // Màu đỏ máu lửa, tuyệt đối an toàn không lỗi
      .setTitle('👊 MỘT CÚ ĐẤM TRỜI GIÁNG 👊')
      .setDescription(`Đạo hữu **${message.author}** đã tung một cú thiết quyền cực mạnh khiến **${targetUser}** văng ra xa mấy thước! Bay màu luôn! 💥😵`)
      .setImage(gifUrl)
      .setTimestamp()
      .setFooter({ text: `Ra đòn bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};