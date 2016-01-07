
// UPLOAD FILES
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('files', file);
        $http.post(uploadUrl + file.name + "?app_name=todoangular", fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
        })
        .error(function(){
        });
    }
}]);


app.service('mnyUploads', function (DreamFactory, $http, $q, $rootScope, $filter) { 


  
  // GLOBALES

  var imageContentbase64;



  // SERVICIOS


  // CONVIERTE A BLOB PARA SUBIR AL SERVIDOR
   var  base64toBlob = function(base64Data, contentType){
// alert(base64Data.substring(0, 30))
      contentType = contentType || '';
      var sliceSize = 1024;
      var byteCharacters = atob(base64Data); 
      var bytesLength = byteCharacters.length;
      var slicesCount = Math.ceil(bytesLength / sliceSize);
      var byteArrays = new Array(slicesCount);
      for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
          var begin = sliceIndex * sliceSize;
          var end = Math.min(begin + sliceSize, bytesLength);

          var bytes = new Array(end - begin);
          for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
              bytes[i] = byteCharacters[offset].charCodeAt(0);
          }
          byteArrays[sliceIndex] = new Uint8Array(bytes);
      }
      return new Blob(byteArrays, { type: contentType });
  }


  // HACE FOTO CON EL MOBIL Y LA GUARDA CRUDA EN imageContentbase64
  var getPicture = function(imagen){
    var deferred = $q.defer(); 
    var options = {
      quality: 50,
      // destinationType: Camera.DestinationType.FILE_URI,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      encodingType: Camera.EncodingType.JPEG,
      correctOrientation: true
      // cameraDirection: 1,
      // saveToPhotoAlbum: true
    };

      navigator.camera.getPicture(onSuccess, onFail, options); 

    function onSuccess(imageData) {
      imageContentbase64 = imageData;   // global

      deferred.resolve("data:image/jpeg;base64,"+imageData)
    }
    function onFail(message) {
        deferred.reject("cancelado")
    }
    return deferred.promise;
  }





  var uploadPicture = function(bucket, fechaFactura, total, iva, concepto){
      var request={};
      request.container = bucket;
      var path = $filter('date')( fechaFactura, "yyyy") + '/'+ $filter('date')( fechaFactura, "MM")+ '/'+ $filter('date')( fechaFactura, "dd")+ '/' ;
      request.file_path = path + $filter('date')( fechaFactura, "HHmmss")+"!*!"+total+"!*!"+iva+"!*!"+concepto+".jpg";
      request.body = base64toBlob(imageContentbase64, "image/jpg");
      DreamFactory.api.S3.createFile(request,
        function(result) {
          // Handle login success
            alert(JSON.stringify(result));
        },
          // Error function
          function(error) { alert(JSON.stringify(error)); }
      );

  }



    // CREAR UN UPLOAD FILE CON ESTO
  //   $scope.uploadFile = function(files){


    // var file = $scope.myFile;

   //    var fd = new FormData();
   //    //Take the first selected file
   //    fd.append("files", file);
   //    // fd.append("files", files[0]);


   //    // en S3 necesita el doble '//'' para subir correctamente
   //    $http.post( df_DSP_URL + "/rest/S3/mny-tmp"  + '//' + file.name, fd, { 
   //    // $http.post( df_DSP_URL + "/rest/S3/" + $scope.actualPath.id + '//' + files[0].name, fd, { 
   //        headers: {'Content-Type': undefined },
   //        transformRequest: angular.identity
   //    })  
   //    .success(function(data){
   //     console.debug("SUBIDO",data);
    // })
    // .error(function(data){
   //     console.debug("ERROR",data);
    // });



  //   };



    return {

      // GENERALES
    base64toBlob: base64toBlob,
    getPicture: getPicture,
    uploadPicture: uploadPicture
  }

})