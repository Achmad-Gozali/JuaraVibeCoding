# Pake Node.js versi 18
FROM node:18-alpine

# Bikin folder aplikasi
WORKDIR /app

# Copy file package dulu buat install library
COPY package*.json ./
RUN npm install

# Copy semua kodingan backend lu
COPY . .

# Build kodingan TS lu jadi JS
RUN npm run build

# Port standar Hugging Face (Wajib 7860)
EXPOSE 7860

# Jalanin servernya
CMD ["npm", "start"]