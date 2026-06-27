FROM oven/bun:latest

# 复制代码
COPY . /ethan-dapp-web

# 设置容器启动后的默认运行目录
WORKDIR /ethan-dapp-web


RUN bun install


CMD ["bun","start"]
