@echo off
echo ===================================
echo  LARAVEL CACHE CLEARING UTILITY
echo ===================================
echo.

echo Running cache:clear...
php artisan cache:clear
echo.

echo Running config:clear...
php artisan config:clear
echo.

echo Running route:clear...
php artisan route:clear
echo.

echo Running view:clear...
php artisan view:clear
echo.

echo Running optimize:clear...
php artisan optimize:clear
echo.

echo Running event:clear...
php artisan event:clear
echo.

echo ===================================
echo  ALL CACHES CLEARED SUCCESSFULLY
echo ===================================
echo.

pause
