/*jshint esversion: 6 */


let restaurants,
    neighborhoods,
    cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", (event) => {
    fetchNeighborhoods();
    fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById("neighborhoods-select");
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement("option");
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
};



/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById("cuisines-select");

    cuisines.forEach(cuisine => {
        const option = document.createElement("option");
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
    updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
    const cSelect = document.getElementById("cuisines-select");
    const nSelect = document.getElementById("neighborhoods-select");

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById("restaurants-list");
    ul.innerHTML = "";

    // Remove all map markers
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
    self.restaurants = restaurants;
};




/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById("restaurants-list");

    restaurants.forEach(restaurant => {

        ul.append(createRestaurantHTML(restaurant));

    });

    addMarkersToMap();

};

/**
 * Create restaurant HTML.
 */

createRestaurantHTML = (restaurant) => {
    const li = document.createElement("li");
    li.className = "restaurant-li col-xs-12 col-l-6";

    // const picture = document.createElement("picture");
    // li.append(picture);

    const imagep = document.createElement("img");
    imagep.className = " lozad left-s restaurant-img col-xs-12 col-s-6 col-l-12";
    imagep.alt = DBHelper.imageAltForRestaurant(restaurant);
    imagep.setAttribute("data-Src", DBHelper.webpImageUrlForRestaurantList(restaurant));
    imagep.src = DBHelper.webpImageUrlForRestaurantList(restaurant);
    li.append(imagep);

    // const image = document.createElement("img");
    // image.className = "lozad restaurant-img";
    // image.alt = DBHelper.imageAltForRestaurant(restaurant);
    // image.setAttribute("data-Src", DBHelper.imageUrlForRestaurantList(restaurant));
    // image.src = DBHelper.imageUrlForRestaurantList(restaurant);
    // li.append(image);
    const div = document.createElement("div");
    div.className = "right-s col-xs-12 col-s-6 col-l-12";
    li.append(div);

    //icons for like feature
    const favoriteIcon = document.createElement("img");
    favoriteIcon.className = "favorite-icon col-xs-1 col-s-1 col-m-1 col-l-1";

    let currentfavorites = localStorage.getItem("favorites");
    currentfavorites = currentfavorites ? JSON.parse(currentfavorites) : {};
    const resID = "resID" + restaurant.id;

    if (currentfavorites[resID] == restaurant.id) {
        favoriteIcon.src = "img/heartsolid.svg";
    } else {
        favoriteIcon.src = "img/heart.svg";
    }



    div.append(favoriteIcon);



    const name = document.createElement("h2");
    name.tabIndex = 1;
    name.title = restaurant.name + " is " +
        restaurant.cuisine_type + " type food in " +
        restaurant.neighborhood;
    name.innerHTML = restaurant.name;
    div.append(name);


    /*cuisine only shows if selection is all*/
    const selectedCuisine = document.getElementById("cuisines-select").selectedIndex;
    
    if (selectedCuisine == 0) {
        const cuisine = document.createElement("p");
        cuisine.className = "cuisine col-s-4 col-xs-4";
        cuisine.innerHTML = restaurant.cuisine_type;
        div.append(cuisine);
    }

    /*neighboorhood only shows if selection is all*/
    const selectedNeighborhood = document.getElementById("neighborhoods-select").selectedIndex;
    if (selectedNeighborhood == 0) {
        const neighborhood = document.createElement("p");
        neighborhood.className = "neighborhood col-s-4 col-xs-4";
        neighborhood.innerHTML = restaurant.neighborhood;
        div.append(neighborhood);
    }

    const address = document.createElement("p");
    address.innerHTML = restaurant.address;
    div.append(address);

    const more = document.createElement("a");
    more.className = "col-xs-12 col-s-12 col-l-12"
    more.innerHTML = "View Details";
    //  more.setAttribute = ('target', '_blank') = "_self";
    more.target = "_self"
    more.tabIndex = 1;

    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more);

    return li;
};



/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, "click", () => {
            window.location.href = marker.url;
        });

        self.markers.push(marker);
    });
};