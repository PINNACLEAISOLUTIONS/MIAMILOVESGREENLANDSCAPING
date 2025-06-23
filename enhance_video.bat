@echo off
echo Installing required Python packages...
pip install opencv-python numpy tqdm
echo.
echo Running video enhancement script...
python enhance_video.py
echo.
echo If successful, the enhanced video has been saved as "Untitled (Facebook Post)_enhanced.mp4"
echo Please update the video source in index.html to use this enhanced version.
pause