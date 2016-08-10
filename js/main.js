// add scripts
var lonLat;
$(document).on('ready', function() {
  console.log('sanity check!');

  // var RESTARRAY = [];
  // var RESTARRAYWITHMENU = RESTARRAY.filter(filterForMenu);



  getIPLonLat().then(function(lonLat) {
    var hHmenuarray = [];
    $.ajax({
      url:'https://api.foursquare.com/v2/venues/explore?client_id=K451HYAEBJX0PR3DF3XDMGTCLRIMKBVRAJXIWEDQ5NY4Y0VZ&client_secret=KQCBRZBR3B2E3FQFGLZOYZHYFU5O5U5MNPIKY2GAQONINNPZ&v=20160808&section=food&sortByDistance=' + $('#closest').prop('checked') + '&openNow=' + $('#openNow').val() + '&limit=50&ll=' + lonLat,
      method: 'GET'
    }).done(function(results){
      RESTARRAYWITHMENU = results.response.groups[0].items.filter(filterForMenu);
      // console.log(RESTARRAYWITHMENU);
      RESTARRAYWITHMENU.forEach(makeRestIDArray);
      // console.log(restIDArray);
    }).then(function() {
      var promiseGroup = [];
      for (let i = 0; i < restIDArray.length; i++) {
        promiseGroup.push(getMenu(i));
      };
      Promise.all(promiseGroup).then(function(group){
        hHmenuarray = group.filter(filterforMenuCount).filter(filterforHHMenu);
        // hHmenuarray = hHmenuarray;
        console.log(hHmenuarray);
      })
    })
  })




});

function getMenu (x) {
  return new Promise(function(resolve,reject) {
    $.ajax({
      url:'https://api.foursquare.com/v2/venues/' + restIDArray[x] + '/menu?client_id=K451HYAEBJX0PR3DF3XDMGTCLRIMKBVRAJXIWEDQ5NY4Y0VZ&client_secret=KQCBRZBR3B2E3FQFGLZOYZHYFU5O5U5MNPIKY2GAQONINNPZ&v=20160809',
      method: 'GET'
    }).done(function(menu) {
      resolve(menu.response.menu.menus);
    });
  })
}

function getIPLonLat () {
  return new Promise(function(resolve,reject) {
    $.getJSON('http://ipinfo.io', function(data){
      ll = data.loc.split(',').map(Number);
      // console.log(lonLat);
      resolve(lonLat = ll[0] + ',' + ll[1]);
    });
  });
}

var restIDArray = [];
function makeRestIDArray (el) {
  restIDArray.push(el.venue.id); //"el" could be more specific
  return restIDArray;
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
  if (el.count !== 0) {
     return true;
  }
}
function filterforHHMenu (el) {
  if(el.items.name === 'Happy Hour' || el.items.name === 'Happy Hour Menu') {
    return true;
  }
}

function restInfo (restaurant) {
  var restaurantUrl = restaurant.url.replace(/^https?:\/\//,'');
  var restaurantLink = '<a href ="' + restaurant.url + '">' + restaurantUrl + '</a>';

  $('.left').append('<p>' + restaurant.name + '</p>');
  $('.left').append(restaurantLink);
  $('.left').append('<p>' + restaurant.hours.status + '</p>');
}

function menuCreator(menu){
  var MENUTYPEARRAY = menu.response.menu.menus.items;
  for (let i = 0; i < MENUTYPEARRAY.length; i++) { //possibly a forEach loop here?
    if (MENUTYPEARRAY[i].name === 'Happy Hour Menu' || MENUTYPEARRAY[i].name === 'Happy Hour') {

      $('.menu').append('<p>' + MENUTYPEARRAY[i].description + '</p>');

      var menu = MENUTYPEARRAY[i].entries.items;
      menu.forEach(menuDisplay);
    };
  };
}

// console.log(restArrayWithHHMenu);
  $('button').on('click', function()  {
    var availability = $('#openNow').val(); //"openNow" could be more specific - what does it open?
    var closest = $('#closest').prop('checked');

    getIPLonLat().then(function(lonLat) {
    $.ajax({
      url:'https://api.foursquare.com/v2/venues/explore?client_id=K451HYAEBJX0PR3DF3XDMGTCLRIMKBVRAJXIWEDQ5NY4Y0VZ&client_secret=KQCBRZBR3B2E3FQFGLZOYZHYFU5O5U5MNPIKY2GAQONINNPZ&v=20160808&section=food&sortByDistance=' + $('#closest').prop('checked') + '&openNow=' + $('#openNow').val() + '&limit=50&ll=' + lonLat,
      method: 'GET'
    }).done(function(results) {
       RESTARRAY = results.response.groups[0].items;
       RESTARRAYWITHMENU = RESTARRAY.filter(filterForMenu);
      // console.log(RESTARRAYWITHMENU);
      var restaurant = RESTARRAYWITHMENU[21].venue;
      var restaurantID = restaurant.id;
      restInfo(restaurant);

        $.ajax({
          url:'https://api.foursquare.com/v2/venues/' + restaurantID + '/menu?client_id=K451HYAEBJX0PR3DF3XDMGTCLRIMKBVRAJXIWEDQ5NY4Y0VZ&client_secret=KQCBRZBR3B2E3FQFGLZOYZHYFU5O5U5MNPIKY2GAQONINNPZ&v=20160809',
          method: 'GET'
        }).done(function(menu){
          menuCreator(menu);
        });
      });
    });
  });
