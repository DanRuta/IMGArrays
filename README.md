# PNGArrays
Compression algorithm for numerical lists. Output is encoded as a PNG image, and beats gzip. Browser + Nodejs

<img width="100%" src="fc.png">

## More documentation to follow.

Examples can be found in the `demo.html`, and `convert.js` files.

## How to use

The library can be used in both the browser, and nodejs. The nodejs version, however, is greatly preferrable, as it includes the optiPNG lossless compression optimizer (http://optipng.sourceforge.net/) as an extra, final step, which reduces the output to a smaller size than gzip. The browser version still does most of the same compression work (which still has its uses), but does not compress to smaller than gzip.

*Pretty charts from benchmarks to follow soon, but you can already see the results in the 'benchmarks data' folder*

### Converting to PNG

##### PNGArrays.toPNG(array, {alpha, file, width, capacity})
**array** - _Array_ |_Uint8ClampedArray_

The array of data to convert. This can be either a Uint8ClampedArray, or an array of numbers that will get converted to Uint8ClampedArray

**alpha** - _Boolean_ (Optional) - *Default*: `false`

 Whether to use the alpha channel for storing data. The file size is not affected, but the image dimensions are smaller, when used.

**file** - _String_

For Nodejs use. Gives the file path to write to. Required to switch to the nodejs logic, instead of the browser's.

**capacity** - _int_ - *Default*: `1`

How many characters of metadata to use per value. More information and explanation on this to follow, but in short, 0 is for normalized values, 1 (default) for values up to 99999999, and 2 for values up to 999999999999999. Smaller capacities use smaller file sizes.


### Converting from PNG

##### PNGArrays.fromPNG(data, {alpha, capacity})
**data** - _Uint8ClampedArray_|_HTMLImageElement_|_string_

The PNG data to parse. This can be an image element, when using the browser.
For reading from a file, when using nodejs, this can be a string for the file path to read from.
Finally, it can be a Uint8ClampedArray, in either case.

**alpha** - _Boolean_ (Optional) - *Default*: `false`

Whether to use the alpha channel, when parsing. You need to make sure that alpha was used when converting, if using this option.

**capacity** - _int_ - *Default*: `1`

The capacity to use for parsing. Must be the same as the value used when converting to PNG.


### Other
You can use the included `PNGArrays.normalize` and `PNGArrays.unnormalize` functions to normalize your data, to allow you to use the lowest capacity size.

The `PNGArrays.normalize` returns an object containing the minValue, and maxValue, needed when using `PNGArrays.unnormalize`. Example:
```javascript
const data = [1,2,3,-5,0.4,2]
const {minVal, maxVal} = PNGArrays.normalize(data)
// data == [0.75, 0.875, 1, 0, 0.675, 0.875]
// minVal = -5
// maxVal = 3
PNGArrays.unnormalize(data, -5, 3)
// data == [1,2,3,-5,0.4,2]
```