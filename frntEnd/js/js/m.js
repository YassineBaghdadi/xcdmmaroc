// import './socket.io.shim.js';

$(document).ready(function () {
  // const socket = io('https://xcdmmaroc.com');

  async function ntfClck(i, l) {
    // alert('clicked')

    await fetch('/ERP/Notifications/click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        i: i,
      }),
    });

    window.location.href = l;
  }
  var checkP = async () => {
    var ur = await window.location.pathname.split('/')[1];

    fetch('/chckP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ a: ur }),
    })
      .then((response) => {
        if (response.redirected) {
          // Handle redirection to "/ERROR" route
          window.location.href = response.url;
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  // checkP();

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  // setInterval(async () => {
  //   await fetch('/Notifications')
  //     .then((response) => response.json())
  //     .then(async (data) => {
  //       if (data.error) {
  //         console.error(data.error);
  //       } else {
  //         if (String(data.n) !== $('#ntfsNmbr').html() && data.n !== 0) {
  //           if (Cookies.get('ntf') !== String(data.n)) {
  //             Cookies.set('ntf', data.n);
  //             Toast.fire({
  //               icon: 'success',
  //               title: 'Vous avez une nouvelle notification',
  //             });
  //           }
  //         }
  //         $('#nofsArea').html(data.t);

  //         if (data.d) {
  //           await fetch('/logout');
  //           await Swal.fire({
  //             icon: 'error',
  //             title: 'Sessions expirées!',
  //             text: 'Vous avez été expulsé de cette session',
  //             confirmButtonText: 'OK',
  //             allowOutsideClick: false,
  //           });

  //           window.location.href = '/';
  //         }
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error:', error);
  //     });
  // }, 5000);

  $('footer')
    .html(`<div class="d-sm-flex justify-content-center justify-content-sm-between">
            <span class="text-muted text-center text-sm-left d-block d-sm-inline-block">
            &copy; ${new Date().getFullYear()} <a href="https://www.xcdmmaroc.com/" target="_blank">XCDM Maroc</a>. All rights reserved.
            </span>
            <span class="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">Hand-crafted & made by <a href="https://github.com/kbourir/" target="_blank">karim BOURIR</a> & <a href="https://yassinebaghdadi.com/" target="_blank">Yassine BAGHDADI</a> <i class="ti-heart text-danger ml-1"></i></span>
          </div>`);

  // notificationCheckInterval()
  // fetch('/getUsDt')
  //       .then(response => response.json())
  //       .then(data => {
  //           if (data.error) {
  //           console.error(data.error);
  //           } else {

  //           $('#userFullName').html(data.data.fname+' '+data.data.lname);
  //           const base64Image = btoa(String.fromCharCode.apply(null, data.data.pic));

  //           var imageUrl = `data:image/jpeg;base64,${base64Image}`;
  //           if(!base64Image){
  //              imageUrl = "./js/prflPic.jpg";
  //           }

  //           document.getElementById('prflPic').src = imageUrl;
  //           }
  //       })
  //       .catch(error => {
  //           console.error('Error:', error);
  //       });

  $('#navBar3Points').click(function () {
    if ($('#right-sidebar').hasClass('open')) {
      $('#right-sidebar').removeClass('open');
    } else {
      $('#right-sidebar').addClass('open');
    }
  });

  $.get('/getName', function (data) {
    $('#nme').html(data);
  }).fail(function () {
    console.error('Failed to fetch default image.');
  });

  // notificationCheckInterval()
});
