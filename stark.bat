@echo off
title STARK WORKSHOP DAEMON - MINI-ADHY PERSONAL AI
cd /d "%~dp0"
node --loader ./esm-loader.mjs stark-daemon.mjs
pause

