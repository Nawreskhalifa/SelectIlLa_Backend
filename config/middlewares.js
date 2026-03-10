module.exports = [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  "global::role-middleware",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
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
      origin: ["http://localhost:8080", "http://localhost:1337",'http://localhost:3000']
    },
  },
];
