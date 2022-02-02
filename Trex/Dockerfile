FROM fusuf/whatsasena:latest

RUN git clone https://github.com/DARKCRIME1/New-up /root/New-up
WORKDIR /root/New-up/
ENV TZ=Europe/Istanbul
RUN npm install supervisor -g
RUN yarn install --no-audit

CMD ["node", "bot.js"]
