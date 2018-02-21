# PNGArrays
Compression algorithm for numerical lists. Output is encoded as a PNG image. Browser + Nodejs


<img width="100%" src="fc.png">

## Documentation to follow.

There are examples for browser or node use included. Early tests (check the benchmarks data folder and compare file sizes across different data sets - pretty graphs to follow soon) show compression comparable, or better than gzip.

There is a browser version of the library, and nodejs version. The nodejs version is able to make use of the optiPNG lossless compression optimizer to further reduce file size, to smaller than gzip, without losing data, and is the recommended version to use. The browser version still does most of the same compression work, but does not compress to smaller than gzip.