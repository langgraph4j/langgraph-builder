rm -rf .next
yarn run build
cp -r public .next/standalone/public       
cp -r .next/static .next/standalone/.next/static 
mv .next/standalone/server.js .next/standalone/server.cjs