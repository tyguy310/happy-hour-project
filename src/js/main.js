// add scripts

// google maps api key AIzaSyBK6ivHNatWs_qAUJcKEPfwW5vheWvk8_E


$(document).on('ready', function() {
  console.log('sanity check!');

  $('#findOwn').hide();
  $('.map').hide();
  $('.restInfo').hide();
});

function getRandomMenu (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getMenu (x) {
  // return new Promise(function(resolve,reject) {
  return Promise.resolve(
    $.ajax({
      url:'https://api.foursquare.com/v2/venues/' + restInfoArray[x].id + '/menu?client_id=K451HYAEBJX0PR3DF3XDMGTCLRIMKBVRAJXIWEDQ5NY4Y0VZ&client_secret=KQCBRZBR3B2E3FQFGLZOYZHYFU5O5U5MNPIKY2GAQONINNPZ&v=20160809',
      method: 'GET'
    })
  );
}

var lonLat;
function getIPLonLat () {
  return new Promise(function(resolve,reject) {
    $.getJSON('http://ipinfo.io/', function(data){
      ll = data.loc.split(',').map(Number);
      resolve(lonLat = ll[0] + ',' + ll[1]);
    });
  });
}

function filterForMenu (el) {
  if (el.venue.hasMenu === true) {
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

function filterforMenuCount (el) {
  // console.log(el);
  if (el.somethingElse.count !== 0) {
     return true;
  }
}

function secondFilterforMenuCount (el) {
  // console.log(el);
  if (el.somethingElse.count !== 0) {
     return true;
  }
}

function filterforHHMenu (el) {
  var typeArray = el.somethingElse.items;
  if (typeArray !== undefined) {
    for (var i = 0; i < typeArray.length; i++) {
      if(typeArray[i].name === 'Happy Hour' || typeArray[i].name === 'Happy Hour Menu') {
      return true;
      }
    }
  }
}

function appendRestInfo (restaurant) {
  // var venue =
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

      $('.menu').append('<p>' + MENUTYPEARRAY[i].description + '</p>');

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

function initialize() {
  var mapProp = {
    center:new google.maps.LatLng(39.73672566308672,-104.98462772334167),
    zoom:16,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById('googleMap'),mapProp);
}
// initialize(39.73672566308672,-104.98462772334167);

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}

var restInfoArray = [];
function makeRestInfoArray (el) {
  restInfoArray.push(el.venue); //"el" could be more specific
  return restInfoArray;
}
var selectedMenu;
var randomHHMenu;
var hHmenuarray = [];
// console.log(restArrayWithHHMenu);
  $('#getHappy').on('click', function()  {
    $('.menu').html('');
    getIPLonLat().then(function(lonLat) {

      $.ajax({
        url:'https://api.foursquare.com/v2/venues/explore?client_id=K451HYAEBJX0PR3DF3XDMGTCLRIMKBVRAJXIWEDQ5NY4Y0VZ&client_secret=KQCBRZBR3B2E3FQFGLZOYZHYFU5O5U5MNPIKY2GAQONINNPZ&v=20160808&section=food&sortByDistance=' + $('#closest').prop('checked') + '&openNow=' + $('#openNow').val() + '&limit=50&near=denver',
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
          // randomHHMenu = hHmenuarray[getRandomMenu(0,hHmenuarray.length)]
          // console.log(selectedMenu);
          menuCreator(selectedMenu);

          // console.log(restInfoArray);
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
    $('.map').hide();
    // console.log(hHmenuarray);
    if (hHmenuarray.length === 0) {
      $('#findOwn').show()
    } else {
      selectMenuRetrieve(hHmenuarray);
      menuCreator(selectedMenu);
    }
  })
  var allFilteredMenus = [];

  $('#takeMe').on('click', function () {
    $('.restInfo').html('');
    $('.map').html('');
    console.log(selectedMenu);
    // console.log(restInfoArray.filter(secondFilterforMenuCount));
    // console.log(allFilteredMenus);
    appendRestInfo(selectedMenu);
    $('.map').show();
    $('.restInfo').show();

  })


var randomMenu;
  $('#findOwn').on('click', function () {
    $('.menu').html('');
    allFilteredMenus = restInfoArray.filter(filterforMenuCount);

    console.log(allFilteredMenus);
    randomMenu = allFilteredMenus[getRandomMenu(0,allFilteredMenus.length)];
    nonHHMenuCreator(randomMenu);
  })
