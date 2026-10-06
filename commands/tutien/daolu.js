const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Bảng từ điển vật phẩm đồng bộ (dùng chung với Chợ NPC / Túi đồ cá nhân)
const ITEM_DICTIONARY = {
  'thaoduoc': { name: '🌿 Thảo Dược Sơ Cấp' },
  'da': { name: '🪨 Thạch Đầu (Đá)' },
  'giay': { name: '📜 Tuyên Thành Giấy' },
  'manh_linhthach': { name: '💎 Mảnh Linh Thạch' },
  'linhthach_thuongpham': { name: '🌟 Linh Thạch Thượng Phẩm' },
  'go': { name: '🪵 Gỗ Thường' },
  'bogo': { name: '🌲 Bó Gỗ Lớn' },
  'rom': { name: '🌾 Rơm Khô' },
  'trung': { name: '🥚 Trứng Gà Linh Thú' },
  'botmi': { name: '🥟 Bột Mì Tinh' },
  'suabo': { name: '🥛 Sữa Bò Thượng Hạng' },
  'muoi': { name: '🧂 Muối Biển Tinh Luyện' },
  'duong': { name: '🍯 Đường Phèn' },
  'dan_ha': { name: '💊 Linh Đan Hạ Phẩm' },
  'dan_trung': { name: '💊 Linh Đan Trung Phẩm' },
  'dan_thuong': { name: '🔮 Linh Đan Thượng Phẩm' }
};

