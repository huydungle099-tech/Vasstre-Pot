const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

// ⚙️ KẾT NỐI DATABASE TRỰC TIẾP TẠI ĐÂY ĐỂ KHÔNG BAO GIỜ BỊ LỖI UNDEFINED:
// (Nếu bot của đạo hữu dùng Quick.db, SQLite, JSONFile hoặc Enmap, hãy chỉnh lại dòng require này cho khớp với dự án của đạo hữu)
const Database = require('quick.db'); // Hoặc đường dẫn tới file/thư viện database của bot
const db = new Database.QuickDB(); // Hoặc biến db mà bot đang sử dụng (ví dụ: const db = require('../../database');)

module.exports = {
  data: new SlashCommandBuilder()
    .setName('luuchamngon')
    .setDescription('Lưu lại châm ngôn kèm hình ảnh cho một đạo hữu (Hiển thị công khai)')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('Đạo hữu được lưu châm ngôn')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('image')
        .setDescription('Hình ảnh châm ngôn (dưới 10MB)')
        .setRequired(true)),

  name: 'luuchamngon',
  aliases: ['lcn', 'lchamngon', 'xemchamngon', 'xemcn', 'xoachamngon', 'xcn', 'xchamngon'],
  description: 'Hệ thống quản lý châm ngôn các đạo hữu (Lưu, Xem, Xóa)',

  async execute(messageOrInteraction, args, dbInstance, client, PREFIX) {
    // Sử dụng trực tiếp biến db đã require ở trên, hoặc lấy từ tham số nếu có
    const activeDb = dbInstance || db;

    const isSlash = messageOrInteraction.isChatInputCommand && messageOrInteraction.isChatInputCommand();

    // ==========================================
    // XỬ LÝ LỆNH SLASH: /luuchamngon
    // ==========================================
    if (isSlash) {
      const targetUser = messageOrInteraction.options.getUser('target');
      const attachment = messageOrInteraction.options.getAttachment('image');

      if (!attachment) {
        return messageOrInteraction.reply({ content: '❌ Vui lòng đính kèm một hình ảnh hợp lệ dưới 10MB!', ephemeral: true });
      }

      const key = `chamngon_${targetUser.id}`;
      let list = (await activeDb.get(key)) || [];
      
      list.push({
        url: attachment.url,
        author: messageOrInteraction.user.id,
        time: Date.now()
      });

      await activeDb.set(key, list);

      const publicEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('📜 LƯU TRỮ CHÂM NGÔN THÀNH CÔNG!')
        .setDescription(`Đạo hữu <@${messageOrInteraction.user.id}> vừa ghi chép một câu châm ngôn mới cho <@${targetUser.id}>!`)
        .setImage(attachment.url)
        .setFooter({ text: `Tổng số châm ngôn của đạo hữu này: ${list.length} trang` })
        .setTimestamp();

      await messageOrInteraction.reply({ 
        content: `Đã lưu châm ngôn cho <@${targetUser.id}>`, 
        embeds: [publicEmbed] 
      });
      return;
    }

    // ==========================================
    // XỬ LÝ PREFIX COMMAND (xemchamngon / xoachamngon)
    // ==========================================
    const message = messageOrInteraction;
    const currentPrefix = PREFIX || '!';
    const invokedCommand = message.content.slice(currentPrefix.length).trim().split(/ +/)[0].toLowerCase();

    // --- LỆNH XEM CHÂM NGÔN ---
    if (['xemchamngon', 'xemcn'].includes(invokedCommand)) {
      const targetUser = message.mentions.users.first() || message.author;
      const key = `chamngon_${targetUser.id}`;
      let list = (await activeDb.get(key)) || [];

      if (list.length === 0) {
        return message.reply(`❌ Đạo hữu <@${targetUser.id}> chưa có châm ngôn nào được ghi chép lại cả!`);
      }

      let currentIndex = 0;

      const generateEmbed = (index) => {
        return new EmbedBuilder()
          .setColor(0x9b59b6)
          .setTitle(`📜 CHÂM NGÔN CỦA - ${targetUser.username.toUpperCase()} 📜`)
          .setImage(list[index].url)
          .setFooter({ text: `Trang ${index + 1} /${list.length} • Được lưu bởi hệ thống` })
          .setTimestamp();
      };

      const getButtons = (index) => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('cn_prev').setLabel('<< Quay lại').setStyle(ButtonStyle.Primary).setDisabled(index === 0),
          new ButtonBuilder().setCustomId('cn_next').setLabel('Tiếp >>').setStyle(ButtonStyle.Primary).setDisabled(index === list.length - 1)
        );
      };

      const msg = await message.reply({ embeds: [generateEmbed(currentIndex)], components: [getButtons(currentIndex)] });

      const collector = msg.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 60000 
      });

      collector.on('collect', async i => {
        if (i.customId === 'cn_prev' && currentIndex > 0) {
          currentIndex--;
        } else if (i.customId === 'cn_next' && currentIndex < list.length - 1) {
          currentIndex++;
        }

        await i.update({ embeds: [generateEmbed(currentIndex)], components: [getButtons(currentIndex)] });
      });

      collector.on('end', async () => {
        try {
          await msg.edit({ components: [] });
        } catch (e) {}
      });
      return;
    }

    // --- LỆNH XÓA CHÂM NGÔN ---
    if (['xoachamngon', 'xcn', 'xchamngon'].includes(invokedCommand)) {
      const targetUser = message.mentions.users.first();
      if (!targetUser) {
        return message.reply(`⚠️ Vui lòng tag đạo hữu cần xóa châm ngôn! Cú pháp: \`${currentPrefix}xoachamngon @user\``);
      }

      const key = `chamngon_${targetUser.id}`;
      let list = (await activeDb.get(key)) || [];

      if (list.length === 0) {
        return message.reply(`❌ Đạo hữu <@${targetUser.id}> không có châm ngôn nào trong kho để xóa cả.`);
      }

      const options = list.map((item, index) => ({
        label: `Châm ngôn #${index + 1}`,
        description: `Lưu ngày: ${new Date(item.time).toLocaleDateString('vi-VN')}`,
        value: `del_cn_${index}`
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('delete_chamngon_select')
        .setPlaceholder('🗑️ Chọn châm ngôn muốn xóa...')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const promptMsg = await message.reply({ 
        content: `📋 Hãy chọn bức châm ngôn cần xóa của <@${targetUser.id}> từ menu bên dưới:`, 
        components: [row] 
      });

      const collector = promptMsg.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 30000
      });

      collector.on('collect', async i => {
        if (i.customId === 'delete_chamngon_select') {
          const selectedIndex = parseInt(i.values[0].replace('del_cn_', ''));
          
          list.splice(selectedIndex, 1);
          await activeDb.set(key, list);

          await i.update({ 
            content: `🗑️ Đã xóa thành công châm ngôn #${selectedIndex + 1} của <@${targetUser.id}>! Hiện còn lại ${list.length} châm ngôn.`, 
            components: [] 
          });
          collector.stop();
        }
      });

      collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
          try {
            await promptMsg.edit({ content: '⏳ Đã hết thời gian thao tác xóa châm ngôn.', components: [] });
          } catch (e) {}
        }
      });
      return;
    }
  }
};