module.exports = {
  dbDev: "mongodb://dev:dev@172.20.10.2:27017/dev",
  dbProduction: "mongodb+srv://worker:PASSWORD@node-k6euf.mongodb.net/kucos?retryWrites=true&w=majority",
  allowedHostname: ["http://localhost:3000", "https://blog.example.com"],
  kucosServerUrl: "http://localhost:3000",
  
  adminPassword: "yourVeryStrongPassword",

  // Antispam by Akismet
  // Visit https://akismet.com/account/ for your own API Key, its free.
  enableAkismet: false, // Change to true if you want to detect spam.
  akismetTesting: false,
  akismetApiKey: "yourApiKey"
};
