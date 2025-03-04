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

$(document).ready(function () {
  // $('#exampleInputEmail1').val('yassine@baghdadi.com');
  // $('#exampleInputPassword1').val('yassine')

  $('button').click(async function () {
    try {
      $('button').html('<i class="fa fa-spinner fa-spin"></i> ');
      $('button').attr('disabled', 'disabled');
      fetch('/login/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: $('#exampleInputEmail1').val(),
          password: $('#exampleInputPassword1').val(),
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Login failed');
          }
        })
        .then((data) => {
          console.log(data);
          if (data) {
            const urlParams = new URLSearchParams(window.location.search);

            const nxt =
              urlParams.get('next') != '/ERP'
                ? urlParams.get('next')
                : '/Profile';
            // const nxt = urlParams.get('next') || '/Profile';
            window.location.href = nxt;
          } else {
            $('button').html('Se connecter');
            $('button').removeAttr('disabled');
            Toast.fire({
              icon: 'error',
              title:
                "Identifiants invalides : le nom d'utilisateur ou le mot de passe est incorrect",
            });
          }
        })
        .catch((error) => {
          $('button').html('Se connecter');
          $('button').removeAttr('disabled');
          Toast.fire({
            icon: 'error',
            title: error,
          });
        });
    } catch (error) {
      console.log('error');
    }
  });

  $('#frgtPss').click(function (e) {
    e.preventDefault();

    Swal.fire({
      title: 'Veuillez insérer votre numéro CIN',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: false,
      confirmButtonText: 'Envoyer',
      showLoaderOnConfirm: true,
      preConfirm: async (c) => {
        try {
          const response = await fetch(`/login/frgtPss?x=${c}`);
          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = `Une erreur s'est produite. Veuillez contacter l'administration.`;
            return Swal.showValidationMessage(errorMessage);
          }
          return response.json();
        } catch (error) {
          Swal.showValidationMessage(`
            Request failed: ${error}
          `);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: `Le nouveau mot de passe a été envoyé à votre adresse e-mail`,
        });
      }
    });
  });
});
