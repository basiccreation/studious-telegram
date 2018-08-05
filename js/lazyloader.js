//https://deanhume.com/lazy-loading-images-using-intersection-observer/




// Get all of the images that are marked up to lazy load
const images = document.querySelectorAll('.js-lazy-image');
const config = {
  // If the image gets within 50px in the Y axis, start the download.
  rootMargin: '50px 0px',
  threshold: 0.01
};


function onIntersection(entries) {
  // Loop through the entries
  entries.forEach(entry => {
    // Are we in viewport?
    if (entry.intersectionRatio > 0) {

      // Stop watching and load the image
      observer.unobserve(entry.target);
      preloadImage(entry.target);
    }
  });
}

// The observer for the images on the page
let observer = new IntersectionObserver(onIntersection, config);
  images.forEach(image => {
    observer.observe(image);
  });

  // If we don't have support for intersection observer, load the images immediately
if (!('IntersectionObserver' in window)) {
  Array.from(images).forEach(image => preloadImage(image));
} else {
  // It is supported, load the images
  observer = new IntersectionObserver(onIntersection, config);
  images.forEach(image => {
 
   observer.observe(image);
  });
}