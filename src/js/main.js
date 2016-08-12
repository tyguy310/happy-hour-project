// add scripts

// google maps api key AIzaSyD3nHjd0_RGDNdjaWEqsfJpcNn7WD3osic


$(document).on('ready', function() {
  console.log('sanity check!');

  $('#findOwn').hide();
  $('.restInfo').hide();
  encodeURIName(restNameURI);
  // console.log(restNameURI);
});

function getRandomMenu (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getMenu (venue) {
  // return new Promise(function(resolve,reject) {
  return Promise.resolve(
    $.ajax({
      url:'https://api.foursquare.com/v2/venues/' + restInfoArray[venue].id + '/menu?client_id=K451HYAEBJX0PR3DF3XDMGTCLRIMKBVRAJXIWEDQ5NY4Y0VZ&client_secret=KQCBRZBR3B2E3FQFGLZOYZHYFU5O5U5MNPIKY2GAQONINNPZ&v=20160812',
      method: 'GET'
    })
  );
}

var lonLat;
function getIPLonLat () {
  return new Promise(function(resolve,reject) {
    // $.getJSON('http://ipinfo.io/', function(data){
    //   ll = data.loc.split(',').map(Number);
    var Longitude = 39.73;
    var Latitude = -104.992;
      resolve(lonLat = Longitude + ',' + Latitude);
    // });
  });
}

function filterForMenu (restaurant) {
  if (restaurant.venue.hasMenu === true) {
    return true;
  }
}

function menuDisplay (item) {
  $('.menu').append('<h4 class="name">' + item.name + '</h4>');
  if (item.description !== undefined) {
    $('.menu').append('<p class="description">' + item.description + '</p>');
  }
  // $('.menu').append('<ul>' + '</ul>');
  const ENTRIESARRAY = item.entries.items;
  for (let i = 0; i < ENTRIESARRAY.length; i++) {
    $('.menu').append('<li>' + ENTRIESARRAY[i].price + ' - ' + ENTRIESARRAY[i].name + '<br>' + ENTRIESARRAY[i].description + '</li>')
  }
};

function filterforMenuCount (venue) {
  // console.log(venue);
  if (venue.somethingElse.count !== 0) {
     return true;
  }
}

function filterforHHMenu (venue) {
  var typeArray = venue.somethingElse.items;
  if (typeArray !== undefined) {
    for (var i = 0; i < typeArray.length; i++) {
      if(typeArray[i].name === 'Happy Hour' || typeArray[i].name === 'Happy Hour Menu') {
      return true;
      }
    }
  }
}

function appendRestInfo (restaurant) {
  var restaurantUrl = restaurant.url.replace(/^https?:\/\//,'');
  var restaurantLink = '<a href ="' + restaurant.url + '">' + restaurantUrl + '</a>';

  $('.restInfo').append('<p>' + restaurant.name + '</p>');
  $('.restInfo').append(restaurantLink);
  $('.restInfo').append('<p>' + restaurant.hours.status + '</p>');
}

function menuCreator(menu){
  var MENUTYPEARRAY = menu.somethingElse.items;
  // console.log(MENUTYPEARRAY);
  for (let i = 0; i < MENUTYPEARRAY.length; i++) { //possibly a forEach loop here?
    if (MENUTYPEARRAY[i].name === 'Happy Hour Menu' || MENUTYPEARRAY[i].name === 'Happy Hour') {

      $('.menu').append('<h4 class="text-center">' + MENUTYPEARRAY[i].description + '</h4>');

      var menu = MENUTYPEARRAY[i].entries.items;
      menu.forEach(menuDisplay);
    };
  };
}

function nonHHMenuCreator(menu){
  var MENUTYPEARRAY = menu.somethingElse.items;
  for (let i = 0; i < MENUTYPEARRAY.length; i++) { //possibly a forEach loop here?

      $('.menu').append('<p>' + MENUTYPEARRAY[i].description + '</p>');

      var menu = MENUTYPEARRAY[i].entries.items;
      menu.forEach(menuDisplay);
  };
}

var restInfoArray = [];
function makeRestInfoArray (restaurant) {
  restInfoArray.push(restaurant.venue);
  return restInfoArray;
}
var selectedMenu;
var randomHHMenu;
var hHmenuarray = [];
  $('#getHappy').on('click', function()  {
    $('.menu').html('');
    getIPLonLat().then(function(lonLat) {

      $.ajax({
        url:'https://api.foursquare.com/v2/venues/explore?client_id=K451HYAEBJX0PR3DF3XDMGTCLRIMKBVRAJXIWEDQ5NY4Y0VZ&client_secret=KQCBRZBR3B2E3FQFGLZOYZHYFU5O5U5MNPIKY2GAQONINNPZ&v=20160812&section=food&sortByDistance=' + $('#closest').prop('checked') + '&openNow=' + $('#openNow').val() + '&limit=50&near=denver',
        method: 'GET'
      }).done(function(results){
        // console.log(results);
        RESTARRAYWITHMENU = results.response.groups[0].items.filter(filterForMenu);
        // console.log(RESTARRAYWITHMENU);
        RESTARRAYWITHMENU.forEach(makeRestInfoArray);
        // console.log(restInfoArray);
      }).then(function() {
        var promiseGroup = [];
        for (let i = 0; i < restInfoArray.length; i++) {
          promiseGroup.push(getMenu(i));
        };
        Promise.all(promiseGroup).then(function(group){
          var menus = group.map(function (menu) {
            return menu.response.menu.menus;
          });

          restInfoArray.forEach(function (restaurant, index) {
            restaurant.somethingElse = menus[index];
          });
          hHmenuarray = restInfoArray.filter(filterforHHMenu);
          console.log(hHmenuarray);
          selectMenuRetrieve(hHmenuarray)

          menuCreator(selectedMenu);
        })
      })
    })
  });

  function selectMenuRetrieve (menuarray) {
    selectedMenu = menuarray.pop()
    return selectedMenu;
  }

  $('#next').on('click', function () {
    $('.menu').html('');
    $('.restInfo').hide();
    $('#googleMap').html('');
    // console.log(hHmenuarray);
    if (hHmenuarray.length === 0) {
      $('#findOwn').show()
      $('#alert').fadeIn(1000).delay(2000).fadeOut(1000);
    } else {
      selectMenuRetrieve(hHmenuarray);
      menuCreator(selectedMenu);
    }
  })
  var allFilteredMenus = [];

var restNameURI = 'denver';
function encodeURIName (name) {
  restNameURI = encodeURI(name);
}

  $('#takeMe').on('click', function () {
    $('.restInfo').html('');
    // $('.map').html('');
    console.log(selectedMenu);
    appendRestInfo(selectedMenu);
    encodeURIName(selectedMenu.name)

    // console.log(restNameURI);
    $('.restInfo').show();
    $('#googleMap').append('<iframe width="250" height="250" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/search?key=AIzaSyD3nHjd0_RGDNdjaWEqsfJpcNn7WD3osic&q=' + restNameURI + '"></iframe>')
console.log(restNameURI);
  })

var randomMenu;
  $('#findOwn').on('click', function () {
    $('.menu').html('');
    $('.restInfo').html('');
    $('#googleMap').html('');

    allFilteredMenus = restInfoArray.filter(filterforMenuCount);

    // console.log(allFilteredMenus);
    randomMenu = allFilteredMenus[getRandomMenu(0,allFilteredMenus.length)];
    selectedMenu = randomMenu
    nonHHMenuCreator(selectedMenu);
  })
