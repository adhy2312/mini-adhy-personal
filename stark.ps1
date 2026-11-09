$Host.UI.RawUI.WindowTitle = "STARK WORKSHOP DAEMON - MINI-ADHY PERSONAL AI"
Set-Location -Path $PSScriptRoot
node --loader ./esm-loader.mjs stark-daemon.mjs

