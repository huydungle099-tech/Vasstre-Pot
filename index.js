const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { QuickDB } = require('quick.db');
const fs = require('node:fs');
const path = require('node:path');

const db = new QuickDB();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

// Khởi tạo kho chứa lệnh
client.commands = new Collection();
client.slashCommands = new Collection();

const PREFIX = 'd';
let isBotStopped = false;

// --- HÀM LOAD LỆNH TỰ ĐỘNG QUÉT TOÀN BỘ THƯ MỤC CON ---
function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  if (!fs.existsSync(commandsPath)) {
    console.log('⚠️ Thư mục "commands" không tồn tại!');
    return;
  }

  const categories = fs.readdirSync(commandsPath);
  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    
    // Kiểm tra nếu là thư mục con
    if (fs.lstatSync(categoryPath).isDirectory()) {
      const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        const filePath = path.join(categoryPath, file);
        const command = require(filePath);
        
        // Nạp lệnh Prefix (nếu có property name)
        if (command.name) {
          client.commands.set(command.name, command);
          console.log(`[PREFIX] Đã nạp lệnh: ${command.name}`);
        }
        
        // Nạp lệnh Slash (nếu có property data)
        if (command.data) {
          client.slashCommands.set(command.data.name, command);
          console.log(`[SLASH] Đã nạp lệnh: /${command.data.name}`);
        }
      }
    }
  }
}

loadCommands();

// --- SỰ KIỆN READY & ĐĂNG KÝ SLASH COMMANDS ---
client.once('ready', async () => {
  console.log(`🤖 Bot đã đăng nhập thành công với tên: ${client.user.tag}`);

  const slashCommandsArray = [];
  client.slashCommands.forEach(cmd => slashCommandsArray.push(cmd.data.toJSON()));

  const rest = new REST({ version: '10' }).setToken(client.token);

  try {
    console.log('🔄 Đang đồng bộ Slash Commands...');
    const MY_GUILD_ID = '1540300445623259226'; // ID Server của đạo hữu

    await rest.put(
      Routes.applicationGuildCommands(client.user.id, MY_GUILD_ID),
      { body: slashCommandsArray },
    );
    console.log('✅ Đã đăng ký thành công Slash Commands!');
  } catch (error) {
    console.error('❌ Lỗi đăng ký Slash Commands:', error);
  }
});

// --- XỬ LÝ SLASH COMMANDS ---
client.on('interactionCreate', async interaction => {
  if (isBotStopped) return;
  if (!interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  try {
    // Truyền interaction và db tương tự lệnh cũ
    if (command.executeSlash) {
      await command.executeSlash(interaction, db, client);
    } else {
      await command.execute(interaction, db);
    }
  } catch (error) {
    console.error(`Lỗi Slash Command ${interaction.commandName}:`, error);
    const errPayload = { content: '❌ Đã xảy ra lỗi hệ thống khi thi triển lệnh này!', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errPayload);
    } else {
      await interaction.reply(errPayload);
    }
  }
});

// --- XỬ LÝ PREFIX COMMANDS (dhelp, dtuvi,...) & QUẢN TRỊ ---
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Lệnh dừng bot
  if (message.content === `${PREFIX}stopbot`) {
    isBotStopped = true;
    return message.reply('🛑 Bot đã được tạm dừng hoạt động!');
  }

  // Lệnh tiếp tục bot
  if (message.content === `${PREFIX}continuebot`) {
    isBotStopped = false;
    return message.reply('▶️ Bot đã hoạt động trở lại bình thường!');
  }

  if (isBotStopped) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return; // Nếu không tìm thấy lệnh, bỏ qua im lặng không lỗi rườm rà

  try {
    await command.execute(message, args, db, client, PREFIX);
  } catch (error) {
    console.error(`Lỗi Prefix Command ${commandName}:`, error);
    message.reply('❌ Đã xảy ra lỗi hệ thống khi thi triển chiêu thức này!');
  }
});

// --- LƯU LOG TIN NHẮN BỊ XÓA ---
client.on('messageDelete', async message => {
  if (!message.guild || message.author?.bot) return;
  if (!message.content) return;

  const guildId = message.guild.id;
  const userId = message.author.id;

  const logData = {
    content: message.content,
    time: Date.now(),
    channelId: message.channel.id
  };

  let deletedLogs = (await db.get(`deleted_logs_${guildId}_${userId}`)) || [];
  deletedLogs.push(logData);
  if (deletedLogs.length > 50) deletedLogs.shift();
  await db.set(`deleted_logs_${guildId}_${userId}`, deletedLogs);
});

// Thay token thật của đạo hữu vào đây
client.login(process.env.DISCORD_TOKEN);