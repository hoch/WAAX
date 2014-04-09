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

Tests
-----
To run the unit tests, first install the development dependencies:

```bash
$ npm install
```

Then we need to serve the test index.html page.  I like using this [http-server](https://github.com/nodeapps/http-server) utility:

```bash
$ npm install -g http-server
$ http-server
```

Then, visit [http://localhost:8080/test/](http://localhost:8080/test/) in your recently updated Google Chrome.
