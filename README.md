# 🚀 天冀云电脑Docke保活
### 1️⃣ 推荐Docker部署
docker-compose.yml
```
services:
  ctyun:
    image: keepctyun:latest
    container_name: ctyun
    restart: always
    volumes:
      - './ctyun:/usr/src/server/data'
```
### 2️⃣ 首次需要扫码
```
创建一个目录放浏览器浏览器数据 puppeteer这个镜像的用户及组是10042:999
$ mkdir ctyun && sudo chown -R 10042:999 ctyun
$ docker-compose up -d
$ docker logs -f ctyun
```
第一次需要扫码登陆即可,后续会直接登陆
