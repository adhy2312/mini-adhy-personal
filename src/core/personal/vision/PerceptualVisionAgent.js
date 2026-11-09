/**
 * ════════════════════════════════════════════════════════════════════
 *  PERCEPTUAL VISION AGENT — WINDOWS DESKTOP VISUAL INTELLIGENCE
 * ════════════════════════════════════════════════════════════════════
 * Gives Mini-Adhy real-time eyes on the Windows workstation:
 * 1. Open Window Enumeration & Active Focus Tracking
 * 2. Window Manipulation (Bring to focus, minimize, restore)
 * 3. Native Windows.Media.Ocr Text Extraction from screenshots
 * 4. Screen region inspection for automated workflow verification
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export class PerceptualVisionAgent {
  constructor(options = {}) {
    this.tempDir = options.tempDir || path.join(process.cwd(), 'data', 'screenshots');
    if (!fs.existsSync(this.tempDir)) {
      try { fs.mkdirSync(this.tempDir, { recursive: true }); } catch {}
    }
  }

  /**
   * Enumerates all currently visible top-level windows
   */
  async getOpenWindows() {
    const psScript = `
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;
  using System.Collections.Generic;

  public class WinUtils {
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll", SetLastError=true)]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  }
"@

$windows = New-Object System.Collections.Generic.List[PSCustomObject]

[WinUtils]::EnumWindows({
  param($hwnd, $lparam)
  if ([WinUtils]::IsWindowVisible($hwnd)) {
    $sb = New-Object System.Text.StringBuilder 256
    [void][WinUtils]::GetWindowText($hwnd, $sb, 256)
    $title = $sb.ToString().Trim()
    if ($title.Length -gt 0) {
      $pid = 0
      [void][WinUtils]::GetWindowThreadProcessId($hwnd, [ref]$pid)
      $p = Get-Process -Id $pid -ErrorAction SilentlyContinue
      $windows.Add([PSCustomObject]@{
        Handle = $hwnd.ToInt64()
        Title = $title
        ProcessId = $pid
        ProcessName = if ($p) { $p.ProcessName } else { "Unknown" }
      })
    }
  }
  return $true
}, [IntPtr]::Zero)

$windows | ConvertTo-Json -Compress
`;

    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    try {
      const { stdout } = await execAsync(`powershell -NoProfile -EncodedCommand ${encoded}`, { timeout: 6000 });
      if (!stdout.trim()) return [];
      const data = JSON.parse(stdout);
      return Array.isArray(data) ? data : [data];
    } catch {
      // Fallback using simple Get-Process MainWindowTitle
      return this._fallbackGetWindows();
    }
  }

  async _fallbackGetWindows() {
    try {
      const cmd = `Get-Process | Where-Object { $_.MainWindowTitle } | Select-Object Id, ProcessName, MainWindowTitle | ConvertTo-Json -Compress`;
      const { stdout } = await execAsync(`powershell -NoProfile -Command "${cmd}"`, { timeout: 4000 });
      if (!stdout.trim()) return [];
      const data = JSON.parse(stdout);
      const list = Array.isArray(data) ? data : [data];
      return list.map(p => ({
        ProcessId: p.Id,
        ProcessName: p.ProcessName,
        Title: p.MainWindowTitle
      }));
    } catch {
      return [];
    }
  }

  /**
   * Retrieves the currently active foreground window
   */
  async getActiveWindow() {
    const psScript = `
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;

  public class ActiveWin {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  }
"@

$hwnd = [ActiveWin]::GetForegroundWindow()
$sb = New-Object System.Text.StringBuilder 256
[void][ActiveWin]::GetWindowText($hwnd, $sb, 256)
$pid = 0
[void][ActiveWin]::GetWindowThreadProcessId($hwnd, [ref]$pid)
$p = Get-Process -Id $pid -ErrorAction SilentlyContinue

[PSCustomObject]@{
  Handle = $hwnd.ToInt64()
  Title = $sb.ToString().Trim()
  ProcessId = $pid
  ProcessName = if ($p) { $p.ProcessName } else { "Unknown" }
} | ConvertTo-Json -Compress
`;

    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    try {
      const { stdout } = await execAsync(`powershell -NoProfile -EncodedCommand ${encoded}`, { timeout: 3500 });
      if (!stdout.trim()) return null;
      return JSON.parse(stdout);
    } catch {
      return null;
    }
  }

  /**
   * Brings an application window to the foreground by partial title match
   */
  async focusWindow(partialTitle) {
    if (!partialTitle) return { success: false, error: 'Title match required' };
    const safeTitle = partialTitle.replace(/["`$\\]/g, '');

    const psScript = `
$wscript = New-Object -ComObject Wscript.Shell
$success = $wscript.AppActivate('${safeTitle}')
[PSCustomObject]@{ Focused = $success; Target = '${safeTitle}' } | ConvertTo-Json -Compress
`;
    try {
      const { stdout } = await execAsync(`powershell -NoProfile -Command "${psScript}"`, { timeout: 4000 });
      const data = JSON.parse(stdout);
      return { success: Boolean(data.Focused), target: safeTitle };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Performs native Windows OCR text recognition on an image file
   */
  async extractTextFromImage(imagePath) {
    if (!fs.existsSync(imagePath)) {
      return { success: false, error: `Image file not found: ${imagePath}` };
    }

    const resolved = path.resolve(imagePath).replace(/\\/g, '\\\\');

    // Windows 10/11 built-in Windows.Media.Ocr PowerShell script
    const psScript = `
[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null

$file = [Windows.Storage.StorageFile]::GetFileFromPathAsync('${resolved}').GetAwaiter().GetResult()
$stream = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read).GetAwaiter().GetResult()
$decoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream).GetAwaiter().GetResult()
$bitmap = $decoder.GetSoftwareBitmapAsync().GetAwaiter().GetResult()

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) {
  Write-Output '{"success":false,"error":"OCR engine unavailable for language profile"}'
  exit
}

$ocrResult = $engine.RecognizeAsync($bitmap).GetAwaiter().GetResult()
[PSCustomObject]@{
  success = $true
  text = $ocrResult.Text
  linesCount = $ocrResult.Lines.Count
} | ConvertTo-Json -Compress
`;

    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    try {
      const { stdout } = await execAsync(`powershell -NoProfile -EncodedCommand ${encoded}`, { timeout: 12000 });
      if (!stdout.trim()) return { success: false, error: 'Empty OCR output' };
      return JSON.parse(stdout);
    } catch (err) {
      return { success: false, error: `OCR extraction failed: ${err.message}` };
    }
  }
}

export const perceptualVisionAgent = new PerceptualVisionAgent();

