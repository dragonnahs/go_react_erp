<!--
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-24 15:17:21
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-24 15:27:30
 * @FilePath: \go_react_erp\README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
backend:
    <!-- 发布 -->
    ```
    cd backend
    <!-- 设置环境变量powershell -->
    $env:GOOS = "linux"
    $env:GOARCH = "amd64"
    go build -o erp-sys

    ./erp-sys
    ```
    <!-- 开发 -->
    ```
    cd backend
    go run main.go

sys-admin:
    cd sys-admin
    npm run dev


# go 启动服务
sudo vi /etc/systemd/system/erp-sys.service
内容
```
[Unit]
Description=ERP System
After=network.target

[Service]
ExecStart=/home/user/erp-sys
WorkingDirectory=/home/user/
Restart=always
User=user

[Install]
WantedBy=multi-user.target

```


# 启动服务
sudo systemctl start erp-sys

# 查看服务状态
sudo systemctl status erp-sys

# 关闭
sudo systemctl enable erp-sys

# 重启
sudo systemctl daemon-reload