#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN} LARAVEL CACHE CLEARING UTILITY${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""

echo -e "${GREEN}Running cache:clear...${NC}"
php artisan cache:clear
echo ""

echo -e "${GREEN}Running config:clear...${NC}"
php artisan config:clear
echo ""

echo -e "${GREEN}Running route:clear...${NC}"
php artisan route:clear
echo ""

echo -e "${GREEN}Running view:clear...${NC}"
php artisan view:clear
echo ""

echo -e "${GREEN}Running optimize:clear...${NC}"
php artisan optimize:clear
echo ""

echo -e "${GREEN}Running event:clear...${NC}"
php artisan event:clear
echo ""

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN} ALL CACHES CLEARED SUCCESSFULLY${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""
