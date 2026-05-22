#!/bin/sh
ROOT_DIR=/usr/share/nginx/html
# Replace env vars in files served by NGINX
for file in $ROOT_DIR/index.html $ROOT_DIR/assets/*.js*;
do
  sed -i 's|VITE_API_URL|'${VITE_API_URL}'|g' $file

done
exec "$@"