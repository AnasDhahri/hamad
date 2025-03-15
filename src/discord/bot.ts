import { Client, GatewayIntentBits, Events } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnection,
  AudioPlayer,
} from '@discordjs/voice';
import { TranslationService } from '../services/translationService';
import { AudioConfigService } from '../services/audioConfig';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const connections = new Map<string, VoiceConnection>();
const players = new Map<string, AudioPlayer>();
const translationServices = new Map<string, TranslationService>();

client.once(Events.ClientReady, () => {
  console.log('Translation bot is ready!');
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!translate')) {
    const args = message.content.split(' ');
    const command = args[1];
    
    switch (command) {
      case 'join':
        await handleJoinCommand(message);
        break;
      case 'leave':
        await handleLeaveCommand(message);
        break;
      case 'languages':
        await handleLanguagesCommand(message);
        break;
      default:
        await message.reply('Available commands: !translate join <from-lang> <to-lang>, !translate leave, !translate languages');
    }
  }
});

async function handleJoinCommand(message: any) {
  if (!message.member?.voice.channel) {
    await message.reply('You need to be in a voice channel first!');
    return;
  }

  const args = message.content.split(' ');
  const fromLang = args[2] || 'en-US';
  const toLang = args[3] || 'es-ES';

  try {
    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild!.id,
      adapterCreator: message.guild!.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    connections.set(message.guild!.id, connection);
    players.set(message.guild!.id, player);

    const translationService = new TranslationService();
    translationServices.set(message.guild!.id, translationService);

    // Start translation service
    await translationService.startTranslation(
      fromLang,
      toLang,
      (text) => {
        // Handle interim results
        message.channel.send(`Translating: ${text}`);
      },
      async (translation) => {
        // Handle final translation
        message.channel.send(`Translation: ${translation}`);
        
        // Synthesize and play translation
        try {
          await translationService.synthesizeSpeech(translation, toLang);
          // Convert synthesized audio to Discord audio resource
          const resource = createAudioResource('path/to/synthesized/audio');
          player.play(resource);
        } catch (error) {
          console.error('Error synthesizing speech:', error);
        }
      }
    );

    await message.reply(`Joined voice channel and started translation from ${fromLang} to ${toLang}`);
  } catch (error) {
    console.error('Error joining voice channel:', error);
    await message.reply('Failed to join voice channel. Please try again.');
  }
}

async function handleLeaveCommand(message: any) {
  const connection = connections.get(message.guild!.id);
  const translationService = translationServices.get(message.guild!.id);

  if (connection) {
    await translationService?.stopTranslation();
    connection.destroy();
    connections.delete(message.guild!.id);
    translationServices.delete(message.guild!.id);
    await message.reply('Left voice channel and stopped translation.');
  } else {
    await message.reply('Not currently in a voice channel.');
  }
}

async function handleLanguagesCommand(message: any) {
  const languages = [
    'en-US (English)',
    'es-ES (Spanish)',
    'fr-FR (French)',
    'de-DE (German)',
    'it-IT (Italian)',
    'pt-PT (Portuguese)',
    'ru-RU (Russian)',
    'zh-CN (Chinese)',
    'ja-JP (Japanese)',
    'ko-KR (Korean)'
  ];

  await message.reply(`Available languages:\n${languages.join('\n')}`);
}

client.login(process.env.DISCORD_TOKEN);