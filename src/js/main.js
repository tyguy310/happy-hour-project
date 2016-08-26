
// google maps api key AIzaSyD3nHjd0_RGDNdjaWEqsfJpcNn7WD3osic

$(document).on('ready', function() {

  $('#findOwn').hide();
  $('.restInfo').hide();
  encodeURIName(restNameURI);
});

function getRandomMenu (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var lonLat;
function getIPLonLat () {
  return new Promise(function(resolve,reject) {

    const Longitude = 39.73;
    const Latitude = -104.992;
    resolve(lonLat = Longitude + ',' + Latitude);
    // });
  });
}

function filterForMenu (restaurant) {
  if (restaurant.venue.hasMenu === true) {
    return true;
  }
}

function menuContentNormalize (entry) {
  if (entry.description !== undefined && entry.price !== undefined) {
    $('.menu').append('<li>' + entry.price + ' - ' + entry.name + '<br>' + entry.description + '</li>');
  } else if (entry.description !== undefined) {
    $('.menu').append('<li>' + entry.name + '<br>' + entry.description + '</li>');
  } else if (entry.price !== undefined) {
    $('.menu').append('<li>' + entry.price + ' - ' + entry.name + '<br>' + '</li>');
  } else {
    $('.menu').append('<li>' + entry.name + '</li>');
  }
}

function menuDisplay (item) {
  $('.menu').append('<h4 class="name">' + item.name + '</h4>');
  if (item.description !== undefined) {
    $('.menu').append('<p class="description">' + item.description + '</p>');
  }
  // $('.menu').append('<ul>' + '</ul>');
  const ENTRIESARRAY = item.entries.items;

  ENTRIESARRAY.forEach(menuContentNormalize);

}

function filterforMenuCount (venue) {
  if (venue.somethingElse.count !== 0) {
    return true;
  }
}

function filterforHHMenu (venue) {
  var typeArray = venue.somethingElse.items;
  if (typeArray !== undefined) {
    for (var i = 0; i < typeArray.length; i++) {
      if (typeArray[i].name === 'Happy Hour' || typeArray[i].name === 'Happy Hour Menu') {
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

function menuCreator(menu) {
  var MENUTYPEARRAY = menu.somethingElse.items;
  for (let i = 0; i < MENUTYPEARRAY.length; i++) {
    if (MENUTYPEARRAY[i].name === 'Happy Hour Menu' || MENUTYPEARRAY[i].name === 'Happy Hour') {

      $('.menu').append('<h4 class="text-center">' + MENUTYPEARRAY[i].description + '</h4>');

      var venueMenu = MENUTYPEARRAY[i].entries.items;
      venueMenu.forEach(menuDisplay);
    }
  }
}

function nonHHMenuCreator(menu) {
  var MENUTYPEARRAY = menu.somethingElse.items;
  for (let i = 0; i < MENUTYPEARRAY.length; i++) {

    $('.menu').append('<h4>' + MENUTYPEARRAY[i].description + '</h4>');

    var venueMenu = MENUTYPEARRAY[i].entries.items;
    venueMenu.forEach(menuDisplay);
  }
}

var restInfoArray = [];
function makeRestInfoArray (restaurant) {
  restInfoArray.push(restaurant.venue);
  return restInfoArray;
}

var selectedMenu;
var randomHHMenu;
var hHmenuarray = [];

function getMenu (venue) {
  return Promise.resolve(
    $.ajax({
      url:'https://api.foursquare.com/v2/venues/' + restInfoArray[venue].id + '/menu?client_id=K451HYAEBJX0PR3DF3XDMGTCLRIMKBVRAJXIWEDQ5NY4Y0VZ&client_secret=KQCBRZBR3B2E3FQFGLZOYZHYFU5O5U5MNPIKY2GAQONINNPZ&v=20160826',
      method: 'GET'
    })
  );
}

$('#getHappy').on('click', function()  {
    $('.menu').html('');
    $('#googleMap').html('');
    $('.restInfo').html('');
    $('.next').removeClass('disabled');

    getIPLonLat().then(function(lonLat) {

      $.ajax({
        url:'https://api.foursquare.com/v2/venues/explore?client_id=K451HYAEBJX0PR3DF3XDMGTCLRIMKBVRAJXIWEDQ5NY4Y0VZ&client_secret=KQCBRZBR3B2E3FQFGLZOYZHYFU5O5U5MNPIKY2GAQONINNPZ&v=20160826&section=food&sortByDistance=' + $('#closest').prop('checked') + '&openNow=' + $('#openNow').val() + '&limit=50&near=denver',
        method: 'GET'
      }).done(function(results) {
        RESTARRAYWITHMENU = results.response.groups[0].items.filter(filterForMenu);
        RESTARRAYWITHMENU.forEach(makeRestInfoArray);
      }).then(function() {
        var promiseGroup = [];
        for (let i = 0; i < restInfoArray.length; i++) {
          promiseGroup.push(getMenu(i));
        }
        Promise.all(promiseGroup).then(function (group) {
          var menus = group.map(function (menu) {
            return menu.response.menu.menus;
          });

          restInfoArray.forEach(function (restaurant, index) {
            restaurant.somethingElse = menus[index];
          });
          hHmenuarray = restInfoArray.filter(filterforHHMenu);
          selectMenuRetrieve(hHmenuarray);

          menuCreator(selectedMenu);
        });
      });
    });
  });

function selectMenuRetrieve (menuarray) {
  selectedMenu = menuarray.pop();
  return selectedMenu;
}

$('#next').on('click', function () {
    $('.menu').html('');
    $('.restInfo').hide();
    $('#googleMap').html('');
    // console.log(hHmenuarray);
    if (hHmenuarray.length === 0) {
      $('#findOwn').show();
      $('#alert').fadeIn(1000).delay(2000).fadeOut(1000);
    } else {
      selectMenuRetrieve(hHmenuarray);
      menuCreator(selectedMenu);
    }
  });
var allFilteredMenus = [];

var restNameURI = 'denver';
function encodeURIName (name) {
  restNameURI = encodeURI(name);
}

$('#takeMe').on('click', function () {
    $('.restInfo').html('');
    $('#googleMap').html('');
    appendRestInfo(selectedMenu);
    encodeURIName(selectedMenu.name);

    $('.restInfo').show();
    $('#googleMap').append('<iframe width="250" height="250" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/search?key=AIzaSyD3nHjd0_RGDNdjaWEqsfJpcNn7WD3osic&q=' + restNameURI + '"></iframe>');
  });

var randomMenu;
$('#findOwn').on('click', function () {
    $('.menu').html('');
    $('.restInfo').html('');
    $('#googleMap').html('');
    $('.next').addClass('disabled');

    allFilteredMenus = restInfoArray.filter(filterforMenuCount);

    randomMenu = allFilteredMenus[getRandomMenu(0,allFilteredMenus.length)];
    selectedMenu = randomMenu;
    nonHHMenuCreator(selectedMenu);
  });
