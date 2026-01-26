@echo off
set "INPUT_VIDEO=Untitled (Facebook Post).mp4"
set "OUTPUT_VIDEO=Untitled (Facebook Post)_enhanced.mp4"

echo Current Directory: %CD%
echo Enhancing video: %INPUT_VIDEO%...
echo This will upscale 2x and apply unsharp mask for better clarity.

ffmpeg -i "%INPUT_VIDEO%" -vf "scale=iw*2:ih*2:flags=neighbor,unsharp=5:5:1.0:5:5:0.0" -c:v libx264 -crf 18 -preset slow "%OUTPUT_VIDEO%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Enhanced video saved as: %OUTPUT_VIDEO%
) else (
    echo.
    echo ERROR: FFmpeg failed. Make sure FFmpeg is installed and in your PATH.
)
pause