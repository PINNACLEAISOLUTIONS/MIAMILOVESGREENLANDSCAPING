@echo off
echo ===================================================
echo Advanced Video Enhancement using FFmpeg
echo ===================================================
echo.

REM Check if FFmpeg is installed
where ffmpeg >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo FFmpeg is not installed or not in your PATH.
    echo Please download and install FFmpeg from https://ffmpeg.org/download.html
    echo.
    echo After installing, you can run this script again.
    pause
    exit /b
)

echo FFmpeg found. Proceeding with video enhancement...
echo.

set INPUT_VIDEO=./Untitled (Facebook Post).mp4
set OUTPUT_VIDEO=./Untitled (Facebook Post)_enhanced.mp4

echo Input video: %INPUT_VIDEO%
echo Output video: %OUTPUT_VIDEO%
echo.

echo Enhancing video quality...
echo This may take several minutes depending on your computer's performance.
echo.

REM Apply advanced FFmpeg filters for quality enhancement
ffmpeg -i "%INPUT_VIDEO%" ^
-vf "scale=iw*2:ih*2:flags=lanczos, ^
unsharp=5:5:1.5:5:5:0.0, ^
eq=brightness=0.05:contrast=1.3:saturation=1.5, ^
hqdn3d=4:3:6:3, ^
format=yuv420p" ^
-c:v libx264 -preset slow -crf 18 -b:v 8M ^
-c:a aac -b:a 192k ^
"%OUTPUT_VIDEO%"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error enhancing video. Please check if the input file exists and try again.
    pause
    exit /b
)

echo.
echo Video enhancement complete!
echo Enhanced video saved as: %OUTPUT_VIDEO%
echo.
echo The HTML has been updated to use this enhanced video.
echo.
pause