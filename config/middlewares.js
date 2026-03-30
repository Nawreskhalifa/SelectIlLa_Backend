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
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://analytics.strapi.io"
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
      origin: ["http://localhost:8080", "http://localhost:1337",'http://localhost:3000','http://localhost:8081', 'http://localhost:5173',"http://localhost:3001","http://localhost", "http://localhost:80"]
    
    },
  },

  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];