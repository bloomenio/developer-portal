FROM openresty/openresty:alpine-fat

RUN apk update && \
   apk add --no-cache apache2-utils cmake openssl coreutils autoconf g++ libtool make python git py-pip libressl-dev

RUN pip install gitpython

RUN curl -fL -o /tmp/mongo-c-driver.tar.gz \
             https://github.com/mongodb/mongo-c-driver/archive/1.14.1.tar.gz \
 && tar -xzf /tmp/mongo-c-driver.tar.gz -C /tmp/ \
 && cd /tmp/mongo-c-driver-* \
 # Build mongo-c-driver from sources
 # https://git.alpinelinux.org/aports/tree/non-free/mongo-c-driver/APKBUILD
 && mkdir -p /tmp/build/mongo-c-driver/ && cd /tmp/build/mongo-c-driver/ \
 && cmake -DCMAKE_BUILD_TYPE=Release \
          -DCMAKE_INSTALL_PREFIX=/usr \
          -DCMAKE_INSTALL_LIBDIR=lib \
          -DENABLE_BSON:STRING=ON \
          -DENABLE_MONGOC:BOOL=ON \
          -DENABLE_SSL:STRING=OPENSSL \
          -DENABLE_AUTOMATIC_INIT_AND_CLEANUP:BOOL=OFF \
          -DENABLE_MAN_PAGES:BOOL=OFF \
          -DENABLE_TESTS:BOOL=ON \
          -DENABLE_EXAMPLES:BOOL=OFF \
          -DCMAKE_SKIP_RPATH=ON \
        /tmp/mongo-c-driver-* \
 && make \
 # Check mongo-c-driver build
 && MONGOC_TEST_SKIP_MOCK=on \
    MONGOC_TEST_SKIP_SLOW=on \
    MONGOC_TEST_SKIP_LIVE=on \
    make check \
    \
 # Install mongo-c-driver
 && make install

#USER root
RUN rm /etc/nginx/conf.d/*


RUN /usr/local/openresty/luajit/bin/luarocks install lua-mongo 

COPY conf/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY conf/server/*.conf /etc/nginx/conf.d/
ADD conf/service/*.src /etc/nginx/conf.d/
ADD conf/upstream/*.ups /etc/nginx/conf.d/
ADD bloomen-shared.lua /usr/local/openresty/lualib/bloomen-shared.lua


ADD script/entrypoint.sh /entrypoint.sh
ADD script/le.sh /le.sh

RUN \
 chmod +x /entrypoint.sh && \
 chmod +x /le.sh && \
 chmod +w /etc/nginx/conf.d &&\
 apk add  --update certbot tzdata openssl && \
 rm -rf /var/cache/apk/*

CMD ["/entrypoint.sh"]
