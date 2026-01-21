This is a simple script that captures all of the BELABOX® websocket messages and sends them to the Internet via WebSocket. This can be used for monitoring (e.g. using my [SRT Exporter](https://github.com/roflb0y/SRTExporter) for Prometheus)

#### Note: this project is not affiliated with BELABOX®

### Installing
1. Login to your SBC (Radxa Rock, Orange Pi, Jetson Nano) via SSH. Clone the repo and cd into it.
   ```shell
   git clone https://github.com/roflb0y/BBSender
   cd BBSender
   ```
2. Install nano (because it's not installed by default)
   ```shell
   sudo apt install nano -y
   ```
3. Rename config.example.json to config.json and edit it. If you're using my SRT Exporter, the url should be ```ws://<ip>:5055/ws```. Set the password to your BELABOX panel password. Leave the token empty.
   ```shell
   mv config.example.json config.json
   nano config.json
   ```
4. Install the WebSocket package and run
   ```shell
   npm install ws
   npm run start
   ```
   If everything is set up correctly, in your console you should see something like this...<br>
   <img height="150" alt="image" src="https://github.com/user-attachments/assets/3970621c-f7a7-4374-a4c4-8807f17a7a41" /><br>
   and if you go to your metrics page at ```http://<ip>:5050/metrics```...<br>
   <img height="150" alt="brave_8B7jXS4ulu" src="https://github.com/user-attachments/assets/921ed0ed-4502-4fe3-9c0b-f90beea397d2" /><br>
   If so then proceed
6. Install systemd service
   ```shell
   sudo cp bbsender.service /etc/systemd/system/bbsender.service
   
   sudo systemctl daemon-reload
   sudo systemctl start bbsender
   sudo systemctl enable bbsender
   ```
