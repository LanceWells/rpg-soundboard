FROM ubuntu:latest
WORKDIR /in

RUN apt-get update
RUN apt-get -y install cmake build-essential g++-mingw-w64 gcc-mingw-w64

CMD ["sh", "-c", " \
  rm -rf build && \
  mkdir build && \
  cd build && \
  cmake -DCMAKE_TOOLCHAIN_FILE=config/mingw.cmake ../ && \
  make && \
  cd demo && \
  make && \
  cp ../gme/libgme.dll ./libgme.dll \
  "]
