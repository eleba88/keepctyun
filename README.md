# 🚀 天冀云电脑Docke保活
### 1️⃣ 推荐Docker部署,注意一下网卡的mtu
docker-compose.yml
```
version: "3"
networks:
  nasnet:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 1450
    ipam:
      config:
        - subnet: 10.0.0.0/24
services:
  ctyun:
    image: ghcr.nju.edu.cn/eleba88/keepctyun:latest
    container_name: ctyun
    networks: [nasnet]
    restart: always
    volumes:
      - './ctyun:/usr/src/server/data'
    environment:
      - TZ=Asia/Shanghai
```
### 2️⃣ 首次需要扫码
```
创建一个目录放浏览器浏览器数据 puppeteer这个镜像的用户及组是10042:999
$ mkdir ctyun && sudo chown -R 10042:999 ctyun
$ docker-compose up -d
$ docker logs -f ctyun
```
第一次需要扫码登陆即可,后续会直接登陆

![image](https://github.com/eleba88/keepctyun/blob/master/screenshot/pic_01.png)
