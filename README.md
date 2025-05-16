node .\nodeServer\server.js

docker run -p 5432:5432 --name buzzJsReload --restart unless-stopped -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres