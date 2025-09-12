FROM node:22

# 复制代码
COPY . /ethan-dapp-web

# 设置容器启动后的默认运行目录
WORKDIR /ethan-dapp-web


RUN npm install


CMD ["npm","start"]
