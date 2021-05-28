export const environment = {
  production: true,

  monday: {
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjEwNDEzNzg0NSwidWlkIjoxNjMzMzQ1LCJpYWQiOiIyMDIxLTAzLTI0VDA2OjA1OjAzLjU2MFoiLCJwZXIiOiJtZTp3cml0ZSIsImFjdGlkIjo2OTc5NzksInJnbiI6InVzZTEifQ.F33TvuwKuKzIyipXblbTRrlJ2aAtVA3C9ZPVCZKsIAc',
    client_id:  'ddc4de8eafde865ef1b2418acafa0acb',
    client_sec: '78278e7064170bfb9d305cef21aeb0f6',
    client_ss: '78278e7064170bfb9d305cef21aeb0f6',
    tokenURL: 'https://auth.monday.com/oauth2/authorize?client_id=ddc4de8eafde865ef1b2418acafa0acb'
  },
  syncsketch: {
    token: 'b1bb92aa73acc60d25721172ba0f64db2654e5ca',
    user: 'acranchliquidanimationcom',
    url: 'https://syncsketch.com/api/v2/'
  },
  celoxis: {
    token: 'EmzOuD4qnaOpBJLXnstwmx3zKI0wPQQ03OHlVgB8',
    url: 'https://la-bne-clx.la.lan:8843/psa/api/v2/'
  },
  confluence: {
    token: 'eLMhONup5waKKjutXAEbE67B',
    user: 'acranch@liquidanimation.com',
    admin: {
      org: '087d96b9-279j-1d72-6c95-1kj15c3k0d69',
      key: 'n2YlZ4N0s9QBkapyVGB8'
    }
  },
  box: {
    "boxAppSettings": {
      "clientID": "716jyn35oyj0h2uewomtbvd07fipmkjt",
      "clientSecret": "uooxY4e7knargOnhU2018IYC3KvK21OC",
    },
    "enterpriseID": "203146362",
    "authorizeUrl": "https://account.box.com/api/oauth2/authorize/",
    "ApiUrl" : "https://api.box.com/2.0/"
  },
  firebase: {
    apiKey: "AIzaSyAFsVU3wTvJ5HOrPlBtE7qMpOYbaldAwtw",
    authDomain: "pm-websocket.firebaseapp.com",
    databaseURL: "https://pm-websocket-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pm-websocket",
    storageBucket: "pm-websocket.appspot.com",
    messagingSenderId: "1005946956635",
    appId: "1:1005946956635:web:c444f29973a663585f087e",
    measurementId: "G-0JDT91CJT0"
  }
};
