FROM node:10

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       sudo vim gcc g++ openjdk-8-jdk python python3 \
       dos2unix inotify-tools libcgroup-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN npm install --only=production

RUN gcc -o runguard -O2 runguard.c -lcgroup -lm

RUN groupadd -r -g 1234 ojapp && useradd -r -g 1234 ojapp

CMD [ "npm", "start" ]
