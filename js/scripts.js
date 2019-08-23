//Funcion para llamar al modal donde se validara el correo o el telefono
var resultados = null;
var invitado = null;
var ListOfInvitados = null;
var api_endpoint = "https://api.perlayjorge.com/";
function validarIdentidad(index){
    if(index !== null && resultados !== null){
        invitado = resultados[index];

        var full_name = invitado.nombre;
        if(invitado.primer_apellido !== null){
            full_name = full_name + " " + invitado.primer_apellido;
        }
        console.log("Nombre: " + full_name)
        $("#confirma-name").text(full_name);
        $("#rsvp-generar-codigo").modal("show");
    }
}

//RSVP APP
var app = angular.module('rsvp',[]);
app.factory('SharedData',function(){
    return {
        api_endpoint : "https://api.perlayjorge.com/",
        SearchResults : null,
        invitado : {},
        setSearchResults : function(val){
            this.SearchResults = val;
        },
        getSearchResult : function(){
            return this.SearchResults;
        },
        setInvitado : function(val){
            this.invitado = val;
        },
        getInvitado : function(){
            return this.invitado;
        }
    };
});
app.controller('CtrlGuestSearch',function($scope,$http,SharedData){
    //Model
    $scope.nametosearch = "";
    $scope.SearchResults = null;
    $scope.ShowSuccessAlert = false;
    $scope.ShowFailAlert = false;
    $scope.SearchGuestByName = function(){
        var method = "invitaciones?filter="+ $scope.nametosearch;
        if($scope.nametosearch !== ""){
            $http.get(SharedData.api_endpoint + method)
                .then(function(response){
                    if(response.data.success === true && response.data.object !== null){
                        SharedData.setSearchResults(response.data.object);
                        $scope.SearchResults = SharedData.SearchResults;

                        //Abrir el modal para mostrar la lista de resultados de la busqueda
                        var element = angular.element('#SearchResultModal');
                        element.modal({
                            backdrop: 'static',
                            keyboard: false
                        });
                        element.modal('show');
                    }
                }).catch(function(response) {
                    console.log('Error occurred:', response.status, response.data);
                }).finally(function() {
                    console.log("Task Finished.");
                });
        }
    }
});

app.controller('CtrlSearchResults',function($scope,$http,SharedData){
    //MODEL
    $scope.SearchResults = null;
    //WATCHERS: esta madre sirve para actualizar el valor que tienen las variables guardades en el servicio 'SharedData'
    $scope.$watch(function() { return SharedData.SearchResults; }, function(newVal, oldVal) {
        $scope.SearchResults = newVal;
    });
    //METHODS
    $scope.ShowGenerateCode = function(i){
        //Guardamos el objeto seleccionado de la lista en la variable invitado
        SharedData.setInvitado(i);
        //Mostramos el nuevo modal
        var element = angular.element('#GenerateCodeModal');
        element.modal({
            backdrop: 'static',
            keyboard: false
        });
        element.modal('show');
    }
});
app.controller('CtrlGenerateCode',function($scope,$http,SharedData){
    //MODEL
    $scope.invitado = null;
    $scope.radio_selection = "email";
    $scope.Codefilter = "";
    //WATCHERS: esta madre sirve para actualizar el valor que tienen las variables guardades en el servicio 'SharedData'
    $scope.$watch(function() { return SharedData.invitado; }, function(newVal, oldVal) {
        $scope.invitado = newVal;
    });
    //METHODS
    $scope.GenerateValidationCode = function(){
        var isValid = false;
        var request = "";
        if($scope.Codefilter !== ""){

            if($scope.radio_selection === "email"){
                //Validamos si el correo introducido es el mismo que tiene el objeto "invitado"
                if($scope.invitado.email.home === $scope.Codefilter){
                    method = "invitaciones/code?email="+$scope.Codefilter;
                    request = SharedData.api_endpoint + method;
                    isValid = true;
                    console.log("Email request: " + request);
                }
                else{
                    console.log("El correo no es el mismo");
                    isValid = false;
                }
            }else{
                if($scope.invitado.telefono === parseInt($scope.Codefilter,10)){
                    method = "invitaciones/code?telefono="+$scope.Codefilter;
                    request = SharedData.api_endpoint + method;
                    console.log("Telefono request: " + request);
                    isValid = true;
                }else{
                    console.log("el telefono no es valido");
                    isValid = false;
                }
            }
            if(isValid){
                $http.get(request)
                .then(function(response){
                    if(response.data.success === true && response.data.message === "Exito"){
                        //Mostramos el nuevo modal
                        var element = angular.element('#ValidateCodeModal');
                        element.modal({
                            backdrop: 'static',
                            keyboard: false
                        });
                        element.modal('show');

                    }
                }).catch(function(response) {
                    console.log('Error occurred:', response.status, response.data);
                }).finally(function() {
                    console.log("Task Finished.");
                });
            }
        }
    }
});
app.controller('CtrlValidateCode',function($scope,$http,SharedData){
    //MODEL
    $scope.invitado = null;
    $scope.validation_code = "";
    $scope.Codefilter = "";
    //WATCHERS: esta madre sirve para actualizar el valor que tienen las variables guardades en el servicio 'SharedData'
    $scope.$watch(function() { return SharedData.invitado; }, function(newVal, oldVal) {
        $scope.invitado = newVal;
    });
    //METHODS
    $scope.ValidateCode = function(){
        //Guardamos el codigo de validacion nuevo
        $scope.invitado.codigo_confirmacion = $scope.validation_code;
        var data = {
            email : $scope.invitado.email.home,
            telefono : $scope.invitado.telefono,
            codigo_confirmacion : $scope.invitado.codigo_confirmacion
        }
        SharedData.setInvitado($scope.invitado);
        //Hacemos un POST request para validar el codigo
        var request = SharedData.api_endpoint + "invitaciones/code";
        $http.post(request,JSON.stringify(data))
            .then(function(response){
                if(response.data.success === true && response.data.object !== null){
                    //Abrir el modal para mostrar la lista de resultados de la busqueda
                    var element = angular.element('#InvitadosModal');
                    element.modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                    element.modal('show');
                }
            }).catch(function(response) {
                console.log('Error occurred:', response.status, response.data);
            }).finally(function() {
                console.log("Task Finished.");
            });
        //Mostramos el nuevo modal
        var element = angular.element('#GenerateCodeModal');
        element.modal({
            backdrop: 'static',
            keyboard: false
        });
        element.modal('show');
    }
});