module.exports = {
  name: 'daolu',
  aliases: ['ketdoi', 'phuthe', 'nguoiyu'],
  description: 'Hệ thống Đạo Lữ: Túi chung, điểm thân mật, tặng quà, kho chung và ly hôn',
  async execute(message, args, db, client, PREFIX) {
    const userId = message.author.id;
    const subCmd = args[0];

    let partnerId = await db.get(`daolu_${userId}`);

    // --- LỆNH: KẾT ĐÔI / CẦU HÔN (ddaolu @user) ---
    if (message.mentions.users.size > 0 && !subCmd) {
      const targetUser = message.mentions.users.first();
      
      if (targetUser.id === userId) {
        return message.reply('❌ Đạo hữu không thể tự kết duyên với chính mình được!');
      }
      if (targetUser.bot) {
        return message.reply('❌ Không thể kết đạo lữ với máy móc (Bot)!');
      }

      if (partnerId) {
        return message.reply('⚠️ Đạo hữu đã có đạo lữ rồi, không thể tơ hồng vương vấn người khác!');
      }

      let targetPartner = await db.get(`daolu_${targetUser.id}`);
      if (targetPartner) {
        return message.reply(`⚠️ Đối phương đã có đạo lữ rồi, đừng chen chân vào nhân duyên của người khác!`);
      }

      const inviteEmbed = new EmbedBuilder()
        .setColor(0xE91E63)
        .setTitle('💞 LỜI TỎA TƯ VẤN - TƠ HỒNG KẾT ĐÔI 💞')
        .setDescription(`Đạo hữu **${message.author}** đã ngỏ lời muốn kết tóc se duyên, cùng nhau song tu trên con đường đại đạo với **${targetUser}**!\n\n⏳ _Lời mời này sẽ hết hạn sau 60 giây._`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('accept_daolu').setLabel('💍 Đồng Ý Kết Đôi').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('reject_daolu').setLabel('💔 Từ Chối').setStyle(ButtonStyle.Danger)
      );

      const msg = await message.reply({ content: `${targetUser}`, embeds: [inviteEmbed], components: [row] });

      const collector = msg.createMessageComponentCollector({
        filter: i => i.user.id === targetUser.id,
        time: 60000
      });

      collector.on('collect', async i => {
        if (i.customId === 'accept_daolu') {
          const coupleKey = [userId, targetUser.id].sort().join('_');

          await db.set(`daolu_${userId}`, targetUser.id);
          await db.set(`daolu_${targetUser.id}`, userId);
          await db.set(`intimacy_${coupleKey}`, 10);

          await i.update({
            content: `🎉 **THIÊN HẠ HỮU HỶ!** Cử hành đại lễ thành hôn thành công! Chúc hai vị **${message.author.username}** và **${targetUser.username}** trăm năm hạnh phúc, đồng tâm hiệp lực bước vào cõi trường sinh!`,
            components: []
          });
        } else {
          await i.update({
            content: `💔 **DUYÊN CHƯA TỚI!** Đạo hữu **${targetUser.username}** đã từ chối lời cầu hôn.`,
            components: []
          });
        }
        collector.stop();
      });

      collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
          try {
            await msg.edit({ content: '⏳ Lời mời kết đôi đã quá hạn.', components: [] });
          } catch (e) {}
        }
      });

      return;
    }

    if (!partnerId) {
      return message.reply(`❌ Đạo hữu hiện vẫn còn độc thân! Hãy dùng \`${PREFIX}daolu @nguoichiem\` để tỏ tình cầu hôn.`);
    }

    const partner = await client.users.fetch(partnerId).catch(() => null);
    const partnerName = partner ? partner.tag : 'Ẩn Sĩ';
    
    const coupleKey = [userId, partnerId].sort().join('_');
    let intimacy = parseInt(await db.get(`intimacy_${coupleKey}`)) || 10;
    let sharedMoney = parseInt(await db.get(`shared_money_${coupleKey}`)) || 0;

    // --- SUB-COMMAND: TẶNG QUÀ (Tương thích giữ nguyên) ---
    if (subCmd === 'tangqua') {
      const amount = parseInt(args[1]);
      if (!amount || isNaN(amount) || amount <= 0) {
        return message.reply(`❌ Vui lòng nhập số lượng linh thạch muốn tặng! (VD: \`${PREFIX}daolu tangqua 500\`)`);
      }

      let userMoney = parseInt(await db.get(`money_${userId}`)) || 0;
      if (userMoney < amount) {
        return message.reply(`❌ Đạo hữu không đủ ${amount.toLocaleString('vi-VN')} Linh Thạch trong túi cá nhân để tặng!`);
      }

      userMoney -= amount;
      await db.set(`money_${userId}`, userMoney);
      
      sharedMoney += amount;
      await db.set(`shared_money_${coupleKey}`, sharedMoney);

      intimacy += Math.floor(amount / 100) + 1;
      await db.set(`intimacy_${coupleKey}`, intimacy);

      return message.reply(`🎁 Đạo hữu đã bỏ vào **Túi Chung** **${amount.toLocaleString('vi-VN')} Linh Thạch**!\n❤️ Điểm thân mật tăng vọt, hiện đạt: **${intimacy} điểm**.`);
    }

    // --- HIỆN GIAO DIỆN CHÍNH (CÓ NÚT BẤM TÚI CHUNG) ---
    const infoEmbed = new EmbedBuilder()
      .setColor(0xFF69B4)
      .setTitle('🌸 ĐẠO LỮ ĐIỂN TỊCH - THẾ GIỚI HAI TA 🌸')
      .addFields(
        { name: '👥 Phủ Thê', value: `**${message.author.username}** ❤️ **${partnerName}**`, inline: false },
        { name: '❤️ Điểm Thân Mật', value: `\`${intimacy} điểm\``, inline: true },
        { name: '💰 Túi Chung Linh Thạch', value: `\`${sharedMoney.toLocaleString('vi-VN')} Linh Thạch\``, inline: true }
      )
      .setDescription(`📌 **Các lệnh hỗ trợ:**\n` +
        `- \`${PREFIX}daolu tangqua <số_lượng>\`: Gửi linh thạch vào túi chung + tăng điểm thân mật.\n` +
        `- \`${PREFIX}daolu lihon\`: Mở giao diện ly hôn (đường ai nấy đi).`)
      .setTimestamp();

    const mainRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn_shared_inv').setLabel('🎒 Túi Chung').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('btn_divorce_menu').setLabel('💔 Ly Hôn').setStyle(ButtonStyle.Danger)
    );

    const msg = await message.reply({ embeds: [infoEmbed], components: [mainRow] });

    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time: 300000 // 5 phút
    });

    collector.on('collect', async i => {
      try {
        // --- XEM TÚI CHUNG VẬT PHẨM ---
        if (i.customId === 'btn_shared_inv' || i.customId === 'back_shared_inv') {
          let currentSharedMoney = parseInt(await db.get(`shared_money_${coupleKey}`)) || 0;
          
          let sharedItemList = [];
          for (const [key, info] of Object.entries(ITEM_DICTIONARY)) {
            const qty = parseInt(await db.get(`shared_inv_${coupleKey}_${key}`)) || 0;
            if (qty > 0) {
              sharedItemList.push(`• **${info.name}**: \`x${qty.toLocaleString('vi-VN')}\``);
            }
          }

          const itemDesc = sharedItemList.length > 0 ? sharedItemList.join('\n') : '*(Túi chung chưa có vật phẩm nào)*';

          const sharedEmbed = new EmbedBuilder()
            .setColor(0x9b59b6)
            .setTitle(`🎒 KHO BÁU CHUNG - ${message.author.username.toUpperCase()} &${partnerName.toUpperCase()}`)
            .setDescription(`💰 **Linh Thạch chung**: \`${currentSharedMoney.toLocaleString('vi-VN')} Linh Thạch\`\n\n📦 **Vật phẩm trong kho chung**:\n${itemDesc}`);

          const sharedRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_deposit').setLabel('📤 Gửi Đồ').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('btn_withdraw').setLabel('📥 Lấy Đồ').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_back_main').setLabel('⬅️ Quay Lại').setStyle(ButtonStyle.Primary)
          );

          return await i.update({ embeds: [sharedEmbed], components: [sharedRow] });
        }

        // --- QUAY LẠI MENU CHÍNH ĐẠO LỮ ---
        if (i.customId === 'btn_back_main') {
          let currentSharedMoney = parseInt(await db.get(`shared_money_${coupleKey}`)) || 0;
          let currentIntimacy = parseInt(await db.get(`intimacy_${coupleKey}`)) || 10;

          const refreshEmbed = new EmbedBuilder()
            .setColor(0xFF69B4)
            .setTitle('🌸 ĐẠO LỮ ĐIỂN TỊCH - THẾ GIỚI HAI TA 🌸')
            .addFields(
              { name: '👥 Phủ Thê', value: `**${message.author.username}** ❤️ **${partnerName}**`, inline: false },
              { name: '❤️ Điểm Thân Mật', value: `\`${currentIntimacy} điểm\``, inline: true },
              { name: '💰 Túi Chung Linh Thạch', value: `\`${currentSharedMoney.toLocaleString('vi-VN')} Linh Thạch\``, inline: true }
            )
            .setDescription(`📌 **Các lệnh hỗ trợ:**\n` +
              `- \`${PREFIX}daolu tangqua <số_lượng>\`: Gửi linh thạch vào túi chung + tăng điểm thân mật.\n` +
              `- \`${PREFIX}daolu lihon\`: Mở giao diện ly hôn (đường ai nấy đi).`)
            .setTimestamp();

          return await i.update({ embeds: [refreshEmbed], components: [mainRow] });
        }

        // --- GỬI ĐỒ VÀO KHO CHUNG (MODAL) ---
        if (i.customId === 'btn_deposit') {
          const modal = new ModalBuilder()
            .setCustomId('modal_deposit')
            .setTitle('📤 Gửi Vật Phẩm Vào Kho Chung');

          const itemKeyInput = new TextInputBuilder()
            .setCustomId('input_item_key')
            .setLabel('Mã vật phẩm (VD: thaoduoc, da, go...)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('thaoduoc')
            .setRequired(true);

          const qtyInput = new TextInputBuilder()
            .setCustomId('input_qty')
            .setLabel('Số lượng muốn gửi:')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('5')
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(itemKeyInput),
            new ActionRowBuilder().addComponents(qtyInput)
          );

          await i.showModal(modal);
          
          const modalSubmit = await i.awaitModalSubmit({
            filter: mi => mi.customId === 'modal_deposit' && mi.user.id === userId,
            time: 60000
          }).catch(() => null);

          if (!modalSubmit) return;

          const itemKey = modalSubmit.fields.getTextInputValue('input_item_key').trim().toLowerCase();
          const qty = parseInt(modalSubmit.fields.getTextInputValue('input_qty'));

          if (!ITEM_DICTIONARY[itemKey]) {
            return await modalSubmit.reply({ content: `❌ Mã vật phẩm \`${itemKey}\` không tồn tại trong hệ thống!`, ephemeral: true });
          }
          if (isNaN(qty) || qty <= 0) {
            return await modalSubmit.reply({ content: `❌ Số lượng không hợp lệ!`, ephemeral: true });
          }

          // Kiểm tra túi cá nhân
          const personalQty = parseInt(await db.get(`inv_${userId}_${itemKey}`)) || 0;
          if (personalQty < qty) {
            return await modalSubmit.reply({ content: `❌ Trong túi riêng của đạo hữu chỉ có \`x${personalQty}\` ${ITEM_DICTIONARY[itemKey].name}, không đủ để gửi!`, ephemeral: true });
          }

          // Trừ kho riêng, cộng kho chung
          await db.set(`inv_${userId}_${itemKey}`, personalQty - qty);
          const currentSharedQty = parseInt(await db.get(`shared_inv_${coupleKey}_${itemKey}`)) || 0;
          await db.set(`shared_inv_${coupleKey}_${itemKey}`, currentSharedQty + qty);

          return await modalSubmit.reply({ content: `✅ Đã gửi thành công **${qty}x ${ITEM_DICTIONARY[itemKey].name}** vào Kho Chung!`, ephemeral: true });
        }

        // --- LẤY ĐỒ TỪ KHO CHUNG (MODAL) ---
        if (i.customId === 'btn_withdraw') {
          const modal = new ModalBuilder()
            .setCustomId('modal_withdraw')
            .setTitle('📥 Lấy Vật Phẩm Từ Kho Chung');

          const itemKeyInput = new TextInputBuilder()
            .setCustomId('input_item_key')
            .setLabel('Mã vật phẩm (VD: thaoduoc, da, go...)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('thaoduoc')
            .setRequired(true);

          const qtyInput = new TextInputBuilder()
            .setCustomId('input_qty')
            .setLabel('Số lượng muốn lấy:')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('5')
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(itemKeyInput),
            new ActionRowBuilder().addComponents(qtyInput)
          );

          await i.showModal(modal);

          const modalSubmit = await i.awaitModalSubmit({
            filter: mi => mi.customId === 'modal_withdraw' && mi.user.id === userId,
            time: 60000
          }).catch(() => null);

          if (!modalSubmit) return;

          const itemKey = modalSubmit.fields.getTextInputValue('input_item_key').trim().toLowerCase();
          const qty = parseInt(modalSubmit.fields.getTextInputValue('input_qty'));

          if (!ITEM_DICTIONARY[itemKey]) {
            return await modalSubmit.reply({ content: `❌ Mã vật phẩm \`${itemKey}\` không hợp lệ!`, ephemeral: true });
          }
          if (isNaN(qty) || qty <= 0) {
            return await modalSubmit.reply({ content: `❌ Số lượng không hợp lệ!`, ephemeral: true });
          }

          // Kiểm tra kho chung
          const sharedQty = parseInt(await db.get(`shared_inv_${coupleKey}_${itemKey}`)) || 0;
          if (sharedQty < qty) {
            return await modalSubmit.reply({ content: `❌ Kho chung hiện chỉ có \`x${sharedQty}\` ${ITEM_DICTIONARY[itemKey].name}, không đủ để lấy!`, ephemeral: true });
          }

          // Trừ kho chung, cộng kho riêng người lấy
          await db.set(`shared_inv_${coupleKey}_${itemKey}`, sharedQty - qty);
          const personalQty = parseInt(await db.get(`inv_${userId}_${itemKey}`)) || 0;
          await db.set(`inv_${userId}_${itemKey}`, personalQty + qty);

          return await modalSubmit.reply({ content: `✅ Đã rút thành công **${qty}x ${ITEM_DICTIONARY[itemKey].name}** từ Kho Chung về túi riêng!`, ephemeral: true });
        }

        // --- GIAO DIỆN LY HÔN (Giữ nguyên tính năng cũ) ---
        if (i.customId === 'btn_divorce_menu') {
          const divorceEmbed = new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('💔 ĐOẠN TUYỆT TÌNH DUYÊN (LY HÔN) 💔')
            .setDescription(`Đạo hữu thực sự muốn đoạn tuyệt mối quan hệ đạo lữ với **${partnerName}** sao?\n\n` +
              `⚖️ **Quy tắc chia tài sản Túi Chung:**\n` +
              `Toàn bộ **${sharedMoney.toLocaleString('vi-VN')} Linh Thạch** trong túi chung sẽ được chia đều 50/50 cho cả hai người khi ly hôn!`);

          const divorceRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm_divorce').setLabel('⚡ Xác Nhận Ly Hôn').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('cancel_divorce').setLabel('🛡️ Suy Nghĩ Lại').setStyle(ButtonStyle.Secondary)
          );

          return await i.update({ embeds: [divorceEmbed], components: [divorceRow] });
        }

        // --- XÁC NHẬN LY HÔN ---
        if (i.customId === 'confirm_divorce') {
          const halfMoney = Math.floor(sharedMoney / 2);
          
          let userMoney = parseInt(await db.get(`money_${userId}`)) || 0;
          let partnerMoney = parseInt(await db.get(`money_${partnerId}`)) || 0;

          await db.set(`money_${userId}`, userMoney + halfMoney);
          await db.set(`money_${partnerId}`, partnerMoney + halfMoney);

          await db.delete(`daolu_${userId}`);
          await db.delete(`daolu_${partnerId}`);
          await db.delete(`shared_money_${coupleKey}`);
          await db.delete(`intimacy_${coupleKey}`);

          return await i.update({
            content: `📜 **ĐOẠN TUYỆT HOÀN TẤT!** Tình duyên giữa hai người đã chấm dứt.\n💰 Tài sản túi chung đã được chia đều, mỗi bên nhận lại **${halfMoney.toLocaleString('vi-VN')} Linh Thạch**. Đường ai nấy đi!`,
            components: []
          });
        }

        // --- HỦY LY HÔN ---
        if (i.customId === 'cancel_divorce') {
          return await i.update({
            content: `🛡️️ Đạo hữu đã hủy bỏ ý định ly hôn.`,
            embeds: [infoEmbed],
            components: [mainRow]
          });
        }

      } catch (err) {
        console.error(err);
      }
    });
  }
};