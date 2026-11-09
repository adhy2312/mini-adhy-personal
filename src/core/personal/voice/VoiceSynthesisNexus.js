/**
 * ════════════════════════════════════════════════════════════════════
 *  VOICE SYNTHESIS NEXUS — 100% OFFLINE WINDOWS SPEECH SYNTHESIZER
 * ════════════════════════════════════════════════════════════════════
 * Bridges Mini-Adhy directly to Windows PC audio speakers:
 * • Utilizes native System.Speech.Synthesis via PowerShell
 * • 100% offline, zero cloud reliance, zero external API keys needed
 * • Audible workstation status, alerts, and verbal confirmations
 * • Rate, volume, and voice persona customization
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class VoiceSynthesisNexus {
  constructor(options = {}) {
    this.defaultRate = options.defaultRate !== undefined ? options.defaultRate : 1; // -10 to 10
    this.defaultVolume = options.defaultVolume || 100; // 0 to 100
    this.preferredVoice = options.preferredVoice || null;
    this.isMuted = false;
    this.speechHistory = [];
  }

  /**
   * Speaks text through PC speakers using native Windows SAPI
   */
  async speak(text, options = {}) {
    if (!text || typeof text !== 'string' || !text.trim()) {
      return { success: false, error: 'Text is required for speech synthesis.' };
    }

    if (this.isMuted && !options.overrideMute) {
      return { success: true, muted: true, message: 'Voice nexus is muted.' };
    }

    const cleanText = text.replace(/["`$\\]/g, ' ').trim();
    const rate = options.rate !== undefined ? options.rate : this.defaultRate;
    const volume = options.volume !== undefined ? options.volume : this.defaultVolume;
    const voice = options.voice || this.preferredVoice;

    // Build PowerShell SAPI synthesis command
    let psScript = `
Add-Type -AssemblyName System.Speech;
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
$synth.Rate = ${rate};
$synth.Volume = ${volume};
`;

    if (voice) {
      psScript += `
try {
  $synth.SelectVoice('${voice}');
} catch {}
`;
    }

    psScript += `
$synth.Speak("${cleanText}");
$synth.Dispose();
`;

    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    const command = `powershell -NoProfile -EncodedCommand ${encoded}`;

    try {
      await execAsync(command, { timeout: 20000 });

      const record = {
        text: cleanText,
        spokenAt: new Date().toISOString(),
        rate,
        volume,
        voice: voice || 'System Default'
      };
      this.speechHistory.unshift(record);
      if (this.speechHistory.length > 50) this.speechHistory.pop();

      return {
        success: true,
        spoken: true,
        text: cleanText,
        timestamp: record.spokenAt
      };
    } catch (err) {
      return {
        success: false,
        error: `Voice synthesis failed: ${err.message}`
      };
    }
  }

  /**
   * Audible Tony Stark system briefings and status announcements
   */
  async announceBriefing(topic = 'BOOT') {
    const briefings = {
      BOOT: "Jarvis online. Neural core operational, workshop connected. All systems nominal, Creator.",
      HEALTH_NOMINAL: "System diagnostics clear. Memory, storage, and CPU operating well within parameters.",
      THREAT_DEFENSE: "Alert: Perimeter sentinel detected an anomalous payload. Threat neutralized and locked in quarantine vault.",
      BUILD_SUCCESS: "Directive complete. Web bundle compiled and tests verified.",
      NIGHT_MODE: "Entering low-power background vigilance mode. Rest well, Creator."
    };

    const script = briefings[topic] || briefings.BOOT;
    return this.speak(script);
  }

  /**
   * Retrieves installed Windows TTS voices
   */
  async getAvailableVoices() {
    const psScript = `
Add-Type -AssemblyName System.Speech;
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
$synth.GetInstalledVoices() | ForEach-Object {
  [PSCustomObject]@{
    Name = $_.VoiceInfo.Name;
    Culture = $_.VoiceInfo.Culture.Name;
    Gender = $_.VoiceInfo.Gender.ToString();
    Age = $_.VoiceInfo.Age.ToString();
    Enabled = $_.Enabled
  }
} | ConvertTo-Json -Compress
`;
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    try {
      const { stdout } = await execAsync(`powershell -NoProfile -EncodedCommand ${encoded}`, { timeout: 5000 });
      if (!stdout.trim()) return [];
      const data = JSON.parse(stdout);
      return Array.isArray(data) ? data : [data];
    } catch {
      return [{ Name: 'Microsoft David Desktop', Culture: 'en-US', Gender: 'Male', Enabled: true }];
    }
  }

  mute() {
    this.isMuted = true;
  }

  unmute() {
    this.isMuted = false;
  }
}

export const voiceSynthesisNexus = new VoiceSynthesisNexus();
