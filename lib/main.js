
requirejs.config({
  "baseUrl": "lib",
  "paths": {
    "demo": "demo",
    "jquery": "contrib/jquery-1.10.1.min",
    "modernizr": "contrib/modernizr",
    "prettify": "contrib/prettify",
    "smallipop": "jquery.smallipop",
    "piwik": "https://tracking.sebastianhelzle.net/piwik"
  }
});

requirejs(['modernizr', 'demo']);