app.controller('CtrlInvitados',function($scope,$http,SharedData){
    //MODEL
    $scope.invitado = null;
    $scope.ShowSuccessAlert = false;
    $scope.ShowFailAlert = false;
    //WATCHERS: esta madre sirve para actualizar el valor que tienen las variables guardades en el servicio 'SharedData'
    $scope.$watch(function() { return SharedData.invitado; }, function(newVal, oldVal) {
        $scope.invitado = newVal;
    });
    //METHODS
    $scope.confirmar = function(){
        var request = SharedData.api_endpoint + "invitaciones/confirmar";
        $http.post(request,JSON.stringify($scope.invitado))
            .then(function(response){
                if(response.data.success === true && response.data.object !== null){
                   //Se ha confirmado la invitacion
                   $scope.ShowSuccessAlert = true;
                   $scope.ShowFailAlert = false;
                }else{
                    $scope.ShowSuccessAlert = false;
                    $scope.ShowFailAlert = true;
                }
            }).catch(function(response) {
                console.log('Error occurred:', response.status, response.data);
                $scope.ShowFailAlert = true;
                $scope.ShowSuccessAlert = false;
            }).finally(function() {
                console.log("Task Finished.");
            });
    }

    $scope.ocultarAlertas = function(){
        $scope.ShowSuccessAlert = false;
        $scope.ShowFailAlert = false;
    }
});


