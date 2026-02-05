set -e
cd /var/www/academia/backoffice
rm -rf .next public .env.local
if [ -f /tmp/backoffice-build.tar.gz ]; then
  tar -xzf /tmp/backoffice-build.tar.gz -C . 
  rm -f /tmp/backoffice-build.tar.gz
elif [ -f /tmp/backoffice-build.zip ]; then  
unzip -o /tmp/backoffice-build.zip -d .

rm -f /tmp/backoffice-build.zip
fi
sudo chown -R ubuntu:ubuntu .next public .env.local || true
sudo chmod -R 755 .next public || true
chmod 644 .env.local || true
echo '✓ BackOffice atualizado com .env.local correto'
cat .env.local || true
pm2 restart academia-backoffice || pm2 start npm --name academia-backoffice -- start
sleep 3
pm2 status || true