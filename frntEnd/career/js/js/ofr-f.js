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

$(document).ready(() => {
  const url =
    (window.location.href.match(/\/Offer\/([^\/]+)/) || [])[1] || null;
  var ofId = url.split('?')[0];
  console.log(ofId);

  // const urlParams = new URLSearchParams(window.location.search);
  // var pltfrm = urlParams.get('pr');
  // var prnj = urlParams.get('pr') ? urlParams.get('pr').split('%')[1] : null;

  // console.log(prnj);

  if (!ofId) {
    window.location.href = '/Career';
  }

  fetch(`/Career/Offer/details/${ofId}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Error: ${response.statusText}`);
      }
    })
    .then(async (data) => {
      // console.log(data);

      $('.ofNme').html(data.nme);
      $('#startdate').html(data.startDte.split('T')[0]);
      $('#enddate').html(data.endDte.split('T')[0]);
      $('#region').html(`${data.place}, `);
      $('#City').html(data.city);
      $('#salary').html(data.salair);
      $('#experience').html(data.expYrs);
      $('#education').html(data.etudLevel);
      $('#Secteur').html(data.sector);
      $('#Fonction').html(data.fonctions);
      $('#wrkTpe').html(data.wrkTpe);
      $('#cmpny').html(data.cmpny);
      $('#postInfo').html(data.post);
      $('#mssions').html(data.missions);
      $('#profileInfo').html(data.prfile);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });

  var checkApply = () => {
    fetch('/Career/Offer/checkApply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        o: ofId,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Login failed');
        }
      })
      .then(async (data) => {
        // console.log(data);

        if (data.a == 1) {
          var dte = data.d;
          $('#aplyBtnArea').html(
            `<h4 style="color: orange"> Vous avez déjà postulé à cette offre d'emploi le ${
              dte.replace('T', ' à ').split('.')[0]
            }  </h4>`
          );
        }
      })
      .catch((error) => {
        console.error('Login Error:', error);
      });
  };

  checkApply();

  $('#aplyBtn').click(() => {
    fetch('/Career/Offer/Apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        o: ofId,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Login failed');
        }
      })
      .then(async (data) => {
        console.log(data);

        checkApply();
        if (data.c == 'r') {
          await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Vous devez d'abord vous connecter pour pouvoir postuler à cette offre.",
          });
          window.location.href = `/login?next=/Career/Offer/${ofId}`;
        } else if (data.c == 1) {
          Toast.fire({
            icon: 'Error',
            title: 'Votre candidature pour cette offre a déjà été envoyée.',
          });
        } else {
          await Swal.fire('Merci ! Votre candidature a bien été enregistrée.');
          // window.location.href = "/Career";
        }
      })
      .catch((error) => {
        console.error('Login Error:', error);
      });
  });

  $('#subBtn').click(() => {
    // alert($("#subEmail").val());
    fetch('/Career/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        e: $('#subEmail').val(),
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Login failed');
        }
      })
      .then(async (data) => {
        if (data == 'subscribed') {
          Toast.fire({
            icon: 'success',
            title: 'Votre email a été enregistré dans notre newsletter.',
          });
        }
      })
      .catch((error) => {
        console.error('Login Error:', error);
      });
  });
});
