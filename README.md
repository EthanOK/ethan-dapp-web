# node -v : v18.14.2

# Docker

## 1. pull and run

```shell
// pull images
docker pull 0xethan/ethan-dapp-web:v2.2.2

// run container
docker run -p 8888:3000 --name ethan-dapp-web 0xethan/ethan-dapp-web:v2.2.2
```

## 2. docker build images

### 本地使用 `单平台 + --load`

`docker buildx build -t 0xethan/ethan-dapp-web:v2.2.2 . --platform linux/arm64 --load`

### `推送` 到远程仓库 `多平台 + --push`

`docker buildx build -t 0xethan/ethan-dapp-web:v2.2.2 . --platform linux/amd64,linux/arm64 --push`

## 3. run container

### docker run

`docker run -p 8888:3000 --name ethan-dapp-web 0xethan/ethan-dapp-web:v2.2.2`

### docker-compose

运行 docker-compose.yml

`docker-compose up`

`docker-compose up -d`
