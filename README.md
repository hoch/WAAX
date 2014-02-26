WAAX (Web Audio API eXtension)
------------------------------
**JavaScript library for music and audio programming on Chrome**

Building
--------
The included grunt script will build all of the WAAX files and minify them.

First install grunt and other dev dependencies:

```bash
$ npm install
```

Then to minify:

```bash
$ grunt
```

Both `waax.js` and `waax.min.js` will be generated in the `build/` directory.

Documentation
-------------
To generate the documentation:

```bash
$ grunt bfdocs
```
