module.exports = [
  "strapi::errors",

  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": [
              "'self'",
              'http://192.168.49.2:30007',
              "http://localhost:3000",
              "http://127.0.0.1:3000",
              "https://analytics.strapi.io",
              "http://localhost:3001",
              'http://localhost:3002',
              'http://a7e93222b68ba4ed7941b1ac21f614a8-1215444167.us-east-1.elb.amazonaws.com:1337',
              'http://a4cb9440074d847c5920de29d145c16c-2097880286.us-east-1.elb.amazonaws.com:1337',
              'http://ae68f7109c75e4893a4ea1ed1afcb864-198466707.us-east-1.elb.amazonaws.com',  // ← AJOUTER
            ],
          "img-src": ["'self'", "data:", "blob:", "http:"],
          "media-src": ["'self'", "data:", "blob:", "http:"],
          "script-src": ["'self'", "'unsafe-inline'"],
        },
      },
    },
  },

  {
    name: "strapi::cors",
    config: {
      enabled: true,
      contentSecurityPolicy: false,
      headers: [
        "Access-Control-Allow-Headers",
        "withCredentials",
        "Origin",
        "Authorization",
        "Accept",
        "X-Requested-With",
        "Content-Type",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
      ],
      origin: ["http://localhost:8080",
         "http://localhost:1337",
         'http://localhost:3000',
         'http://localhost:8081', 
         'http://localhost:5173',
         "http://localhost:3001",
         "http://localhost", 
         "http://localhost:80",
          "http://localhost:82",
          'http://192.168.49.2:30007',
      'http://127.0.0.1:3000',
    'http://localhost:3002',
  "http://frontend-service",
        "http://frontend-service:80",
        'http://192.168.49.2:30080',
         'http://a7e93222b68ba4ed7941b1ac21f614a8-1215444167.us-east-1.elb.amazonaws.com:1337',
        'http://ad7b91c4685d943258995a5f24070881-1285256874.us-east-1.elb.amazonaws.com',
        'http://a4cb9440074d847c5920de29d145c16c-2097880286.us-east-1.elb.amazonaws.com:1337',
      'http://ae68f7109c75e4893a4ea1ed1afcb864-198466707.us-east-1.elb.amazonaws.com',      ]
    
    },
  },

  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];