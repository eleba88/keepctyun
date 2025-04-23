# 天冀云电脑Docke保活
## 🚀 如何使用？
### 1️⃣ 推荐Docker部署
docker-compose.yml
```
services:
  ctyun:
    image: ghcr.nju.edu.cn/eleba88/keepctyun:latest
    container_name: ctyun
    restart: always
```
### 2️⃣ 首次需要扫码
```
$ docker-compose up -d
$ docker logs -f ctyun
```
扫码登陆即可,后续会直接登陆
