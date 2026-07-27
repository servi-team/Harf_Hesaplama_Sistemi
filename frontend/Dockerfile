FROM nginx:alpine

# Özel Nginx konfigürasyonunu kopyalıyoruz
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Statik web dosyalarını Nginx dizinine kopyalıyoruz
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
