@echo off
echo ====================================
echo   Git Auto-Push Skripti Ishga Tushdi
echo ====================================
echo.

:: O'zgarishlarni qo'shish
git add .

:: Kommit xabarini so'rash (agar shunchaki Enter bossangiz, avto-xabar yoziladi)
set /p commitMsg="Commit xabarini kiriting (bo'sh qoldirsangiz 'Auto update'): "
if "%commitMsg%"=="" set commitMsg=Auto update %date% %time%

:: Commit qilish
git commit -m "%commitMsg%"

:: Git push qilish
echo.
echo GitHub/GitLab'ga yuklanmoqda...
git push

echo.
echo ====================================
echo   Muvaffaqiyatli yuklandi! 🚀
echo ====================================
pause