$(document).ready(function () {

    /***************** Waypoints ******************/

    $('.wp1').waypoint(function () {
        $('.wp1').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp2').waypoint(function () {
        $('.wp2').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp3').waypoint(function () {
        $('.wp3').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp4').waypoint(function () {
        $('.wp4').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp5').waypoint(function () {
        $('.wp5').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp6').waypoint(function () {
        $('.wp6').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp7').waypoint(function () {
        $('.wp7').addClass('animated fadeInUp');
    }, {
        offset: '75%'
    });
    $('.wp8').waypoint(function () {
        $('.wp8').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp9').waypoint(function () {
        $('.wp9').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });

    /***************** Initiate Flexslider ******************/
    $('.flexslider').flexslider({
        animation: "slide"
    });

    /***************** Initiate Fancybox ******************/

    $('.single_image').fancybox({
        padding: 4
    });

    $('.fancybox').fancybox({
        padding: 4,
        width: 1000,
        height: 800
    });

    /***************** Tooltips ******************/
    $('[data-toggle="tooltip"]').tooltip();

    /***************** Nav Transformicon ******************/

    /* When user clicks the Icon */
    $('.nav-toggle').click(function () {
        $(this).toggleClass('active');
        $('.header-nav').toggleClass('open');
        event.preventDefault();
    });
    /* When user clicks a link */
    $('.header-nav li a').click(function () {
        $('.nav-toggle').toggleClass('active');
        $('.header-nav').toggleClass('open');

    });

    /***************** Header BG Scroll ******************/

    $(function () {
        $(window).scroll(function () {
            var scroll = $(window).scrollTop();

            if (scroll >= 20) {
                $('section.navigation').addClass('fixed');
                $('header').css({
                    "border-bottom": "none",
                    "padding": "35px 0"
                });
                $('header .member-actions').css({
                    "top": "26px",
                });
                $('header .navicon').css({
                    "top": "34px",
                });
            } else {
                $('section.navigation').removeClass('fixed');
                $('header').css({
                    "border-bottom": "solid 1px rgba(255, 255, 255, 0.2)",
                    "padding": "50px 0"
                });
                $('header .member-actions').css({
                    "top": "41px",
                });
                $('header .navicon').css({
                    "top": "48px",
                });
            }
        });
    });
    /***************** Smooth Scrolling ******************/

    $(function () {

        $('a[href*=#]:not([href=#])').click(function () {
            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - 90
                    }, 2000);
                    return false;
                }
            }
        });

    });

    /********************** Social Share buttons ***********************/
    
    /********************** Embed youtube video *********************/
    $('.player').YTPlayer();


    /********************** Toggle Map Content **********************/
    $('#btn-show-map').click(function () {
        $('#map-content').toggleClass('toggle-map-content');
        $('#btn-show-content').toggleClass('toggle-map-content');
    });
    $('#btn-show-content').click(function () {
        $('#map-content').toggleClass('toggle-map-content');
        $('#btn-show-content').toggleClass('toggle-map-content');
    });

    /********************** Add to Calendar **********************/
    var myCalendar = createCalendar({
        options: {
            class: '',
            // You can pass an ID. If you don't, one will be generated for you
            id: ''
        },
        data: {
            // Event title
            title: "Boda Perla Y Jorge",

            // Event start date
            start: new Date('Dec 19 2019 21:00'),

            // Event duration (IN MINUTES)
            // duration: 120,

            // You can also choose to set an end time
            // If an end time is set, this will take precedence over duration
            end: new Date('Dec 19 2019 02:00'),

            // Event Address
            address: 'Dubai Eventos Los Mochis, Sinaloa',

            // Event Description
            description: "No podemos esperar para verte en nuestro gran dia. Para cualquier pregunta enviar un email a info@perlayjorge.com"
        }
    });

   // $('#add-to-cal').html(myCalendar);

    /********************** RSVP **********************/
    /* $('#rsvp-form').on('submit', function (e) {
        e.preventDefault();
        var data = $(this).serialize();
        var title = document.getElementById('m-title');
        var subtitle = document.getElementById('m-subtitle');
         title.innerHTML="Este eres tú?";
         subtitle.innerHTML="Selecciona tu nombre para continuar";
        var $invitados = $('#paragraphInModal');
       $.ajax({
            type: "GET",
            url: "https://api.perlayjorge.com/invitaciones?"+data
        }).done(function(myData) {
            if(myData.object !== null){
                resultados = myData.object;
                ListOfInvitados = myData.object;
                $invitados.html("");
                //$invitados.append('<ul id="paragraphInModal">')
                $.each(ListOfInvitados,function(i,invitado) {
                  $invitados.append('<li data-index="'+i+'"><h3><a ng-click="SetInvitado('+i+')" href="javascript:validarIdentidad('+i+')">'+invitado.nombre+' '+invitado.primer_apellido+'</a></h3></li>');
                });
                // $invitados.append("</ul>");

            }else{
                resultados = null;
                console.log("No hay resultados");
            }
            //htmlData = "<p>"+myData[0]+"</p>";
            //$("#paragraphInModal").html(htmlData);
            $("#rsvp-modal").modal("show");
        });

        $('#alert-wrapper').html(alert_markup('info', '<strong>Un segundo!</strong> Buscando información...'));


    }); */

});

/********************** Extras **********************/

// Google map
function initMap() {
    var itc_kol = {lat: 25.8099397, lng: -109.0013736};
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 15,
        center: itc_kol,
        scrollwheel: false
    });

    var marker = new google.maps.Marker({
        position: itc_kol,
        map: map
    });
}

function initBBSRMap() {
    var la_fiesta = {lat: 20.305826, lng: 85.85480189999998};
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 15,
        center: la_fiesta,
        scrollwheel: false
    });

    var marker = new google.maps.Marker({
        position: la_fiesta,
        map: map
    });
}

// alert_markup
function alert_markup(alert_type, msg) {
    return '<div class="alert alert-' + alert_type + '" role="alert">' + msg + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span>&times;</span></button></div>';
}

// MD5 Encoding
var MD5 = function (string) {

    function RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function F(x, y, z) {
        return (x & y) | ((~x) & z);
    }

    function G(x, y, z) {
        return (x & z) | (y & (~z));
    }

    function H(x, y, z) {
        return (x ^ y ^ z);
    }

    function I(x, y, z) {
        return (y ^ (x | (~z)));
    }

    function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    function WordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    };

    // function Utf8Encode(string) {
    //     string = string.replace(/\r\n/g, "\n");
    //     var utftext = "";

    //     for (var n = 0; n < string.length; n++) {

    //         var c = string.charCodeAt(n);

    //         if (c < 128) {
    //             utftext += String.fromCharCode(c);
    //         }
    //         else if ((c > 127) && (c < 2048)) {
    //             utftext += String.fromCharCode((c >> 6) | 192);
    //             utftext += String.fromCharCode((c & 63) | 128);
    //         }
    //         else {
    //             utftext += String.fromCharCode((c >> 12) | 224);
    //             utftext += String.fromCharCode(((c >> 6) & 63) | 128);
    //             utftext += String.fromCharCode((c & 63) | 128);
    //         }

    //     }

    //     return utftext;
    // };

    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

   // string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = AddUnsigned(a, AA);
        b = AddUnsigned(b, BB);
        c = AddUnsigned(c, CC);
        d = AddUnsigned(d, DD);
    }

    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

    return temp.toLowerCase();
};
