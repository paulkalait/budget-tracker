
const FILES_TO_CACHE = [
    "index.html",
    "./js/db.js",
    "./js/index.js",
    "./css/styles.css",
    "../models/transaction.js",
    "../routes/api.js"
]
const APP_PREFIX = 'BudgetTrack-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION

// service workers run before the window object has ever been created. So instead we use the self keyword to instantiate linsetenrs on the service workers. The context of self here refers to the service worker object
self.addEventListener('install', function (e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
      })
    )

})

self.addEventListener('activate', function(e){
    e.waitUntil(
        //this moethof will return a promise with an array of the cache keys
        caches.keys().then(function (keyList){
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX)
            })
            cacheKeeplist.push(CACHE_NAME)
            // this method will not return until all promises are accpeted or rejected
            return Promise.all(keyList.map(function(key, i){
                if(cacheKeeplist.indexOf(key) === -1){
                    //if key not found in keep list *REMOVE it from the cache
                    return caches.delete(keyList[i])
                }
            }))
        })
    )
    cacheKeeplist.push(CACHE_NAME);
})


self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    //attach the respondWIth method to the event
    e.respondWith(
        caches.match(e.request).then(function (request){
            if(request){ //if chace is available , respond with cache
            console.log('responding with cache: ' + request)
        return request
    }else{   //if there are no cache, try fetching request
        console.log('file is not caches, fetching : ' + e.request.url)
        return fetch(e.request)
    }


    console.log(request || fetch(e.request))
        })
  
    )
  })